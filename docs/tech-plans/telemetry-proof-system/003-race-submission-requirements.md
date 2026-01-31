# Technical Plan: Race Submission Requirements

**Status**: Draft  
**Version**: 1.0  
**Date**: 2026-01-31  
**Owner**: Development Team  
**Implements**: [PRD-003: Race Submission Requirements](../../product/telemetry-proof-system/003-race-submission-requirements.md)  
**Related**: [TP-001: Heartbeat System](001-heartbeat-system.md), [TP-002: Heartbeat Validation](002-heartbeat-validation.md), [API Specification](../../api/plugin.md#race-submission-validation)

## Overview

This Technical Plan implements race submission validation that requires an active heartbeat connection. Race submissions must reference an active heartbeat (<30 seconds old) and align with heartbeat session data.

## Implementation Details

### Validation Algorithm

```typescript
async function validateRaceSubmission(
  payload: RaceSubmissionPayload,
  env: Env
): Promise<ValidationResult> {
  // 1. Check for active heartbeat
  const heartbeatKey = `heartbeat:${payload.discordId}`;
  const heartbeatState = await env.KV.get(heartbeatKey);
  
  if (!heartbeatState) {
    return {
      valid: false,
      reason: "No active SimHub connection",
      code: "NO_HEARTBEAT"
    };
  }
  
  const state: HeartbeatState = JSON.parse(heartbeatState);
  
  // 2. Check heartbeat is recent (<30 seconds)
  const timeSinceHeartbeat = Date.now() - state.lastHeartbeat;
  if (timeSinceHeartbeat > 30000) {
    return {
      valid: false,
      reason: "SimHub connection inactive",
      code: "HEARTBEAT_STALE"
    };
  }
  
  // 3. Validate session ID match
  if (payload.sessionId !== state.sessionId) {
    return {
      valid: false,
      reason: "Session ID mismatch",
      code: "SESSION_MISMATCH"
    };
  }
  
  // 4. Validate position alignment
  if (state.telemetrySequence.length > 0) {
    const lastPosition = state.telemetrySequence[
      state.telemetrySequence.length - 1
    ].currentPosition;
    
    const positionDiff = Math.abs(payload.finalPosition - lastPosition);
    if (positionDiff > 2) {
      // Flag for review but don't reject
      return {
        valid: true,
        flagged: true,
        reason: "Position jump detected",
        code: "POSITION_JUMP"
      };
    }
  }
  
  return { valid: true };
}
```

## Related Documentation

- [PRD-003: Race Submission Requirements](../../product/telemetry-proof-system/003-race-submission-requirements.md)
- [TP-001: Heartbeat System](001-heartbeat-system.md)
- [TP-002: Heartbeat Validation](002-heartbeat-validation.md)
- [Documentation Standards](../../standards/documentation-standards.md)
