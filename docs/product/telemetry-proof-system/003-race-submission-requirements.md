# PRD-003: Race Submission Requirements

**Doc type**: PRD | **ID**: PRD-003 | **Related**: [TP-003](../../tech-plans/telemetry-proof-system/003-race-submission-requirements.md), [PRD-001: Heartbeat System](001-heartbeat-system.md), [PRD-002: Heartbeat Validation](002-heartbeat-validation.md)

**Status**: Draft  
**Version**: 1.0  
**Date**: 2026-01-31  
**Owner**: Security Team  
**Related**: [Technical Plan](../../tech-plans/telemetry-proof-system/003-race-submission-requirements.md), [PRD-001: Heartbeat System](001-heartbeat-system.md), [PRD-002: Heartbeat Validation](002-heartbeat-validation.md)

## Overview

### Problem Statement

Even with heartbeat validation, attackers could submit race results without an active SimHub connection by using a stolen token and fabricated telemetry data. Race submissions must require proof of an active SimHub connection.

### Solution

Require race submissions to reference an active heartbeat connection. Validate that the user has sent recent heartbeats (<30 seconds old) and that the race submission aligns with the heartbeat session data.

### Success Criteria

- ✅ Race submissions require active heartbeat (<30 seconds old)
- ✅ Race session ID must match heartbeat session ID
- ✅ Race position must align with recent heartbeat position data
- ✅ Zero false positives (legitimate races never blocked)
- ✅ Validation completes in <100ms (p95)

## User Stories

### As a Security Engineer
- I want race submissions to require active heartbeats, so fake telemetry is blocked
- I want to validate session continuity, so I can detect session manipulation

### As a Plugin Developer
- I want clear error messages when heartbeat is missing, so users understand the issue
- I want race submissions to work seamlessly when heartbeats are active

### As a User
- I want race submissions to work automatically when SimHub is running
- I don't want to manually manage heartbeats (transparent to user)

## Requirements

### Functional Requirements

#### FR-001: Active Heartbeat Requirement
- **Priority**: P0 (Critical)
- **Description**: Race submissions must have an active heartbeat connection
- **Acceptance Criteria**:
  - Check for heartbeat state in KV: `heartbeat:{discordId}`
  - Heartbeat must be <30 seconds old
  - Missing heartbeat: Return 403 Forbidden with message "No active SimHub connection"
  - Stale heartbeat (>30 seconds): Return 403 Forbidden with message "SimHub connection inactive"

#### FR-002: Session ID Validation
- **Priority**: P0 (Critical)
- **Description**: Race submission session ID must match heartbeat session ID
- **Acceptance Criteria**:
  - Race submission includes `sessionId` field
  - Compare race `sessionId` to heartbeat state `sessionId`
  - Mismatch: Return 400 Bad Request with message "Session ID mismatch"
  - Missing session ID: Generate new session ID, update heartbeat state

#### FR-003: Position Alignment Validation
- **Priority**: P1 (High)
- **Description**: Race final position must align with recent heartbeat position data
- **Acceptance Criteria**:
  - Compare race `finalPosition` to last heartbeat `currentPosition`
  - Allow position difference of ±2 positions (accounting for race end timing)
  - Large position jumps (>3 positions): Flag for review (don't reject, but log)
  - Missing position data: Skip validation (fail open)

#### FR-004: Race Submission Payload
- **Priority**: P0 (Critical)
- **Description**: Race submission must include session reference
- **Acceptance Criteria**:
  - Race payload includes: `sessionId`, `discordId`, `raceData`, `timestamp`
  - Session ID must match active heartbeat session ID
  - Timestamp must be recent (<5 minutes from race end)

### Non-Functional Requirements

#### NFR-001: Performance
- **Priority**: P1 (High)
- **Description**: Validation must not slow down race submissions
- **Acceptance Criteria**:
  - Heartbeat check <50ms (KV read)
  - Total validation <100ms (p95)
  - Validation doesn't block race submission processing

#### NFR-002: Reliability
- **Priority**: P1 (High)
- **Description**: Heartbeat failures must not block legitimate races
- **Acceptance Criteria**:
  - KV read failures: Fallback to D1 (slower but works)
  - Missing heartbeat state: Clear error message, don't crash
  - Race submission errors logged for analysis

#### NFR-003: User Experience
- **Priority**: P2 (Medium)
- **Description**: Error messages must be clear and actionable
- **Acceptance Criteria**:
  - Error messages explain what's wrong (missing heartbeat, stale connection)
  - Error messages suggest solutions (restart SimHub, check plugin status)
  - Errors don't expose internal validation logic

## Technical Constraints

- **Workers KV**: Single key-value read per validation
- **Cloudflare Workers**: 50ms CPU time limit (validation must be fast)
- **Network Latency**: Variable (30-second window accounts for this)

## Out of Scope

- Telemetry continuity validation (covered in PRD-004)
- Challenge-response system (covered in PRD-005)
- Heartbeat UI/visualization (future enhancement)

## Dependencies

- PRD-001: Telemetry Heartbeat System (must be implemented)
- PRD-002: Heartbeat Validation (must be implemented)
- Race submission API endpoint (existing)

## Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| False positives (legitimate races blocked) | High | Medium | 30-second window, clear error messages |
| KV read failures | Medium | Low | Fallback to D1, graceful degradation |
| Session ID collisions | Low | Very Low | UUID v4 generation, collision detection |

## Success Metrics

- **Validation Success Rate**: >99.9% (race submissions correctly validated)
- **False Positive Rate**: <0.1% (legitimate races incorrectly blocked)
- **Validation Latency**: <100ms (p95 processing time)
- **Attack Prevention**: Track blocked submissions (missing/stale heartbeats)

## Related Documentation

- [Technical Plan](../../tech-plans/telemetry-proof-system/003-race-submission-requirements.md)
- [PRD-001: Heartbeat System](001-heartbeat-system.md)
- [PRD-002: Heartbeat Validation](002-heartbeat-validation.md)
- [API Specification](../../api/plugin.md#race-submission-validation)
- [Documentation Standards](../../standards/documentation-standards.md)
