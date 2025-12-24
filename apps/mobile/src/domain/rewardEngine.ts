export type RewardActionId =
  | 'DAILY_CLAIM'
  | 'DAILY_CHECK_IN'
  | 'PLAY_MATCH'
  | 'WIN_MATCH'
  | 'COMPLETE_SESSION'
  | 'VIEW_MODEL_PROFILE'
  | 'SHARE_PROFILE';

export type RewardPerkEffectType =
  | 'EARNING_MULTIPLIER'
  | 'DAILY_CLAIM_BONUS'
  | 'DAILY_CLAIM_MULTIPLIER'
  | 'DAILY_LIMIT_BONUS';

export interface RewardPerkEffect {
  type: RewardPerkEffectType;
  value: number;
  mode: 'add' | 'mul';
}

export interface RewardContext {
  baseReward: number;
  streak?: number;
  streakCap?: number;
  streakAdd?: number;
  isGoldHolder?: boolean;
  perkEffects: RewardPerkEffect[];
}

const clampStreak = (streak: number, cap?: number) => {
  if (cap === undefined) {
    return streak;
  }
  return Math.min(streak, cap);
};

const applyPerkEffects = (
  actionId: RewardActionId,
  base: number,
  effects: RewardPerkEffect[],
) => {
  let additiveBonus = 0;
  let multiplier = 1;
  const appliedEffects: Array<Record<string, unknown>> = [];

  effects.forEach((effect) => {
    const mode = effect.mode ?? 'add';
    if (effect.type === 'DAILY_CLAIM_BONUS' && actionId === 'DAILY_CLAIM') {
      additiveBonus += effect.value;
      appliedEffects.push({ effect, impact: 'bonus', amount: effect.value });
      return;
    }
    if (effect.type === 'DAILY_CLAIM_MULTIPLIER' && actionId === 'DAILY_CLAIM') {
      multiplier += effect.value;
      appliedEffects.push({ effect, impact: mode, amount: effect.value });
      return;
    }
    if (effect.type === 'EARNING_MULTIPLIER') {
      multiplier += effect.value;
      appliedEffects.push({ effect, impact: mode, amount: effect.value });
      return;
    }
    if (effect.type === 'DAILY_LIMIT_BONUS') {
      appliedEffects.push({ effect, impact: 'limit', amount: effect.value });
    }
  });

  return {
    additiveBonus,
    multiplier,
    appliedEffects,
    baseWithBonus: base + additiveBonus,
  };
};

export const calculateGoldPoints = (
  actionId: RewardActionId,
  ctx: RewardContext,
): { finalGold: number; debug: Record<string, unknown> } => {
  const streak = ctx.streak ?? 0;
  const streakAdd = ctx.streakAdd ?? 0;
  const streakCap = clampStreak(streak, ctx.streakCap);
  const streakBonus = actionId === 'DAILY_CLAIM' ? streakCap * streakAdd : 0;
  const baseAfterStreak = ctx.baseReward + streakBonus;

  const perkEffectResult = applyPerkEffects(actionId, baseAfterStreak, ctx.perkEffects ?? []);
  const holderMultiplier = ctx.isGoldHolder ? 1 : 1;

  const finalGold = Math.max(
    0,
    Math.floor(perkEffectResult.baseWithBonus * perkEffectResult.multiplier * holderMultiplier),
  );

  return {
    finalGold,
    debug: {
      actionId,
      baseReward: ctx.baseReward,
      streak,
      streakCap: ctx.streakCap,
      streakAdd,
      streakBonus,
      baseAfterStreak,
      additiveBonus: perkEffectResult.additiveBonus,
      multiplier: perkEffectResult.multiplier,
      holderMultiplier,
      appliedEffects: perkEffectResult.appliedEffects,
      finalGold,
    },
  };
};
