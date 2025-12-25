import { useMemo } from 'react';

import { useDemoIdentityStore } from '../state/demoIdentity';

export const useDemoIdentity = () => {
  const enabled = useDemoIdentityStore((state) => state.enabled);
  const userId = useDemoIdentityStore((state) => state.userId);
  const role = useDemoIdentityStore((state) => state.role);

  const { isFan, isCreator } = useMemo(
    () => ({
      isFan: !enabled || role === 'fan',
      isCreator: enabled && role === 'creator',
    }),
    [enabled, role],
  );

  return {
    enabled,
    userId,
    role,
    isFan,
    isCreator,
  };
};
