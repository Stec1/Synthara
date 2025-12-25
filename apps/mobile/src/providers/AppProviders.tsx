import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { PropsWithChildren, useEffect, useMemo } from 'react';

import { useGoldStore } from '../state/gold';
import { ThemeProvider } from '../ui';

const queryClient = new QueryClient();

export function AppProviders({ children }: PropsWithChildren) {
  const client = useMemo(() => queryClient, []);

  useEffect(() => {
    useGoldStore.getState().resetIfNewDay();
  }, []);

  return (
    <ThemeProvider>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </ThemeProvider>
  );
}
