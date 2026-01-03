import { useState, useEffect } from "react";
import { StyleSheet, ScrollView, View, Switch, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { HelpModal } from "@/components/help-modal";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useThemeColor } from "@/hooks/use-theme-color";

const SETTINGS_KEY = "@investment_simulator:settings";

interface Settings {
  considerFees: boolean;
  feeRate: number;
  considerTax: boolean;
  isNISA: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  considerFees: false,
  feeRate: 0.5,
  considerTax: false,
  isNISA: true,
};

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const tintColor = useThemeColor({}, "tint");
  const cardBg = useThemeColor({}, "cardBackground");
  const textSecondary = useThemeColor({}, "textSecondary");

  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [helpModalVisible, setHelpModalVisible] = useState(false);
  const [helpTopic, setHelpTopic] = useState<"return" | "compound" | "nisa" | "fees">("nisa");

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    saveSettings();
  }, [settings]);

  const loadSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem(SETTINGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setSettings(parsed);
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  };

  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  };

  const showHelp = (topic: "return" | "compound" | "nisa" | "fees") => {
    setHelpTopic(topic);
    setHelpModalVisible(true);
  };

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
        <ThemedText type="title" style={styles.title}>
          設定
        </ThemedText>

        {/* 手数料設定 */}
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <View style={styles.cardHeader}>
            <ThemedText type="subtitle" style={styles.cardTitle}>
              手数料
            </ThemedText>
            <Pressable onPress={() => showHelp("fees")} style={styles.helpIcon}>
              <IconSymbol size={24} name="questionmark.circle" color={tintColor} />
            </Pressable>
          </View>

          <View style={styles.settingRow}>
            <ThemedText style={styles.settingLabel}>手数料を考慮する</ThemedText>
            <Switch
              value={settings.considerFees}
              onValueChange={(value) => setSettings({ ...settings, considerFees: value })}
              trackColor={{ false: "#767577", true: tintColor }}
              thumbColor="#f4f3f4"
            />
          </View>

          {settings.considerFees && (
            <View style={styles.detailSection}>
              <ThemedText style={[styles.detailLabel, { color: textSecondary }]}>
                信託報酬（年率）
              </ThemedText>
              <View style={styles.feeOptions}>
                {[0.1, 0.5, 1.0, 1.5].map((rate) => (
                  <Pressable
                    key={rate}
                    style={[
                      styles.feeOption,
                      {
                        borderColor: settings.feeRate === rate ? tintColor : textSecondary,
                        backgroundColor:
                          settings.feeRate === rate ? `${tintColor}20` : "transparent",
                      },
                    ]}
                    onPress={() => setSettings({ ...settings, feeRate: rate })}
                  >
                    <ThemedText
                      style={[
                        styles.feeOptionText,
                        { color: settings.feeRate === rate ? tintColor : textSecondary },
                      ]}
                    >
                      {rate}%
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
              <ThemedText style={[styles.hint, { color: textSecondary }]}>
                一般的なインデックスファンドは0.1〜0.5%程度です
              </ThemedText>
            </View>
          )}
        </View>

        {/* 税金設定 */}
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <View style={styles.cardHeader}>
            <ThemedText type="subtitle" style={styles.cardTitle}>
              税金
            </ThemedText>
            <Pressable onPress={() => showHelp("nisa")} style={styles.helpIcon}>
              <IconSymbol size={24} name="questionmark.circle" color={tintColor} />
            </Pressable>
          </View>

          <View style={styles.settingRow}>
            <ThemedText style={styles.settingLabel}>税金を考慮する</ThemedText>
            <Switch
              value={settings.considerTax}
              onValueChange={(value) => setSettings({ ...settings, considerTax: value })}
              trackColor={{ false: "#767577", true: tintColor }}
              thumbColor="#f4f3f4"
            />
          </View>

          {settings.considerTax && (
            <View style={styles.detailSection}>
              <ThemedText style={[styles.detailLabel, { color: textSecondary }]}>
                口座の種類
              </ThemedText>
              <View style={styles.taxOptions}>
                <Pressable
                  style={[
                    styles.taxOption,
                    {
                      borderColor: settings.isNISA ? tintColor : textSecondary,
                      backgroundColor: settings.isNISA ? `${tintColor}20` : "transparent",
                    },
                  ]}
                  onPress={() => setSettings({ ...settings, isNISA: true })}
                >
                  <ThemedText
                    style={[
                      styles.taxOptionText,
                      { color: settings.isNISA ? tintColor : textSecondary },
                    ]}
                  >
                    NISA口座（非課税）
                  </ThemedText>
                </Pressable>
                <Pressable
                  style={[
                    styles.taxOption,
                    {
                      borderColor: !settings.isNISA ? tintColor : textSecondary,
                      backgroundColor: !settings.isNISA ? `${tintColor}20` : "transparent",
                    },
                  ]}
                  onPress={() => setSettings({ ...settings, isNISA: false })}
                >
                  <ThemedText
                    style={[
                      styles.taxOptionText,
                      { color: !settings.isNISA ? tintColor : textSecondary },
                    ]}
                  >
                    特定口座（課税20.315%）
                  </ThemedText>
                </Pressable>
              </View>
              <ThemedText style={[styles.hint, { color: textSecondary }]}>
                {settings.isNISA
                  ? "NISA口座では運用益に税金がかかりません"
                  : "特定口座では運用益に約20%の税金がかかります"}
              </ThemedText>
            </View>
          )}
        </View>

        {/* 説明 */}
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <ThemedText type="subtitle" style={styles.cardTitle}>
            このアプリについて
          </ThemedText>
          <ThemedText style={[styles.infoText, { color: textSecondary }]}>
            このアプリは投資信託の積立シミュレーションを行うツールです。
            実際の運用結果を保証するものではありません。
            投資判断は自己責任で行ってください。
          </ThemedText>
        </View>
      </ScrollView>

      <HelpModal
        visible={helpModalVisible}
        onClose={() => setHelpModalVisible(false)}
        topic={helpTopic}
      />
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
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    marginBottom: 0,
  },
  helpIcon: {
    padding: 4,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  settingLabel: {
    fontSize: 16,
    lineHeight: 24,
  },
  detailSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  detailLabel: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  feeOptions: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  feeOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  feeOptionText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
  },
  taxOptions: {
    gap: 8,
    marginBottom: 8,
  },
  taxOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  taxOptionText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
  },
  hint: {
    fontSize: 12,
    lineHeight: 16,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
