/**
 * 投資信託の積立シミュレーション計算ロジック
 */

export interface SimulationParams {
  monthlyAmount: number; // 毎月の積立額（円）
  years: number; // 積立期間（年）
  annualReturn: number; // 想定年利回り（%）
  fees?: number; // 手数料率（%）
  taxRate?: number; // 税率（%）
}

export interface YearlyData {
  year: number; // 経過年数
  principal: number; // 元本累計
  earnings: number; // 運用益累計
  total: number; // 合計資産額
  yearlyEarnings: number; // その年の運用益
}

export interface SimulationResult {
  finalAmount: number; // 最終資産額
  totalPrincipal: number; // 総元本
  totalEarnings: number; // 総運用益
  yearlyData: YearlyData[]; // 年次データ
}

/**
 * 複利計算を用いた積立シミュレーション
 * 
 * 計算式:
 * 毎月積立の場合、各月の積立額が複利で運用されるため、
 * 最終資産額 = Σ(月額 × (1 + 月利)^(残り月数))
 * 
 * 簡略化のため、年次で計算する場合:
 * n年後の資産額 = 月額 × 12 × ((1 + 年利)^n - 1) / 年利 × (1 + 年利)
 */
export function calculateInvestment(params: SimulationParams): SimulationResult {
  const { monthlyAmount, years, annualReturn, fees = 0, taxRate = 0 } = params;
  
  // 実質利回り（手数料を考慮）
  const effectiveReturn = (annualReturn - fees) / 100;
  const monthlyReturn = effectiveReturn / 12;
  
  const yearlyData: YearlyData[] = [];
  let currentPrincipal = 0;
  let currentTotal = 0;
  
  for (let year = 1; year <= years; year++) {
    // その年の元本増加
    const yearlyPrincipal = monthlyAmount * 12;
    currentPrincipal += yearlyPrincipal;
    
    // 複利計算: 毎月積立の場合
    // その年の各月の積立が年末までに得る運用益を計算
    let yearEndTotal = currentTotal;
    for (let month = 1; month <= 12; month++) {
      yearEndTotal = (yearEndTotal + monthlyAmount) * (1 + monthlyReturn);
    }
    
    const previousTotal = currentTotal;
    currentTotal = yearEndTotal;
    const yearlyEarnings = currentTotal - previousTotal - yearlyPrincipal;
    const totalEarnings = currentTotal - currentPrincipal;
    
    yearlyData.push({
      year,
      principal: Math.round(currentPrincipal),
      earnings: Math.round(totalEarnings),
      total: Math.round(currentTotal),
      yearlyEarnings: Math.round(yearlyEarnings),
    });
  }
  
  const finalData = yearlyData[yearlyData.length - 1];
  
  return {
    finalAmount: finalData.total,
    totalPrincipal: finalData.principal,
    totalEarnings: finalData.earnings,
    yearlyData,
  };
}

/**
 * プリセット設定
 */
export interface Preset {
  id: string;
  name: string;
  description: string;
  params: SimulationParams;
}

export const PRESETS: Preset[] = [
  {
    id: "nisa_standard",
    name: "つみたてNISA標準",
    description: "月33,333円を20年間、年利5%で運用",
    params: {
      monthlyAmount: 33333,
      years: 20,
      annualReturn: 5,
    },
  },
  {
    id: "conservative",
    name: "保守的",
    description: "月20,000円を30年間、年利3%で運用",
    params: {
      monthlyAmount: 20000,
      years: 30,
      annualReturn: 3,
    },
  },
  {
    id: "aggressive",
    name: "積極的",
    description: "月50,000円を15年間、年利7%で運用",
    params: {
      monthlyAmount: 50000,
      years: 15,
      annualReturn: 7,
    },
  },
  {
    id: "retirement",
    name: "老後準備",
    description: "月30,000円を30年間、年利5%で運用",
    params: {
      monthlyAmount: 30000,
      years: 30,
      annualReturn: 5,
    },
  },
];

/**
 * リスクシミュレーション（楽観的/悲観的シナリオ）
 */
export interface RiskScenario {
  optimistic: SimulationResult;
  base: SimulationResult;
  pessimistic: SimulationResult;
}

export function calculateRiskScenarios(params: SimulationParams): RiskScenario {
  const returnVariance = 2; // ±2%のブレを想定
  
  return {
    optimistic: calculateInvestment({
      ...params,
      annualReturn: params.annualReturn + returnVariance,
    }),
    base: calculateInvestment(params),
    pessimistic: calculateInvestment({
      ...params,
      annualReturn: Math.max(0, params.annualReturn - returnVariance),
    }),
  };
}

/**
 * 数値を日本円フォーマットに変換
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * パーセンテージフォーマット
 */
export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}
