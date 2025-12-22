import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from './client';
import { Auction, GoldNFTDrop, LoRAAsset, ModelGoldStatus, ModelProfile, ModelProfileDetail, UserProfile } from '@synthara/shared';

const keys = {
  me: ['me'] as const,
  models: ['models'] as const,
  model: (id: number) => ['model', id] as const,
  loras: (id: number) => ['loras', id] as const,
  gold: (id: number) => ['gold', id] as const,
};

export function useCurrentUser() {
  return useQuery({
    queryKey: keys.me,
    queryFn: async () => {
      const res = await api.get<UserProfile>('/me');
      return res.data;
    },
    enabled: false,
  });
}

export function useModels() {
  return useQuery({
    queryKey: keys.models,
    queryFn: async () => {
      const res = await api.get<ModelProfile[]>('/models');
      return res.data;
    },
  });
}

export function useModelDetail(id?: number) {
  return useQuery({
    queryKey: id ? keys.model(id) : ['model', 'none'],
    queryFn: async () => {
      const res = await api.get<ModelProfileDetail>(`/models/${id}`);
      return res.data;
    },
    enabled: Boolean(id),
  });
}

export function useGoldStatus(id?: number) {
  return useQuery({
    queryKey: id ? keys.gold(id) : ['gold', 'none'],
    queryFn: async () => {
      const res = await api.get<ModelGoldStatus>(`/models/${id}/gold`);
      return res.data;
    },
    enabled: Boolean(id),
  });
}

export function useStartEmailAuth() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (email: string) => {
      const res = await api.post<{ status: string }>('/auth/email/start', { email });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.me });
    },
  });
}

export function useVerifyEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await api.post<{ token: string }>('/auth/email/verify', { code: '000000' });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: keys.me });
      return data;
    },
  });
}

export type { Auction, GoldNFTDrop, LoRAAsset, ModelProfile };
