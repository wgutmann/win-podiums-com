# PRD-005: Challenge-Response System

**Doc type**: PRD | **ID**: PRD-005 | **Related**: [TP-005](../../tech-plans/telemetry-proof-system/005-challenge-response.md), [PRD-001: Heartbeat System](001-heartbeat-system.md), [PRD-002: Heartbeat Validation](002-heartbeat-validation.md), [PRD-003: Race Submission Requirements](003-race-submission-requirements.md), [PRD-004: Telemetry Continuity](004-telemetry-continuity.md)

**Status**: Draft  
**Version**: 1.0  
**Date**: 2026-01-31  
**Owner**: Security Team  
**Related**: [Technical Plan](../../tech-plans/telemetry-proof-system/005-challenge-response.md), [PRD-001: Heartbeat System](001-heartbeat-system.md), [PRD-002: Heartbeat Validation](002-heartbeat-validation.md), [PRD-003: Race Submission Requirements](003-race-submission-requirements.md), [PRD-004: Telemetry Continuity](004-telemetry-continuity.md)

## Overview

### Problem Statement

For podium finishes (P1-P3), we need additional proof that SimHub is running at the exact moment of race submission. Attackers could submit race results using a valid heartbeat connection but with fabricated race data.

### Solution

Implement a challenge-response system for podium finishes. When a podium finish is submitted, the server generates a challenge that requires an immediate response with current SimHub telemetry data. This proves SimHub is running at submission time.

### Success Criteria

- ✅ Podium submissions trigger challenge generation
- ✅ Challenge requires response within 5 seconds
- ✅ Response must contain current SimHub telemetry data
- ✅ Challenge-response completes in <200ms total (p95)
- ✅ Zero false positives (legitimate podiums never blocked)

## User Stories

### As a Security Engineer
- I want podium submissions to require immediate SimHub proof, so fake podiums are blocked
- I want challenges to expire quickly, so attackers can't reuse them

### As a Plugin Developer
- I want challenge-response to be automatic, so users don't need to do anything
- I want clear error messages if challenge fails, so users understand the issue

### As a User
- I want podium submissions to work seamlessly, so I don't notice the challenge
- I don't want challenges to slow down my race submissions

## Requirements

### Functional Requirements

#### FR-001: Challenge Generation
- **Priority**: P0 (Critical)
- **Description**: Generate challenge for podium finish submissions
- **Acceptance Criteria**:
  - Challenge generated when `finalPosition <= 3`
  - Challenge is random UUID v4 (128 bits)
  - Challenge stored in KV with key: `challenge:{discordId}`
  - Challenge TTL: 5 seconds (expires quickly)
  - Response includes challenge in payload

#### FR-002: Challenge Response Requirement
- **Priority**: P0 (Critical)
- **Description**: Podium submission must include challenge response
- **Acceptance Criteria**:
  - Race submission includes `challenge` and `challengeResponse` fields
  - Challenge response contains current SimHub telemetry data
  - Response must be submitted within 5 seconds of challenge generation
  - Missing/invalid challenge: Return 400 Bad Request

#### FR-003: Challenge Response Validation
- **Priority**: P0 (Critical)
- **Description**: Validate challenge response contains current SimHub data
- **Acceptance Criteria**:
  - Verify challenge exists in KV (not expired)
  - Verify challenge response timestamp is recent (<5 seconds old)
  - Verify challenge response contains live telemetry (speed, RPM, gear)
  - Verify challenge response telemetry hash matches current state
  - Invalid response: Return 400 Bad Request, reject submission

#### FR-004: Challenge Response Payload
- **Priority**: P0 (Critical)
- **Description**: Challenge response must include current SimHub telemetry
- **Acceptance Criteria**:
  - Response includes: `challenge`, `timestamp`, `currentSpeed`, `currentRPM`, `currentGear`, `telemetryHash`
  - All values sourced from current `GameData` object
  - Timestamp is UTC, millisecond precision
  - Telemetry hash is SHA256 of current state

### Non-Functional Requirements

#### NFR-001: Performance
- **Priority**: P1 (High)
- **Description**: Challenge-response must not slow down podium submissions
- **Acceptance Criteria**:
  - Challenge generation <10ms
  - Challenge validation <50ms
  - Total challenge-response <200ms (p95)
  - Non-podium submissions not affected (no challenge)

#### NFR-002: Reliability
- **Priority**: P1 (High)
- **Description**: Challenge failures must not block legitimate podiums
- **Acceptance Criteria**:
  - KV failures: Fallback to D1 (slower but works)
  - Challenge expiration: Clear error message, allow retry
  - Response validation errors: Log but don't crash

#### NFR-003: Security
- **Priority**: P0 (Critical)
- **Description**: Challenges must be cryptographically secure
- **Acceptance Criteria**:
  - Challenges use cryptographically secure random (UUID v4)
  - Challenges expire quickly (5 seconds)
  - Challenges can't be reused (one-time use)
  - Challenge validation server-side only

## Technical Constraints

- **Workers KV**: Single key-value read/write per challenge
- **Cloudflare Workers**: 50ms CPU time limit (validation must be fast)
- **Network Latency**: Variable (5-second window accounts for this)

## Out of Scope

- Challenge UI/visualization (transparent to user)
- Challenge analytics (future enhancement)
- Multi-challenge support (future enhancement)

## Dependencies

- PRD-001: Telemetry Heartbeat System (must be implemented)
- PRD-002: Heartbeat Validation (must be implemented)
- PRD-003: Race Submission Requirements (must be implemented)
- Race submission API endpoint (existing)

## Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| False positives (legitimate podiums blocked) | High | Medium | 5-second window, clear error messages |
| Challenge expiration (network delays) | Medium | Low | 5-second window, allow retry |
| KV read/write failures | Medium | Low | Fallback to D1, graceful degradation |

## Success Metrics

- **Challenge Success Rate**: >99% (challenges successfully validated)
- **False Positive Rate**: <0.1% (legitimate podiums incorrectly blocked)
- **Challenge Latency**: <200ms (p95 total time)
- **Attack Prevention**: Track blocked podium submissions (invalid challenges)

## Related Documentation

- [Technical Plan](../../tech-plans/telemetry-proof-system/005-challenge-response.md)
- [PRD-001: Heartbeat System](001-heartbeat-system.md)
- [PRD-002: Heartbeat Validation](002-heartbeat-validation.md)
- [PRD-003: Race Submission Requirements](003-race-submission-requirements.md)
- [PRD-004: Telemetry Continuity](004-telemetry-continuity.md)
- [API Specification](../../api/plugin.md#challenge-response)
- [Documentation Standards](../../standards/documentation-standards.md)
