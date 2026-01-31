# ADR-005: Cost-Optimized Cloudflare Architecture

**Status**: Accepted  
**Date**: 2026-01-31  
**Deciders**: Architecture Team

## Context

Optimize Cloudflare-only architecture for **cost-savings** while maintaining:
- Scalable features (Queues, proper patterns)
- Security (no compromises)
- Simplicity (minimal complexity)

## Cost Analysis: Cloudflare Free Tier vs Paid

### Free Tier Limits (Sufficient for MVP/Phase 1-2)

| Service | Free Tier | Estimated Usage (10K users) | Status |
|---------|-----------|----------------------------|--------|
| **Workers** | 100K requests/day | ~50K/day (5 req/user/day) | ✅ **FREE** |
| **D1 Reads** | 5M rows/day | ~500K/day (50 reads/user/day) | ✅ **FREE** |
| **D1 Writes** | 100K rows/day | ~10K/day (1 write/user/day) | ✅ **FREE** |
| **D1 Storage** | 5 GB | ~100 MB (10K users) | ✅ **FREE** |
| **R2 Storage** | 10 GB | ~500 MB (plugin files) | ✅ **FREE** |
| **R2 Operations** | 1M Class A, 10M Class B/month | ~100K/month | ✅ **FREE** |

### When Paid Plan Needed

**Workers Paid Plan ($5/month minimum)** needed when:
- >100K requests/day (20K+ active users)
- >10M requests/month

**D1 Paid Plan** (included with Workers Paid) needed when:
- >5M reads/day (100K+ active users)
- >100K writes/day (100K+ active users)
- >5GB storage (250K+ users)

**R2 Paid Plan** needed when:
- >10GB storage (rare - plugin files are small)
- >1M write operations/month (rare)

## Cost Optimization Strategy

### 1. **Minimize Database Operations** (Biggest Cost Driver)

**Current Plan**: Direct D1 queries for every operation

**Optimized Plan**:
- **Cache frequently-read data** in Workers KV (free tier: 100K reads/day)
- **Batch writes** where possible (reduce write operations)
- **Archive old data** to R2 (cheaper than D1 storage)

**Pattern**: Read from KV cache → Fallback to D1 → Write to D1 + Update KV

```typescript
// Cost-optimized: Cache user profiles in KV
async function getUserProfile(discordId: string, env: Env) {
  // Try KV first (free, fast)
  const cached = await env.KV.get(`user:${discordId}`);
  if (cached) return JSON.parse(cached);
  
  // Fallback to D1 (counts toward free tier)
  const user = await env.DB.prepare('SELECT * FROM users WHERE discord_id = ?')
    .bind(discordId).first();
  
  // Cache for 1 hour (reduce D1 reads)
  if (user) {
    await env.KV.put(`user:${discordId}`, JSON.stringify(user), { expirationTtl: 3600 });
  }
  
  return user;
}
```

**Cost Impact**: 
- **Before**: 50 reads/user/day = 500K D1 reads/day
- **After**: 5 reads/user/day (cache hits) = 50K D1 reads/day
- **Savings**: 90% reduction in D1 reads = stay in free tier longer

### 2. **Optimize Background Jobs** (Use Free Tier Efficiently)

**Current Plan**: Cron Triggers + Queues for cleanup

**Optimized Plan**:
- **Cron Triggers**: Free, use for scheduled cleanup
- **Queues**: Only use if needed (free tier: 1M messages/month)
- **Batch cleanup**: Process multiple deletions in single transaction

```typescript
// Cost-optimized: Batch cleanup in single transaction
export default {
  async scheduled(event: ScheduledEvent, env: Env) {
    // Single transaction = 1 write operation (not N operations)
    await env.DB.batch([
      env.DB.prepare('DELETE FROM qr_auth_sessions WHERE expires_at < ?')
        .bind(Date.now() - 3600000),
      env.DB.prepare('DELETE FROM manual_tokens WHERE expires_at < ?')
        .bind(Date.now() - 86400000),
      env.DB.prepare('DELETE FROM rate_limit_logs WHERE window_end < ?')
        .bind(Date.now() - 2592000000),
    ]);
  }
}
```

**Cost Impact**: 
- **Before**: 3 separate DELETE queries = 3 write operations
- **After**: 1 batch transaction = 1 write operation
- **Savings**: 66% reduction in write operations

### 3. **Simplify Architecture** (Remove Unnecessary Services)

**Remove Until Needed**:
- ❌ **Durable Objects** - Not needed for MVP/Phase 1-2 (adds complexity + cost)
- ❌ **Workers AI** - Only needed in Phase 4 (ML anti-cheat)
- ❌ **Queues** - Only use if Cron Triggers insufficient

**Keep (Essential)**:
- ✅ **Workers** - Core compute (free tier sufficient)
- ✅ **D1** - Database (free tier sufficient)
- ✅ **R2** - Storage (free tier sufficient)
- ✅ **Cron Triggers** - Scheduled cleanup (free)
- ✅ **Workers KV** - Caching (free tier: 100K reads/day)

### 4. **Optimize API Design** (Reduce Request Count)

**Current Plan**: Separate endpoints for each operation

**Optimized Plan**:
- **Batch operations** where possible (single request = multiple operations)
- **Combine endpoints** (e.g., `/api/profile/me` returns all user data in one call)
- **Use HTTP caching** (ETags, Cache-Control headers)

**Example**:
```typescript
// Cost-optimized: Single endpoint returns all user data
GET /api/profile/me
Response: {
  user: { ... },
  recentPodiums: [ ... ],
  pluginStatus: { ... }
}
// Instead of 3 separate API calls
```

**Cost Impact**: 
- **Before**: 3 API requests = 3 Workers invocations
- **After**: 1 API request = 1 Workers invocation
- **Savings**: 66% reduction in Workers requests

### 5. **Archive Old Data** (Reduce D1 Storage Costs)

**Strategy**: Move old race results to R2 after 1 year

```typescript
// Archive old race results to R2 (cheaper than D1 storage)
async function archiveOldResults(env: Env) {
  const oldResults = await env.DB.prepare(`
    SELECT * FROM race_results 
    WHERE session_date < datetime('now', '-1 year')
    LIMIT 1000
  `).all();
  
  // Upload to R2 as JSON
  await env.R2.put(`archive/results-${Date.now()}.json`, 
    JSON.stringify(oldResults.results));
  
  // Delete from D1 (frees up storage)
  await env.DB.prepare(`
    DELETE FROM race_results 
    WHERE session_date < datetime('now', '-1 year')
  `).run();
}
```

**Cost Impact**:
- **D1 Storage**: $0.75/GB-month (after 5GB free)
- **R2 Storage**: $0.015/GB-month (14x cheaper)
- **Savings**: Archive 1GB = save $0.735/month

## Optimized Architecture Stack

### Phase 1-2 (MVP): **100% Free Tier**

```
┌─────────────────────────────────────────┐
│      Cloudflare Free Tier Stack         │
├─────────────────────────────────────────┤
│ Workers      → Web/API (100K req/day)   │
│ D1           → Database (5M reads/day) │
│ R2           → Storage (10GB free)     │
│ Cron Triggers → Cleanup jobs (free)     │
│ Workers KV   → Caching (100K reads/day) │
└─────────────────────────────────────────┘
```

**Monthly Cost**: **$0** (stays in free tier)

### Phase 3-4: **Minimal Paid Plan**

```
┌─────────────────────────────────────────┐
│   Cloudflare Paid Plan ($5/month min)   │
├─────────────────────────────────────────┤
│ Workers      → Web/API (10M req/month)   │
│ D1           → Database (25B reads/month)│
│ R2           → Storage (10GB+ if needed)│
│ Cron Triggers → Cleanup jobs (free)     │
│ Workers KV   → Caching (free tier)      │
│ Queues       → Async jobs (if needed)   │
│ Workers AI   → ML anti-cheat (Phase 4)   │
└─────────────────────────────────────────┘
```

**Monthly Cost**: **$5-20** (depending on usage)

## Security: No Compromises

### Maintained Security Features

✅ **OAuth2 + PKCE** - No changes (required for security)
✅ **HMAC-SHA256 signatures** - No changes (required for telemetry verification)
✅ **Token encryption** - No changes (Workers Secrets + AES-256)
✅ **Rate limiting** - No changes (required for abuse prevention)
✅ **HTTPS/TLS 1.3** - No changes (automatic with Workers)

### Security Optimizations (Cost-Neutral)

- **Cache invalidation on auth changes** - Ensure KV cache doesn't serve stale auth data
- **Token refresh optimization** - Cache refresh tokens, reduce D1 reads
- **Rate limit optimization** - Use KV for rate limit counters (faster + free)

## Simplicity: Minimal Complexity

### Removed Complexity

❌ **Durable Objects** - Not needed, adds complexity
❌ **Workflows** - Overkill for simple cleanup jobs
❌ **Multiple D1 databases** - Single database is simpler
❌ **Complex caching layers** - Simple KV cache is sufficient

### Kept Patterns (Scalable + Simple)

✅ **Cron Triggers** - Simple scheduled jobs
✅ **Workers KV** - Simple caching (key-value)
✅ **Batch operations** - Simple batching in D1
✅ **Single D1 database** - Simple data model

## Cost Projections

### Phase 1-2 (10K users, MVP)

| Service | Usage | Cost |
|---------|-------|------|
| Workers | 50K req/day (1.5M/month) | **$0** (free tier) |
| D1 Reads | 500K/day (15M/month) | **$0** (free tier) |
| D1 Writes | 10K/day (300K/month) | **$0** (free tier) |
| D1 Storage | 100 MB | **$0** (free tier) |
| R2 Storage | 500 MB | **$0** (free tier) |
| R2 Operations | 100K/month | **$0** (free tier) |
| **Total** | | **$0/month** |

### Phase 3 (100K users)

| Service | Usage | Cost |
|---------|-------|------|
| Workers | 500K req/day (15M/month) | **$5** (paid plan min) |
| D1 Reads | 5M/day (150M/month) | **$0** (included) |
| D1 Writes | 100K/day (3M/month) | **$0** (included) |
| D1 Storage | 1 GB | **$0** (included) |
| R2 Storage | 2 GB | **$0** (free tier) |
| **Total** | | **$5/month** |

### Phase 4 (500K users + ML)

| Service | Usage | Cost |
|---------|-------|------|
| Workers | 2.5M req/day (75M/month) | **$5** (base) + **$19.50** (65M extra) = **$24.50** |
| D1 Reads | 25M/day (750M/month) | **$0** (included) |
| D1 Writes | 500K/day (15M/month) | **$0** (included) |
| D1 Storage | 5 GB | **$0** (included) |
| R2 Storage | 5 GB | **$0** (free tier) |
| Workers AI | ~10K inferences/month | **~$1-5** (depends on model) |
| **Total** | | **~$25-30/month** |

## Implementation Checklist

### Cost Optimization Tasks

- [ ] **Add Workers KV caching** for user profiles (reduce D1 reads by 90%)
- [ ] **Batch cleanup operations** in single transaction (reduce D1 writes by 66%)
- [ ] **Combine API endpoints** where possible (reduce Workers requests)
- [ ] **Implement HTTP caching** (ETags, Cache-Control) for static data
- [ ] **Archive old race results** to R2 after 1 year (reduce D1 storage costs)
- [ ] **Monitor usage** with Cloudflare Analytics (track free tier limits)
- [ ] **Set up alerts** for approaching free tier limits

### Security Tasks (No Changes)

- [ ] OAuth2 + PKCE implementation (already planned)
- [ ] HMAC-SHA256 telemetry signatures (already planned)
- [ ] Token encryption with Workers Secrets (already planned)
- [ ] Rate limiting implementation (already planned)

### Simplicity Tasks

- [ ] **Remove Durable Objects** from architecture (not needed)
- [ ] **Remove Workers AI** until Phase 4 (not needed yet)
- [ ] **Use Queues only if needed** (Cron Triggers may be sufficient)
- [ ] **Single D1 database** (no sharding needed)

## Updated Architecture Decision

**Decision**: Use **cost-optimized Cloudflare stack** with:
- **Free tier** for Phase 1-2 (MVP)
- **Minimal paid plan** ($5/month) for Phase 3
- **Scalable paid plan** ($25-30/month) for Phase 4

**Services Used**:
- ✅ **Workers** - Web/API (free tier → $5/month)
- ✅ **D1** - Database (free tier → included with Workers paid)
- ✅ **R2** - Storage (free tier sufficient)
- ✅ **Cron Triggers** - Scheduled cleanup (free)
- ✅ **Workers KV** - Caching (free tier → reduces D1 costs)
- ⚠️ **Queues** - Only if Cron Triggers insufficient (free tier: 1M/month)
- ⚠️ **Workers AI** - Only in Phase 4 (ML anti-cheat)

**Removed** (until needed):
- ❌ **Durable Objects** - Not needed, adds complexity
- ❌ **Workflows** - Overkill for simple jobs
- ❌ **Multiple databases** - Single D1 is simpler

## Cost Optimization Patterns

### Pattern 1: KV Cache + D1 Fallback

```typescript
// Reduces D1 reads by 90% (stays in free tier longer)
async function getCachedUser(discordId: string, env: Env) {
  const cached = await env.KV.get(`user:${discordId}`);
  if (cached) return JSON.parse(cached);
  
  const user = await env.DB.prepare('SELECT * FROM users WHERE discord_id = ?')
    .bind(discordId).first();
  
  if (user) {
    await env.KV.put(`user:${discordId}`, JSON.stringify(user), { expirationTtl: 3600 });
  }
  
  return user;
}
```

### Pattern 2: Batch Database Operations

```typescript
// Reduces write operations by batching
await env.DB.batch([
  env.DB.prepare('DELETE FROM qr_auth_sessions WHERE expires_at < ?').bind(expired),
  env.DB.prepare('DELETE FROM manual_tokens WHERE expires_at < ?').bind(expired),
  env.DB.prepare('DELETE FROM rate_limit_logs WHERE window_end < ?').bind(expired),
]);
```

### Pattern 3: Archive to R2

```typescript
// Archive old data to R2 (14x cheaper than D1 storage)
const oldData = await env.DB.prepare('SELECT * FROM race_results WHERE session_date < ?')
  .bind(oneYearAgo).all();

await env.R2.put(`archive/results-${Date.now()}.json`, JSON.stringify(oldData.results));
await env.DB.prepare('DELETE FROM race_results WHERE session_date < ?').bind(oneYearAgo).run();
```

## Conclusion

**Cost-optimized Cloudflare architecture**:
- ✅ **$0/month** for Phase 1-2 (MVP) - stays in free tier
- ✅ **$5/month** for Phase 3 (100K users) - minimal paid plan
- ✅ **$25-30/month** for Phase 4 (500K users + ML) - scalable paid plan
- ✅ **Security maintained** - no compromises
- ✅ **Scalability preserved** - Queues, KV, proper patterns
- ✅ **Simplicity improved** - removed unnecessary services

**Key Optimizations**:
1. **KV caching** reduces D1 reads by 90%
2. **Batch operations** reduce D1 writes by 66%
3. **Combined endpoints** reduce Workers requests by 66%
4. **Archive to R2** reduces storage costs by 14x
5. **Remove unnecessary services** (Durable Objects, AI until Phase 4)

## References

- [Cloudflare Workers Pricing](https://developers.cloudflare.com/workers/platform/pricing/)
- [Cloudflare D1 Pricing](https://developers.cloudflare.com/d1/platform/pricing/)
- [Cloudflare R2 Pricing](https://developers.cloudflare.com/r2/pricing/)
- [Workers KV Pricing](https://developers.cloudflare.com/kv/pricing/)
- [Cloudflare Queues Pricing](https://developers.cloudflare.com/queues/pricing/)
