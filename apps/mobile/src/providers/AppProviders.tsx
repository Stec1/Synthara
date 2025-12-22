import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { PropsWithChildren, useMemo } from 'react';

const queryClient = new QueryClient();

export function AppProviders({ children }: PropsWithChildren) {
  const client = useMemo(() => queryClient, []);

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
