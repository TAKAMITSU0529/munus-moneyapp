import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { ScreenTitle } from "@/components/screen-title";
import { useThemeColor } from "@/hooks/use-theme-color";
import { formatCurrency } from "@/lib/calculator";

const STORAGE_KEY = "@expense_manager";

export interface ExpenseItem {
  id: string;
  name: string;
  amount: number;
  type: "monthly" | "annual";
}

export default function ExpenseScreen() {
  const [monthlyExpenses, setMonthlyExpenses] = useState<ExpenseItem[]>([]);
  const [annualExpenses, setAnnualExpenses] = useState<ExpenseItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<ExpenseItem | null>(null);
  const [expenseType, setExpenseType] = useState<"monthly" | "annual">("monthly");
  const [itemName, setItemName] = useState("");
  const [itemAmount, setItemAmount] = useState("");

  const cardBg = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");

  // データの読み込み
  useEffect(() => {
    loadData();
  }, []);

  // データの保存
  useEffect(() => {
    saveData();
  }, [monthlyExpenses, annualExpenses]);

  const loadData = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        setMonthlyExpenses(parsed.monthly || []);
        setAnnualExpenses(parsed.annual || []);
      }
    } catch (error) {
      console.error("Failed to load expense data:", error);
    }
  };

  const saveData = async () => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          monthly: monthlyExpenses,
          annual: annualExpenses,
        })
      );
    } catch (error) {
      console.error("Failed to save expense data:", error);
    }
  };

  const openAddModal = (type: "monthly" | "annual") => {
    setExpenseType(type);
    setEditingItem(null);
    setItemName("");
    setItemAmount("");
    setModalVisible(true);
  };

  const openEditModal = (item: ExpenseItem) => {
    setEditingItem(item);
    setExpenseType(item.type);
    setItemName(item.name);
    setItemAmount(item.amount.toString());
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!itemName.trim()) {
      Alert.alert("エラー", "項目名を入力してください");
      return;
    }

    const amount = parseFloat(itemAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("エラー", "有効な金額を入力してください");
      return;
    }

    if (editingItem) {
      // 編集
      if (expenseType === "monthly") {
        setMonthlyExpenses((prev) =>
          prev.map((item) =>
            item.id === editingItem.id
              ? { ...item, name: itemName, amount, type: expenseType }
              : item
          )
        );
      } else {
        setAnnualExpenses((prev) =>
          prev.map((item) =>
            item.id === editingItem.id
              ? { ...item, name: itemName, amount, type: expenseType }
              : item
          )
        );
      }
    } else {
      // 新規追加
      const newItem: ExpenseItem = {
        id: Date.now().toString(),
        name: itemName,
        amount,
        type: expenseType,
      };

      if (expenseType === "monthly") {
        setMonthlyExpenses((prev) => [...prev, newItem]);
      } else {
        setAnnualExpenses((prev) => [...prev, newItem]);
      }
    }

    setModalVisible(false);
  };

  const handleDelete = (item: ExpenseItem) => {
    Alert.alert("削除確認", `「${item.name}」を削除しますか？`, [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除",
        style: "destructive",
        onPress: () => {
          if (item.type === "monthly") {
            setMonthlyExpenses((prev) => prev.filter((i) => i.id !== item.id));
          } else {
            setAnnualExpenses((prev) => prev.filter((i) => i.id !== item.id));
          }
        },
      },
    ]);
  };

  // 月間支出合計（月間固定支出 + 年間支出の月換算）
  const totalMonthlyExpense =
    monthlyExpenses.reduce((sum, item) => sum + item.amount, 0) +
    annualExpenses.reduce((sum, item) => sum + item.amount / 12, 0);

  // 年間支出合計
  const totalAnnualExpense =
    monthlyExpenses.reduce((sum, item) => sum + item.amount * 12, 0) +
    annualExpenses.reduce((sum, item) => sum + item.amount, 0);

  const renderExpenseItem = (item: ExpenseItem) => (
    <Pressable
      key={item.id}
      style={[styles.expenseItem, { borderColor: tintColor + "30" }]}
      onPress={() => openEditModal(item)}
      onLongPress={() => handleDelete(item)}
    >
      <View style={styles.expenseItemContent}>
        <ThemedText style={styles.expenseItemName}>{item.name}</ThemedText>
        <ThemedText style={[styles.expenseItemAmount, { color: tintColor }]}>
          {formatCurrency(item.amount)}
          {item.type === "annual" && (
            <ThemedText style={styles.monthlyNote}>
              {" "}
              (月{formatCurrency(Math.round(item.amount / 12))})
            </ThemedText>
          )}
        </ThemedText>
      </View>
    </Pressable>
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* タイトル */}
        <ScreenTitle title="支出管理" subtitle="毎月の支出を把握しよう" />

        {/* サマリー */}
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <View style={styles.summaryContainer}>
            <View style={styles.summaryItem}>
              <ThemedText style={styles.summaryLabel}>月間支出合計</ThemedText>
              <ThemedText
                style={[styles.summaryValue, { color: "#FF3B30", fontVariant: ["tabular-nums"] }]}
              >
                {formatCurrency(Math.round(totalMonthlyExpense))}
              </ThemedText>
            </View>
            <View style={styles.summaryItem}>
              <ThemedText style={styles.summaryLabel}>年間支出合計</ThemedText>
              <ThemedText
                style={[styles.summaryValue, { color: "#FF3B30", fontVariant: ["tabular-nums"] }]}
              >
                {formatCurrency(Math.round(totalAnnualExpense))}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* 月間固定支出 */}
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle">📅 月間固定支出</ThemedText>
            <Pressable
              style={[styles.addButton, { backgroundColor: tintColor }]}
              onPress={() => openAddModal("monthly")}
            >
              <ThemedText style={styles.addButtonText}>+ 追加</ThemedText>
            </Pressable>
          </View>
          {monthlyExpenses.length === 0 ? (
            <ThemedText style={styles.emptyText}>
              月間固定支出を追加してください（家賃、食費、光熱費など）
            </ThemedText>
          ) : (
            monthlyExpenses.map(renderExpenseItem)
          )}
          {monthlyExpenses.length > 0 && (
            <View style={styles.subtotalContainer}>
              <ThemedText style={styles.subtotalLabel}>月間固定支出 小計</ThemedText>
              <ThemedText style={[styles.subtotalValue, { fontVariant: ["tabular-nums"] }]}>
                {formatCurrency(monthlyExpenses.reduce((sum, item) => sum + item.amount, 0))}
              </ThemedText>
            </View>
          )}
          {annualExpenses.length > 0 && (
            <View style={styles.subtotalContainer}>
              <ThemedText style={styles.subtotalLabel}>年間支出（月換算） 小計</ThemedText>
              <ThemedText style={[styles.subtotalValue, { fontVariant: ["tabular-nums"] }]}>
                {formatCurrency(Math.round(annualExpenses.reduce((sum, item) => sum + item.amount / 12, 0)))}
              </ThemedText>
            </View>
          )}
          {(monthlyExpenses.length > 0 || annualExpenses.length > 0) && (
            <View style={[styles.subtotalContainer, styles.totalContainer]}>
              <ThemedText style={[styles.subtotalLabel, styles.totalLabel]}>月間支出合計</ThemedText>
              <ThemedText style={[styles.subtotalValue, styles.totalValue, { fontVariant: ["tabular-nums"] }]}>
                {formatCurrency(Math.round(totalMonthlyExpense))}
              </ThemedText>
            </View>
          )}
        </View>

        {/* 年間支出 */}
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle">📆 年間支出</ThemedText>
            <Pressable
              style={[styles.addButton, { backgroundColor: tintColor }]}
              onPress={() => openAddModal("annual")}
            >
              <ThemedText style={styles.addButtonText}>+ 追加</ThemedText>
            </Pressable>
          </View>
          {annualExpenses.length === 0 ? (
            <ThemedText style={styles.emptyText}>
              年間支出を追加してください（保険料、税金、旅行費など）
            </ThemedText>
          ) : (
            annualExpenses.map(renderExpenseItem)
          )}
          {annualExpenses.length > 0 && (
            <View style={styles.subtotalContainer}>
              <ThemedText style={styles.subtotalLabel}>年間支出 小計</ThemedText>
              <ThemedText style={[styles.subtotalValue, { fontVariant: ["tabular-nums"] }]}>
                {formatCurrency(annualExpenses.reduce((sum, item) => sum + item.amount, 0))}
              </ThemedText>
            </View>
          )}
        </View>

        <ThemedText style={styles.helpText}>
          💡 ヒント: 項目をタップして編集、長押しで削除できます
        </ThemedText>
      </ScrollView>

      {/* 追加・編集モーダル */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: cardBg }]}>
            <ThemedText type="subtitle" style={styles.modalTitle}>
              {editingItem ? "支出項目を編集" : "支出項目を追加"}
            </ThemedText>

            <ThemedText style={styles.inputLabel}>項目名</ThemedText>
            <TextInput
              style={[styles.input, { color: textColor, borderColor: tintColor }]}
              value={itemName}
              onChangeText={setItemName}
              placeholder="例: 家賃、保険料"
              placeholderTextColor={textColor + "80"}
            />

            <ThemedText style={styles.inputLabel}>金額（円）</ThemedText>
            <TextInput
              style={[styles.input, { color: textColor, borderColor: tintColor }]}
              value={itemAmount}
              onChangeText={setItemAmount}
              placeholder="例: 80000"
              placeholderTextColor={textColor + "80"}
              keyboardType="numeric"
            />

            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <ThemedText>キャンセル</ThemedText>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.saveButton, { backgroundColor: tintColor }]}
                onPress={handleSave}
              >
                <ThemedText style={styles.saveButtonText}>保存</ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  content: {
    padding: 16,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  pageTitle: {
    marginBottom: 16,
  },
  summaryContainer: {
    gap: 12,
  },
  summaryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 16,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "600",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  addButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 14,
    opacity: 0.6,
    fontStyle: "italic",
  },
  expenseItem: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  expenseItemContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  expenseItemName: {
    fontSize: 16,
    flex: 1,
  },
  expenseItemAmount: {
    fontSize: 18,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
  monthlyNote: {
    fontSize: 12,
    opacity: 0.6,
  },
  subtotalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
  subtotalLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  subtotalValue: {
    fontSize: 18,
    fontWeight: "600",
  },
  totalContainer: {
    backgroundColor: "rgba(0, 122, 255, 0.1)",
    paddingHorizontal: 12,
    marginHorizontal: -12,
    marginBottom: -12,
    borderRadius: 8,
  },
  totalLabel: {
    fontSize: 17,
    fontWeight: "700",
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "700",
  },
  helpText: {
    fontSize: 12,
    opacity: 0.6,
    textAlign: "center",
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxWidth: 400,
    padding: 24,
    borderRadius: 16,
  },
  modalTitle: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#ccc",
  },
  saveButton: {
    backgroundColor: "#007AFF",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
