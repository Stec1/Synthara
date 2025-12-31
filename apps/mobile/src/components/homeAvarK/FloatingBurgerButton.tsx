import React from 'react';
import { Pressable, View } from 'react-native';

import { useTheme } from '../../ui';

type FloatingBurgerButtonProps = {
  onPress: () => void;
};

export function FloatingBurgerButton({ onPress }: FloatingBurgerButtonProps) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          position: 'absolute',
          right: theme.spacing.lg,
          bottom: theme.spacing.lg,
          width: 54,
          height: 54,
          borderRadius: 18,
          backgroundColor: 'rgba(10,10,12,0.85)',
          borderWidth: 1.5,
          borderColor: 'rgba(247,201,72,0.65)',
          shadowColor: '#000',
          shadowOpacity: 0.45,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 8 },
          justifyContent: 'center',
          alignItems: 'center',
          transform: [{ translateY: pressed ? 2 : 0 }],
        },
      ]}
    >
      <View style={{ gap: 4 }}>
        <View
          style={{
            width: 22,
            height: 2,
            backgroundColor: theme.colors.primary,
            borderRadius: 2,
          }}
        />
        <View
          style={{
            width: 18,
            height: 2,
            backgroundColor: 'rgba(255,255,255,0.9)',
            borderRadius: 2,
          }}
        />
        <View
          style={{
            width: 22,
            height: 2,
            backgroundColor: theme.colors.primary,
            borderRadius: 2,
          }}
        />
      </View>
    </Pressable>
  );
}
