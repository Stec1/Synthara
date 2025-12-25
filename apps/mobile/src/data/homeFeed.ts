import { DEMO_MODELS } from './demoModels';

export type HomeFeaturedBlock = {
  modelId: string;
  headline: string;
  subline: string;
  ctaLabel: string;
};

export type HomeDropItem = {
  id: string;
  title: string;
  modelId: string;
  priceGold: number;
  status: 'live' | 'soon' | 'ended';
  endsAtISO?: string;
};

export type HomeAuctionItem = {
  id: string;
  title: string;
  modelId: string;
  currentBidGold: number;
  status: 'ending_soon' | 'live' | 'ended';
  endsAtISO?: string;
};

const FEATURED_MODEL_ID = DEMO_MODELS[0]?.id ?? 'model-ember-rayne';

export const getHomeFeed = (): {
  featuredModelId: string;
  drops: HomeDropItem[];
  auctions: HomeAuctionItem[];
} => ({
  featuredModelId: FEATURED_MODEL_ID,
  drops: [
    {
      id: 'drop-rayne-gold',
      title: 'Raynefall Limited Gold',
      modelId: 'model-ember-rayne',
      priceGold: 320,
      status: 'live',
      endsAtISO: '2025-02-15T18:00:00Z',
    },
    {
      id: 'drop-shift-zero',
      title: 'Zero-G Showcase Pack',
      modelId: 'model-lyra-shift',
      priceGold: 260,
      status: 'soon',
      endsAtISO: '2025-03-01T05:00:00Z',
    },
    {
      id: 'drop-lumen-night',
      title: 'Lumen Nightfall Vault',
      modelId: 'model-arc-lumen',
      priceGold: 210,
      status: 'ended',
      endsAtISO: '2024-12-10T23:30:00Z',
    },
  ],
  auctions: [
    {
      id: 'auction-rayne-diamond',
      title: 'Ember Rayne Diamond Seat',
      modelId: 'model-ember-rayne',
      currentBidGold: 880,
      status: 'ending_soon',
      endsAtISO: '2025-02-10T03:00:00Z',
    },
    {
      id: 'auction-shift-motion',
      title: 'Shiftwave Motion One-Off',
      modelId: 'model-lyra-shift',
      currentBidGold: 640,
      status: 'live',
      endsAtISO: '2025-02-20T10:00:00Z',
    },
    {
      id: 'auction-lumen-vault',
      title: 'Lumen Echo Archive',
      modelId: 'model-arc-lumen',
      currentBidGold: 420,
      status: 'live',
      endsAtISO: '2025-02-18T19:30:00Z',
    },
  ],
});
