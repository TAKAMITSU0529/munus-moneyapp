import { View, Dimensions, StyleSheet, Platform } from "react-native";
import { useThemeColor } from "@/hooks/use-theme-color";
import { ThemedText } from "./themed-text";
import type { YearlyData } from "@/lib/calculator";
import { useState, useEffect } from "react";

interface InvestmentChartProps {
  data: YearlyData[];
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

export function InvestmentChart({ data }: InvestmentChartProps) {
  const principalColor = "#007AFF"; // 青色（元本）
  const totalColor = "#34C759"; // 緑色（総資産）
  const textColor = useThemeColor({}, "text");
  const textSecondary = useThemeColor({}, "textSecondary");
  const [chartError, setChartError] = useState(false);

  const screenWidth = Dimensions.get("window").width;
  const chartWidth = Math.min(screenWidth - 64, 380); // padding考慮、最大幅制限

  // データを5年ごとにサンプリング（データ量が多い場合）
  const sampledData =
    data.length > 10
      ? data.filter((_, index) => index === 0 || (index + 1) % 5 === 0 || index === data.length - 1)
      : data;

  const labels = sampledData.map((d) => `${d.year}年`);
  const principalData = sampledData.map((d) => d.principal);
  const totalData = sampledData.map((d) => d.total);

  // Webでチャートがエラーを起こす場合のフォールバック
  if (Platform.OS === "web" && chartError) {
    return (
      <View style={styles.container}>
        <ThemedText type="subtitle" style={styles.title}>
          資産推移
        </ThemedText>
        <View style={styles.fallbackChart}>
          {sampledData.map((d, index) => (
            <View key={d.year} style={styles.fallbackRow}>
              <ThemedText style={styles.fallbackLabel}>{d.year}年目</ThemedText>
              <View style={styles.fallbackBars}>
                <View
                  style={[
                    styles.fallbackBar,
                    {
                      backgroundColor: principalColor,
                      width: `${(d.principal / totalData[totalData.length - 1]) * 100}%`
                    }
                  ]}
                />
              </View>
              <ThemedText style={styles.fallbackValue}>
                {Math.round(d.total / 10000)}万円
              </ThemedText>
            </View>
          ))}
        </View>
      </View>
    );
  }

  const chartData = {
    labels,
    datasets: [
      {
        data: principalData,
        color: (opacity = 1) => principalColor,
        strokeWidth: 2,
      },
      {
        data: totalData,
        color: (opacity = 1) => totalColor,
        strokeWidth: 3,
      },
    ],
    legend: ["元本", "総資産"],
  };

  const chartConfig = {
    backgroundColor: "transparent",
    backgroundGradientFrom: "transparent",
    backgroundGradientTo: "transparent",
    decimalPlaces: 0,
    color: (opacity = 1) => "#666666",
    labelColor: (opacity = 1) => textColor,
    style: {
      borderRadius: 12,
    },
    propsForDots: {
      r: "3",
      strokeWidth: "1",
    },
    propsForBackgroundLines: {
      strokeDasharray: "",
      stroke: textColor,
      strokeOpacity: 0.1,
    },
  };

  return (
    <View style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>
        資産推移グラフ
      </ThemedText>
      <View style={styles.chartWrapper}>
        <SafeLineChart
          data={chartData}
          width={chartWidth}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          withInnerLines={true}
          withOuterLines={true}
          withVerticalLines={false}
          withHorizontalLines={true}
          withDots={sampledData.length <= 10}
          withShadow={false}
          formatYLabel={(value: string) => {
            const num = parseFloat(value);
            if (num >= 10000000) {
              return `${(num / 10000000).toFixed(0)}千万`;
            } else if (num >= 1000000) {
              return `${(num / 10000).toFixed(0)}万`;
            }
            return `${(num / 10000).toFixed(0)}万`;
          }}
          onError={() => setChartError(true)}
        />
      </View>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: principalColor }]} />
          <ThemedText style={styles.legendText}>元本</ThemedText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: totalColor }]} />
          <ThemedText style={styles.legendText}>総資産</ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    marginBottom: 12,
  },
  chartWrapper: {
    alignItems: "center",
    marginVertical: 8,
  },
  chart: {
    borderRadius: 12,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 14,
    lineHeight: 20,
  },
  fallbackChart: {
    gap: 8,
  },
  fallbackRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  fallbackLabel: {
    width: 50,
    fontSize: 12,
  },
  fallbackBars: {
    flex: 1,
    height: 16,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    overflow: "hidden",
  },
  fallbackBar: {
    height: "100%",
    borderRadius: 4,
  },
  fallbackValue: {
    width: 60,
    fontSize: 12,
    textAlign: "right",
  },
});
