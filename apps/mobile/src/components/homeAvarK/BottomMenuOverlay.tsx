import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

import { useTheme } from '../../ui';

type MenuRoute = 'profile' | 'game' | 'settings' | 'about';

type BottomMenuOverlayProps = {
  visible: boolean;
  onClose: () => void;
  onNavigate: (route: MenuRoute) => void;
};

const menuItems: Array<{ key: MenuRoute; label: string }> = [
  { key: 'profile', label: 'Profile' },
  { key: 'game', label: 'Game' },
  { key: 'settings', label: 'Settings' },
  { key: 'about', label: 'About us' },
];

export function BottomMenuOverlay({ visible, onClose, onNavigate }: BottomMenuOverlayProps) {
  const { theme } = useTheme();

  const handleNavigate = (route: MenuRoute) => {
    onClose();
    setTimeout(() => onNavigate(route), 100);
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.55)',
          justifyContent: 'flex-end',
        }}
        onPress={onClose}
      >
        <Pressable
          style={{
            backgroundColor: '#0f0f16',
            paddingHorizontal: theme.spacing.lg,
            paddingVertical: theme.spacing.lg,
            borderTopLeftRadius: theme.radius.lg,
            borderTopRightRadius: theme.radius.lg,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.14)',
            gap: theme.spacing.md,
          }}
          onPress={(event) => event.stopPropagation()}
        >
          <View style={{ alignSelf: 'center', width: 36, height: 4, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.3)' }} />
          {menuItems.map((item) => (
            <Pressable
              key={item.key}
              onPress={() => handleNavigate(item.key)}
              style={({ pressed }) => [
                {
                  paddingVertical: theme.spacing.sm,
                  borderRadius: theme.radius.sm,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: pressed ? 'rgba(255,255,255,0.04)' : 'transparent',
                },
              ]}
            >
              <Text style={[theme.typography.subtitle, { color: theme.colors.text }]}>{item.label}</Text>
              <Text style={[theme.typography.caption, { color: theme.colors.subdued }]}>↗</Text>
            </Pressable>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
