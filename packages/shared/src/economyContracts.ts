export type SupportedChain = 'ethereum' | 'polygon' | 'ton' | 'solana';

export interface GoldShopPerkDTO {
  id: string;
  title: string;
  description: string;
  priceGold: number;
  roleGate?: string;
  type?: 'BOOST' | 'GAME' | 'COSMETIC' | 'ACCESS';
  stackingRule?: 'NONE' | 'ADDITIVE' | 'MULTIPLICATIVE';
  durationType?: 'PERMANENT' | 'TIME_LIMITED' | 'USES';
  durationValue?: number;
  effects?: PerkEffectDTO[];
}

export type NftTierDTO = 'silver' | 'gold' | 'diamond';

export interface NftInventoryItemDTO {
  id: string;
  name: string;
  tier: NftTierDTO;
  createdAt: string;
  sourcePerkId?: string;
  chain?: SupportedChain;
}

export interface EarningActionDTO {
  id: string;
  title: string;
  description: string;
  baseReward: number;
  cooldownSeconds: number;
  dailyLimit: number;
  roleGate?: string;
}

export interface PerkEffectDTO {
  type: string;
  value: number;
  mode?: 'add' | 'mul';
}

export interface EarningLogItemDTO {
  id: string;
  type: string;
  amount: number;
  createdAt: string;
  note?: string;
}

export interface UserEconomySnapshotDTO {
  balance: number;
  ownedPerks: Record<string, boolean>;
  inventory: NftInventoryItemDTO[];
  walletAddress?: string | null;
  lastDailyClaimAt?: string | null;
  dailyClaimStreak?: number;
  earningLog?: EarningLogItemDTO[];
  earningActions?: EarningActionDTO[];
}

export interface PurchasePerkRequestDTO {
  perkId: string;
}

export interface PurchasePerkResponseDTO {
  ok: boolean;
  balance: number;
  ownedPerks: Record<string, boolean>;
  error?: string;
}

export interface MintNftRequestDTO {
  tier?: NftTierDTO;
  sourcePerkId?: string;
  chain?: SupportedChain;
}

export interface MintNftResponseDTO {
  nft: NftInventoryItemDTO;
  balance: number;
}
