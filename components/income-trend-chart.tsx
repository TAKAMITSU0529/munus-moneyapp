import React, { useState, useEffect } from "react";
import { View, StyleSheet, Dimensions, Platform } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";

interface IncomeTrendChartProps {
  years: number;
  annualIncome: number; // 年間手取り収入（万円）
  annualExpense: number; // 年間支出（万円）
  annualSavings: number; // 年間貯蓄額（万円）
  initialAssets: number; // 初期資産（万円）
}

// Safe LineChart wrapper to handle errors
function SafeLineChart(props: any) {
  const [hasError, setHasError] = useState(false);
  const [LineChartComponent, setLineChartComponent] = useState<any>(null);

  useEffect(() => {
    // Dynamically import chart to avoid SSR issues
    try {
      const { LineChart } = require("react-native-chart-kit");
      setLineChartComponent(() => LineChart);
    } catch (e) {
      console.error("Failed to load chart:", e);
      setHasError(true);
    }
  }, []);

  if (hasError || !LineChartComponent) {
    return null;
  }

  try {
    return <LineChartComponent {...props} />;
  } catch (e) {
    console.error("Chart render error:", e);
    return null;
  }
}

export function IncomeTrendChart({
  years,
  annualIncome,
  annualExpense,
  annualSavings,
  initialAssets,
}: IncomeTrendChartProps) {
  const textColor = useThemeColor({}, "text");
  const backgroundColor = useThemeColor({}, "background");
  const isDark = backgroundColor === "#151718";
  const [showChart, setShowChart] = useState(false);

  // Delay chart rendering to improve initial load performance
  useEffect(() => {
    const timer = setTimeout(() => setShowChart(true), 200);
    return () => clearTimeout(timer);
  }, []);

  // 年次推移データを生成
  const labels: string[] = [];
  const incomeData: number[] = [];
  const expenseData: number[] = [];
  const savingsData: number[] = [];
  const assetsData: number[] = [];

  let cumulativeAssets = initialAssets;

  for (let year = 0; year <= years; year++) {
    labels.push(`${year}年`);
    incomeData.push(annualIncome);
    expenseData.push(annualExpense);
    savingsData.push(annualSavings);
    assetsData.push(cumulativeAssets);
    cumulativeAssets += annualSavings;
  }

  const screenWidth = Dimensions.get("window").width;
  const chartWidth = Math.min(screenWidth - 32, 600);

  const data = {
    labels: labels.filter((_, i) => i % Math.ceil(years / 10) === 0 || i === years),
    datasets: [
      {
        data: assetsData.filter((_, i) => i % Math.ceil(years / 10) === 0 || i === years),
        color: () => "#34C759", // 資産残高（緑）
        strokeWidth: 3,
      },
      {
        data: incomeData.filter((_, i) => i % Math.ceil(years / 10) === 0 || i === years),
        color: () => "#007AFF", // 収入（青）
        strokeWidth: 2,
      },
      {
        data: expenseData.filter((_, i) => i % Math.ceil(years / 10) === 0 || i === years),
        color: () => "#FF3B30", // 支出（赤）
        strokeWidth: 2,
      },
      {
        data: savingsData.filter((_, i) => i % Math.ceil(years / 10) === 0 || i === years),
        color: () => "#FF9500", // 貯蓄（オレンジ）
        strokeWidth: 2,
      },
    ],
  };

  // Fallback for Web platform
  if (Platform.OS === "web") {
    const finalAssets = assetsData[assetsData.length - 1];
    return (
      <View style={styles.container}>
        <ThemedText type="subtitle" style={styles.title}>
          📊 年次推移サマリー
        </ThemedText>

        <View style={styles.webSummary}>
          <View style={styles.summaryRow}>
            <View style={[styles.legendDot, { backgroundColor: "#007AFF" }]} />
            <ThemedText style={styles.summaryLabel}>年間収入</ThemedText>
            <ThemedText type="defaultSemiBold">{annualIncome}万円</ThemedText>
          </View>
          <View style={styles.summaryRow}>
            <View style={[styles.legendDot, { backgroundColor: "#FF3B30" }]} />
            <ThemedText style={styles.summaryLabel}>年間支出</ThemedText>
            <ThemedText type="defaultSemiBold">{annualExpense}万円</ThemedText>
          </View>
          <View style={styles.summaryRow}>
            <View style={[styles.legendDot, { backgroundColor: "#FF9500" }]} />
            <ThemedText style={styles.summaryLabel}>年間貯蓄</ThemedText>
            <ThemedText type="defaultSemiBold">{annualSavings}万円</ThemedText>
          </View>
          <View style={[styles.summaryRow, styles.summaryTotal]}>
            <View style={[styles.legendDot, { backgroundColor: "#34C759" }]} />
            <ThemedText style={styles.summaryLabel}>{years}年後の資産</ThemedText>
            <ThemedText type="defaultSemiBold" style={{ color: "#34C759" }}>
              {finalAssets}万円
            </ThemedText>
          </View>
        </View>

        <ThemedText style={styles.note}>
          ※ 資産残高は年間貯蓄額を累積した値です
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>
        📊 年次推移グラフ
      </ThemedText>

      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#34C759" }]} />
          <ThemedText style={styles.legendText}>資産残高</ThemedText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#007AFF" }]} />
          <ThemedText style={styles.legendText}>年間収入</ThemedText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#FF3B30" }]} />
          <ThemedText style={styles.legendText}>年間支出</ThemedText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#FF9500" }]} />
          <ThemedText style={styles.legendText}>年間貯蓄</ThemedText>
        </View>
      </View>

      {showChart && (
        <SafeLineChart
          data={data}
          width={chartWidth}
          height={240}
          chartConfig={{
            backgroundColor: "transparent",
            backgroundGradientFrom: backgroundColor,
            backgroundGradientTo: backgroundColor,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(128, 128, 128, ${opacity})`,
            labelColor: () => textColor,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: "4",
              strokeWidth: "2",
            },
            propsForBackgroundLines: {
              strokeDasharray: "",
              stroke: isDark ? "#3a3a3c" : "#e0e0e0",
              strokeWidth: 1,
            },
          }}
          bezier
          style={styles.chart}
          withInnerLines
          withOuterLines
          withVerticalLines={false}
          withHorizontalLines
          withDots
          withShadow={false}
        />
      )}

      <ThemedText style={styles.note}>
        ※ 資産残高は年間貯蓄額を累積した値です
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  title: {
    marginBottom: 12,
  },
  legendContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  note: {
    fontSize: 11,
    opacity: 0.6,
    marginTop: 8,
  },
  webSummary: {
    gap: 12,
    padding: 16,
    backgroundColor: "rgba(0,0,0,0.03)",
    borderRadius: 12,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  summaryLabel: {
    flex: 1,
    fontSize: 14,
  },
  summaryTotal: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
    marginTop: 4,
  },
});
