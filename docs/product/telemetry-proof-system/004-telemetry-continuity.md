# PRD-004: Telemetry Continuity Validation

**Status**: Draft  
**Version**: 1.0  
**Date**: 2026-01-31  
**Owner**: Security Team  
**Related**: [Technical Plan](../../tech-plans/telemetry-proof-system/004-telemetry-continuity.md), [PRD-001: Heartbeat System](001-heartbeat-system.md), [PRD-002: Heartbeat Validation](002-heartbeat-validation.md), [PRD-003: Race Submission Requirements](003-race-submission-requirements.md)

## Overview

### Problem Statement

Attackers could send valid heartbeats but submit race results that don't align with the telemetry sequence seen in heartbeats. For example, heartbeats show position 5, but race submission claims position 1 without intermediate heartbeats showing position improvement.

### Solution

Validate that race submission telemetry is consistent with the heartbeat telemetry sequence. Check that position progression, lap times, and speed patterns align with what was observed in recent heartbeats.

### Success Criteria

- ✅ Race position progression validated against heartbeat sequence
- ✅ Lap time consistency validated against heartbeat data
- ✅ Speed/RPM patterns validated against heartbeat sequence
- ✅ Inconsistent telemetry flagged for review (not auto-rejected)
- ✅ Validation completes in <100ms (p95)

## User Stories

### As a Security Engineer
- I want to validate telemetry continuity, so I can detect fabricated race results
- I want inconsistent telemetry flagged, so I can review suspicious submissions

### As a System Administrator
- I want continuity validation to be non-blocking, so legitimate races aren't rejected
- I want flagged submissions logged, so I can analyze patterns

## Requirements

### Functional Requirements

#### FR-001: Position Progression Validation
- **Priority**: P1 (High)
- **Description**: Validate race final position aligns with heartbeat position progression
- **Acceptance Criteria**:
  - Analyze last 10 heartbeats for position changes
  - If race claims position 1, heartbeats should show position improving (5→4→3→2→1)
  - Allow position jumps of ±2 positions (accounting for race end timing)
  - Large position jumps (>3 positions): Flag for review
  - Missing position data: Skip validation (fail open)

#### FR-002: Lap Time Consistency Validation
- **Priority**: P1 (High)
- **Description**: Validate race lap times are consistent with heartbeat lap time data
- **Acceptance Criteria**:
  - Compare race lap times to heartbeat lap times
  - Race lap times should be within ±5 seconds of heartbeat lap times
  - Sudden lap time improvements (>10 seconds): Flag for review
  - Missing lap time data: Skip validation

#### FR-003: Speed/RPM Pattern Validation
- **Priority**: P2 (Medium)
- **Description**: Validate race speed/RPM patterns align with heartbeat patterns
- **Acceptance Criteria**:
  - Compare race average speed to heartbeat average speed
  - Race speed should be within ±10% of heartbeat speed
  - Sudden speed changes (>20%): Flag for review
  - Missing speed data: Skip validation

#### FR-004: Continuity Scoring
- **Priority**: P1 (High)
- **Description**: Calculate continuity score for race submission
- **Acceptance Criteria**:
  - Score ranges from 0-100 (100 = perfect continuity)
  - Score based on position progression, lap time consistency, speed patterns
  - Score <70: Flag for manual review
  - Score ≥70: Auto-approve (with other validations)

### Non-Functional Requirements

#### NFR-001: Performance
- **Priority**: P1 (High)
- **Description**: Continuity validation must not slow down race submissions
- **Acceptance Criteria**:
  - Validation logic <100ms (p95)
  - Analysis of 10 heartbeats completes quickly
  - No blocking operations

#### NFR-002: Reliability
- **Priority**: P1 (High)
- **Description**: Validation failures must not block legitimate races
- **Acceptance Criteria**:
  - Missing heartbeat data: Skip validation (fail open)
  - Validation errors: Log but don't crash
  - Low continuity scores: Flag for review, don't auto-reject

#### NFR-003: Accuracy
- **Priority**: P1 (High)
- **Description**: Validation must accurately detect inconsistencies
- **Acceptance Criteria**:
  - False positive rate <1% (legitimate races incorrectly flagged)
  - False negative rate <5% (fake races incorrectly approved)
  - Continuity scores calibrated through testing

## Technical Constraints

- **Workers KV**: Single key-value read (heartbeat state)
- **Cloudflare Workers**: 50ms CPU time limit (validation must be fast)
- **Data Availability**: Heartbeat sequence may be incomplete (handle gracefully)

## Out of Scope

- ML-based anomaly detection (future enhancement)
- Historical pattern analysis (future enhancement)
- Multi-race pattern detection (future enhancement)

## Dependencies

- PRD-001: Telemetry Heartbeat System (must be implemented)
- PRD-002: Heartbeat Validation (must be implemented)
- PRD-003: Race Submission Requirements (must be implemented)

## Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| False positives (legitimate races flagged) | Medium | Medium | Flag for review, don't auto-reject |
| False negatives (fake races approved) | High | Low | Multiple validation layers |
| Incomplete heartbeat data | Medium | Low | Fail open, skip validation |

## Success Metrics

- **Continuity Score Accuracy**: >95% (correctly identify consistent/inconsistent telemetry)
- **False Positive Rate**: <1% (legitimate races incorrectly flagged)
- **False Negative Rate**: <5% (fake races incorrectly approved)
- **Validation Latency**: <100ms (p95 processing time)

## Related Documentation

- [Technical Plan](../../tech-plans/telemetry-proof-system/004-telemetry-continuity.md)
- [PRD-001: Heartbeat System](001-heartbeat-system.md)
- [PRD-002: Heartbeat Validation](002-heartbeat-validation.md)
- [PRD-003: Race Submission Requirements](003-race-submission-requirements.md)
- [Documentation Standards](../../standards/documentation-standards.md)
