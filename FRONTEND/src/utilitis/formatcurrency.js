export function formatPrice(amount, currency = "PKR") {
  if (amount == null) return "";

  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount);
}

export function formatOrderWhen(iso, opts = {}) {
  const { dateStyle = "medium" } = opts;
  if (!iso) return "";

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat(undefined, {
    dateStyle,
    timeStyle: "short",
  }).format(date);
}