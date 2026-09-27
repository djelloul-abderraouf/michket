"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getCommunes,
  getDeliveryRate,
  getWilayas,
  setGuestOrderAccessToken,
  type ApiCommune,
  type ApiWilaya,
  type CampaignItem,
  type CampaignPage,
} from "@/lib/api";

type DeliveryType = "home" | "office";

type LineState = {
  included: boolean;
  variantId: string;
  quantity: number;
  personalization: string;
};

const inputClass =
  "min-h-12 w-full min-w-0 rounded-[10px] border border-[#251713]/10 bg-white px-3.5 text-base text-[#251713] outline-none transition placeholder:text-[#251713]/25 focus:border-[#ECAB1C] focus:ring-2 focus:ring-[#ECAB1C]/10";

function formatDA(amount: number) {
  return (
    new Intl.NumberFormat("fr-DZ", {
      maximumFractionDigits: 0,
    }).format(amount) + " دج"
  );
}

function unitPrice(item: CampaignItem, variantId: string) {
  const variant = item.variants.find((entry) => entry.id === variantId);
  return item.price + (variant?.isMulticolor ? 500 : 0);
}

export function CampaignOrder({ campaign }: { campaign: CampaignPage }) {
  const router = useRouter();
  const [lines, setLines] = useState<Record<string, LineState>>(() =>
    Object.fromEntries(
      campaign.items.map((item) => [
        item.id,
        {
          included: true,
          variantId: item.variants[0]?.id ?? "",
          quantity: 1,
          personalization: "",
        },
      ]),
    ),
  );
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [deliveryType, setDeliveryType] = useState<DeliveryType>("home");
  const [wilayas, setWilayas] = useState<ApiWilaya[]>([]);
  const [communes, setCommunes] = useState<ApiCommune[]>([]);
  const [wilayaCode, setWilayaCode] = useState("");
  const [communeId, setCommuneId] = useState("");
  const [deliveryFee, setDeliveryFee] = useState<number | null>(null);
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [deliveryMessage, setDeliveryMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const selectedWilaya = wilayas.find(
    (wilaya) => String(wilaya.code) === wilayaCode,
  );
  const selectedCommune = communes.find(
    (commune) => String(commune.id) === communeId,
  );

  useEffect(() => {
    let cancelled = false;
    getWilayas()
      .then((rows) => {
        if (!cancelled) setWilayas(rows);
      })
      .catch(() => {
        if (!cancelled) setDeliveryMessage("تعذر تحميل الولايات.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!wilayaCode) {
      setCommunes([]);
      setCommuneId("");
      return;
    }

    let cancelled = false;
    getCommunes(Number(wilayaCode))
      .then((rows) => {
        if (!cancelled) setCommunes(rows);
      })
      .catch(() => {
        if (!cancelled) setCommunes([]);
      });

    return () => {
      cancelled = true;
    };
  }, [wilayaCode]);

  useEffect(() => {
    if (!selectedWilaya || !selectedCommune) {
      setDeliveryFee(null);
      setDeliveryMessage("");
      return;
    }

    if (!selectedWilaya.available || !selectedCommune.available) {
      setDeliveryFee(null);
      setDeliveryMessage("التوصيل غير متوفر لهذه الوجهة.");
      return;
    }

    if (deliveryType === "office" && !selectedCommune.hasStopDesk) {
      setDeliveryFee(null);
      setDeliveryMessage("التوصيل إلى مكتب ياليدين غير متوفر في هذه البلدية.");
      return;
    }

    let cancelled = false;
    setDeliveryLoading(true);
    setDeliveryMessage("");

    getDeliveryRate(selectedWilaya.code, selectedCommune.id, deliveryType)
      .then((rate) => {
        if (!cancelled) setDeliveryFee(rate.amountCents / 100);
      })
      .catch(() => {
        if (!cancelled) {
          setDeliveryFee(null);
          setDeliveryMessage("تعذر حساب سعر التوصيل.");
        }
      })
      .finally(() => {
        if (!cancelled) setDeliveryLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedWilaya, selectedCommune, deliveryType]);

  const selectedItems = campaign.items.filter(
    (item) => lines[item.id]?.included,
  );

  const subtotal = useMemo(
    () =>
      selectedItems.reduce((sum, item) => {
        const line = lines[item.id];
        return sum + unitPrice(item, line.variantId) * line.quantity;
      }, 0),
    [selectedItems, lines],
  );

  const total = subtotal + (deliveryFee ?? 0);

  function updateLine(id: string, patch: Partial<LineState>) {
    setLines((current) => ({
      ...current,
      [id]: { ...current[id], ...patch },
    }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    if (selectedItems.length === 0) {
      setError("اختر منتجًا واحدًا على الأقل.");
      return;
    }

    for (const item of selectedItems) {
      const line = lines[item.id];
      if (item.variants.length > 0 && !line.variantId) {
        setError(`اختر لون ${item.title}.`);
        return;
      }
      if (item.personalizable && !line.personalization.trim()) {
        setError(`أضف تفاصيل الطلب لـ ${item.title}.`);
        return;
      }
    }

    if (!selectedWilaya || !selectedCommune || deliveryFee === null) {
      setError("أكمل ولاية التوصيل والبلدية.");
      return;
    }

    setSending(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignSlug: campaign.slug,
          fullName,
          phone,
          address,
          commune: selectedCommune.name,
          wilayaCode: selectedWilaya.code,
          communeId: selectedCommune.id,
          deliveryType,
          lines: selectedItems.map((item) => ({
            itemId: item.id,
            variantId: lines[item.id].variantId || undefined,
            quantity: lines[item.id].quantity,
            personalization: lines[item.id].personalization.trim(),
          })),
        }),
      });

      const data = (await response.json()) as {
        message?: string;
        reference?: string;
        guestAccessToken?: string;
      };

      if (!response.ok || !data.reference) {
        setError(data.message || "تعذر إرسال الطلب.");
        return;
      }

      if (data.guestAccessToken) {
        setGuestOrderAccessToken(data.reference, data.guestAccessToken);
      }

      router.replace(`/commande/${encodeURIComponent(data.reference)}`);
    } catch {
      setError("تعذر إرسال الطلب.");
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <header className="mb-8 text-center">
        <p className="text-sm font-semibold text-[#ECAB1C]">حملة ميشكت</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl">
          {campaign.publicTitle}
        </h1>
      </header>

      <div className="space-y-5">
        {campaign.items.map((item, index) => {
          const line = lines[item.id];
          const price = unitPrice(item, line.variantId);

          return (
            <section
              key={item.id}
              className="overflow-hidden rounded-2xl border border-[#251713]/10 bg-white"
            >
              <div className="flex items-center justify-between gap-3 border-b border-[#251713]/8 px-4 py-3">
                <h2 className="text-lg font-bold">{item.title}</h2>
                <span className="text-xs text-[#251713]/45">
                  {index + 1} / {campaign.items.length}
                </span>
              </div>

              <div className="grid gap-4 p-4 sm:grid-cols-[120px_1fr]">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-28 w-full rounded-xl object-cover sm:h-32"
                  />
                ) : (
                  <div className="h-28 rounded-xl bg-[#F7F1E8]" />
                )}

                <div className="min-w-0 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm text-[#251713]/70">{item.name}</p>
                    <p className="shrink-0 font-bold">{formatDA(price)}</p>
                  </div>

                  <label className="flex items-center gap-2 text-sm font-medium">
                    <input
                      type="checkbox"
                      checked={line.included}
                      onChange={(event) =>
                        updateLine(item.id, { included: event.target.checked })
                      }
                    />
                    أريد هذا المنتج
                  </label>

                  {line.included ? (
                    <div className="space-y-3">
                      {item.variants.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {item.variants.map((variant) => {
                            const active = line.variantId === variant.id;
                            return (
                              <button
                                key={variant.id}
                                type="button"
                                onClick={() =>
                                  updateLine(item.id, { variantId: variant.id })
                                }
                                className={[
                                  "inline-flex min-h-10 items-center gap-2 rounded-full border px-3 text-sm",
                                  active
                                    ? "border-[#ECAB1C] bg-[#ECAB1C]/15"
                                    : "border-[#251713]/10 bg-white",
                                ].join(" ")}
                              >
                                <span
                                  className="h-3.5 w-3.5 rounded-full border border-black/10"
                                  style={{
                                    background: variant.isMulticolor
                                      ? "conic-gradient(#ECAB1C, #e11d48, #2563eb, #16a34a, #ECAB1C)"
                                      : variant.hex || "#ddd",
                                  }}
                                />
                                {variant.name}
                                {variant.isMulticolor ? " +500 دج" : ""}
                              </button>
                            );
                          })}
                        </div>
                      ) : null}

                      <label className="block text-sm">
                        <span className="mb-1 block font-medium">الكمية</span>
                        <input
                          type="number"
                          min={1}
                          max={99}
                          value={line.quantity}
                          onChange={(event) =>
                            updateLine(item.id, {
                              quantity: Number(event.target.value),
                            })
                          }
                          className={inputClass}
                        />
                      </label>

                      {item.personalizable ? (
                        <label className="block text-sm">
                          <span className="mb-1 block font-medium">
                            تفاصيل الطلب
                          </span>
                          {item.orderDetailsPrompt ? (
                            <span className="mb-2 block text-[#251713]/60">
                              {item.orderDetailsPrompt}
                            </span>
                          ) : null}
                          <textarea
                            required
                            maxLength={500}
                            value={line.personalization}
                            onChange={(event) =>
                              updateLine(item.id, {
                                personalization: event.target.value,
                              })
                            }
                            className={`${inputClass} min-h-28 py-3`}
                          />
                        </label>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            </section>
          );
        })}
      </div>

      <section className="mt-6 space-y-4 rounded-2xl border border-[#251713]/10 bg-white p-4 sm:p-6">
        <h2 className="text-lg font-bold">معلومات التوصيل</h2>

        <label className="block text-sm">
          <span className="mb-1 block font-medium">الاسم واللقب</span>
          <input
            required
            minLength={2}
            maxLength={200}
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            className={inputClass}
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium">رقم الهاتف</span>
          <input
            required
            dir="ltr"
            inputMode="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="05xxxxxxxx"
            className={inputClass}
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block font-medium">الولاية</span>
            <select
              required
              value={wilayaCode}
              onChange={(event) => {
                setWilayaCode(event.target.value);
                setCommuneId("");
              }}
              className={inputClass}
            >
              <option value="">اختر الولاية</option>
              {wilayas.map((wilaya) => (
                <option key={wilaya.code} value={wilaya.code}>
                  {wilaya.code} - {wilaya.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium">البلدية</span>
            <select
              required
              value={communeId}
              onChange={(event) => setCommuneId(event.target.value)}
              className={inputClass}
            >
              <option value="">اختر البلدية</option>
              {communes.map((commune) => (
                <option key={commune.id} value={commune.id}>
                  {commune.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {(
            [
              ["home", "توصيل للمنزل"],
              ["office", "مكتب ياليدين"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setDeliveryType(value)}
              className={[
                "min-h-12 rounded-xl border text-sm font-semibold",
                deliveryType === value
                  ? "border-[#ECAB1C] bg-[#ECAB1C]/15"
                  : "border-[#251713]/10",
              ].join(" ")}
            >
              {label}
            </button>
          ))}
        </div>

        {deliveryType === "home" ? (
          <label className="block text-sm">
            <span className="mb-1 block font-medium">العنوان</span>
            <input
              required
              maxLength={255}
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              className={inputClass}
            />
          </label>
        ) : null}

        {deliveryMessage ? (
          <p className="text-sm text-red-700">{deliveryMessage}</p>
        ) : null}

        <div className="space-y-1 text-sm">
          <p className="flex justify-between">
            <span>المنتجات</span>
            <span>{formatDA(subtotal)}</span>
          </p>
          <p className="flex justify-between">
            <span>التوصيل</span>
            <span>
              {deliveryLoading
                ? "..."
                : deliveryFee === null
                  ? "—"
                  : formatDA(deliveryFee)}
            </span>
          </p>
          <p className="flex justify-between text-base font-bold">
            <span>المجموع</span>
            <span>{deliveryFee === null ? "—" : formatDA(total)}</span>
          </p>
        </div>

        {error ? <p className="text-sm text-red-700">{error}</p> : null}

        <button
          type="submit"
          disabled={sending || deliveryFee === null}
          className="min-h-12 w-full rounded-xl bg-[#251713] text-base font-bold text-white disabled:opacity-50"
        >
          {sending ? "جارٍ الإرسال..." : "تأكيد الطلب"}
        </button>
      </section>
    </form>
  );
}
