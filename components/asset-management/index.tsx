
import { useState } from "react";
import { StyleSheet, View, Pressable, TextInput } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useThemeColor } from "@/hooks/use-theme-color";
import { formatCurrency } from "@/lib/calculator";

export type BankAccount = {
    id: string;
    bankName: string;
    currentBalance: number;
    expectedDeposit: number;
};

type Props = {
    title: string;
    accounts: BankAccount[];
    onAddAccount: (account: Omit<BankAccount, "id">) => void;
    onEditAccount: (account: BankAccount) => void;
    onDeleteAccount: (id: string) => void;
};

export function AssetManagement({
    title,
    accounts,
    onAddAccount,
    onEditAccount,
    onDeleteAccount,
}: Props) {
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [bankName, setBankName] = useState("");
    const [currentBalance, setCurrentBalance] = useState("");
    const [expectedDeposit, setExpectedDeposit] = useState("");

    const tintColor = useThemeColor({}, "tint");
    const textSecondary = useThemeColor({}, "icon");
    const borderColor = useThemeColor({ light: "#e0e0e0", dark: "#3a3a3c" }, "icon");

    const totalBalance = accounts.reduce((sum, acc) => sum + acc.currentBalance, 0);

    const resetForm = () => {
        setBankName("");
        setCurrentBalance("");
        setExpectedDeposit("");
        setIsEditing(false);
        setEditingId(null);
    };

    const handleSubmit = () => {
        if (!bankName) return;

        const accountData = {
            bankName,
            currentBalance: parseInt(currentBalance) || 0,
            expectedDeposit: parseInt(expectedDeposit) || 0,
        };

        if (editingId) {
            onEditAccount({ ...accountData, id: editingId });
        } else {
            onAddAccount(accountData);
        }
        resetForm();
    };

    const handleEdit = (account: BankAccount) => {
        setBankName(account.bankName);
        setCurrentBalance(account.currentBalance.toString());
        setExpectedDeposit(account.expectedDeposit.toString());
        setEditingId(account.id);
        setIsEditing(true);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <ThemedText type="defaultSemiBold">{title}</ThemedText>
                <ThemedText type="defaultSemiBold" style={{ color: tintColor }}>
                    合計: {formatCurrency(totalBalance)}万円
                </ThemedText>
            </View>

            {accounts.map((account) => (
                <View key={account.id} style={[styles.accountItem, { borderColor }]}>
                    <View style={styles.accountInfo}>
                        <ThemedText style={styles.bankName}>{account.bankName}</ThemedText>
                        <View style={styles.balanceInfo}>
                            <ThemedText style={styles.balanceText}>
                                残高: {formatCurrency(account.currentBalance)}万円
                            </ThemedText>
                            {account.expectedDeposit > 0 && (
                                <ThemedText style={styles.depositText}>
                                    (入金予定: +{formatCurrency(account.expectedDeposit)}万円)
                                </ThemedText>
                            )}
                        </View>
                    </View>
                    <View style={styles.actions}>
                        <Pressable onPress={() => handleEdit(account)} style={styles.actionButton}>
                            <IconSymbol name="pencil" size={20} color={textSecondary} />
                        </Pressable>
                        <Pressable
                            onPress={() => onDeleteAccount(account.id)}
                            style={styles.actionButton}
                        >
                            <IconSymbol name="trash" size={20} color="#FF3B30" />
                        </Pressable>
                    </View>
                </View>
            ))}

            {isEditing ? (
                <View style={[styles.form, { borderColor }]}>
                    <TextInput
                        style={[styles.input, { borderColor, color: textSecondary }]}
                        placeholder="銀行名"
                        value={bankName}
                        onChangeText={setBankName}
                        placeholderTextColor={textSecondary}
                    />
                    <View style={styles.row}>
                        <TextInput
                            style={[styles.input, { borderColor, color: textSecondary, flex: 1 }]}
                            placeholder="現在残高(万円)"
                            value={currentBalance}
                            onChangeText={setCurrentBalance}
                            keyboardType="numeric"
                            placeholderTextColor={textSecondary}
                        />
                        <TextInput
                            style={[styles.input, { borderColor, color: textSecondary, flex: 1 }]}
                            placeholder="入金予定(万円)"
                            value={expectedDeposit}
                            onChangeText={setExpectedDeposit}
                            keyboardType="numeric"
                            placeholderTextColor={textSecondary}
                        />
                    </View>
                    <View style={styles.formActions}>
                        <Pressable onPress={resetForm} style={[styles.button, styles.cancelButton]}>
                            <ThemedText>キャンセル</ThemedText>
                        </Pressable>
                        <Pressable
                            onPress={handleSubmit}
                            style={[styles.button, { backgroundColor: tintColor }]}
                        >
                            <ThemedText style={{ color: "#fff" }}>
                                {editingId ? "更新" : "追加"}
                            </ThemedText>
                        </Pressable>
                    </View>
                </View>
            ) : (
                <Pressable
                    style={[styles.addButton, { borderColor: tintColor }]}
                    onPress={() => setIsEditing(true)}
                >
                    <IconSymbol name="plus" size={20} color={tintColor} />
                    <ThemedText style={{ color: tintColor }}>口座を追加</ThemedText>
                </Pressable>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    accountItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 12,
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 8,
    },
    accountInfo: {
        flex: 1,
    },
    bankName: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 4,
    },
    balanceInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        flexWrap: "wrap",
    },
    balanceText: {
        fontSize: 14,
    },
    depositText: {
        fontSize: 12,
        opacity: 0.6,
    },
    actions: {
        flexDirection: "row",
        gap: 12,
        paddingLeft: 12,
    },
    actionButton: {
        padding: 4,
    },
    addButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: 12,
        borderWidth: 1,
        borderStyle: "dashed",
        borderRadius: 8,
    },
    form: {
        padding: 12,
        borderWidth: 1,
        borderRadius: 8,
        gap: 12,
    },
    input: {
        height: 40,
        borderWidth: 1,
        borderRadius: 6,
        paddingHorizontal: 12,
        fontSize: 14,
    },
    row: {
        flexDirection: "row",
        gap: 12,
    },
    formActions: {
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 12,
    },
    button: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 6,
        alignItems: "center",
    },
    cancelButton: {
        backgroundColor: "transparent",
    },
});
