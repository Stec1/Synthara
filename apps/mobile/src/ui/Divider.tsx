import React from 'react';
import { View } from 'react-native';

import { useTheme } from './ThemeProvider';

export function Divider() {
  const { theme } = useTheme();

  return <View style={{ height: 1, backgroundColor: theme.colors.border, width: '100%' }} />;
}
