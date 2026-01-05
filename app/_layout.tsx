import { Tabs } from "expo-router";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/error-boundary";
import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();

  return (
    <ErrorBoundary>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
          headerShown: false,
          tabBarButton: HapticTab,
          // Ensure tab bar respects bottom safe area for devices with home indicators
          tabBarStyle: {
            paddingBottom: insets.bottom,
            height: 49 + insets.bottom, // Default tab bar height (49) + safe area
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "積立・複利",
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="income"
          options={{
            title: "収入・貯蓄",
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="yensign.circle.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="expense"
          options={{
            title: "支出",
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="cart.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "設定",
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="gearshape.fill" color={color} />,
          }}
        />
      </Tabs>
    </ErrorBoundary>
  );
}
