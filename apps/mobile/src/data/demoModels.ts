export type DemoModel = {
  id: string;
  name: string;
  tagline: string;
  heroImage?: string;
  passport: {
    origin: string;
    archetype: string;
    style: string;
    aiStack: {
      baseModel: string;
      loraVersion: string;
      notes: string;
    };
  };
  ownership: {
    diamond: {
      supply: '1/1';
      statusLabel: string;
      utilities: string[];
    };
    gold: {
      supply: string;
      priceLabel: string;
      utilities: string[];
    };
  };
  series: {
    goldSeriesName: string;
    goldSeriesCount: number;
  };
  badges: {
    isFeatured: boolean;
  };
};

export const DEMO_MODELS: DemoModel[] = [
  {
    id: 'model-ember-rayne',
    name: 'Ember Rayne',
    tagline: 'Neon noir vocalist with a mercenary following.',
    heroImage: '',
    passport: {
      origin: 'Neo-Tokyo backchannel circuits',
      archetype: 'Vocalist · Rogue Navigator',
      style: 'Cinematic neon noir with velvet vocals',
      aiStack: {
        baseModel: 'SYN-V Core v3',
        loraVersion: 'LoRA 1.2 Ember/Velvet',
        notes: 'Optimized for moody live sessions and midnight drops.',
      },
    },
    ownership: {
      diamond: {
        supply: '1/1',
        statusLabel: 'Owner Asset',
        utilities: ['Full creative direction rights', 'Priority split on collab drops', 'Backstage AI co-writing seat'],
      },
      gold: {
        supply: '120',
        priceLabel: 'Fixed price drop',
        utilities: ['Early access to new tracks', 'Member-only remix stems', 'Priority merch allowlist'],
      },
    },
    series: {
      goldSeriesName: 'Raynefall Gold',
      goldSeriesCount: 3,
    },
    badges: {
      isFeatured: true,
    },
  },
  {
    id: 'model-lyra-shift',
    name: 'Lyra Shift',
    tagline: 'Gravity-bending choreographer turned live-sim host.',
    heroImage: '',
    passport: {
      origin: 'Orbital studio residencies',
      archetype: 'Choreographer · Sim Host',
      style: 'Weightless dance with crisp glitch flourishes',
      aiStack: {
        baseModel: 'Astra Motion v2',
        loraVersion: 'LoRA 0.9 Zero-G Flow',
        notes: 'Built for live-rendered motion with sharp silhouettes.',
      },
    },
    ownership: {
      diamond: {
        supply: '1/1',
        statusLabel: 'Owner Asset',
        utilities: ['Scene veto + casting approvals', 'Commission one zero-g showcase', 'Lifetime holo-meet priority'],
      },
      gold: {
        supply: '90',
        priceLabel: 'Timed access release',
        utilities: ['Unlock choreography packs', 'Vote on next collab venues', 'VIP line for holo-meets'],
      },
    },
    series: {
      goldSeriesName: 'Shiftwave',
      goldSeriesCount: 2,
    },
    badges: {
      isFeatured: false,
    },
  },
  {
    id: 'model-arc-lumen',
    name: 'Arc Lumen',
    tagline: 'Cerebral DJ curating lucid rave odysseys.',
    heroImage: '',
    passport: {
      origin: 'Underground data vaults',
      archetype: 'DJ · Systems Storyteller',
      style: 'Lux minimal techno with radiant basslines',
      aiStack: {
        baseModel: 'Nimbus Audio v5',
        loraVersion: 'LoRA 2.0 Lucid Bass',
        notes: 'Latency-tuned for real-time club control.',
      },
    },
    ownership: {
      diamond: {
        supply: '1/1',
        statusLabel: 'Owner Asset',
        utilities: ['Headline set programming rights', 'Private listening keys', 'Curator credit on live albums'],
      },
      gold: {
        supply: '150',
        priceLabel: 'Fixed price drop',
        utilities: ['Prelistens + stem vault', 'Guest list queue jump', 'Seasonal merch capsule access'],
      },
    },
    series: {
      goldSeriesName: 'Lumen Echo',
      goldSeriesCount: 4,
    },
    badges: {
      isFeatured: false,
    },
  },
];

export const getDemoModelById = (id: string): DemoModel | undefined =>
  DEMO_MODELS.find((model) => model.id === id);
