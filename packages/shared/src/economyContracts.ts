export type SupportedChain = 'ethereum' | 'polygon' | 'ton' | 'solana';

export interface GoldShopPerkDTO {
  id: string;
  title: string;
  description: string;
  priceGold: number;
  roleGate?: string;
  type?: 'BOOST' | 'GAME' | 'COSMETIC' | 'ACCESS';
  stackingRule?: PerkStackingRuleDTO;
  durationType?: PerkDurationDTO['kind'];
  durationValue?: PerkDurationDTO['value'];
  effects?: PerkEffectDTO[];
  duration?: PerkDurationDTO;
  category?: 'BOOST' | 'ACCESS' | 'COSMETIC' | 'GAME';
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
  type: 'EARNING_MULTIPLIER' | 'DAILY_CLAIM_BONUS' | 'DAILY_CLAIM_MULTIPLIER' | 'DAILY_LIMIT_BONUS';
  value: number;
  mode?: 'add' | 'mul';
}

export interface PerkDurationDTO {
  kind: 'PERMANENT' | 'TIME_LIMITED' | 'USES';
  value?: number;
}

export type PerkStackingRuleDTO = 'NONE' | 'ADDITIVE' | 'MULTIPLICATIVE';

export interface PerkInventoryItemDTO {
  id: string;
  perkId: string;
  acquiredAt: string;
  source: 'SHOP_PURCHASE' | 'REWARD_TICKET' | 'ADMIN_GRANT';
  expiresAt?: string;
  remainingUses?: number;
}

export interface RewardTicketDTO {
  id: string;
  createdAt: string;
  source: 'GAME_MATCH' | 'EVENT' | 'ADMIN';
  status: 'PENDING' | 'CLAIMED' | 'EXPIRED';
  expiresAt?: string;
  reward:
    | { kind: 'GOLD_POINTS'; amount: number }
    | { kind: 'PERK_ITEM'; perkId: string }
    | { kind: 'NFT_PLACEHOLDER'; name: string; tier?: 'silver' | 'gold' | 'diamond' };
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
  perkInventory?: PerkInventoryItemDTO[];
  rewardTickets?: RewardTicketDTO[];
  walletAddress?: string | null;
  lastDailyClaimAt?: string | null;
  dailyClaimStreak?: number;
  earningLog?: EarningLogItemDTO[];
  earningActions?: EarningActionDTO[];
  inventorySnapshot?: InventoryDTO;
}

export interface PurchasePerkRequestDTO {
  perkId: string;
}

export interface PurchasePerkResponseDTO {
  ok: boolean;
  balance: number;
  ownedPerks: Record<string, boolean>;
  error?: string;
  perkInventory?: PerkInventoryItemDTO[];
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

export interface InventoryDTO {
  perks: PerkInventoryItemDTO[];
  nfts: NftInventoryItemDTO[];
}

export interface ClaimRewardTicketRequestDTO {
  ticketId: string;
}

export interface ClaimRewardTicketResponseDTO {
  ok: boolean;
  ticket?: RewardTicketDTO;
  inventoryDelta?: Partial<InventoryDTO>;
  goldDelta?: number;
  error?: string;
}

export type EntitlementKey =
  | 'CAN_CLAIM_DAILY_GOLD'
  | 'CAN_USE_EARNING_ACTIONS'
  | 'HAS_ACTIVE_GOLD_PASS'
  | 'CAN_ACCESS_GAME_ROOM'
  | 'CAN_CLAIM_REWARD_TICKET'
  | 'CAN_VIEW_LORA_PASSPORT';

export interface UserEntitlementDTO {
  key: EntitlementKey;
  value: boolean;
  source?: 'PERK' | 'NFT' | 'SYSTEM';
  expiresAt?: string;
}

export interface UserEntitlementsDTO {
  updatedAt: string;
  entitlements: UserEntitlementDTO[];
}
