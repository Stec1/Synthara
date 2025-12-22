import { Tabs } from 'expo-router';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

export default function TabsLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: '#0b0b0f' }}>
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          headerStyle: { backgroundColor: '#0b0b0f' },
          headerTintColor: '#f5f5f5',
          tabBarStyle: { backgroundColor: '#0b0b0f', borderTopColor: '#222' },
          tabBarActiveTintColor: '#f7c948',
          tabBarInactiveTintColor: '#9aa0aa',
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
