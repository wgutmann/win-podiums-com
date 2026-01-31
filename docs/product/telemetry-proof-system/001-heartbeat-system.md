# PRD-001: Telemetry Heartbeat System

**Status**: Draft  
**Version**: 1.0  
**Date**: 2026-01-31  
**Owner**: Security Team  
**Related**: [Technical Plan](../../tech-plans/telemetry-proof-system/001-heartbeat-system.md)

## Overview

### Problem Statement

Attackers can extract authentication tokens from the WinPodiums plugin and submit fake telemetry data directly to the API, bypassing the plugin entirely. This undermines the merit-based verification system by allowing fabricated race results.

### Solution

Implement a continuous telemetry heartbeat system that proves the plugin is actively monitoring SimHub. The plugin sends periodic heartbeats containing live SimHub telemetry data, establishing an active connection that must exist before race submissions are accepted.

### Success Criteria

- ✅ Plugin sends heartbeats every 5 seconds when SimHub is running
- ✅ Server tracks active heartbeat connections per user
- ✅ Heartbeats include live, changing telemetry values (speed, RPM, gear, position)
- ✅ Heartbeat data stored in Workers KV with 5-minute TTL
- ✅ Zero false positives (legitimate users never blocked)
- ✅ <50ms heartbeat processing latency (p95)

## User Stories

### As a Plugin Developer
- I want the plugin to automatically send heartbeats when SimHub is active, so the server knows the connection is live
- I want heartbeat failures to be logged but not block plugin functionality, so users aren't disrupted

### As a Security Engineer
- I want to verify users have active SimHub connections before accepting race submissions, so fake telemetry is blocked
- I want heartbeat data to include changing telemetry values, so I can detect static/fake data

### As a System Administrator
- I want heartbeat data stored efficiently (KV), so costs remain low
- I want heartbeat failures to be monitored, so I can detect connection issues

## Requirements

### Functional Requirements

#### FR-001: Heartbeat Transmission
- **Priority**: P0 (Critical)
- **Description**: Plugin must send heartbeat payloads to `/api/plugin/heartbeat` every 5 seconds when SimHub is running
- **Acceptance Criteria**:
  - Heartbeat sent automatically when `DataUpdate()` is called by SimHub
  - Heartbeat includes current telemetry values (speed, RPM, gear, lap time, position, session time)
  - Heartbeat includes Discord ID and timestamp
  - Heartbeat includes telemetry hash (SHA256 of current state)

#### FR-002: Heartbeat Payload Structure
- **Priority**: P0 (Critical)
- **Description**: Heartbeat payload must contain live SimHub telemetry data
- **Acceptance Criteria**:
  - Payload includes: `discordId`, `timestamp`, `currentSpeed`, `currentRPM`, `currentGear`, `currentLapTime`, `currentPosition`, `sessionTime`, `telemetryHash`
  - All values sourced from `GameData` object (SimHub SDK)
  - Timestamp is UTC, millisecond precision

#### FR-003: Heartbeat Storage
- **Priority**: P0 (Critical)
- **Description**: Server must store heartbeat state in Workers KV
- **Acceptance Criteria**:
  - Heartbeat state stored with key: `heartbeat:{discordId}`
  - State includes: `userId`, `lastHeartbeat`, `telemetrySequence` (last 10 heartbeats), `sessionId`, `isActive`
  - TTL set to 5 minutes (300 seconds)
  - State updated on each heartbeat

#### FR-004: Heartbeat Lifecycle
- **Priority**: P1 (High)
- **Description**: Heartbeat system must start/stop based on SimHub state
- **Acceptance Criteria**:
  - Heartbeats start when SimHub `DataUpdate()` begins receiving data
  - Heartbeats stop when SimHub session ends or plugin is closed
  - Heartbeat failures don't crash plugin (graceful degradation)

### Non-Functional Requirements

#### NFR-001: Performance
- **Priority**: P1 (High)
- **Description**: Heartbeat processing must not impact plugin or API performance
- **Acceptance Criteria**:
  - Heartbeat transmission <10ms (plugin-side)
  - Heartbeat processing <50ms (server-side, p95)
  - Heartbeat failures don't block plugin UI

#### NFR-002: Reliability
- **Priority**: P1 (High)
- **Description**: Heartbeat system must handle network failures gracefully
- **Acceptance Criteria**:
  - Failed heartbeats retried up to 3 times with exponential backoff
  - Network failures logged but don't crash plugin
  - Heartbeat state expires gracefully (5-minute TTL)

#### NFR-003: Cost
- **Priority**: P2 (Medium)
- **Description**: Heartbeat system must stay within free tier limits
- **Acceptance Criteria**:
  - Heartbeat KV writes: ~12/minute/user = ~17K/day (10K users)
  - Stays within Workers KV free tier (100K reads/day)
  - No additional paid services required

#### NFR-004: Security
- **Priority**: P0 (Critical)
- **Description**: Heartbeat payloads must be authenticated
- **Acceptance Criteria**:
  - Heartbeat includes Discord OAuth2 token in Authorization header
  - Server validates token before processing heartbeat
  - Invalid tokens rejected with 401 Unauthorized

## Technical Constraints

- **SimHub SDK**: Must use `DataUpdate()` callback for telemetry access
- **Cloudflare Workers**: 50ms CPU time limit per request
- **Workers KV**: 100K reads/day free tier limit
- **Network**: Heartbeats must work over standard HTTPS

## Out of Scope

- Heartbeat visualization/UI (future enhancement)
- Heartbeat analytics dashboard (future enhancement)
- Heartbeat failure notifications (future enhancement)
- Multi-sim heartbeat support (covered in separate PRD)

## Dependencies

- Discord OAuth2 authentication (must be authenticated to send heartbeats)
- SimHub SDK integration (must have SimHub running)
- Workers KV availability (Cloudflare service)

## Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Heartbeat spam (DoS) | High | Low | Rate limiting (max 1 heartbeat per 3 seconds) |
| KV storage costs | Medium | Low | Use KV free tier, monitor usage |
| Network failures | Medium | Medium | Retry logic, graceful degradation |
| SimHub SDK changes | High | Low | Version pinning, compatibility testing |

## Success Metrics

- **Heartbeat Success Rate**: >99% (heartbeats successfully sent)
- **Heartbeat Latency**: <50ms (p95 server processing time)
- **Active Connections**: Track number of users with active heartbeats
- **False Positives**: 0% (legitimate users never blocked)

## Related Documentation

- [Technical Plan](../../tech-plans/telemetry-proof-system/001-heartbeat-system.md)
- [API Specification](../../api/plugin.md#heartbeat-endpoint)
- [SimHub Plugin LLD](../../design/components/simhub-plugin.md)
- [Documentation Standards](../../standards/documentation-standards.md)
