# TP-005: Challenge-Response System

**Doc type**: Tech Plan | **ID**: TP-005 | **Implements**: [PRD-005: Challenge-Response System](../../product/telemetry-proof-system/005-challenge-response.md) | **Related**: [TP-001: Heartbeat System](001-heartbeat-system.md), [TP-003: Race Submission Requirements](003-race-submission-requirements.md), [API Specification](../../api/plugin.md#challenge-response)

**Status**: Draft  
**Version**: 1.0  
**Date**: 2026-01-31  
**Owner**: Development Team  
**Implements**: [PRD-005: Challenge-Response System](../../product/telemetry-proof-system/005-challenge-response.md)  
**Related**: [TP-001: Heartbeat System](001-heartbeat-system.md), [TP-003: Race Submission Requirements](003-race-submission-requirements.md), [API Specification](../../api/plugin.md#challenge-response)

## Overview

This Technical Plan implements a challenge-response system for podium finishes (P1-P3). When a podium finish is submitted, the server generates a challenge requiring an immediate response with current SimHub telemetry data.

## Implementation Details

### Challenge Generation

```typescript
async function generateChallenge(
  discordId: string,
  env: Env
): Promise<string> {
  const challenge = crypto.randomUUID(); // UUID v4
  
  // Store challenge in KV with 5-second TTL
  await env.KV.put(
    `challenge:${discordId}`,
    challenge,
    { expirationTtl: 5 }
  );
  
  return challenge;
}
```

### Challenge Response Validation

```typescript
async function validateChallengeResponse(
  challenge: string,
  response: ChallengeResponsePayload,
  env: Env
): Promise<ValidationResult> {
  // 1. Verify challenge exists
  const storedChallenge = await env.KV.get(`challenge:${response.discordId}`);
  if (storedChallenge !== challenge) {
    return {
      valid: false,
      reason: "Invalid or expired challenge",
      code: "INVALID_CHALLENGE"
    };
  }
  
  // 2. Verify response is recent (<5 seconds)
  const responseAge = Date.now() - new Date(response.timestamp).getTime();
  if (responseAge > 5000) {
    return {
      valid: false,
      reason: "Challenge response too old",
      code: "RESPONSE_STALE"
    };
  }
  
  // 3. Verify telemetry hash matches current state
  const expectedHash = computeTelemetryHash(response);
  if (response.telemetryHash !== expectedHash) {
    return {
      valid: false,
      reason: "Telemetry hash mismatch",
      code: "HASH_MISMATCH"
    };
  }
  
  // 4. Delete challenge (one-time use)
  await env.KV.delete(`challenge:${response.discordId}`);
  
  return { valid: true };
}
```

## Related Documentation

- [PRD-005: Challenge-Response System](../../product/telemetry-proof-system/005-challenge-response.md)
- [TP-001: Heartbeat System](001-heartbeat-system.md)
- [TP-003: Race Submission Requirements](003-race-submission-requirements.md)
- [Documentation Standards](../../standards/documentation-standards.md)
