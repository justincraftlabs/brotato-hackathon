const VND_LOCALE = "vi-VN";
const VND_SUFFIX = "\u0111";
const KWH_SUFFIX = " kWh";
const CO2_SUFFIX = " kg CO\u2082";
const PERCENT_SYMBOL = "%";

export function formatVnd(amount: number): string {
  const formatted = new Intl.NumberFormat(VND_LOCALE).format(Math.round(amount));
  return `${formatted}${VND_SUFFIX}`;
}

export function formatKwh(kwh: number): string {
  const rounded = Math.round(kwh * 10) / 10;
  return `${rounded}${KWH_SUFFIX}`;
}

export function formatPercent(value: number): string {
  const rounded = Math.round(value);
  const sign = rounded > 0 ? "+" : "";
  return `${sign}${rounded}${PERCENT_SYMBOL}`;
}

export function formatCo2(kg: number): string {
  const rounded = Math.round(kg * 10) / 10;
  return `${rounded}${CO2_SUFFIX}`;
}
