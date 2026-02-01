# Plugin API

**Summary of plugin integration endpoints** (full spec: [openapi.yaml](./openapi.yaml)).

## Overview

Endpoints for the SimHub plugin: verification, heartbeat, and installer download. All require a valid Discord access token (Bearer) except download, which may be public or restricted.

## Endpoints

| Method | Path | Summary |
|--------|------|---------|
| POST | `/api/plugin/verify` | Submit race result for verification |
| POST | `/api/plugin/heartbeat` | Plugin health check |
| GET | `/api/plugin/download/:type` | Download plugin installer |

## Authentication

Plugin requests use:

```http
Authorization: Bearer {ACCESS_TOKEN}
```

## Verify

- **POST /api/plugin/verify** — Submits telemetry payload for verification. Returns 200 when accepted, 400/401/409 on validation or auth failure.

## Heartbeat

- **POST /api/plugin/heartbeat** — Keeps session active. Rate limit: 1 per 5 minutes per user.

**Contract (align with OpenAPI)**: Request: `Authorization: Bearer {accessToken}`; optional JSON body e.g. `{ "version": "1.0.0" }` for plugin version. Response: 200 OK (success); 400/401 (failure). See [openapi.yaml](./openapi.yaml) for full schema.

## Download

- **GET /api/plugin/download/:type** — Returns installer binary (e.g. by type: `stable`, `beta`). Response is file download.

Schema details: see [OpenAPI spec](./openapi.yaml) and [API README](./README.md).
