from __future__ import annotations

import os
from enum import Enum


class AppEnv(str, Enum):
    DEV = "dev"
    PROD = "prod"
    MVP_CANON = "mvp_canon"


_CANON_VALUES = {AppEnv.PROD.value, AppEnv.MVP_CANON.value, "mvp-canon"}


def get_app_env() -> AppEnv:
    raw = os.getenv("APP_ENV", AppEnv.DEV.value).strip().lower()
    if raw in _CANON_VALUES:
        return AppEnv.MVP_CANON if raw == "mvp-canon" else AppEnv(raw)
    return AppEnv.DEV if raw not in {AppEnv.DEV.value, AppEnv.PROD.value} else AppEnv(raw)


def is_dev_env() -> bool:
    return get_app_env() == AppEnv.DEV


def is_canonical_env() -> bool:
    return get_app_env() in {AppEnv.PROD, AppEnv.MVP_CANON}


def get_admin_api_key() -> str:
    return os.getenv("ADMIN_API_KEY", "")
