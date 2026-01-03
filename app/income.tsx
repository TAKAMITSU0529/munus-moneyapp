import { useState, useEffect } from "react";
import { ScrollView, View, StyleSheet, Pressable } from "react-native";
import Slider from "@react-native-community/slider";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { ScreenTitle } from "@/components/screen-title";
import { useThemeColor } from "@/hooks/use-theme-color";
import {
  calculateNetIncome,
  calculateMonthlyNetIncome,
  calculateSavings,
  calculateSavingsRate,
} from "@/lib/income-calculator";
import { AssetManagement, BankAccount } from "@/components/asset-management";
import { IncomeTrendChart } from "@/components/income-trend-chart";

const STORAGE_KEY = "@income_simulator_settings";
const ASSETS_STORAGE_KEY = "@income_simulator_assets";

export default function IncomeScreen() {
  const [isMonthlyMode, setIsMonthlyMode] = useState(true); // true: 月額モード, false: 年額モード
  const [monthlySalary, setMonthlySalary] = useState(30); // 月額額面給与（万円）
  const [monthlyExpense, setMonthlyExpense] = useState(20); // 月額支出（万円）
  const [bonus, setBonus] = useState(80); // 年間ボーナス（万円）
  const [years, setYears] = useState(10); // 期間（年）
  const [personalAccounts, setPersonalAccounts] = useState<BankAccount[]>([]);
  const [corporateAccounts, setCorporateAccounts] = useState<BankAccount[]>([]);
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [accountType, setAccountType] = useState<"personal" | "corporate">("personal");
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);

  const tintColor = useThemeColor({}, "tint");
  const cardBg = useThemeColor({ light: "#f5f5f5", dark: "#1c1c1e" }, "background");
  const textColor = useThemeColor({}, "text");
  const textSecondary = useThemeColor({}, "icon");

  // 計算結果
  const grossIncome = monthlySalary * 12; // 年収（万円）
  const netIncome = calculateNetIncome(grossIncome);
  const monthlyNetIncome = calculateMonthlyNetIncome(netIncome);
  const totalSavings = calculateSavings(grossIncome, bonus, monthlyExpense, years);
  const savingsRate = calculateSavingsRate(grossIncome, bonus, monthlyExpense);
  const annualNetIncome = netIncome + bonus;
  const annualExpense = monthlyExpense * 12;
  const annualSavings = Math.max(0, annualNetIncome - annualExpense);

  // 設定を保存
  useEffect(() => {
    const saveSettings = async () => {
      try {
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ isMonthlyMode, monthlySalary, monthlyExpense, bonus, years })
        );
      } catch (error) {
        console.error("Failed to save settings:", error);
      }
    };
    saveSettings();
  }, [isMonthlyMode, monthlySalary, monthlyExpense, bonus, years]);

  // 設定を読み込み
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const settings = JSON.parse(saved);
          setIsMonthlyMode(settings.isMonthlyMode !== undefined ? settings.isMonthlyMode : true);
          setMonthlySalary(settings.monthlySalary || 30);
          setMonthlyExpense(settings.monthlyExpense || 20);
          setBonus(settings.bonus || 80);
          setYears(settings.years || 10);
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    };
    loadSettings();
  }, []);

  // 資産情報を保存
  useEffect(() => {
    const saveAssets = async () => {
      try {
        await AsyncStorage.setItem(
          ASSETS_STORAGE_KEY,
          JSON.stringify({ personal: personalAccounts, corporate: corporateAccounts })
        );
      } catch (error) {
        console.error("Failed to save assets:", error);
      }
    };
    saveAssets();
  }, [personalAccounts, corporateAccounts]);

  // 資産情報を読み込み
  useEffect(() => {
    const loadAssets = async () => {
      try {
        const saved = await AsyncStorage.getItem(ASSETS_STORAGE_KEY);
        if (saved) {
          const assets = JSON.parse(saved);
          setPersonalAccounts(assets.personal || []);
          setCorporateAccounts(assets.corporate || []);
        }
      } catch (error) {
        console.error("Failed to load assets:", error);
      }
    };
    loadAssets();
  }, []);

  // 個人資産のハンドラー
  const handleAddPersonalAccount = (account: Omit<BankAccount, "id">) => {
    const newAccount = { ...account, id: Date.now().toString() };
    setPersonalAccounts([...personalAccounts, newAccount]);
  };

  const handleEditPersonalAccount = (account: BankAccount) => {
    setPersonalAccounts(personalAccounts.map((a) => (a.id === account.id ? account : a)));
  };

  const handleDeletePersonalAccount = (id: string) => {
    setPersonalAccounts(personalAccounts.filter((a) => a.id !== id));
  };

  // 法人資産のハンドラー
  const handleAddCorporateAccount = (account: Omit<BankAccount, "id">) => {
    const newAccount = { ...account, id: Date.now().toString() };
    setCorporateAccounts([...corporateAccounts, newAccount]);
  };

  const handleEditCorporateAccount = (account: BankAccount) => {
    setCorporateAccounts(corporateAccounts.map((a) => (a.id === account.id ? account : a)));
  };

  const handleDeleteCorporateAccount = (id: string) => {
    setCorporateAccounts(corporateAccounts.filter((a) => a.id !== id));
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={{ padding: 16 }}>
        <ScreenTitle title="収入・貲蓄シミュレーター" subtitle="資産形成の見通しを立てよう" />

        {/* 入力セクション */}
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            条件を設定
          </ThemedText>

          {/* 月額/年額切り替え */}
          <View style={styles.toggleContainer}>
            <Pressable
              style={[
                styles.toggleButton,
                isMonthlyMode && styles.toggleButtonActive,
                { borderColor: tintColor },
              ]}
              onPress={() => setIsMonthlyMode(true)}
            >
              <ThemedText
                style={[
                  styles.toggleText,
                  isMonthlyMode && { color: "#fff" },
                ]}
              >
                月額入力
              </ThemedText>
            </Pressable>
            <Pressable
              style={[
                styles.toggleButton,
                !isMonthlyMode && styles.toggleButtonActive,
                { borderColor: tintColor },
              ]}
              onPress={() => setIsMonthlyMode(false)}
            >
              <ThemedText
                style={[
                  styles.toggleText,
                  !isMonthlyMode && { color: "#fff" },
                ]}
              >
                年額入力
              </ThemedText>
            </Pressable>
          </View>

          {/* 給与入力（月額/年額切り替え） */}
          {isMonthlyMode ? (
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <ThemedText style={styles.label}>月額額面給与</ThemedText>
                <ThemedText style={[styles.label, { color: tintColor }]}>
                  ¥{monthlySalary.toLocaleString()}万円
                </ThemedText>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={15}
                maximumValue={300}
                step={1}
                value={monthlySalary}
                onValueChange={setMonthlySalary}
                minimumTrackTintColor={tintColor}
                maximumTrackTintColor={textSecondary}
              />
              <View style={styles.sliderLabels}>
                <ThemedText style={[styles.sliderLabel, { color: textSecondary }]}>
                  15万円
                </ThemedText>
                <ThemedText style={[styles.sliderLabel, { color: textSecondary }]}>
                  300万円
                </ThemedText>
              </View>
              <ThemedText style={[styles.infoText, { color: textSecondary, marginTop: 4 }]}>
                年収: ¥{grossIncome.toLocaleString()}万円
              </ThemedText>
            </View>
          ) : (
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <ThemedText style={styles.label}>額面年収</ThemedText>
                <ThemedText style={[styles.label, { color: tintColor }]}>
                  ¥{grossIncome.toLocaleString()}万円
                </ThemedText>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={180}
                maximumValue={3600}
                step={10}
                value={grossIncome}
                onValueChange={(value) => setMonthlySalary(value / 12)}
                minimumTrackTintColor={tintColor}
                maximumTrackTintColor={textSecondary}
              />
              <View style={styles.sliderLabels}>
                <ThemedText style={[styles.sliderLabel, { color: textSecondary }]}>
                  180万円
                </ThemedText>
                <ThemedText style={[styles.sliderLabel, { color: textSecondary }]}>
                  3600万円
                </ThemedText>
              </View>
              <ThemedText style={[styles.infoText, { color: textSecondary, marginTop: 4 }]}>
                月給: ¥{monthlySalary.toLocaleString()}万円
              </ThemedText>
            </View>
          )}

          {/* ボーナス */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <ThemedText style={styles.label}>年間ボーナス</ThemedText>
              <ThemedText style={[styles.label, { color: tintColor }]}>
                ¥{bonus.toLocaleString()}万円
              </ThemedText>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={500}
              step={10}
              value={bonus}
              onValueChange={setBonus}
              minimumTrackTintColor={tintColor}
              maximumTrackTintColor={textSecondary}
            />
            <View style={styles.sliderLabels}>
              <ThemedText style={[styles.sliderLabel, { color: textSecondary }]}>
                0万円
              </ThemedText>
              <ThemedText style={[styles.sliderLabel, { color: textSecondary }]}>
                500万円
              </ThemedText>
            </View>
          </View>

          {/* 月額支出 */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <ThemedText style={styles.label}>月額支出</ThemedText>
              <ThemedText style={[styles.label, { color: tintColor }]}>
                ¥{monthlyExpense.toLocaleString()}万円
              </ThemedText>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={5}
              maximumValue={300}
              step={1}
              value={monthlyExpense}
              onValueChange={setMonthlyExpense}
              minimumTrackTintColor={tintColor}
              maximumTrackTintColor={textSecondary}
            />
            <View style={styles.sliderLabels}>
              <ThemedText style={[styles.sliderLabel, { color: textSecondary }]}>
                5万円
              </ThemedText>
              <ThemedText style={[styles.sliderLabel, { color: textSecondary }]}>
                300万円
              </ThemedText>
            </View>
          </View>

          {/* 期間 */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <ThemedText style={styles.label}>期間</ThemedText>
              <ThemedText style={[styles.label, { color: tintColor }]}>{years}年</ThemedText>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={50}
              step={1}
              value={years}
              onValueChange={setYears}
              minimumTrackTintColor={tintColor}
              maximumTrackTintColor={textSecondary}
            />
            <View style={styles.sliderLabels}>
              <ThemedText style={[styles.sliderLabel, { color: textSecondary }]}>1年</ThemedText>
              <ThemedText style={[styles.sliderLabel, { color: textSecondary }]}>
                50年
              </ThemedText>
            </View>
          </View>
        </View>

        {/* 結果セクション */}
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            シミュレーション結果
          </ThemedText>

          {/* 手取り年収 */}
          <View style={styles.resultItem}>
            <ThemedText style={styles.resultLabel}>手取り年収（税引後）</ThemedText>
            <ThemedText
              style={[
                styles.resultValue,
                { color: tintColor, fontVariant: ["tabular-nums"] as any },
              ]}
            >
              ¥{netIncome.toLocaleString()}万円
            </ThemedText>
          </View>

          {/* 月額手取り */}
          <View style={styles.resultItem}>
            <ThemedText style={styles.resultLabel}>月額手取り</ThemedText>
            <ThemedText
              style={[
                styles.resultValue,
                { color: textSecondary, fontVariant: ["tabular-nums"] as any },
              ]}
            >
              ¥{monthlyNetIncome.toLocaleString()}万円
            </ThemedText>
          </View>

          <View style={styles.divider} />

          {/* 年間収入（ボーナス込み） */}
          <View style={styles.resultItem}>
            <ThemedText style={styles.resultLabel}>年間収入（手取り+ボーナス）</ThemedText>
            <ThemedText
              style={[
                styles.resultValue,
                { color: tintColor, fontVariant: ["tabular-nums"] as any },
              ]}
            >
              ¥{annualNetIncome.toLocaleString()}万円
            </ThemedText>
          </View>

          {/* 年間支出 */}
          <View style={styles.resultItem}>
            <ThemedText style={styles.resultLabel}>年間支出</ThemedText>
            <ThemedText
              style={[
                styles.resultValue,
                { color: "#FF3B30", fontVariant: ["tabular-nums"] as any },
              ]}
            >
              ¥{annualExpense.toLocaleString()}万円
            </ThemedText>
          </View>

          {/* 年間貯蓄 */}
          <View style={styles.resultItem}>
            <ThemedText style={styles.resultLabel}>年間貯蓄可能額</ThemedText>
            <ThemedText
              style={[
                styles.resultValue,
                { color: "#34C759", fontVariant: ["tabular-nums"] as any },
              ]}
            >
              ¥{annualSavings.toLocaleString()}万円
            </ThemedText>
          </View>

          {/* 貯蓄率 */}
          <View style={styles.resultItem}>
            <ThemedText style={styles.resultLabel}>貯蓄率</ThemedText>
            <ThemedText
              style={[
                styles.resultValue,
                { color: "#34C759", fontVariant: ["tabular-nums"] as any },
              ]}
            >
              {savingsRate}%
            </ThemedText>
          </View>

          <View style={styles.divider} />

          {/* 期間内の総貯蓄 */}
          <View style={styles.totalResult}>
            <ThemedText style={styles.totalLabel}>{years}年間の総貯蓄可能額</ThemedText>
            <ThemedText
              style={[
                styles.totalValue,
                { color: "#34C759", fontVariant: ["tabular-nums"] as any },
              ]}
            >
              ¥{totalSavings.toLocaleString()}万円
            </ThemedText>
            <ThemedText style={[styles.infoText, { color: textSecondary }]}>
              年間{annualSavings.toLocaleString()}万円を{years}年間貯蓄すると、約¥
              {totalSavings.toLocaleString()}万円になります
            </ThemedText>
          </View>
        </View>

        {/* アドバイス */}
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            💡 アドバイス
          </ThemedText>
          <ThemedText style={[styles.infoText, { color: textSecondary }]}>
            {savingsRate >= 20
              ? `貯蓄率${savingsRate}%は素晴らしいです！この調子で積立投資を続ければ、将来の資産形成がより確実になります。`
              : savingsRate >= 10
                ? `貯蓄率${savingsRate}%は良好です。さらに支出を見直すか、収入を増やすことで、より多くの資産を築けます。`
                : savingsRate > 0
                  ? `貯蓄率${savingsRate}%は少し低めです。固定費の見直しや、収入アップを検討してみましょう。`
                  : "現在の収支では貯蓄が難しい状況です。支出の見直しを優先的に行いましょう。"}
          </ThemedText>
        </View>

        {/* 年次推移グラフ */}
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <IncomeTrendChart
            years={years}
            annualIncome={annualNetIncome}
            annualExpense={annualExpense}
            annualSavings={annualSavings}
            initialAssets={
              personalAccounts.reduce((sum, acc) => sum + acc.currentBalance, 0) +
              corporateAccounts.reduce((sum, acc) => sum + acc.currentBalance, 0)
            }
          />
        </View>

        {/* 資産管理 */}
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <ThemedText type="subtitle" style={[styles.sectionTitle, { marginBottom: 16 }]}>
            💰 資産管理
          </ThemedText>
          <AssetManagement
            title="個人資産"
            accounts={personalAccounts}
            onAddAccount={handleAddPersonalAccount}
            onEditAccount={handleEditPersonalAccount}
            onDeleteAccount={handleDeletePersonalAccount}
          />
          <AssetManagement
            title="法人資産"
            accounts={corporateAccounts}
            onAddAccount={handleAddCorporateAccount}
            onEditAccount={handleEditCorporateAccount}
            onDeleteAccount={handleDeleteCorporateAccount}
          />
        </View>
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
    marginBottom: 16,
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
  resultItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  resultLabel: {
    fontSize: 14,
    lineHeight: 20,
  },
  resultValue: {
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 24,
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 16,
    opacity: 0.3,
  },
  totalResult: {
    alignItems: "center",
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
  },
  totalValue: {
    fontSize: 32,
    fontWeight: "bold",
    lineHeight: 40,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
  },
  toggleContainer: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 8,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleButtonActive: {
    backgroundColor: "#34C759",
    borderColor: "#34C759",
  },
  toggleText: {
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
});
