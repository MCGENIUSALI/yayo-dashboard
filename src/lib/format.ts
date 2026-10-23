/** Indicative rate used to show the USD equivalent under FC prices. */
export const FC_PER_USD = 2800;

const fcFormatter = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });
const usdFormatter = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });

/** 1250000 -> "1 250 000 FC" (narrow no-break spaces normalised to plain spaces). */
export function formatFC(amount: number) {
  return `${fcFormatter.format(Math.round(amount)).replace(/ | /g, " ")} FC`;
}

/** 95000 -> "≈ 34 $" */
export function formatUSD(amountFC: number) {
  return `≈ ${usdFormatter.format(Math.round(amountFC / FC_PER_USD)).replace(/ | /g, " ")} $`;
}

/** 4800000 -> "4,8 M FC", 12100 -> "12,1 k" */
export function formatCompact(value: number, suffix = "") {
  const f = new Intl.NumberFormat("fr-FR", { notation: "compact", maximumFractionDigits: 1 });
  return `${f.format(value).replace(/ | /g, " ")}${suffix}`;
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("fr-FR").format(value).replace(/ | /g, " ");
}

export function formatPercent(value: number) {
  return `${value > 0 ? "+" : value < 0 ? "−" : ""}${Math.abs(value).toLocaleString("fr-FR")} %`;
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}
