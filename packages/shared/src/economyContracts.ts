export type SupportedChain = 'ethereum' | 'polygon' | 'ton' | 'solana';

export interface GoldShopPerkDTO {
  id: string;
  title: string;
  description: string;
  priceGold: number;
  roleGate?: string;
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

export interface UserEconomySnapshotDTO {
  balance: number;
  ownedPerks: Record<string, boolean>;
  inventory: NftInventoryItemDTO[];
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
