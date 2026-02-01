# PRD-002: Heartbeat Validation

**Doc type**: PRD | **ID**: PRD-002 | **Related**: [TP-002](../../tech-plans/telemetry-proof-system/002-heartbeat-validation.md), [PRD-001: Heartbeat System](001-heartbeat-system.md)

**Status**: Draft  
**Version**: 1.0  
**Date**: 2026-01-31  
**Owner**: Security Team  
**Related**: [Technical Plan](../../tech-plans/telemetry-proof-system/002-heartbeat-validation.md), [PRD-001: Heartbeat System](001-heartbeat-system.md)

## Overview

### Problem Statement

Heartbeats alone don't prevent fake telemetry submission. Attackers could send static heartbeat data or manipulate heartbeat timing to appear legitimate while still submitting fake race results.

### Solution

Implement server-side heartbeat validation that verifies heartbeats contain live, changing telemetry data and arrive at expected intervals. This ensures heartbeats prove an active SimHub connection, not just token possession.

### Success Criteria

- ✅ Server validates heartbeat frequency (3-10 second intervals)
- ✅ Server detects static telemetry (same values across heartbeats)
- ✅ Server tracks telemetry sequence (last 10 heartbeats)
- ✅ Invalid heartbeats rejected without blocking legitimate users
- ✅ Validation logic completes in <50ms (p95)

## User Stories

### As a Security Engineer
- I want to verify heartbeats contain changing telemetry, so I can detect static/fake data
- I want to validate heartbeat frequency, so I can detect timing manipulation

### As a System Administrator
- I want invalid heartbeats logged, so I can monitor attack attempts
- I want validation failures to be non-blocking, so legitimate users aren't affected

## Requirements

### Functional Requirements

#### FR-001: Telemetry Change Detection
- **Priority**: P0 (Critical)
- **Description**: Server must detect when heartbeat telemetry values are not changing
- **Acceptance Criteria**:
  - Compare current heartbeat values to previous heartbeat values
  - Flag heartbeat if all values (speed, RPM, gear) are identical
  - Allow small variations (e.g., speed ±1 km/h) to account for measurement precision
  - Store telemetry sequence (last 10 heartbeats) for analysis

#### FR-002: Heartbeat Frequency Validation
- **Priority**: P0 (Critical)
- **Description**: Server must validate heartbeat arrival frequency
- **Acceptance Criteria**:
  - Heartbeats must arrive between 3-10 seconds apart
  - Heartbeats arriving <3 seconds apart are rejected (rate limiting)
  - Heartbeats arriving >10 seconds apart are flagged (connection issue)
  - First heartbeat for a user always accepted (no previous heartbeat to compare)

#### FR-003: Telemetry Sequence Tracking
- **Priority**: P1 (High)
- **Description**: Server must maintain telemetry sequence for each user
- **Acceptance Criteria**:
  - Store last 10 heartbeats in sequence (FIFO queue)
  - Each heartbeat includes: timestamp, speed, RPM, gear, lap time, position, telemetry hash
  - Sequence stored in Workers KV with heartbeat state
  - Sequence used for continuity validation (see PRD-004)

#### FR-004: Validation Response
- **Priority**: P1 (High)
- **Description**: Server must respond to heartbeat validation results
- **Acceptance Criteria**:
  - Valid heartbeats: Update state, return 200 OK
  - Invalid heartbeats: Log error, return 400 Bad Request with reason
  - Rate-limited heartbeats: Return 429 Too Many Requests
  - Response includes current session ID

### Non-Functional Requirements

#### NFR-001: Performance
- **Priority**: P1 (High)
- **Description**: Validation must complete quickly
- **Acceptance Criteria**:
  - Validation logic <50ms (p95)
  - KV read/write operations batched where possible
  - No blocking operations

#### NFR-002: Reliability
- **Priority**: P1 (High)
- **Description**: Validation failures must not crash API
- **Acceptance Criteria**:
  - Invalid heartbeats logged but don't crash worker
  - KV failures handled gracefully (fallback to D1 if needed)
  - Validation errors don't expose internal logic

#### NFR-003: Security
- **Priority**: P0 (Critical)
- **Description**: Validation logic must not leak information
- **Acceptance Criteria**:
  - Error messages don't reveal validation thresholds
  - Rate limiting prevents heartbeat spam
  - Validation state stored securely (KV encryption)

## Technical Constraints

- **Workers KV**: Single key-value operations (no transactions)
- **Cloudflare Workers**: 50ms CPU time limit
- **Network Latency**: Variable (3-10 second window accounts for this)

## Out of Scope

- Heartbeat replay detection (covered in PRD-003)
- Telemetry continuity validation (covered in PRD-004)
- Challenge-response system (covered in PRD-005)

## Dependencies

- PRD-001: Telemetry Heartbeat System (must be implemented first)
- Workers KV availability
- Discord OAuth2 token validation

## Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| False positives (legitimate users blocked) | High | Medium | Allow small variations, log for analysis |
| KV read/write latency | Medium | Low | Batch operations, use KV efficiently |
| Validation bypass | High | Low | Multiple validation layers, server-side only |

## Success Metrics

- **Validation Accuracy**: >99.9% (correctly identify valid/invalid heartbeats)
- **False Positive Rate**: <0.1% (legitimate heartbeats incorrectly rejected)
- **Validation Latency**: <50ms (p95 processing time)
- **Attack Detection**: Track number of invalid heartbeats per user

## Related Documentation

- [Technical Plan](../../tech-plans/telemetry-proof-system/002-heartbeat-validation.md)
- [PRD-001: Heartbeat System](001-heartbeat-system.md)
- [API Specification](../../api/plugin.md#heartbeat-validation)
- [Documentation Standards](../../standards/documentation-standards.md)
