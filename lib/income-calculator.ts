/**
 * 収入・支出シミュレーションの計算ロジック
 */

/**
 * 手取り金額を計算（簡易版）
 * 社会保険料・所得税・住民税を概算で控除
 * 
 * @param grossIncome 額面年収（万円）
 * @returns 手取り年収（万円）
 */
export function calculateNetIncome(grossIncome: number): number {
  // 簡易計算：額面の約80%が手取り（社会保険料15%、税金5%程度）
  // より正確には収入額に応じて税率が変わるが、ここでは簡易版
  let deductionRate = 0.2; // 20%控除
  
  if (grossIncome >= 1000) {
    deductionRate = 0.25; // 高収入は25%控除
  } else if (grossIncome >= 600) {
    deductionRate = 0.22; // 中高収入は22%控除
  }
  
  return Math.round(grossIncome * (1 - deductionRate));
}

/**
 * 月額手取りを計算
 * 
 * @param netIncome 手取り年収（万円）
 * @returns 月額手取り（万円）
 */
export function calculateMonthlyNetIncome(netIncome: number): number {
  return Math.round((netIncome / 12) * 10) / 10;
}

/**
 * 期間内の総収入を計算
 * 
 * @param grossIncome 額面年収（万円）
 * @param bonus 年間ボーナス（万円）
 * @param years 期間（年）
 * @returns 総収入（万円）
 */
export function calculateTotalIncome(
  grossIncome: number,
  bonus: number,
  years: number
): number {
  const annualIncome = grossIncome + bonus;
  return annualIncome * years;
}

/**
 * 期間内の総支出を計算
 * 
 * @param monthlyExpense 月額支出（万円）
 * @param years 期間（年）
 * @returns 総支出（万円）
 */
export function calculateTotalExpense(
  monthlyExpense: number,
  years: number
): number {
  return monthlyExpense * 12 * years;
}

/**
 * 貯蓄可能額を計算
 * 
 * @param grossIncome 額面年収（万円）
 * @param bonus 年間ボーナス（万円）
 * @param monthlyExpense 月額支出（万円）
 * @param years 期間（年）
 * @returns 貯蓄可能額（万円）
 */
export function calculateSavings(
  grossIncome: number,
  bonus: number,
  monthlyExpense: number,
  years: number
): number {
  const netIncome = calculateNetIncome(grossIncome);
  const totalNetIncome = (netIncome + bonus) * years;
  const totalExpense = calculateTotalExpense(monthlyExpense, years);
  return Math.max(0, totalNetIncome - totalExpense);
}

/**
 * 年間貯蓄率を計算
 * 
 * @param grossIncome 額面年収（万円）
 * @param bonus 年間ボーナス（万円）
 * @param monthlyExpense 月額支出（万円）
 * @returns 貯蓄率（%）
 */
export function calculateSavingsRate(
  grossIncome: number,
  bonus: number,
  monthlyExpense: number
): number {
  const netIncome = calculateNetIncome(grossIncome);
  const annualNetIncome = netIncome + bonus;
  const annualExpense = monthlyExpense * 12;
  const annualSavings = annualNetIncome - annualExpense;
  
  if (annualNetIncome === 0) return 0;
  
  return Math.max(0, Math.round((annualSavings / annualNetIncome) * 100));
}

/**
 * 年次データを生成
 */
export interface YearlyIncomeData {
  year: number;
  grossIncome: number;
  netIncome: number;
  expense: number;
  savings: number;
}

export function generateYearlyIncomeData(
  grossIncome: number,
  bonus: number,
  monthlyExpense: number,
  years: number
): YearlyIncomeData[] {
  const netIncome = calculateNetIncome(grossIncome);
  const annualNetIncome = netIncome + bonus;
  const annualExpense = monthlyExpense * 12;
  const annualSavings = Math.max(0, annualNetIncome - annualExpense);
  
  const data: YearlyIncomeData[] = [];
  let cumulativeSavings = 0;
  
  for (let i = 1; i <= years; i++) {
    cumulativeSavings += annualSavings;
    data.push({
      year: i,
      grossIncome: grossIncome + bonus,
      netIncome: annualNetIncome,
      expense: annualExpense,
      savings: cumulativeSavings,
    });
  }
  
  return data;
}
