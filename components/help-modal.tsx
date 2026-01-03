import { Modal, View, StyleSheet, Pressable, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";

interface HelpModalProps {
  visible: boolean;
  onClose: () => void;
  topic: "return" | "compound" | "nisa" | "fees";
}

const HELP_CONTENT = {
  return: {
    title: "利回りとは？",
    content: `利回りとは、投資した金額に対して1年間でどれだけの利益が得られるかを示す割合です。

例えば、年利5%の場合、100万円を投資すると1年後に5万円の利益が得られる計算になります。

ただし、投資信託の利回りは保証されたものではなく、市場の状況によって変動します。過去の実績や平均値を参考にしますが、将来の利回りを約束するものではありません。

一般的な目安:
• 保守的: 3%前後（債券中心）
• バランス型: 5%前後（株式と債券の混合）
• 積極的: 7%以上（株式中心）`,
  },
  compound: {
    title: "複利効果とは？",
    content: `複利とは、運用で得た利益を再投資することで、利益が利益を生む効果のことです。

例えば、100万円を年利5%で運用した場合:
• 1年目: 100万円 → 105万円（+5万円）
• 2年目: 105万円 → 110.25万円（+5.25万円）
• 3年目: 110.25万円 → 115.76万円（+5.51万円）

このように、利益が再投資されることで、毎年の利益額が増えていきます。

長期間積み立てるほど、複利効果が大きくなります。20年、30年と続けることで、元本よりも運用益の方が大きくなることもあります。`,
  },
  nisa: {
    title: "NISAとは？",
    content: `NISA（少額投資非課税制度）は、投資で得た利益が非課税になる制度です。

通常、投資信託の利益には約20%の税金がかかりますが、NISA口座で運用すれば税金がかかりません。

つみたてNISAの特徴:
• 年間投資上限: 120万円（月10万円）
• 非課税期間: 無期限
• 対象商品: 金融庁が認めた長期・積立・分散投資に適した投資信託

例えば、20年間で運用益が500万円出た場合:
• 通常の口座: 約100万円の税金
• NISA口座: 税金0円

長期の積立投資を考えているなら、NISAの活用がおすすめです。`,
  },
  fees: {
    title: "手数料の影響",
    content: `投資信託には主に2種類の手数料がかかります。

1. 購入時手数料（販売手数料）
購入時に一度だけかかる手数料。最近は「ノーロード」と呼ばれる手数料無料の商品が増えています。

2. 信託報酬（運用管理費用）
保有している間、毎年かかる手数料。年率0.1%〜2%程度。

手数料の影響例（月3万円、20年、年利5%の場合）:
• 信託報酬0.1%: 最終資産額 約1,220万円
• 信託報酬0.5%: 最終資産額 約1,180万円
• 信託報酬1.0%: 最終資産額 約1,140万円

わずかな手数料の差でも、長期間では大きな差になります。できるだけ手数料の低い商品を選ぶことが重要です。`,
  },
};

export function HelpModal({ visible, onClose, topic }: HelpModalProps) {
  const insets = useSafeAreaInsets();
  const tintColor = useThemeColor({}, "tint");
  const cardBg = useThemeColor({}, "cardBackground");

  const content = HELP_CONTENT[topic];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <ThemedView
          style={[
            styles.modalContainer,
            {
              paddingTop: Math.max(insets.top, 20) + 16,
              paddingBottom: Math.max(insets.bottom, 20) + 16,
            },
          ]}
        >
          <View style={styles.header}>
            <ThemedText type="title" style={styles.title}>
              {content.title}
            </ThemedText>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <ThemedText style={[styles.closeButtonText, { color: tintColor }]}>
                閉じる
              </ThemedText>
            </Pressable>
          </View>

          <ScrollView style={styles.scrollView}>
            <View style={[styles.contentCard, { backgroundColor: cardBg }]}>
              <ThemedText style={styles.contentText}>{content.content}</ThemedText>
            </View>
          </ScrollView>
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "80%",
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    flex: 1,
  },
  closeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  closeButtonText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  contentCard: {
    borderRadius: 12,
    padding: 16,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
  },
});
