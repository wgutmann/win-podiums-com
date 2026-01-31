# ADR-004: Cloudflare-Only Architecture (100% Cloudflare)

**Status**: Under Review  
**Date**: 2026-01-31  
**Deciders**: Architecture Team

## Context

Decision to use **Cloudflare exclusively** for all cloud infrastructure, unless compelling reasons exist to use external services.

## Current Cloudflare Stack

- **Compute**: Cloudflare Workers (web frontend + API)
- **Database**: Cloudflare D1 (SQLite-based, edge-replicated)
- **Storage**: Cloudflare R2 (object storage, plugin downloads)
- **External Services**: Discord OAuth2 (identity provider - required)

## Analysis: Can Cloudflare Handle Everything?

### ✅ **YES - Cloudflare Can Handle All Current Requirements**

#### 1. **Background Jobs & Scheduled Tasks**

**Requirement**: Cleanup expired sessions, tokens, rate limit logs (from database schema)

**Cloudflare Solution**: 
- **Cron Triggers** - Scheduled Workers that run on cron schedule
- **Queues** - Async job processing with retry logic
- **Pattern**: Cron Trigger → Enqueue cleanup jobs → Queue processes them

**Example**:
```typescript
// wrangler.toml
[triggers]
crons = ["0 * * * *"] // Every hour

// worker.ts
export default {
  async scheduled(event: ScheduledEvent, env: Env) {
    // Cleanup expired QR sessions, tokens, rate limit logs
    await cleanupExpiredSessions(env.DB);
  }
}
```

**Verdict**: ✅ **Fully supported** - No external service needed

#### 2. **Database (D1)**

**Current Plan**: D1 for all data storage

**Capacity Analysis**:
- **D1 Limits**: 10GB per database
- **Estimated Data**:
  - Users: ~200 bytes/user → 10GB = **50M users**
  - RaceResults: ~1KB/result → 10GB = **10M results**
- **Target**: 10K-100K members initially

**Verdict**: ✅ **D1 is sufficient** - Can handle 50-500x initial target

**Potential Concern**: "Plan migration to Postgres if >100K members" (from ADR-001)
- **Reality**: D1 can handle 50M users (500x the 100K threshold)
- **If Postgres needed**: Cloudflare Hyperdrive can connect to external Postgres, but this breaks "Cloudflare only" rule
- **Recommendation**: **Stay with D1** - No need for Postgres migration

#### 3. **Real-Time Features (Phase 3)**

**Requirement**: Discord role auto-assignment, live notifications

**Cloudflare Solution**:
- **Workers** support WebSockets for real-time connections
- **Discord Webhooks** (external, but required for Discord integration)
- **Durable Objects** for stateful real-time features if needed

**Verdict**: ✅ **Supported** - Workers + Discord webhooks sufficient

#### 4. **ML/AI Anti-Cheat (Phase 4)**

**Requirement**: "Advanced anti-cheat (ML-based anomaly detection)"

**Cloudflare Solution**:
- **Workers AI** - On-edge AI inference (runs models at edge)
- Supports popular models (Llama, Mistral, etc.)
- No external ML service needed

**Verdict**: ✅ **Fully supported** - Workers AI handles ML inference

#### 5. **Long-Running Processes**

**Requirement**: None identified in current architecture

**Cloudflare Solution** (if needed):
- **Durable Objects** - Stateful, long-running Workers
- **Queues** - Async processing with retry logic
- **Workflows** - Multi-step orchestration

**Verdict**: ✅ **Supported** - But not needed for WinPodiums

#### 6. **File Processing**

**Requirement**: Plugin downloads, static assets

**Cloudflare Solution**:
- **R2** - S3-compatible object storage
- **Zero egress fees** - Critical for plugin distribution
- **CDN integration** - Automatic global distribution

**Verdict**: ✅ **Perfect fit** - R2 is ideal

### ⚠️ **Potential Concerns (But Not Blockers)**

#### 1. **D1 Eventual Consistency**

**Issue**: D1 uses eventual consistency model (reads may be slightly stale)

**Impact**: 
- **Low** - User profiles, race results don't need strict consistency
- **Mitigation**: Write-then-read pattern for critical operations

**Verdict**: ✅ **Acceptable** - Eventual consistency is fine for WinPodiums use case

#### 2. **Workers 50ms CPU Limit**

**Issue**: Workers have 50ms CPU time limit per request

**Impact**:
- **Low** - Current API endpoints are simple (auth, telemetry validation)
- **Mitigation**: Offload heavy work to Queues if needed

**Verdict**: ✅ **Acceptable** - Current endpoints complete in <10ms

#### 3. **D1 Query Complexity**

**Issue**: D1 is SQLite-based, may have limitations on complex queries

**Impact**:
- **Low** - Current queries are simple (SELECT, INSERT, UPDATE)
- **Mitigation**: Design queries to be simple and indexed

**Verdict**: ✅ **Acceptable** - Simple queries work perfectly

### ❌ **What Cloudflare CANNOT Do (But We Don't Need)**

1. **Managed Postgres/MySQL** - But D1 is sufficient
2. **Traditional VMs/Containers** - But Workers are better for our use case
3. **Kubernetes** - Not needed for serverless architecture

## Recommendation: **100% Cloudflare Architecture**

### Complete Cloudflare Stack

```
┌─────────────────────────────────────────┐
│         Cloudflare Platform             │
├─────────────────────────────────────────┤
│ Workers      → Web/API compute          │
│ D1           → Database (SQLite)        │
│ R2           → Object storage           │
│ Cron Triggers → Scheduled jobs          │
│ Queues       → Async processing         │
│ Workers AI   → ML inference (Phase 4)   │
│ Durable Objects → Stateful features     │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│      External (Required)                │
├─────────────────────────────────────────┤
│ Discord OAuth2 → Identity provider      │
│ Discord Webhooks → Notifications        │
└─────────────────────────────────────────┘
```

### Updated Architecture Decision

**Decision**: Use **100% Cloudflare** for all cloud infrastructure.

**Services Used**:
- ✅ **Workers** - Web frontend + API
- ✅ **D1** - Database (no Postgres migration needed)
- ✅ **R2** - Storage
- ✅ **Cron Triggers** - Scheduled cleanup jobs
- ✅ **Queues** - Async background processing (if needed)
- ✅ **Workers AI** - ML anti-cheat (Phase 4)
- ✅ **Durable Objects** - Stateful features (if needed)

**External Services** (Required, not optional):
- Discord OAuth2 (identity provider)
- Discord Webhooks (notifications)

## Consequences

### Positive
- **Unified platform**: Single vendor, single billing, single support
- **Operational simplicity**: One platform to learn and manage
- **Cost efficiency**: Pay-as-you-go, no infrastructure management
- **Global performance**: Edge compute provides <50ms latency worldwide
- **Zero egress fees**: R2 eliminates data transfer costs
- **Future-proof**: Cloudflare platform continues to expand capabilities

### Negative
- **Vendor lock-in**: Tight coupling to Cloudflare (acceptable trade-off)
- **D1 eventual consistency**: May require careful query design (acceptable)
- **Workers CPU limits**: Must design for <50ms execution (already doing this)

### Neutral
- **Learning curve**: Team learns Cloudflare-specific patterns (one-time cost)
- **Platform maturity**: D1 is newer than Postgres (but sufficient for needs)

## Migration Path (If Needed)

**If D1 becomes insufficient** (unlikely, but contingency):
1. **Option A**: Use Cloudflare Hyperdrive to connect to external Postgres
   - **Problem**: Breaks "Cloudflare only" rule (requires external Postgres)
   - **Not recommended** if staying Cloudflare-only

2. **Option B**: Optimize D1 usage
   - Archive old race results to R2
   - Use multiple D1 databases (sharding)
   - **Recommended**: Stay Cloudflare-only

3. **Option C**: Wait for Cloudflare to offer managed Postgres
   - **Status**: Not currently available
   - **Future**: May be added to Cloudflare platform

## Updated ADR-001 Mitigation

**Original**: "Plan migration to Postgres if user base exceeds 100K members"

**Updated**: **Remove Postgres migration plan** - D1 can handle 50M users (500x the threshold). Stay with D1 indefinitely.

## Conclusion

**Cloudflare can handle 100% of WinPodiums' cloud infrastructure needs.**

- ✅ All compute needs (Workers)
- ✅ All database needs (D1)
- ✅ All storage needs (R2)
- ✅ All background jobs (Cron Triggers + Queues)
- ✅ All ML/AI needs (Workers AI)
- ✅ All real-time needs (Workers WebSockets + Durable Objects)

**Recommendation**: **Proceed with 100% Cloudflare architecture**. No external cloud services needed beyond Discord (which is required for identity/community integration).

## References

- [Cloudflare Workers Cron Triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/)
- [Cloudflare Queues](https://developers.cloudflare.com/queues/)
- [Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai/)
- [Cloudflare Durable Objects](https://developers.cloudflare.com/durable-objects/)
- [Cloudflare Hyperdrive](https://developers.cloudflare.com/hyperdrive/) (for reference, not recommended)
