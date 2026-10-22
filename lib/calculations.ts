export interface LiftingCalcResult {
  wll: number;
  staticLoad: number;
  dynamicLoad: number;
  standard: string;
}

export function calculateLiftingTests(wllTon: number): LiftingCalcResult {
  return {
    wll: wllTon,
    staticLoad: +(wllTon * 1.25).toFixed(2),
    dynamicLoad: +(wllTon * 1.1).toFixed(2),
    standard: 'TS 10116 — Statik Deney WLL×1.25 / Dinamik Deney WLL×1.1',
  };
}

export interface PressureCalcResult {
  designPressure: number;
  hydrostaticTestPressure: number;
  directive: string;
}

export function calculatePressureTest(designPressureBar: number): PressureCalcResult {
  return {
    designPressure: designPressureBar,
    hydrostaticTestPressure: +(designPressureBar * 1.43).toFixed(2),
    directive: 'PED 2014/68/EU — Asgari Hidrostatik Test Basıncı = Tasarım Basıncı × 1.43',
  };
}

export function formatDateTR(iso: string): string {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatCurrencyTRY(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateTimeTR(ts: number): string {
  return new Date(ts).toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
