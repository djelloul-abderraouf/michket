export function normalizeClientPhoneInput(value: string) {
  return value.replace(/\D/g, "").slice(0, 10);
}

export function clientPhoneError(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!digits) {
    return "Le numero est obligatoire.";
  }
  if (!digits.startsWith("0")) {
    return "Le numero doit commencer par 0.";
  }
  if (digits.length > 10) {
    return "Le numero ne doit pas depasser 10 chiffres.";
  }
  if (digits.length < 10) {
    return "Le numero doit contenir 10 chiffres.";
  }
  return null;
}
