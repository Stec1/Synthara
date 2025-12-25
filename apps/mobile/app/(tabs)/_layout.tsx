import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

import { useEntitlementsStore } from '../../src/state/entitlements';
import { useTheme } from '../../src/ui';

export default function TabsLayout() {
  const syncEntitlements = useEntitlementsStore((state) => state.syncEntitlementsFromApi);
  const { theme, colorScheme } = useTheme();

  useEffect(() => {
    syncEntitlements();
  }, [syncEntitlements]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar style={colorScheme === 'light' ? 'dark' : 'light'} />
      <Tabs
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.background },
          headerTintColor: theme.colors.text,
          tabBarStyle: { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.subdued,
        }}
      >
        <Tabs.Screen name="home" options={{ title: 'Home' }} />
        <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
        <Tabs.Screen name="game" options={{ title: 'Game' }} />
        <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
      </Tabs>
    </View>
  );
}
