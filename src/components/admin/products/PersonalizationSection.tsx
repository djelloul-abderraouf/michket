"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";

/* ── Types ── */

type PersonalizationMode =
  | "NONE"
  | "FREE"
  | "OPTIONS"
  | "INVALID";

type OptionField = {
  id: string;
  label: string;
  type: "TEXT" | "SELECT";
  required: boolean;
  placeholder: string;
  maxLength: string;
  options: string[];
};

export type PersonalizationPayload = {
  isPersonalizable: boolean;
  personalizationPrompt: string | undefined;
  personalizationConfig:
    | {
        version: 1;
        mode: "FREE";
        label: string;
        placeholder?: string;
        required: boolean;
        maxLength?: number;
      }
    | {
        version: 1;
        mode: "OPTIONS";
        fields: Array<
          | {
              id: string;
              label: string;
              type: "TEXT";
              required: boolean;
              placeholder?: string;
              maxLength?: number;
            }
          | {
              id: string;
              label: string;
              type: "SELECT";
              required: boolean;
              options: string[];
            }
        >;
      }
    | null;
};

export type PersonalizationSectionHandle = {
  getPayload: () => PersonalizationPayload;
  getValidationErrors: () => string[];
};

type Props = {
  /** Pre-fill from existing product config (edit mode) */
  initialIsPersonalizable?: boolean;
  initialPersonalizationPrompt?: string | null;
  initialPersonalizationConfig?: Record<string, unknown> | null;
  /** CSS class names (shared with parent form) */
  inputClassName: string;
  textareaClassName: string;
  labelClassName: string;
};

/* ── Helpers ── */

let fieldCounter = 0;
function generateFieldId(): string {
  fieldCounter += 1;
  return `field_${fieldCounter}_${Date.now().toString(36)}`;
}

/**
 * Determine if an existing config is a valid FREE config.
 */
function isValidFreeConfig(
  config: Record<string, unknown>,
): boolean {
  if (config.version !== 1) return false;
  if (config.mode !== "FREE") return false;
  // label is required for FREE
  if (typeof config.label !== "string") return false;
  return true;
}

/**
 * Determine if an existing config is a valid OPTIONS config.
 */
function isValidOptionsConfig(
  config: Record<string, unknown>,
): boolean {
  if (config.version !== 1) return false;
  if (config.mode !== "OPTIONS") return false;
  if (!Array.isArray(config.fields)) return false;
  // Each field must have id, label, type
  for (const f of config.fields) {
    if (
      typeof f !== "object" ||
      f === null ||
      typeof (f as Record<string, unknown>).id !== "string" ||
      typeof (f as Record<string, unknown>).label !==
        "string" ||
      ((f as Record<string, unknown>).type !== "TEXT" &&
        (f as Record<string, unknown>).type !== "SELECT")
    ) {
      return false;
    }
  }
  return true;
}

function deriveInitialState(
  isPersonalizable: boolean | undefined,
  prompt: string | null | undefined,
  config: Record<string, unknown> | null | undefined,
): {
  mode: PersonalizationMode;
  effectivePrompt: string;
  freeLabel: string;
  freePlaceholder: string;
  freeRequired: boolean;
  freeMaxLength: string;
  optionFields: OptionField[];
} {
  const defaults = {
    effectivePrompt: prompt ?? "",
    freeLabel: "Votre texte",
    freePlaceholder: "",
    freeRequired: true,
    freeMaxLength: "50",
    optionFields: [] as OptionField[],
  };

  // Case 1: product is not personalizable → NONE
  if (!isPersonalizable) {
    return { mode: "NONE", ...defaults };
  }

  // Case 2: isPersonalizable=true but config is null/missing → INVALID
  if (!config) {
    return { mode: "INVALID", ...defaults };
  }

  // Case 3: config exists — validate it
  if (isValidFreeConfig(config)) {
    return {
      mode: "FREE",
      effectivePrompt: prompt ?? "",
      freeLabel:
        typeof config.label === "string"
          ? config.label
          : "Votre texte",
      freePlaceholder:
        typeof config.placeholder === "string"
          ? config.placeholder
          : "",
      freeRequired:
        typeof config.required === "boolean"
          ? config.required
          : true,
      freeMaxLength:
        typeof config.maxLength === "number"
          ? String(config.maxLength)
          : "50",
      optionFields: [],
    };
  }

  if (isValidOptionsConfig(config)) {
    return {
      mode: "OPTIONS",
      effectivePrompt: prompt ?? "",
      freeLabel: "Votre texte",
      freePlaceholder: "",
      freeRequired: true,
      freeMaxLength: "50",
      optionFields: (config.fields as Record<string, unknown>[]).map(
        (f) => ({
          id:
            typeof f.id === "string"
              ? f.id
              : generateFieldId(),
          label: typeof f.label === "string" ? f.label : "",
          type:
            f.type === "SELECT" ? "SELECT" : ("TEXT" as const),
          required:
            typeof f.required === "boolean"
              ? f.required
              : true,
          placeholder:
            typeof f.placeholder === "string"
              ? f.placeholder
              : "",
          maxLength:
            typeof f.maxLength === "number"
              ? String(f.maxLength)
              : "50",
          options:
            f.type === "SELECT" && Array.isArray(f.options)
              ? f.options.filter(
                  (o: unknown) => typeof o === "string",
                )
              : [],
        }),
      ),
    };
  }

  // Case 4: isPersonalizable=true but config is malformed → INVALID
  return { mode: "INVALID", ...defaults };
}

/* ── Component ── */

const PersonalizationSection = forwardRef<
  PersonalizationSectionHandle,
  Props
>(function PersonalizationSection(
  {
    initialIsPersonalizable,
    initialPersonalizationPrompt,
    initialPersonalizationConfig,
    inputClassName,
    textareaClassName,
    labelClassName,
  },
  ref,
) {
  const [initialState] = useState(() =>
    deriveInitialState(
      initialIsPersonalizable,
      initialPersonalizationPrompt,
      initialPersonalizationConfig,
    ),
  );

  const [personalizationMode, setPersonalizationMode] =
    useState<PersonalizationMode>(initialState.mode);
  const [personalizationPrompt, setPersonalizationPrompt] =
    useState(initialState.effectivePrompt);

  // FREE mode state
  const [freeLabel, setFreeLabel] = useState(
    initialState.freeLabel,
  );
  const [freePlaceholder, setFreePlaceholder] = useState(
    initialState.freePlaceholder,
  );
  const [freeRequired, setFreeRequired] = useState(
    initialState.freeRequired,
  );
  const [freeMaxLength, setFreeMaxLength] = useState(
    initialState.freeMaxLength,
  );

  // OPTIONS mode state
  const [optionFields, setOptionFields] = useState<
    OptionField[]
  >(initialState.optionFields);

  /* ── Option field helpers ── */

  const addOptionField = useCallback(() => {
    setOptionFields((prev) => [
      ...prev,
      {
        id: generateFieldId(),
        label: "",
        type: "TEXT",
        required: true,
        placeholder: "",
        maxLength: "50",
        options: [],
      },
    ]);
  }, []);

  const removeOptionField = useCallback((index: number) => {
    setOptionFields((prev) =>
      prev.filter((_, i) => i !== index),
    );
  }, []);

  const moveOptionField = useCallback(
    (index: number, direction: -1 | 1) => {
      setOptionFields((prev) => {
        const newIndex = index + direction;
        if (
          newIndex < 0 ||
          newIndex >= prev.length
        )
          return prev;
        const next = [...prev];
        [next[index], next[newIndex]] = [
          next[newIndex],
          next[index],
        ];
        return next;
      });
    },
    [],
  );

  const updateOptionField = useCallback(
    (
      index: number,
      patch: Partial<Omit<OptionField, "id">>,
    ) => {
      setOptionFields((prev) =>
        prev.map((f, i) =>
          i === index ? { ...f, ...patch } : f,
        ),
      );
    },
    [],
  );

  const addSelectOption = useCallback(
    (fieldIndex: number) => {
      setOptionFields((prev) =>
        prev.map((f, i) =>
          i === fieldIndex
            ? { ...f, options: [...f.options, ""] }
            : f,
        ),
      );
    },
    [],
  );

  const updateSelectOption = useCallback(
    (fieldIndex: number, optionIndex: number, value: string) => {
      setOptionFields((prev) =>
        prev.map((f, i) =>
          i === fieldIndex
            ? {
                ...f,
                options: f.options.map((o, j) =>
                  j === optionIndex ? value : o,
                ),
              }
            : f,
        ),
      );
    },
    [],
  );

  const removeSelectOption = useCallback(
    (fieldIndex: number, optionIndex: number) => {
      setOptionFields((prev) =>
        prev.map((f, i) =>
          i === fieldIndex
            ? {
                ...f,
                options: f.options.filter(
                  (_, j) => j !== optionIndex,
                ),
              }
            : f,
        ),
      );
    },
    [],
  );

  /* ── Payload builder ── */

  const buildPayload =
    useCallback((): PersonalizationPayload => {
      if (personalizationMode === "NONE") {
        return {
          isPersonalizable: false,
          personalizationPrompt: undefined,
          personalizationConfig: null,
        };
      }

      if (personalizationMode === "FREE") {
        return {
          isPersonalizable: true,
          personalizationPrompt:
            personalizationPrompt.trim() || undefined,
          personalizationConfig: {
            version: 1,
            mode: "FREE",
            label: freeLabel.trim() || "Votre texte",
            ...(freePlaceholder.trim()
              ? { placeholder: freePlaceholder.trim() }
              : {}),
            required: freeRequired,
            ...(Number(freeMaxLength) > 0
              ? { maxLength: Number(freeMaxLength) || 50 }
              : {}),
          },
        };
      }

      if (personalizationMode === "OPTIONS") {
        return {
          isPersonalizable: true,
          personalizationPrompt:
            personalizationPrompt.trim() || undefined,
          personalizationConfig: {
            version: 1 as const,
            mode: "OPTIONS" as const,
            fields: optionFields.map((f) => {
              if (f.type === "SELECT") {
                return {
                  id: f.id,
                  label: f.label.trim(),
                  type: "SELECT" as const,
                  required: f.required,
                  options: f.options
                    .map((o) => o.trim())
                    .filter(Boolean),
                };
              }
              return {
                id: f.id,
                label: f.label.trim(),
                type: "TEXT" as const,
                required: f.required,
                ...(f.placeholder.trim()
                  ? { placeholder: f.placeholder.trim() }
                  : {}),
                maxLength: Number(f.maxLength) || 50,
              };
            }),
          },
        };
      }

      // INVALID — should not normally reach here if
      // validation blocks submit, but return safe default
      return {
        isPersonalizable: false,
        personalizationPrompt: undefined,
        personalizationConfig: null,
      };
    }, [
      personalizationMode,
      personalizationPrompt,
      freeLabel,
      freePlaceholder,
      freeRequired,
      freeMaxLength,
      optionFields,
    ]);

  /* ── Validation ── */

  const getValidationErrors =
    useCallback((): string[] => {
      const errors: string[] = [];

      // INVALID state blocks submit
      if (personalizationMode === "INVALID") {
        errors.push(
          "Ce produit possède une ancienne configuration de personnalisation invalide. Choisissez un nouveau mode de personnalisation avant d'enregistrer.",
        );
        return errors;
      }

      if (personalizationMode === "FREE") {
        if (!freeLabel.trim()) {
          errors.push(
            "Le libellé du champ libre est requis.",
          );
        }
        const ml = Number(freeMaxLength);
        if (
          freeMaxLength &&
          (!Number.isInteger(ml) || ml < 1 || ml > 500)
        ) {
          errors.push(
            "Le nombre maximum de caractères doit être entre 1 et 500.",
          );
        }
      }

      if (personalizationMode === "OPTIONS") {
        if (optionFields.length === 0) {
          errors.push(
            "Ajoutez au moins un champ de personnalisation.",
          );
        }
        for (let i = 0; i < optionFields.length; i++) {
          const f = optionFields[i];
          if (!f.id.trim()) {
            errors.push(
              `Le champ #${i + 1} n'a pas d'identifiant.`,
            );
          }
          if (!f.label.trim()) {
            errors.push(
              `Le libellé du champ #${i + 1} est requis.`,
            );
          }
          if (
            f.type === "SELECT" &&
            f.options.filter((o) => o.trim()).length < 2
          ) {
            errors.push(
              `Le champ SELECT "${f.label || `#${i + 1}`}" doit avoir au moins 2 options.`,
            );
          }
        }
      }

      return errors;
    }, [
      personalizationMode,
      freeLabel,
      freeMaxLength,
      optionFields,
    ]);

  /* ── Expose via ref ── */

  useImperativeHandle(
    ref,
    () => ({
      getPayload: buildPayload,
      getValidationErrors,
    }),
    [buildPayload, getValidationErrors],
  );

  /* ── Reset config when mode changes (not for INVALID → INVALID) ── */
  useEffect(() => {
    if (personalizationMode === "FREE") {
      setFreeLabel("Votre texte");
      setFreePlaceholder("");
      setFreeRequired(true);
      setFreeMaxLength("50");
      setOptionFields([]);
    } else if (personalizationMode === "OPTIONS") {
      setOptionFields([]);
      setFreeLabel("Votre texte");
      setFreePlaceholder("");
      setFreeRequired(true);
      setFreeMaxLength("50");
    } else {
      // NONE or INVALID — clear everything
      setFreeLabel("Votre texte");
      setFreePlaceholder("");
      setFreeRequired(true);
      setFreeMaxLength("50");
      setOptionFields([]);
    }
  }, [personalizationMode]);

  /* ── Render ── */

  return (
    <section className="rounded-2xl border border-black/[0.07] bg-white p-5 shadow-[0_8px_30px_rgba(23,23,20,0.035)] sm:p-6">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
          Configuration
        </p>
        <h2 className="mt-1 text-lg font-semibold tracking-[-0.025em] text-neutral-950">
          Personnalisation
        </h2>
      </div>

      <div className="space-y-5">
        {/* ── INVALID state warning ── */}
        {personalizationMode === "INVALID" && (
          <div
            role="alert"
            className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800"
          >
            <p className="font-semibold">
              Configuration de personnalisation invalide
            </p>
            <p className="mt-1">
              Ce produit possède une ancienne configuration de
              personnalisation invalide. Choisissez un nouveau mode
              de personnalisation ci-dessous avant d'enregistrer.
            </p>
          </div>
        )}

        {/* ── Mode selector ── */}
        <div>
          <p className={labelClassName}>
            Personnalisation
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              {
                value: "NONE" as const,
                title: "Non personnalisable",
                desc: "Produit classique, aucune saisie client.",
              },
              {
                value: "FREE" as const,
                title: "Personnalisation libre",
                desc: "Le client saisit un texte libre.",
              },
              {
                value: "OPTIONS" as const,
                title: "Choix définis par l'admin",
                desc: "Champs et listes configurés par vous.",
              },
            ].map((opt) => (
              <label
                key={opt.value}
                className={[
                  "cursor-pointer rounded-xl border p-4 transition",
                  personalizationMode === opt.value
                    ? "border-neutral-950 bg-neutral-950/[0.03] ring-2 ring-neutral-950/10"
                    : "border-black/[0.07] bg-[#faf9f6] hover:border-neutral-300",
                ].join(" ")}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="personalizationMode"
                    value={opt.value}
                    checked={
                      personalizationMode === opt.value
                    }
                    onChange={() =>
                      setPersonalizationMode(opt.value)
                    }
                    className="mt-0.5 h-4 w-4 accent-neutral-950"
                  />
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">
                      {opt.title}
                    </p>
                    <p className="mt-0.5 text-xs leading-5 text-neutral-500">
                      {opt.desc}
                    </p>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* ── General instruction (FREE & OPTIONS) ── */}
        {personalizationMode !== "NONE" &&
          personalizationMode !== "INVALID" && (
            <div>
              <label
                htmlFor="personalizationPrompt"
                className={labelClassName}
              >
                Instruction générale
              </label>
              <textarea
                id="personalizationPrompt"
                value={personalizationPrompt}
                maxLength={500}
                rows={3}
                onChange={(event) =>
                  setPersonalizationPrompt(
                    event.target.value,
                  )
                }
                placeholder="Ex. Indiquez le prénom et la date à graver."
                className={textareaClassName}
              />
              <p className="mt-1.5 text-right text-[11px] text-neutral-400">
                {personalizationPrompt.length}/500
              </p>
            </div>
          )}

        {/* ── FREE mode config ── */}
        {personalizationMode === "FREE" && (
          <div className="space-y-4 rounded-xl border border-black/[0.07] bg-[#faf9f6] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400">
              Configuration du champ libre
            </p>

            <div>
              <label
                htmlFor="freeLabel"
                className={labelClassName}
              >
                Libellé du champ *
              </label>
              <input
                id="freeLabel"
                type="text"
                value={freeLabel}
                maxLength={120}
                onChange={(e) =>
                  setFreeLabel(e.target.value)
                }
                placeholder="Votre texte"
                className={inputClassName}
              />
            </div>

            <div>
              <label
                htmlFor="freePlaceholder"
                className={labelClassName}
              >
                Placeholder
              </label>
              <input
                id="freePlaceholder"
                type="text"
                value={freePlaceholder}
                maxLength={200}
                onChange={(e) =>
                  setFreePlaceholder(e.target.value)
                }
                placeholder="Ex : Joyeux anniversaire Sarah"
                className={inputClassName}
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <label className="text-sm font-medium text-neutral-700">
                Obligatoire
              </label>
              <button
                type="button"
                role="switch"
                aria-checked={freeRequired}
                onClick={() =>
                  setFreeRequired(!freeRequired)
                }
                className={[
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition",
                  freeRequired
                    ? "bg-neutral-950"
                    : "bg-neutral-300",
                ].join(" ")}
              >
                <span
                  className={[
                    "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
                    freeRequired
                      ? "translate-x-5"
                      : "translate-x-0",
                  ].join(" ")}
                />
              </button>
            </div>

            <div>
              <label
                htmlFor="freeMaxLength"
                className={labelClassName}
              >
                Nombre maximum de caractères
              </label>
              <input
                id="freeMaxLength"
                type="number"
                min={1}
                max={500}
                value={freeMaxLength}
                onChange={(e) =>
                  setFreeMaxLength(e.target.value)
                }
                className={inputClassName}
              />
            </div>
          </div>
        )}

        {/* ── OPTIONS mode config ── */}
        {personalizationMode === "OPTIONS" && (
          <div className="space-y-4 rounded-xl border border-black/[0.07] bg-[#faf9f6] p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400">
                Champs de personnalisation
              </p>
              <span className="text-[11px] text-neutral-400">
                {optionFields.length}/10
              </span>
            </div>

            {optionFields.map((field, fieldIndex) => (
              <div
                key={field.id}
                className="rounded-xl border border-black/[0.07] bg-white p-4 space-y-3"
              >
                {/* Field header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        moveOptionField(fieldIndex, -1)
                      }
                      disabled={fieldIndex === 0}
                      className="h-7 w-7 inline-flex items-center justify-center rounded-lg border border-black/[0.08] text-xs text-neutral-500 hover:bg-neutral-50 disabled:opacity-30"
                      title="Monter"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        moveOptionField(fieldIndex, 1)
                      }
                      disabled={
                        fieldIndex ===
                        optionFields.length - 1
                      }
                      className="h-7 w-7 inline-flex items-center justify-center rounded-lg border border-black/[0.08] text-xs text-neutral-500 hover:bg-neutral-50 disabled:opacity-30"
                      title="Descendre"
                    >
                      ↓
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      removeOptionField(fieldIndex)
                    }
                    className="text-xs font-medium text-red-600 hover:text-red-800"
                  >
                    Supprimer
                  </button>
                </div>

                {/* Label + Type */}
                <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                  <div>
                    <label className="text-xs text-neutral-500">
                      Libellé *
                    </label>
                    <input
                      type="text"
                      value={field.label}
                      maxLength={120}
                      onChange={(e) =>
                        updateOptionField(fieldIndex, {
                          label: e.target.value,
                        })
                      }
                      placeholder="Ex. Prénom"
                      className={inputClassName}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-neutral-500">
                      Type
                    </label>
                    <select
                      value={field.type}
                      onChange={(e) =>
                        updateOptionField(fieldIndex, {
                          type: e.target.value as
                            | "TEXT"
                            | "SELECT",
                        })
                      }
                      className={inputClassName}
                    >
                      <option value="TEXT">TEXT</option>
                      <option value="SELECT">
                        SELECT
                      </option>
                    </select>
                  </div>
                </div>

                {/* Required toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-700">
                    Obligatoire
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={field.required}
                    onClick={() =>
                      updateOptionField(fieldIndex, {
                        required: !field.required,
                      })
                    }
                    className={[
                      "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition",
                      field.required
                        ? "bg-neutral-950"
                        : "bg-neutral-300",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
                        field.required
                          ? "translate-x-5"
                          : "translate-x-0",
                      ].join(" ")}
                    />
                  </button>
                </div>

                {/* TEXT-specific fields */}
                {field.type === "TEXT" && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-xs text-neutral-500">
                        Placeholder
                      </label>
                      <input
                        type="text"
                        value={field.placeholder}
                        maxLength={200}
                        onChange={(e) =>
                          updateOptionField(fieldIndex, {
                            placeholder: e.target.value,
                          })
                        }
                        className={inputClassName}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-neutral-500">
                        Max caractères
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={500}
                        value={field.maxLength}
                        onChange={(e) =>
                          updateOptionField(fieldIndex, {
                            maxLength: e.target.value,
                          })
                        }
                        className={inputClassName}
                      />
                    </div>
                  </div>
                )}

                {/* SELECT-specific: options */}
                {field.type === "SELECT" && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-neutral-500">
                        Options
                      </label>
                      <span className="text-[11px] text-neutral-400">
                        {field.options.length}/10
                      </span>
                    </div>

                    {field.options.map(
                      (opt, optIndex) => (
                        <div
                          key={optIndex}
                          className="flex items-center gap-2"
                        >
                          <input
                            type="text"
                            value={opt}
                            maxLength={120}
                            onChange={(e) =>
                              updateSelectOption(
                                fieldIndex,
                                optIndex,
                                e.target.value,
                              )
                            }
                            placeholder={`Option ${optIndex + 1}`}
                            className={inputClassName}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              removeSelectOption(
                                fieldIndex,
                                optIndex,
                              )
                            }
                            className="text-xs text-red-500 hover:text-red-700"
                          >
                            ✕
                          </button>
                        </div>
                      ),
                    )}

                    {field.options.length < 10 && (
                      <button
                        type="button"
                        onClick={() =>
                          addSelectOption(fieldIndex)
                        }
                        className="text-xs font-medium text-neutral-500 hover:text-neutral-800"
                      >
                        + Ajouter une option
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}

            {optionFields.length < 10 && (
              <button
                type="button"
                onClick={addOptionField}
                className="w-full rounded-xl border border-dashed border-neutral-300 bg-white py-3 text-sm font-medium text-neutral-500 transition hover:border-neutral-400 hover:text-neutral-700"
              >
                + Ajouter un champ
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
});

export default PersonalizationSection;
