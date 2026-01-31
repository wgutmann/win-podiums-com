# ADR-001: Cloudflare Stack for Hosting

**Status**: Accepted  
**Date**: 2026-01-31  
**Deciders**: Architecture Team

## Context

WinPodiums requires a hosting solution that provides:
- Global low-latency access for international sim racing community
- Serverless auto-scaling to handle unpredictable traffic patterns
- Integrated database, storage, and edge compute
- Cost-effective for initial launch with clear growth path

## Decision

We will use **100% Cloudflare's edge platform stack**, optimized for cost:

**Core Services** (Always Used):
- **Cloudflare Workers** for web frontend (SSR) and API layer
- **Cloudflare D1** for relational database (SQLite-based) - **No Postgres migration planned**
- **Cloudflare R2** for object storage (plugin downloads, static assets, archived data)
- **Cloudflare Cron Triggers** for scheduled background jobs (cleanup tasks)
- **Workers KV** for caching (reduces D1 reads by 90%, stays in free tier longer)

**Optional Services** (Only When Needed):
- **Cloudflare Queues** - Only if Cron Triggers insufficient for async processing
- **Cloudflare Workers AI** - Only in Phase 4 (ML-based anti-cheat)

**Removed** (Not Needed):
- **Durable Objects** - Not needed, adds complexity
- **Workflows** - Overkill for simple jobs

## Rationale

### Why Cloudflare Workers
- **Edge compute**: Runs close to users globally (<50ms latency target achievable)
- **Auto-scaling**: Automatic scaling with zero configuration
- **Cost**: Free tier (100K requests/day) sufficient for MVP; $5/month paid plan scales to millions
- **Developer experience**: Wrangler CLI provides excellent local dev experience

### Why Cloudflare D1
- **Edge replication**: Database reads replicated to edge locations
- **Serverless**: No database management overhead
- **SQLite compatibility**: Standard SQL with familiar tooling
- **Integration**: Native integration with Workers
- **Cost**: Free tier (5M reads/day, 100K writes/day, 5GB storage) sufficient for MVP

### Why Cloudflare R2
- **S3-compatible**: Standard object storage API
- **Zero egress fees**: Unlike AWS S3, no charges for data transfer out
- **CDN integration**: Automatic global distribution for plugin downloads
- **Cost**: Free tier (10GB storage) sufficient for MVP; 14x cheaper than D1 for archived data

## Consequences

### Positive
- Unified platform reduces operational complexity
- Edge compute provides excellent global performance
- Pay-as-you-go pricing aligns with startup economics
- Wrangler CLI enables local development parity

### Negative
- **Vendor lock-in**: Tight coupling to Cloudflare ecosystem
- **D1 limitations**: Eventual consistency model, 10GB database size limit per D1
- **Workers constraints**: 50ms CPU time limit per request, memory limits
- **Migration effort**: Moving to another platform would require significant refactoring

### Neutral
- **Learning curve**: Team must learn Cloudflare-specific patterns
- **D1 maturity**: D1 is still in beta (as of 2026), potential stability concerns

## Mitigation Strategies

1. **Vendor lock-in**: Acceptable trade-off for unified platform and operational simplicity
2. **D1 size limits**: D1 can handle 50M users (500x initial 100K target) - **No Postgres migration needed**
3. **Workers CPU limits**: Design API endpoints to complete within 50ms; offload heavy work to Cloudflare Queues if needed
4. **D1 maturity**: Monitor Cloudflare status page; D1 is production-ready for our use case
5. **Background jobs**: Use Cloudflare Cron Triggers for scheduled cleanup tasks (free, simple)
6. **Cost optimization**: Use Workers KV for caching (reduces D1 reads by 90%, stays in free tier longer)
7. **Batch operations**: Batch database operations to reduce write costs
8. **Archive old data**: Move old race results to R2 (14x cheaper than D1 storage)

## Alternatives Considered

### AWS Lambda + DynamoDB + S3
- **Pros**: Battle-tested, mature ecosystem
- **Cons**: Higher operational complexity, egress costs, slower cold starts

### Vercel + Postgres + S3
- **Pros**: Excellent DX for Next.js, mature database
- **Cons**: Higher cost at scale, no edge database replication

### Self-hosted (DigitalOcean/Hetzner)
- **Pros**: Maximum control, predictable costs
- **Cons**: Requires DevOps expertise, manual scaling, no edge distribution

## Related Decisions

- [ADR-004: Cloudflare-Only Architecture](004-cloudflare-only-architecture.md) - Detailed analysis of 100% Cloudflare approach
- [ADR-005: Cost-Optimized Cloudflare](005-cost-optimized-cloudflare.md) - Cost optimization strategies and patterns

## References

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Cloudflare D1 Docs](https://developers.cloudflare.com/d1/)
- [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)
- [Cloudflare Cron Triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/)
- [Cloudflare Queues](https://developers.cloudflare.com/queues/)
- [Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai/)
