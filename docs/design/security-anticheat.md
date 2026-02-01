# Security & Anti-Cheat LLD

**Status**: Deferred (Phase 2+)  
**Last Updated**: 2026-01-31

## Overview

Detailed security measures and threat mitigation (anti-cheat, telemetry validation, rate limiting, and abuse prevention) are **deferred** to Phase 2+. Phase 1 focuses on Discord auth, minimal API, and basic plugin flow; anti-cheat and full Telemetry Proof (heartbeat, validation, continuity, challenge-response) are out of scope for MVP.

## Phase 1 scope

- Rate limiting as described in [API README](../api/README.md) (per-endpoint limits).
- HTTPS only, CORS, and CSRF/state validation for OAuth2.
- No dedicated anti-cheat LLD until Telemetry Proof implementation.

## Phase 2+ (when implemented)

- Threat model and mitigation for telemetry spoofing and replay.
- Signature validation and continuity checks per [Telemetry Proof tech plans](../tech-plans/telemetry-proof-system/).
- This document will be expanded with full Security & Anti-Cheat LLD.

## Related

- [High-Level Design](../architecture/high-level-design.md) — References this doc
- [API README](../api/README.md) — Rate limiting and security overview
