"use client";

import {
  type FormEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
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
  type CampaignVariant,
} from "@/lib/api";

type DeliveryType = "home" | "office";
type OrderState =
  | { status: "idle" }
  | { status: "sending" }
  | { status: "error"; message: string };

const inputClass =
  "min-h-12 w-full min-w-0 rounded-[10px] border border-[#251713]/10 bg-white px-3.5 text-base text-[#251713] outline-none transition placeholder:text-[#251713]/25 focus:border-[#ECAB1C] focus:ring-2 focus:ring-[#ECAB1C]/10";

function formatPriceDA(amount: number) {
  return (
    new Intl.NumberFormat("fr-DZ", {
      maximumFractionDigits: 0,
    }).format(amount) + " DA"
  );
}

function localizeColorLabel(value: string) {
  const labels: Record<string, string> = {
    rouge: "أحمر",
    vert: "أخضر",
    bleu: "أزرق",
    rose: "وردي",
    "bleu ciel": "أزرق سماوي",
    jaune: "أصفر",
    blanc: "أبيض",
    noir: "أسود",
    multicolore: "متعدد الألوان",
    multicolor: "متعدد الألوان",
  };

  return labels[value.trim().toLocaleLowerCase("fr")] ?? value;
}

function unitPrice(item: CampaignItem, variant: CampaignVariant | null) {
  return item.price + (variant?.isMulticolor ? 500 : 0);
}

export function CampaignOrder({ campaign }: { campaign: CampaignPage }) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(campaign.items[0]?.id ?? "");
  const [variantId, setVariantId] = useState(
    campaign.items[0]?.variants[0]?.id ?? "",
  );
  const [quantity, setQuantity] = useState(1);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [personalization, setPersonalization] = useState("");
  const [address, setAddress] = useState("");
  const [deliveryType, setDeliveryType] = useState<DeliveryType>("home");
  const [wilayas, setWilayas] = useState<ApiWilaya[]>([]);
  const [wilayaCode, setWilayaCode] = useState("");
  const [wilayasLoading, setWilayasLoading] = useState(true);
  const [wilayasError, setWilayasError] = useState("");
  const [communes, setCommunes] = useState<ApiCommune[]>([]);
  const [communeId, setCommuneId] = useState("");
  const [communesLoading, setCommunesLoading] = useState(false);
  const [communesError, setCommunesError] = useState("");
  const [deliveryFee, setDeliveryFee] = useState<number | null>(null);
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [deliveryMessage, setDeliveryMessage] = useState("");
  const [orderState, setOrderState] = useState<OrderState>({ status: "idle" });

  const item =
    campaign.items.find((entry) => entry.id === selectedId) ??
    campaign.items[0];
  const variant =
    item?.variants.find((entry) => entry.id === variantId) ??
    item?.variants[0] ??
    null;

  const selectedWilaya = useMemo(
    () => wilayas.find((entry) => String(entry.code) === wilayaCode) ?? null,
    [wilayaCode, wilayas],
  );
  const selectedCommune = useMemo(
    () => communes.find((entry) => String(entry.id) === communeId) ?? null,
    [communeId, communes],
  );

  useEffect(() => {
    let cancelled = false;
    setWilayasLoading(true);
    getWilayas()
      .then((rows) => {
        if (!cancelled) setWilayas(rows);
      })
      .catch(() => {
        if (!cancelled) setWilayasError("تعذر تحميل الولايات.");
      })
      .finally(() => {
        if (!cancelled) setWilayasLoading(false);
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
    setCommunesLoading(true);
    setCommunesError("");
    getCommunes(Number(wilayaCode))
      .then((rows) => {
        if (!cancelled) setCommunes(rows);
      })
      .catch(() => {
        if (!cancelled) {
          setCommunes([]);
          setCommunesError("تعذر تحميل البلديات.");
        }
      })
      .finally(() => {
        if (!cancelled) setCommunesLoading(false);
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
          setDeliveryMessage("تعذر حساب سعر التوصيل عبر ياليدين.");
        }
      })
      .finally(() => {
        if (!cancelled) setDeliveryLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedWilaya, selectedCommune, deliveryType]);

  if (!item) return null;

  const price = unitPrice(item, variant);
  const subtotal = price * quantity;
  const total = deliveryFee === null ? null : subtotal + deliveryFee;
  const detailsStep = item.personalizable ? "2" : null;
  const deliveryStep = item.personalizable ? "3" : "2";
  const totalStep = item.personalizable ? "4" : "3";
  const canSubmit =
    orderState.status !== "sending" &&
    fullName.trim().length >= 2 &&
    Boolean(selectedWilaya && selectedCommune) &&
    deliveryFee !== null &&
    (deliveryType === "office" || Boolean(address.trim())) &&
    (!item.personalizable || Boolean(personalization.trim())) &&
    (item.variants.length === 0 || Boolean(variant));

  function chooseProduct(next: CampaignItem) {
    setSelectedId(next.id);
    setVariantId(next.variants[0]?.id ?? "");
    setPersonalization("");
    setQuantity(1);
    setOrderState({ status: "idle" });
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSubmit || !item) return;

    if (item.variants.length > 0 && !variant) {
      setOrderState({
        status: "error",
        message: "اختر اللون أو الخيار المناسب قبل تأكيد الطلب.",
      });
      return;
    }

    setOrderState({ status: "sending" });

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignSlug: campaign.slug,
          fullName,
          phone,
          address,
          commune: selectedCommune?.name,
          wilayaCode: selectedWilaya?.code,
          communeId: selectedCommune?.id,
          deliveryType,
          lines: [
            {
              itemId: item.id,
              variantId: variant?.id,
              quantity,
              personalization: personalization.trim(),
            },
          ],
        }),
      });
      const data = (await response.json()) as {
        message?: string;
        reference?: string;
        guestAccessToken?: string;
      };

      if (!response.ok || !data.reference) {
        setOrderState({
          status: "error",
          message: data.message || "تعذر إرسال الطلب.",
        });
        return;
      }

      if (data.guestAccessToken) {
        setGuestOrderAccessToken(data.reference, data.guestAccessToken);
      }

      router.replace(`/commande/${encodeURIComponent(data.reference)}`);
    } catch {
      setOrderState({ status: "error", message: "تعذر إرسال الطلب." });
    }
  }

  return (
    <section className="mx-auto w-full max-w-[1240px] overflow-x-hidden px-3 py-3 pb-16 sm:px-5 sm:py-6 md:px-6 lg:px-8 lg:py-8">
      <div className="mb-4 sm:mb-5">
        <p className="text-[11px] font-extrabold tracking-[0.14em] text-[#8A6A20]">
          Campagne | حملة
        </p>
        <h1 className="mt-1 text-[26px] font-semibold leading-tight tracking-[-0.03em] sm:text-[34px]">
          {campaign.publicTitle}
        </h1>
      </div>

      <div className="grid min-w-0 gap-4 sm:gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.92fr)] xl:items-start xl:gap-8">
        <div className="min-w-0 space-y-3 sm:space-y-4 xl:sticky xl:top-5">
          <div className="rounded-[18px] border border-[#251713]/[0.07] bg-white p-3 shadow-[0_12px_35px_rgba(37,23,19,0.05)] sm:p-4">
            <p className="mb-3 text-[11px] font-extrabold text-[#251713]/60">
              Produit | اختر المنتج
            </p>
            <div className="grid grid-cols-1 gap-2 min-[520px]:grid-cols-2">
              {campaign.items.map((entry) => {
                const active = entry.id === item.id;
                return (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => chooseProduct(entry)}
                    aria-pressed={active}
                    className={[
                      "flex min-h-[76px] items-center gap-3 rounded-[12px] border p-2 text-right transition",
                      active
                        ? "border-[#ECAB1C] bg-[#FFF8E8]"
                        : "border-[#251713]/10 bg-[#FFFCF8] hover:border-[#251713]/20",
                    ].join(" ")}
                  >
                    {entry.imageUrl ? (
                      <img
                        src={entry.imageUrl}
                        alt=""
                        className="h-16 w-16 shrink-0 rounded-[10px] object-cover"
                      />
                    ) : (
                      <span className="h-16 w-16 shrink-0 rounded-[10px] bg-[#EDE3D7]" />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-extrabold">
                        {entry.title}
                      </span>
                      <span className="mt-0.5 block truncate text-[12px] text-[#251713]/50">
                        {entry.name}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative block w-full overflow-hidden rounded-[18px] border border-[#251713]/[0.07] bg-[#EDE3D7] shadow-[0_18px_45px_rgba(37,23,19,0.08)] sm:rounded-[22px]">
            <div className="relative aspect-square sm:aspect-[4/3] lg:aspect-square">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-[#251713]/25">
                  Michket
                </div>
              )}
            </div>
          </div>

          {item.variants.length > 0 ? (
            <div className="rounded-[12px] border border-[#251713]/[0.07] bg-white p-3 shadow-[0_7px_18px_rgba(37,23,19,0.03)]">
              <p className="mb-2 text-[11px] font-extrabold text-[#251713]/60">
                Couleur | اختر اللون
              </p>
              <p className="mb-3 text-[12px] leading-5 text-[#251713]/55">
                كل الألوان بنفس السعر. متعدد الألوان: +500 دج
              </p>
              <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2 sm:grid-cols-3">
                {item.variants.map((choice) => {
                  const label = localizeColorLabel(choice.name);
                  const active = variant?.id === choice.id;
                  return (
                    <button
                      key={choice.id}
                      type="button"
                      onClick={() => setVariantId(choice.id)}
                      aria-pressed={active}
                      className={[
                        "flex min-h-[42px] min-w-0 items-center gap-2 rounded-[9px] border px-2.5 py-1.5 text-right transition",
                        active
                          ? "border-[#ECAB1C] bg-[#FFF8E8]"
                          : "border-[#251713]/10 bg-[#FFFCF8] hover:border-[#251713]/20",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "relative h-5 w-5 shrink-0 overflow-hidden rounded-full border",
                          active ? "border-[#ECAB1C]" : "border-black/10",
                        ].join(" ")}
                      >
                        {choice.isMulticolor ? (
                          <span
                            className="absolute inset-0"
                            style={{
                              background:
                                "conic-gradient(from 0deg, #FF3B30, #FF9500, #FFCC00, #34C759, #00C7BE, #007AFF, #5856D6, #AF52DE, #FF2D55, #FF3B30)",
                            }}
                          />
                        ) : (
                          <span
                            className="absolute inset-0"
                            style={{ backgroundColor: choice.hex || "#E7DED3" }}
                          />
                        )}
                      </span>
                      <span className="min-w-0 flex-1 break-words text-[13px] font-bold leading-4">
                        {label}
                        {choice.isMulticolor ? (
                          <span className="mt-0.5 block text-[11px] font-semibold text-[#8A6A20]">
                            +500 DA
                          </span>
                        ) : null}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div className="rounded-[18px] border border-[#251713]/[0.07] bg-white p-4 shadow-[0_12px_35px_rgba(37,23,19,0.05)] sm:p-6">
            <h2 className="text-[22px] font-semibold leading-snug tracking-[-0.03em] sm:text-[32px]">
              {item.title}
            </h2>
            <p className="mt-1 text-[13px] text-[#251713]/50">{item.name}</p>
            <div className="mt-3 flex flex-wrap items-end gap-3">
              <span className="text-[27px] font-extrabold tracking-[-0.04em] sm:text-[32px]">
                {formatPriceDA(price)}
              </span>
            </div>
            <button
              type="button"
              onClick={() =>
                document.getElementById("michket-order-form")?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                })
              }
              className="mt-5 flex min-h-[52px] w-full items-center justify-center rounded-[11px] bg-[#ECAB1C] px-5 text-[12px] font-extrabold tracking-[0.08em] text-[#251713] shadow-[0_10px_24px_rgba(236,171,28,0.24)] transition hover:bg-[#F1B82F]"
            >
              اطلب الآن
            </button>
          </div>
        </div>

        <form
          id="michket-order-form"
          onSubmit={handleSubmit}
          className="scroll-mt-4 overflow-hidden rounded-[18px] border border-[#251713]/[0.08] bg-[#FFFCF8] shadow-[0_18px_45px_rgba(37,23,19,0.08)] sm:rounded-[22px]"
        >
          <div className="h-1.5 bg-[#ECAB1C]" />
          <div className="border-b border-[#251713]/[0.07] bg-white p-4 sm:p-6">
            <div className="flex flex-col gap-3 min-[440px]:flex-row min-[440px]:items-start min-[440px]:justify-between">
              <div>
                <p className="text-[9px] font-extrabold tracking-[0.14em] text-[#8A6A20]">
                  Commande rapide | طلب سريع
                </p>
                <h2 className="mt-1 text-[20px] font-semibold leading-snug tracking-[-0.03em] sm:text-[28px]">
                  اطلب بسهولة في بضع خطوات
                </h2>
                <p className="mt-1 text-[11px] leading-5 text-[#251713]/45">
                  أدخل معلوماتك، اختر طريقة التوصيل ثم أكّد طلبك.
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-[#FFF4D5] px-3 py-1.5 text-[12px] font-extrabold text-[#8A6200]">
                {formatPriceDA(price)}
              </span>
            </div>
          </div>

          <div className="space-y-4 p-3 sm:space-y-5 sm:p-5 lg:p-6">
            <FormSection
              number="1"
              title={<BilingualText fr="Vos informations" ar="معلوماتك" />}
              subtitle="نحتاجها لتأكيد الطلب وتوصيله إليك."
            >
              <Field
                label={<BilingualText fr="Nom et prénom" ar="الاسم واللقب" />}
                required
              >
                <input
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  required
                  minLength={2}
                  maxLength={200}
                  autoComplete="name"
                  className={inputClass}
                  placeholder="اكتب الاسم واللقب"
                />
              </Field>
              <Field
                label={<BilingualText fr="Téléphone" ar="رقم الهاتف" />}
                required
              >
                <input
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  required
                  autoComplete="tel"
                  inputMode="tel"
                  dir="ltr"
                  className={`${inputClass} !text-left`}
                  placeholder="05 XX XX XX XX"
                />
              </Field>
            </FormSection>

            {item.personalizable ? (
              <FormSection
                number={detailsStep ?? "2"}
                title={
                  <BilingualText fr="Détails de la commande" ar="تفاصيل الطلب" />
                }
                subtitle={
                  item.orderDetailsPrompt || "اكتب كل تفاصيل طلبك في هذا الحقل."
                }
              >
                <Field
                  label={<BilingualText fr="Votre message" ar="تفاصيل طلبك" />}
                  required
                >
                  <textarea
                    value={personalization}
                    onChange={(event) => setPersonalization(event.target.value)}
                    required
                    maxLength={500}
                    rows={4}
                    className={`${inputClass} min-h-[105px] resize-y py-3`}
                    placeholder="اكتب هنا الاسم، التاريخ أو أي تفصيل تريد نقشه"
                  />
                </Field>
              </FormSection>
            ) : null}

            <FormSection
              number={deliveryStep}
              title={<BilingualText fr="Livraison" ar="التوصيل" />}
              subtitle="يُحسب سعر التوصيل تلقائيًا."
            >
              <div className="grid gap-3 md:grid-cols-2">
                <Field label={<BilingualText fr="Wilaya" ar="الولاية" />} required>
                  <select
                    value={wilayaCode}
                    onChange={(event) => {
                      setWilayaCode(event.target.value);
                      setCommuneId("");
                    }}
                    required
                    disabled={wilayasLoading || Boolean(wilayasError)}
                    className={`${inputClass} disabled:bg-[#EFE8DF] disabled:text-[#251713]/30`}
                  >
                    <option value="">
                      {wilayasLoading ? "جارٍ تحميل الولايات..." : "اختر الولاية"}
                    </option>
                    {wilayas.map((wilaya) => (
                      <option
                        key={wilaya.code}
                        value={wilaya.code}
                        disabled={!wilaya.available}
                      >
                        {String(wilaya.code).padStart(2, "0")} — {wilaya.name}
                      </option>
                    ))}
                  </select>
                  {wilayasError ? (
                    <span className="mt-1 block text-[10px] font-medium text-red-700">
                      {wilayasError}
                    </span>
                  ) : null}
                </Field>
                <Field label={<BilingualText fr="Commune" ar="البلدية" />} required>
                  <select
                    value={communeId}
                    onChange={(event) => {
                      const nextId = event.target.value;
                      const next =
                        communes.find((entry) => String(entry.id) === nextId) ??
                        null;
                      setCommuneId(nextId);
                      if (deliveryType === "office" && next?.hasStopDesk !== true) {
                        setDeliveryType("home");
                      }
                    }}
                    required
                    disabled={!wilayaCode || communesLoading || Boolean(communesError)}
                    className={`${inputClass} disabled:bg-[#EFE8DF] disabled:text-[#251713]/30`}
                  >
                    <option value="">
                      {!wilayaCode
                        ? "اختر الولاية أولًا"
                        : communesLoading
                          ? "جارٍ تحميل البلديات..."
                          : "اختر البلدية"}
                    </option>
                    {communes.map((commune) => (
                      <option
                        key={commune.id}
                        value={commune.id}
                        disabled={!commune.available}
                      >
                        {commune.name}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div>
                <span className="mb-2 block text-[10px] font-bold tracking-[0.06em] text-[#251713]/55">
                  Mode de livraison | طريقة التوصيل *
                </span>
                <div className="grid grid-cols-1 gap-2.5 min-[430px]:grid-cols-2">
                  <DeliveryChoice
                    active={deliveryType === "home"}
                    title={<BilingualText fr="Domicile" ar="إلى المنزل" />}
                    price={
                      deliveryType === "home" && deliveryFee !== null
                        ? formatPriceDA(deliveryFee)
                        : undefined
                    }
                    disabled={!selectedCommune?.available}
                    onClick={() => setDeliveryType("home")}
                  />
                  <DeliveryChoice
                    active={deliveryType === "office"}
                    title={<BilingualText fr="Bureau Yalidine" ar="مكتب ياليدين" />}
                    price={
                      deliveryType === "office" && deliveryFee !== null
                        ? formatPriceDA(deliveryFee)
                        : undefined
                    }
                    disabled={
                      !selectedCommune?.available ||
                      selectedCommune.hasStopDesk !== true
                    }
                    unavailableText={
                      selectedCommune && selectedCommune.hasStopDesk !== true
                        ? "غير متاح"
                        : undefined
                    }
                    onClick={() => setDeliveryType("office")}
                  />
                </div>
              </div>

              {deliveryType === "home" ? (
                <Field label={<BilingualText fr="Adresse" ar="العنوان" />} required>
                  <input
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                    required
                    autoComplete="street-address"
                    className={inputClass}
                    placeholder="الحي، الشارع، رقم المنزل..."
                  />
                </Field>
              ) : null}

              <div className="min-h-5 text-[10px]">
                {deliveryLoading ? (
                  <span className="text-[#251713]/45">جارٍ حساب سعر التوصيل...</span>
                ) : deliveryMessage ? (
                  <span className="font-medium text-amber-800">{deliveryMessage}</span>
                ) : deliveryFee !== null ? (
                  <span className="font-semibold text-emerald-700">
                    التوصيل: {formatPriceDA(deliveryFee)}
                  </span>
                ) : null}
              </div>
            </FormSection>

            <FormSection
              number={totalStep}
              title={<BilingualText fr="Votre total" ar="إجمالي الطلب" />}
              subtitle="ستدفع هذا المبلغ عند الاستلام."
            >
              <div className="rounded-[14px] border border-[#251713]/[0.08] bg-[#F7F1E8] p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold">
                    Quantité | الكمية
                  </span>
                  <div className="flex items-center overflow-hidden rounded-[9px] border border-[#251713]/10 bg-white">
                    <button
                      type="button"
                      onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                      className="flex h-10 w-10 items-center justify-center text-lg"
                      aria-label="تقليل الكمية"
                    >
                      −
                    </button>
                    <span className="flex h-10 min-w-10 items-center justify-center border-x border-[#251713]/10 px-2 text-xs font-bold">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((value) => Math.min(10, value + 1))}
                      className="flex h-10 w-10 items-center justify-center text-lg"
                      aria-label="زيادة الكمية"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="my-3 h-px bg-[#251713]/[0.08]" />
                <div className="space-y-2 text-[12px]">
                  <PriceRow
                    label={<BilingualText fr="Produit" ar="المنتج" />}
                    value={formatPriceDA(subtotal)}
                  />
                  <PriceRow
                    label={<BilingualText fr="Livraison" ar="التوصيل" />}
                    value={
                      deliveryLoading
                        ? "جارٍ الحساب..."
                        : deliveryFee === null
                          ? "—"
                          : formatPriceDA(deliveryFee)
                    }
                  />
                </div>
                <div className="my-3 h-px bg-[#251713]/[0.08]" />
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <span className="text-[11px] font-extrabold tracking-[0.1em] text-[#8A6A20]">
                    Total à payer | المبلغ الإجمالي
                  </span>
                  <span className="text-[24px] font-extrabold tracking-[-0.04em] sm:text-[30px]">
                    {total === null ? "—" : formatPriceDA(total)}
                  </span>
                </div>
              </div>

              {orderState.status === "error" ? (
                <div className="rounded-[10px] border border-red-800/10 bg-red-50 p-3 text-[11px] font-medium text-red-800">
                  {orderState.message}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={!canSubmit}
                className="flex min-h-[58px] w-full items-center justify-center rounded-[12px] bg-[#ECAB1C] px-5 text-[13px] font-extrabold tracking-[0.09em] text-[#251713] shadow-[0_14px_30px_rgba(236,171,28,0.28)] transition hover:bg-[#F1B82F] disabled:cursor-not-allowed disabled:bg-[#D8C8A3] disabled:text-[#251713]/45"
              >
                {orderState.status === "sending"
                  ? "جارٍ إرسال الطلب..."
                  : "تأكيد الطلب"}
              </button>
              <p className="text-center text-[10px] font-medium text-[#251713]/45">
                الدفع عند الاستلام · تأكيد سريع للطلب
              </p>
            </FormSection>
          </div>
        </form>
      </div>
    </section>
  );
}

function BilingualText({ fr, ar }: { fr: string; ar: string }) {
  return (
    <span dir="ltr" className="inline-flex flex-wrap items-baseline justify-end gap-x-1">
      <span lang="fr">{fr}</span>
      <span aria-hidden="true" className="text-[#251713]/30">
        |
      </span>
      <span lang="ar" dir="rtl">
        {ar}
      </span>
    </span>
  );
}

function Field({
  label,
  required = false,
  children,
}: {
  label: ReactNode;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-bold tracking-[0.055em] text-[#251713]/55">
        {label}
        {required ? <span className="mr-1 text-[#A87406]">*</span> : null}
      </span>
      {children}
    </label>
  );
}

function DeliveryChoice({
  active,
  title,
  price,
  disabled = false,
  unavailableText,
  onClick,
}: {
  active: boolean;
  title: ReactNode;
  price?: string;
  disabled?: boolean;
  unavailableText?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-[11px] border p-3.5 text-right transition ${
        disabled
          ? "cursor-not-allowed border-[#251713]/[0.06] bg-[#EFE8DF] text-[#251713]/35"
          : active
            ? "border-[#ECAB1C] bg-[#FFF8E8]"
            : "border-[#251713]/10 bg-white"
      }`}
    >
      <p className="text-[11px] font-bold">{title}</p>
      {price && !disabled ? (
        <p className="mt-1 text-[10px] font-extrabold text-[#8A6A20]">{price}</p>
      ) : null}
      {unavailableText && disabled ? (
        <p className="mt-1 text-[9px] font-semibold">{unavailableText}</p>
      ) : null}
    </button>
  );
}

function FormSection({
  number,
  title,
  subtitle,
  children,
}: {
  number: string;
  title: ReactNode;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[15px] border border-[#251713]/[0.07] bg-white p-3.5 sm:p-5">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#ECAB1C] text-[11px] font-extrabold text-[#251713]">
          {number}
        </span>
        <div>
          <h3 className="text-[13px] font-extrabold text-[#251713]">{title}</h3>
          <p className="mt-0.5 text-[10px] leading-4 text-[#251713]/45">{subtitle}</p>
        </div>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function PriceRow({ label, value }: { label: ReactNode; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[#251713]/48">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
