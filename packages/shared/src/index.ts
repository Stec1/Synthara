export type UserRole = 'fan' | 'creator' | 'owner';

export interface UserProfile {
  id: number;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface ModelProfile {
  id: number;
  name: string;
  tagline: string;
  tags: string[];
  bio?: string;
  created_at: string;
}

export interface LoRAAsset {
  id: number;
  model_id: number;
  version: string;
  passport_metadata: string;
  created_at: string;
}

export interface ModelProfileDetail extends ModelProfile {
  loras: LoRAAsset[];
  gold: ModelGoldStatus;
}

export interface GoldNFTDrop {
  id: number;
  model_id: number;
  price: number;
  supply: number;
  remaining: number;
  status: 'upcoming' | 'live' | 'ended';
  created_at: string;
}

export interface Auction {
  id: number;
  model_id: number;
  current_bid: number;
  ends_at: string;
  created_at: string;
}

export interface ModelGoldStatus {
  drop: GoldNFTDrop | null;
  auction: Auction | null;
}

export interface GameEvent {
  id: number;
  name: string;
  required_gold: number;
  created_at: string;
}
