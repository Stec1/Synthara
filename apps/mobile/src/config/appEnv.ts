export type AppEnv = 'dev' | 'prod' | 'mvp_canon';

declare const process: {
  env?: {
    EXPO_PUBLIC_APP_ENV?: string;
  };
};

const rawEnv = process.env?.EXPO_PUBLIC_APP_ENV?.trim().toLowerCase();
const normalized = rawEnv === 'mvp-canon' ? 'mvp_canon' : rawEnv;

export const APP_ENV: AppEnv =
  normalized === 'prod' || normalized === 'mvp_canon' ? (normalized as AppEnv) : 'dev';
export const IS_DEV = APP_ENV === 'dev';
export const IS_MVP_CANON = APP_ENV === 'mvp_canon' || APP_ENV === 'prod';
