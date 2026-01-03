import { describe, it, expect } from "vitest";
import { calculateInvestment, formatCurrency, formatPercent, PRESETS } from "./calculator";

describe("calculateInvestment", () => {
  it("should calculate investment with 0% return correctly", () => {
    const result = calculateInvestment({
      monthlyAmount: 10000,
      years: 10,
      annualReturn: 0,
    });

    // 0%利回りの場合、最終資産額は元本のみ
    expect(result.totalPrincipal).toBe(10000 * 12 * 10); // 1,200,000
    expect(result.totalEarnings).toBe(0);
    expect(result.finalAmount).toBe(result.totalPrincipal);
  });

  it("should calculate investment with positive return correctly", () => {
    const result = calculateInvestment({
      monthlyAmount: 30000,
      years: 20,
      annualReturn: 5,
    });

    // 20年間、月3万円、年利5%の場合
    expect(result.totalPrincipal).toBe(30000 * 12 * 20); // 7,200,000
    expect(result.finalAmount).toBeGreaterThan(result.totalPrincipal); // 複利効果で元本より多い
    expect(result.totalEarnings).toBeGreaterThan(0);
    expect(result.finalAmount).toBe(result.totalPrincipal + result.totalEarnings);
  });

  it("should generate yearly data correctly", () => {
    const result = calculateInvestment({
      monthlyAmount: 10000,
      years: 5,
      annualReturn: 3,
    });

    expect(result.yearlyData).toHaveLength(5);
    expect(result.yearlyData[0].year).toBe(1);
    expect(result.yearlyData[4].year).toBe(5);

    // 各年のデータが増加していることを確認
    for (let i = 1; i < result.yearlyData.length; i++) {
      expect(result.yearlyData[i].principal).toBeGreaterThan(
        result.yearlyData[i - 1].principal
      );
      expect(result.yearlyData[i].total).toBeGreaterThan(result.yearlyData[i - 1].total);
    }
  });

  it("should handle fees correctly", () => {
    const withoutFees = calculateInvestment({
      monthlyAmount: 30000,
      years: 20,
      annualReturn: 5,
      fees: 0,
    });

    const withFees = calculateInvestment({
      monthlyAmount: 30000,
      years: 20,
      annualReturn: 5,
      fees: 1, // 1%の手数料
    });

    // 手数料がある場合、最終資産額は少なくなる
    expect(withFees.finalAmount).toBeLessThan(withoutFees.finalAmount);
  });

  it("should handle edge case: 1 year investment", () => {
    const result = calculateInvestment({
      monthlyAmount: 10000,
      years: 1,
      annualReturn: 5,
    });

    expect(result.yearlyData).toHaveLength(1);
    expect(result.totalPrincipal).toBe(10000 * 12); // 120,000
    expect(result.finalAmount).toBeGreaterThan(result.totalPrincipal);
  });

  it("should handle edge case: very high return", () => {
    const result = calculateInvestment({
      monthlyAmount: 10000,
      years: 10,
      annualReturn: 10,
    });

    // 高い利回りの場合、運用益が元本を大きく上回る
    expect(result.totalEarnings).toBeGreaterThan(result.totalPrincipal * 0.5);
  });
});

describe("formatCurrency", () => {
  it("should format currency correctly", () => {
    expect(formatCurrency(1000000)).toBe("￥1,000,000");
    expect(formatCurrency(12345)).toBe("￥12,345");
    expect(formatCurrency(0)).toBe("￥0");
  });

  it("should handle decimal values", () => {
    expect(formatCurrency(1234.56)).toBe("￥1,235"); // 四捨五入
  });
});

describe("formatPercent", () => {
  it("should format percent correctly", () => {
    expect(formatPercent(5)).toBe("5.0%");
    expect(formatPercent(3.5)).toBe("3.5%");
    expect(formatPercent(0)).toBe("0.0%");
  });

  it("should handle decimal places", () => {
    expect(formatPercent(5.123)).toBe("5.1%");
    expect(formatPercent(5.678)).toBe("5.7%");
  });
});

describe("PRESETS", () => {
  it("should have all required presets", () => {
    expect(PRESETS).toHaveLength(4);
    expect(PRESETS.map((p) => p.id)).toContain("nisa_standard");
    expect(PRESETS.map((p) => p.id)).toContain("conservative");
    expect(PRESETS.map((p) => p.id)).toContain("aggressive");
    expect(PRESETS.map((p) => p.id)).toContain("retirement");
  });

  it("should have valid parameters for each preset", () => {
    PRESETS.forEach((preset) => {
      expect(preset.params.monthlyAmount).toBeGreaterThan(0);
      expect(preset.params.years).toBeGreaterThan(0);
      expect(preset.params.annualReturn).toBeGreaterThanOrEqual(0);
      expect(preset.params.annualReturn).toBeLessThanOrEqual(10);
    });
  });

  it("should calculate correctly for NISA standard preset", () => {
    const nisaPreset = PRESETS.find((p) => p.id === "nisa_standard");
    expect(nisaPreset).toBeDefined();

    if (nisaPreset) {
      const result = calculateInvestment(nisaPreset.params);
      expect(result.totalPrincipal).toBe(nisaPreset.params.monthlyAmount * 12 * nisaPreset.params.years);
      expect(result.finalAmount).toBeGreaterThan(result.totalPrincipal);
    }
  });
});
