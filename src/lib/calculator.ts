export interface CalculationResult {
  previousReading: number;
  currentReading: number;
  consumption: number;
  waterCost: number;
  sewerCost: number;
  totalAmount: number;
  breakdown: BreakdownItem[];
}

export interface BreakdownItem {
  label: string;
  units: number;
  rate: number;
  cost: number;
}

const TIERS = [
  { limit: 30, rate: 100, label: "أول ٣٠ متر مكعب" },
  { limit: 30, rate: 120, label: "ثاني ٣٠ متر مكعب" },
  { limit: 30, rate: 140, label: "ثالث ٣٠ متر مكعب" },
  { limit: 30, rate: 160, label: "رابع ٣٠ متر مكعب" },
  { limit: Infinity, rate: 180, label: "خامس ٣٠ وما فوق" },
];

export function calculateWaterBill(
  previousReading: number,
  currentReading: number
): CalculationResult {
  const consumption = currentReading - previousReading;
  const breakdown: BreakdownItem[] = [];
  let remaining = consumption;
  let waterCost = 0;

  for (const tier of TIERS) {
    if (remaining <= 0) break;
    const units = Math.min(remaining, tier.limit);
    const cost = units * tier.rate;
    if (units > 0) {
      breakdown.push({ label: tier.label, units, rate: tier.rate, cost });
      waterCost += cost;
    }
    remaining -= units;
  }

  const sewerCost = waterCost;
  const totalAmount = waterCost + sewerCost;

  return {
    previousReading,
    currentReading,
    consumption,
    waterCost,
    sewerCost,
    totalAmount,
    breakdown,
  };
}

export function formatCurrency(amount: number): string {
  return amount.toLocaleString("ar-IQ") + " د.ع";
}
