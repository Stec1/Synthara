# SSOT Compliance Checklist

## Implemented
- `APP_ENV` configuration supports `dev`, `prod`, and `MVP_CANON` to switch behavior. (frontend + API)
- `/models/seed` guarded by dev-only admin key.
- Canonical read endpoints exposed: `/models`, `/models/:id`, `/models/:id/lora`, `/models/:id/gold`, `/games/rooms`, `/inventory/me`, `/entitlements/me`.
- Non-SSOT write endpoints require authentication when running in MVP_CANON/prod.
- Health endpoint surfaces current `APP_ENV` value.

## Divergences
- None known.

## Dev-only
- `/models/seed` available only in `APP_ENV=dev` with `X-Admin-Key` header (value from `ADMIN_API_KEY`).
- Non-SSOT write endpoints may be used without authentication only in `APP_ENV=dev`.
