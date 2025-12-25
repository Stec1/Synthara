import { DEMO_MODELS } from './demoModels';

export type DemoUserModelRef = {
  modelId: string;
  relation: 'owned' | 'followed';
};

export type DemoUserNftItem = {
  id: string;
  modelId: string;
  tier: 'diamond' | 'gold';
  label: string;
  status: 'owned' | 'listed' | 'locked';
  acquiredAtISO?: string;
};

type DemoAssets = {
  models: DemoUserModelRef[];
  nfts: DemoUserNftItem[];
};

const KNOWN_USERS: Record<string, DemoAssets> = {
  'demo-user-001': {
    models: [
      { modelId: 'model-ember-rayne', relation: 'owned' },
      { modelId: 'model-lyra-shift', relation: 'followed' },
    ],
    nfts: [
      {
        id: 'asset-ember-diamond',
        modelId: 'model-ember-rayne',
        tier: 'diamond',
        label: 'Diamond 1/1',
        status: 'owned',
        acquiredAtISO: '2024-05-12T10:00:00.000Z',
      },
      {
        id: 'asset-lyra-gold-14',
        modelId: 'model-lyra-shift',
        tier: 'gold',
        label: 'Gold #14',
        status: 'listed',
        acquiredAtISO: '2024-06-02T15:00:00.000Z',
      },
      {
        id: 'asset-lyra-gold-21',
        modelId: 'model-lyra-shift',
        tier: 'gold',
        label: 'Gold #21',
        status: 'locked',
      },
    ],
  },
};

const baseDate = new Date('2024-01-01T00:00:00.000Z').getTime();

const deriveChecksum = (value: string) =>
  value
    .split('')
    .map((char) => char.charCodeAt(0))
    .reduce((acc, code) => acc + code, 0);

const deriveIsoFromOffset = (checksum: number, offsetDays = 0) =>
  new Date(baseDate + (checksum % 30) * 24 * 60 * 60 * 1000 + offsetDays * 24 * 60 * 60 * 1000)
    .toISOString();

const createGeneratedAssets = (userId: string): DemoAssets => {
  const checksum = deriveChecksum(userId);
  const primaryModel = DEMO_MODELS[checksum % DEMO_MODELS.length];
  const secondaryModel = DEMO_MODELS[(checksum + 1) % DEMO_MODELS.length];

  const models: DemoUserModelRef[] = [
    { modelId: primaryModel.id, relation: 'owned' },
    secondaryModel.id !== primaryModel.id
      ? { modelId: secondaryModel.id, relation: 'followed' }
      : { modelId: DEMO_MODELS[(checksum + 2) % DEMO_MODELS.length].id, relation: 'followed' },
  ];

  const nfts: DemoUserNftItem[] = [
    {
      id: `demo-nft-${userId}-d`,
      modelId: primaryModel.id,
      tier: 'diamond',
      label: 'Diamond 1/1',
      status: 'owned',
      acquiredAtISO: deriveIsoFromOffset(checksum, 1),
    },
    {
      id: `demo-nft-${userId}-g`,
      modelId: secondaryModel.id,
      tier: 'gold',
      label: `Gold #${(checksum % 50) + 1}`,
      status: (checksum % 2 === 0 ? 'listed' : 'locked') as DemoUserNftItem['status'],
      acquiredAtISO: deriveIsoFromOffset(checksum, 5),
    },
  ];

  return { models, nfts };
};

export const getDemoAssetsForUser = (userId: string): DemoAssets => {
  if (KNOWN_USERS[userId]) {
    return KNOWN_USERS[userId];
  }
  return createGeneratedAssets(userId);
};
