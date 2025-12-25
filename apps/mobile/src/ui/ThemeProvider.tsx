import React, { createContext, PropsWithChildren, useContext, useMemo } from 'react';
import { ColorSchemeName, useColorScheme } from 'react-native';

import { themes, Theme } from './theme';

type ThemeContextValue = {
  colorScheme: ColorSchemeName;
  theme: Theme;
};

const ThemeContext = createContext<ThemeContextValue>({
  colorScheme: 'dark',
  theme: themes.dark,
});

type ThemeProviderProps = PropsWithChildren<{ colorSchemeOverride?: ColorSchemeName }>;

export function ThemeProvider({ children, colorSchemeOverride }: ThemeProviderProps) {
  const systemScheme = useColorScheme();
  const colorScheme = colorSchemeOverride ?? systemScheme ?? 'dark';

  const value = useMemo(
    () => ({
      colorScheme,
      theme: colorScheme === 'light' ? themes.light : themes.dark,
    }),
    [colorScheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
