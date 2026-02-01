# Authentication API

**Summary of auth endpoints** (full spec: [openapi.yaml](./openapi.yaml)).

## Overview

All auth flows use **Discord OAuth2**. Web uses session cookies; plugin uses Bearer token in `Authorization` header.

## Endpoints

| Method | Path | Summary |
|--------|------|---------|
| POST | `/api/auth/discord/callback` | Web OAuth2 callback |
| POST | `/api/auth/discord/exchange` | Plugin token exchange (PKCE) |
| GET | `/api/auth/qr-status/:sessionId` | QR code polling |
| POST | `/api/auth/token-exchange` | Manual token validation (debug only) |

## Web flow

1. User is redirected to Discord authorization URL (client_id, redirect_uri, scope, state).
2. Discord redirects to `/api/auth/discord/callback` with `code` and `state`.
3. Backend exchanges `code` for access token, creates session, sets HTTP-only cookie.

## Plugin flows

- **Browser / QR** (primary): Plugin opens browser or shows QR; user completes Discord auth; plugin polls `GET /api/auth/qr-status/:sessionId` or exchanges code via `POST /api/auth/discord/exchange`.
- **Manual token** (debug only, feature-flagged): Not a user-facing option. When a debug feature flag is enabled, user can paste a token from `/auth/token`; `POST /api/auth/token-exchange` validates and returns session info.

## Contract: Plugin PKCE exchange

**POST /api/auth/discord/exchange** — Request body (JSON): `code` (string), `code_verifier` (string), `redirect_uri` (string, e.g. `http://127.0.0.1:54321/callback`). Response (200): JSON with `access_token` and `discord_id` (or equivalent per OpenAPI). See [openapi.yaml](./openapi.yaml) for full request/response schema.

**POST /api/auth/token-exchange** (debug only) — Request body (JSON): `token` (string). Response (200): session/token info. See [openapi.yaml](./openapi.yaml).

## Responses

- 200: Success (session created or token valid).
- 400: Bad request (missing/invalid code, state, or body).
- 401: Unauthorized (invalid or expired token).

Schema details: see [OpenAPI spec](./openapi.yaml) and [API README](./README.md).
