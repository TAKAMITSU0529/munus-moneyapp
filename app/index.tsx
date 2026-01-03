import { useState, useEffect } from "react";
import { StyleSheet, ScrollView, View, Pressable, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Slider from "@react-native-community/slider";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { InvestmentChart } from "@/components/investment-chart";
import { HistoricalChart } from "@/components/historical-chart";
import { HelpModal } from "@/components/help-modal";
import { ScreenTitle } from "@/components/screen-title";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useThemeColor } from "@/hooks/use-theme-color";
import {
  calculateInvestment,
  formatCurrency,
  formatPercent,
  PRESETS,
  type SimulationParams,
  type SimulationResult,
} from "@/lib/calculator";

const STORAGE_KEY = "@investment_simulator:params";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const tintColor = useThemeColor({}, "tint");
  const accentColor = useThemeColor({}, "accent");
  const cardBg = useThemeColor({}, "cardBackground");
  const textSecondary = useThemeColor({}, "textSecondary");

  const [params, setParams] = useState<SimulationParams>({
    monthlyAmount: 30000,
    years: 20,
    annualReturn: 5,
  });

  const [result, setResult] = useState<SimulationResult | null>(null);
  const [helpModalVisible, setHelpModalVisible] = useState(false);
  const [helpTopic, setHelpTopic] = useState<"return" | "compound" | "nisa" | "fees">("return");

  const showHelp = (topic: "return" | "compound" | "nisa" | "fees") => {
    setHelpTopic(topic);
    setHelpModalVisible(true);
  };

  // 初回ロード時に保存された値を復元
  useEffect(() => {
    loadParams();
  }, []);

  // パラメータ変更時に計算と保存
  useEffect(() => {
    const newResult = calculateInvestment(params);
    setResult(newResult);
    saveParams();
  }, [params]);

  const loadParams = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setParams(parsed);
      }
    } catch (error) {
      console.error("Failed to load params:", error);
    }
  };

  const saveParams = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(params));
    } catch (error) {
      console.error("Failed to save params:", error);
    }
  };

  const applyPreset = (presetParams: SimulationParams) => {
    setParams(presetParams);
  };

  if (!result) {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={{ padding: 20, alignItems: "center" }}>
          <ThemedText type="title" style={{ marginBottom: 16, textAlign: "center" }}>
            資産形成シミュレーションアプリ
          </ThemedText>
          <ThemedText style={{ textAlign: "center", lineHeight: 24 }}>
            自分の収入や支出を把握し、{"\n"}
            資産の運用・積立を計算してもらおう。
          </ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  const earningsRatio = (result.totalEarnings / result.finalAmount) * 100;

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingTop: Math.max(insets.top, 20) + 16,
          paddingBottom: Math.max(insets.bottom, 20) + 16,
          paddingLeft: 16,
          paddingRight: 16,
        }}
      >
        {/* タイトル */}
        <ScreenTitle title="運用・積立シミュレーター" subtitle="複利効果を体感しよう" />

        {/* 入力セクション */}
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            条件を設定
          </ThemedText>

          {/* 毎月の積立額 */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <ThemedText style={styles.label}>毎月の積立額</ThemedText>
              <ThemedText type="defaultSemiBold" style={{ color: tintColor }}>
                {formatCurrency(params.monthlyAmount)}
              </ThemedText>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={5000}
              maximumValue={500000}
              step={5000}
              value={params.monthlyAmount}
              onValueChange={(value: number) => setParams({ ...params, monthlyAmount: value })}
              minimumTrackTintColor={tintColor}
              maximumTrackTintColor={textSecondary}
            />
            <View style={styles.sliderLabels}>
              <ThemedText style={styles.sliderLabel}>5千円</ThemedText>
              <ThemedText style={styles.sliderLabel}>50万円</ThemedText>
            </View>
          </View>

          {/* 積立期間 */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <ThemedText style={styles.label}>積立期間</ThemedText>
              <ThemedText type="defaultSemiBold" style={{ color: tintColor }}>
                {params.years}年
              </ThemedText>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={5}
              maximumValue={50}
              step={1}
              value={params.years}
              onValueChange={(value: number) => setParams({ ...params, years: value })}
              minimumTrackTintColor={tintColor}
              maximumTrackTintColor={textSecondary}
            />
            <View style={styles.sliderLabels}>
              <ThemedText style={styles.sliderLabel}>5年</ThemedText>
              <ThemedText style={styles.sliderLabel}>50年</ThemedText>
            </View>
          </View>

          {/* 想定利回り */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <View style={styles.labelWithHelp}>
                <ThemedText style={styles.label}>想定利回り（年率）</ThemedText>
                <Pressable onPress={() => showHelp("return")} style={styles.helpIcon}>
                  <IconSymbol size={20} name="questionmark.circle" color={tintColor} />
                </Pressable>
              </View>
              <ThemedText type="defaultSemiBold" style={{ color: tintColor }}>
                {formatPercent(params.annualReturn)}
              </ThemedText>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={10}
              step={0.5}
              value={params.annualReturn}
              onValueChange={(value: number) => setParams({ ...params, annualReturn: value })}
              minimumTrackTintColor={tintColor}
              maximumTrackTintColor={textSecondary}
            />
            <View style={styles.sliderLabels}>
              <ThemedText style={styles.sliderLabel}>0%</ThemedText>
              <ThemedText style={styles.sliderLabel}>10%</ThemedText>
            </View>
          </View>

          {/* プリセットボタン */}
          <View style={styles.presetsContainer}>
            <ThemedText style={styles.presetsLabel}>プリセット:</ThemedText>
            <View style={styles.presetButtons}>
              {PRESETS.map((preset) => (
                <Pressable
                  key={preset.id}
                  style={[styles.presetButton, { borderColor: tintColor }]}
                  onPress={() => applyPreset(preset.params)}
                >
                  <ThemedText style={[styles.presetButtonText, { color: tintColor }]}>
                    {preset.name}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* 結果表示セクション */}
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            シミュレーション結果
          </ThemedText>

          <View style={styles.resultContainer}>
            <ThemedText style={styles.resultLabel}>
              {params.years}年後の資産額
            </ThemedText>
            <ThemedText style={[styles.resultAmount, { color: accentColor }]}>
              {formatCurrency(result.finalAmount)}
            </ThemedText>
            <ThemedText style={[styles.resultDescription, { color: textSecondary }]}>
              毎月{formatCurrency(params.monthlyAmount)}を{params.years}年間積み立てると、
              約{formatCurrency(result.finalAmount)}になります
            </ThemedText>
          </View>

          {/* 内訳 */}
          <View style={styles.breakdownContainer}>
            <View style={styles.breakdownRow}>
              <View style={styles.breakdownLabelColumn}>
                <View style={styles.breakdownLabelRow}>
                  <View style={[styles.colorDot, { backgroundColor: tintColor }]} />
                  <ThemedText style={styles.breakdownLabel}>元本</ThemedText>
                </View>
                <View style={styles.breakdownLabelRow}>
                  <View style={[styles.colorDot, { backgroundColor: accentColor }]} />
                  <ThemedText style={styles.breakdownLabel}>運用益</ThemedText>
                </View>
              </View>
              <View style={styles.breakdownValueColumn}>
                <ThemedText style={styles.breakdownValue}>
                  {formatCurrency(result.totalPrincipal)}
                </ThemedText>
                <ThemedText style={[styles.breakdownValue, { color: accentColor }]}>
                  {formatCurrency(result.totalEarnings)}
                </ThemedText>
              </View>
            </View>
          </View>

          {/* 運用益の割合 */}
          <View style={styles.ratioBar}>
            <View
              style={[
                styles.ratioBarPrincipal,
                { backgroundColor: tintColor, flex: 100 - earningsRatio },
              ]}
            />
            <View
              style={[
                styles.ratioBarEarnings,
                { backgroundColor: accentColor, flex: earningsRatio },
              ]}
            />
          </View>
          <ThemedText style={[styles.ratioText, { color: textSecondary }]}>
            運用益が全体の{earningsRatio.toFixed(1)}%を占めています
          </ThemedText>
        </View>

        {/* グラフ */}
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <InvestmentChart data={result.yearlyData} />
        </View>

        {/* 過去実績チャート */}
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <HistoricalChart />
        </View>

        {/* 説明 */}
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <View style={styles.labelRow}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              なぜ今すぐ始めるべき？
            </ThemedText>
            <Pressable onPress={() => showHelp("compound")} style={styles.helpIcon}>
              <IconSymbol size={24} name="questionmark.circle" color={tintColor} />
            </Pressable>
          </View>

          <ThemedText type="defaultSemiBold" style={[styles.emphasisText, { marginTop: 16 }]}>
            「投資信託」って何？
          </ThemedText>
          <ThemedText style={[styles.infoText, { color: textSecondary, marginTop: 8 }]}>
            投資信託とは、「みんなでお金を出し合って、プロに運用をお願いする仕組み」です。あなたが出したお金を、運用のプロ（ファンドマネージャー）が世界中の企業の株式や債券に分散して投資してくれます。つまり投資や運用知識の無い大多数の人が最も堅実にお金の運用ができ、増やせる仕組みです。
          </ThemedText>

          <View style={[styles.exampleBox, { backgroundColor: `${tintColor}10`, marginTop: 12 }]}>
            <ThemedText type="defaultSemiBold" style={{ marginBottom: 8 }}>
              🏛️ 具体例：こんなイメージ
            </ThemedText>
            <ThemedText style={[styles.infoText, { color: textSecondary }]}>
              ・ あなた：月、3万円を投資信託に積立{"\n"}
              ・ 証券会社：そのお金をまとめてプロに渡す{"\n"}
              ・ プロ：世界中の企業（Apple、Toyotaなど）に分散投資{"\n"}
              ・ 企業が成長→株価が上がる→あなたの資産が増える！
            </ThemedText>
          </View>

          <ThemedText type="defaultSemiBold" style={[styles.emphasisText, { marginTop: 24 }]}>
            なぜ個別の株じゃなくて投資信託？
          </ThemedText>
          <ThemedText style={[styles.infoText, { color: textSecondary, marginTop: 8 }]}>
            個別の株を買うには数十万円必要ですが、投資信託なら月、5,000円から始められます。しかも、1つの商品で数百〜数千の企業に分散投資できるので、リスクを抑えて安定した運用ができます。
          </ThemedText>

          <ThemedText type="defaultSemiBold" style={[styles.emphasisText, { marginTop: 24 }]}>
            「お金がお金を生む」強力な複利の仕組み
          </ThemedText>
          <ThemedText style={[styles.infoText, { color: textSecondary, marginTop: 8 }]}>
            投資信託では、あなたが働いていない間も、眠っている間も、世界中の企業が成長し続けることで、お金が24時間働いてくれます。これが「複利」の力です。
          </ThemedText>

          <View style={[styles.exampleBox, { backgroundColor: `${tintColor}10`, marginTop: 16 }]}>
            <ThemedText type="defaultSemiBold" style={{ marginBottom: 8 }}>
              💡 具体例：20年間の差
            </ThemedText>
            <ThemedText style={[styles.infoText, { color: textSecondary }]}>
              ・ 貯金だけ：月3万円×20年 = 720万円{"\n"}
              ・ 運用した場合（年利5%）：約1,238万円
            </ThemedText>
            <ThemedText type="defaultSemiBold" style={[{ color: accentColor, marginTop: 8 }]}>
              → 差額518万円！これが複利の力です
            </ThemedText>
          </View>

          <ThemedText type="defaultSemiBold" style={[styles.emphasisText, { marginTop: 24 }]}>
            時間を味方につける
          </ThemedText>
          <ThemedText style={[styles.infoText, { color: textSecondary, marginTop: 8 }]}>
            複利効果は「時間」が長いほど大きくなります。10年より20年、20年より30年。始めるのが1年遅れるだけで、数十万円の差が生まれます。だからこそ、「今すぐ」始めることが最大の武器なのです。
          </ThemedText>

          <ThemedText type="defaultSemiBold" style={[styles.emphasisText, { marginTop: 24 }]}>
            少額からでもOK
          </ThemedText>
          <ThemedText style={[styles.infoText, { color: textSecondary, marginTop: 8 }]}>
            「お金がないから」と諦める必要はありません。月、5,000円からでも始められます。大切なのは「続けること」。小さな種が、時間をかけて大きな木に育ちます。
          </ThemedText>
        </View>

        {/* 始め方ガイド */}
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            🚀 今日から始める5ステップ
          </ThemedText>

          <View style={styles.stepContainer}>
            <View style={styles.stepItem}>
              <View style={[styles.stepNumber, { backgroundColor: tintColor }]}>
                <ThemedText style={styles.stepNumberText}>1</ThemedText>
              </View>
              <View style={styles.stepContent}>
                <ThemedText type="defaultSemiBold">証券会社で口座を開く</ThemedText>
                <ThemedText style={[styles.stepDescription, { color: textSecondary }]}>
                  ネット証券（SBI証券、楽天証券など）で「NISA口座」を開設。スマホから10分で申し込み完了！
                </ThemedText>
              </View>
            </View>

            <View style={styles.stepItem}>
              <View style={[styles.stepNumber, { backgroundColor: tintColor }]}>
                <ThemedText style={styles.stepNumberText}>2</ThemedText>
              </View>
              <View style={styles.stepContent}>
                <ThemedText type="defaultSemiBold">投資信託を選ぶ</ThemedText>
                <ThemedText style={[styles.stepDescription, { color: textSecondary }]}>
                  初心者には「全世界株式インデックスファンド」がおすすめ。手数料が安く（0.1%前後）、分散投資ができます。
                </ThemedText>
              </View>
            </View>

            <View style={styles.stepItem}>
              <View style={[styles.stepNumber, { backgroundColor: tintColor }]}>
                <ThemedText style={styles.stepNumberText}>3</ThemedText>
              </View>
              <View style={styles.stepContent}>
                <ThemedText type="defaultSemiBold">積立設定をする</ThemedText>
                <ThemedText style={[styles.stepDescription, { color: textSecondary }]}>
                  毎月の積立額を設定。最初は無理のない金額（月、1万円〜3万円）からスタート。
                </ThemedText>
              </View>
            </View>

            <View style={styles.stepItem}>
              <View style={[styles.stepNumber, { backgroundColor: tintColor }]}>
                <ThemedText style={styles.stepNumberText}>4</ThemedText>
              </View>
              <View style={styles.stepContent}>
                <ThemedText type="defaultSemiBold">自動引き落としを設定</ThemedText>
                <ThemedText style={[styles.stepDescription, { color: textSecondary }]}>
                  銀行口座から毎月自動で引き落とされるように設定。これで「ほったらかし」で資産が増えます。
                </ThemedText>
              </View>
            </View>

            <View style={styles.stepItem}>
              <View style={[styles.stepNumber, { backgroundColor: tintColor }]}>
                <ThemedText style={styles.stepNumberText}>5</ThemedText>
              </View>
              <View style={styles.stepContent}>
                <ThemedText type="defaultSemiBold">放置して待つ</ThemedText>
                <ThemedText style={[styles.stepDescription, { color: textSecondary }]}>
                  一番大事なのは「何もしないこと」。短期的な価格変動に一喜一憂せず、長期的に続けることが成功の鍵です。
                </ThemedText>
              </View>
            </View>
          </View>

          <View style={[styles.ctaBox, { backgroundColor: `${accentColor}15`, marginTop: 24 }]}>
            <ThemedText type="defaultSemiBold" style={{ marginBottom: 8, textAlign: "center" }}>
              ✨ 今始めれば、20年後に大きな差が生まれます
            </ThemedText>
            <ThemedText style={[styles.infoText, { color: textSecondary, textAlign: "center" }]}>
              「いつかやろう」ではなく、「今すぐ」行動しましょう！
            </ThemedText>
          </View>
        </View>

        <HelpModal
          visible={helpModalVisible}
          onClose={() => setHelpModalVisible(false)}
          topic={helpTopic}
        />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  title: {
    marginBottom: 24,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 0,
  },
  inputGroup: {
    marginBottom: 24,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    lineHeight: 24,
  },
  labelWithHelp: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  helpIcon: {
    padding: 4,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: -8,
  },
  sliderLabel: {
    fontSize: 12,
    lineHeight: 16,
    opacity: 0.6,
  },
  presetsContainer: {
    marginTop: 8,
  },
  presetsLabel: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  presetButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  presetButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  presetButtonText: {
    fontSize: 14,
    lineHeight: 20,
  },
  resultContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  resultLabel: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
  },
  resultAmount: {
    fontSize: 40,
    fontWeight: "bold",
    lineHeight: 48,
    marginBottom: 12,
  },
  resultDescription: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  breakdownContainer: {
    marginBottom: 16,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  breakdownLabelColumn: {
    gap: 16,
  },
  breakdownValueColumn: {
    gap: 16,
    alignItems: "flex-end",
  },
  breakdownLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 32,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  breakdownLabel: {
    fontSize: 16,
    lineHeight: 24,
  },
  breakdownValue: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "600",
    height: 32,
    fontVariant: ["tabular-nums"],
  },
  ratioBar: {
    flexDirection: "row",
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  ratioBarPrincipal: {
    height: "100%",
  },
  ratioBarEarnings: {
    height: "100%",
  },
  ratioText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  infoText: {
    fontSize: 14,
    lineHeight: 22,
  },
  emphasisText: {
    fontSize: 16,
    lineHeight: 24,
  },
  exampleBox: {
    padding: 16,
    borderRadius: 8,
  },
  stepContainer: {
    marginTop: 16,
    gap: 16,
  },
  stepItem: {
    flexDirection: "row",
    gap: 12,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  stepNumberText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  stepContent: {
    flex: 1,
    gap: 4,
  },
  stepDescription: {
    fontSize: 13,
    lineHeight: 20,
  },
  ctaBox: {
    padding: 16,
    borderRadius: 8,
  },
});
