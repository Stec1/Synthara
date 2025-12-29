import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type RegisteredModelSocials = {
  instagram?: string;
  x?: string;
  tiktok?: string;
  website?: string;
};

export type RegisteredModel = {
  modelId: string;
  displayName: string;
  bio: string;
  photoUri: string;
  socials: RegisteredModelSocials;
  createdAtISO: string;
  createdByUserId: string;
};

type ModelRegistryState = {
  models: RegisteredModel[];
  createModel: (
    input: Omit<RegisteredModel, 'modelId' | 'createdAtISO'> & { modelId?: string },
  ) => RegisteredModel;
  getModelById: (id: string) => RegisteredModel | undefined;
  getModelsByUser: (userId: string) => RegisteredModel[];
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const generateModelId = (displayName: string) => {
  const base = slugify(displayName) || 'model';
  const suffix = Math.random().toString(16).slice(2, 6);
  return `${base}-${suffix}`;
};

export const useModelRegistryStore = create<ModelRegistryState>()(
  persist(
    (set, get) => ({
      models: [],
      createModel: (input) => {
        const modelId = input.modelId ?? generateModelId(input.displayName);
        const model: RegisteredModel = {
          ...input,
          modelId,
          createdAtISO: new Date().toISOString(),
        };
        set((state) => ({
          models: [model, ...state.models.filter((existing) => existing.modelId !== model.modelId)],
        }));
        return model;
      },
      getModelById: (id) => get().models.find((model) => model.modelId === id),
      getModelsByUser: (userId) => get().models.filter((model) => model.createdByUserId === userId),
    }),
    {
      name: 'synthara.modelRegistry.v1',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
