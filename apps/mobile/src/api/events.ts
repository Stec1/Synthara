import { postEventLog } from './client';

export type EventType = 'GOLD_EARNED' | 'GOLD_SPENT' | 'PERK_PURCHASED' | 'REWARD_CLAIMED';

export const logEvent = async (eventType: EventType, metadata?: Record<string, unknown>) => {
  try {
    await postEventLog({ eventType, metadata });
  } catch (_error) {
    // Fire-and-forget: ignore API failures
  }
};
