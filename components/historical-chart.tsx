import { View, StyleSheet, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { ThemedText } from "./themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import { historicalIndexData } from "@/lib/historical-data";

export function HistoricalChart() {
  const tintColor = useThemeColor({}, "tint");
  const textColor = useThemeColor({}, "text");
  const textSecondary = useThemeColor({}, "icon");

  const screenWidth = Dimensions.get("window").width;
  const chartWidth = Math.min(screenWidth - 64, 350); // padding考慮、最大幅制限

  // 5年ごとのラベルを表示
  const labels = historicalIndexData
    .filter((_, index) => index % 5 === 0)
    .map((d) => `'${String(d.year).slice(2)}`);

  const data = {
    labels,
    datasets: [
      {
        data: historicalIndexData.map((d) => d.value),
        color: (opacity = 1) => tintColor,
        strokeWidth: 2,
      },
    ],
  };

  return (
    <View style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>
        📈 過去20年間の実績
      </ThemedText>
      <ThemedText style={[styles.subtitle, { color: textSecondary }]}>
        全世界株式インデックス（2004年=100）
      </ThemedText>

      <View style={styles.chartContainer}>
        <LineChart
          data={data}
          width={chartWidth}
          height={220}
          chartConfig={{
            backgroundColor: "transparent",
            backgroundGradientFrom: "transparent",
            backgroundGradientTo: "transparent",
            decimalPlaces: 0,
            color: (opacity = 1) => tintColor,
            labelColor: (opacity = 1) => textSecondary,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: "0",
            },
            propsForBackgroundLines: {
              strokeDasharray: "",
              stroke: textSecondary,
              strokeOpacity: 0.1,
            },
            fillShadowGradient: tintColor,
            fillShadowGradientOpacity: 0.1,
          }}
          bezier
          style={styles.chart}
          withInnerLines={true}
          withOuterLines={true}
          withVerticalLines={false}
          withHorizontalLines={true}
          withDots={false}
          withShadow={false}
        />
      </View>

      <View style={styles.insights}>
        <View style={styles.insightItem}>
          <ThemedText type="defaultSemiBold">2004年: 100</ThemedText>
          <ThemedText style={[styles.insightText, { color: textSecondary }]}>
            20年前に投資した100万円が...
          </ThemedText>
        </View>
        <View style={styles.arrow}>
          <ThemedText style={{ fontSize: 24 }}>→</ThemedText>
        </View>
        <View style={styles.insightItem}>
          <ThemedText type="defaultSemiBold" style={{ color: tintColor }}>
            2024年: 285
          </ThemedText>
          <ThemedText style={[styles.insightText, { color: textSecondary }]}>
            約285万円に成長！
          </ThemedText>
        </View>
      </View>

      <View style={[styles.noteBox, { backgroundColor: `${tintColor}10` }]}>
        <ThemedText type="defaultSemiBold" style={{ marginBottom: 8 }}>
          💡 重要なポイント
        </ThemedText>
        <ThemedText style={[styles.noteText, { color: textSecondary }]}>
          ・ 2008年（リーマンショック）と2020年（コロナショック）で一時的に下落{"\n"}
          ・ しかし長期的には右肩上がりで成長{"\n"}
          ・ 短期的な下落に動じず、長期保有することが重要
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  title: {
    marginBottom: 0,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: -8,
  },
  chartContainer: {
    alignItems: "center",
    marginVertical: 8,
  },
  chart: {
    borderRadius: 16,
  },
  insights: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  insightItem: {
    flex: 1,
    gap: 4,
  },
  arrow: {
    paddingHorizontal: 8,
  },
  insightText: {
    fontSize: 12,
    lineHeight: 18,
  },
  noteBox: {
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  noteText: {
    fontSize: 13,
    lineHeight: 20,
  },
});
