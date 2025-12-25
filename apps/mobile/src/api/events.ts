import { useEventLogStore } from '../state/eventLog';
import { postEventLog } from './client';

export type EventType =
  | 'GOLD_EARNED'
  | 'GOLD_SPENT'
  | 'PERK_PURCHASED'
  | 'REWARD_CLAIMED'
  | 'GAME_MATCH_STARTED'
  | 'GAME_MATCH_FINISHED'
  | 'REWARD_TICKET_CREATED';

export const logEvent = async (eventType: EventType, metadata?: Record<string, unknown>) => {
  useEventLogStore.getState().logLocalEvent(eventType, metadata);
  try {
    await postEventLog({ eventType, metadata });
  } catch (_error) {
    // Fire-and-forget: ignore API failures
  }
};
