# Technical Plan: Telemetry Continuity Validation

**Status**: Draft  
**Version**: 1.0  
**Date**: 2026-01-31  
**Owner**: Development Team  
**Implements**: [PRD-004: Telemetry Continuity Validation](../../product/telemetry-proof-system/004-telemetry-continuity.md)  
**Related**: [TP-001: Heartbeat System](001-heartbeat-system.md), [TP-002: Heartbeat Validation](002-heartbeat-validation.md), [TP-003: Race Submission Requirements](003-race-submission-requirements.md)

## Overview

This Technical Plan implements telemetry continuity validation that ensures race submission telemetry aligns with the heartbeat telemetry sequence. This detects fabricated race results that don't match observed telemetry patterns.

## Implementation Details

### Continuity Scoring Algorithm

```typescript
function calculateContinuityScore(
  raceData: RaceSubmissionPayload,
  heartbeatSequence: TelemetrySnapshot[]
): ContinuityScore {
  let score = 100;
  
  // 1. Position progression (40 points)
  const positionScore = validatePositionProgression(raceData, heartbeatSequence);
  score -= (40 - positionScore);
  
  // 2. Lap time consistency (30 points)
  const lapTimeScore = validateLapTimeConsistency(raceData, heartbeatSequence);
  score -= (30 - lapTimeScore);
  
  // 3. Speed/RPM patterns (30 points)
  const speedScore = validateSpeedPatterns(raceData, heartbeatSequence);
  score -= (30 - speedScore);
  
  return {
    score: Math.max(0, score),
    flagged: score < 70,
    details: {
      positionScore,
      lapTimeScore,
      speedScore
    }
  };
}

function validatePositionProgression(
  raceData: RaceSubmissionPayload,
  sequence: TelemetrySnapshot[]
): number {
  if (sequence.length < 2) return 40; // Not enough data
  
  const positions = sequence.map(s => s.currentPosition);
  const finalPosition = raceData.finalPosition;
  
  // Check if position improved over time
  let improvementCount = 0;
  for (let i = 1; i < positions.length; i++) {
    if (positions[i] < positions[i - 1]) {
      improvementCount++;
    }
  }
  
  // If claiming P1, should see position improving
  if (finalPosition === 1 && improvementCount === 0) {
    return 0; // No improvement detected
  }
  
  // Allow ±2 position difference
  const lastPosition = positions[positions.length - 1];
  const positionDiff = Math.abs(finalPosition - lastPosition);
  
  if (positionDiff <= 2) {
    return 40; // Perfect match
  } else if (positionDiff <= 3) {
    return 20; // Acceptable
  } else {
    return 0; // Large jump
  }
}
```

## Related Documentation

- [PRD-004: Telemetry Continuity Validation](../../product/telemetry-proof-system/004-telemetry-continuity.md)
- [TP-001: Heartbeat System](001-heartbeat-system.md)
- [TP-002: Heartbeat Validation](002-heartbeat-validation.md)
- [TP-003: Race Submission Requirements](003-race-submission-requirements.md)
- [Documentation Standards](../../standards/documentation-standards.md)
