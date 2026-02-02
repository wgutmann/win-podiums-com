# Plugin API

**Summary of plugin integration endpoints** (full spec: [openapi.yaml](./openapi.yaml)).

## Overview

Endpoints for the SimHub plugin: verification, heartbeat, and installer download. All require a valid Discord access token (Bearer) except download, which may be public or restricted.

## Endpoints

| Method | Path | Summary |
|--------|------|---------|
| POST | `/api/auth/refresh` | Refresh access token (Bearer required) |
| POST | `/api/plugin/verify` | Submit race result for verification |
| POST | `/api/plugin/heartbeat` | Plugin health check |
| GET | `/api/plugin/download/:type` | Download plugin installer |

## Authentication

Plugin requests use:

```http
Authorization: Bearer {ACCESS_TOKEN}
```

## Refresh

- **POST /api/auth/refresh** — Exchanges current (possibly expired) Bearer token for a new access token. Called by the plugin when a protected request returns 401. Returns `access_token`, `expires_in`, `discord_id`. Returns 401 when refresh token revoked, 429 when rate limited, 502 when Discord unavailable.

## Verify

- **POST /api/plugin/verify** — Submits telemetry payload for verification. Returns 200 when accepted, 400/401/409 on validation or auth failure.

## Heartbeat

- **POST /api/plugin/heartbeat** — Keeps session active. Rate limit: 1 per 5 minutes per user.

## Download

- **GET /api/plugin/download/:type** — Returns installer binary (e.g. by type: `stable`, `beta`). Response is file download.

Schema details: see [OpenAPI spec](./openapi.yaml) and [API README](./README.md).
