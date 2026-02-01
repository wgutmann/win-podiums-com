# User Profile API

**Summary of profile endpoints** (full spec: [openapi.yaml](./openapi.yaml)).

## Overview

Member profile data and preferences. All profile endpoints require a valid Discord access token (session cookie for web, Bearer for plugin).

## Endpoints

| Method | Path | Summary |
|--------|------|---------|
| GET | `/api/profile/me` | Current user's profile |
| PATCH | `/api/profile/me` | Update user preferences |
| GET | `/api/profile/:discordId` | Public profile (if enabled) |

## GET /api/profile/me

Returns the authenticated user's profile (discord_id, member state, preferences, podium history summary). 401 if not authenticated.

## PATCH /api/profile/me

Updates preferences for the authenticated user. Body: partial profile object. 200 on success, 400 on validation error, 401 if not authenticated.

## GET /api/profile/:discordId

Returns public profile for a given Discord ID, if the user has enabled public profile. 404 if not found or not public.

Schema details: see [OpenAPI spec](./openapi.yaml) and [API README](./README.md).
