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

We will use **Cloudflare's edge platform stack**:
- **Cloudflare Workers** for web frontend (SSR) and API layer
- **Cloudflare D1** for relational database (SQLite-based)
- **Cloudflare R2** for object storage (plugin downloads, static assets)

## Rationale

### Why Cloudflare Workers
- **Edge compute**: Runs close to users globally (<50ms latency target achievable)
- **Auto-scaling**: Automatic scaling with zero configuration
- **Cost**: Free tier supports development; production pricing scales with usage
- **Developer experience**: Wrangler CLI provides excellent local dev experience

### Why Cloudflare D1
- **Edge replication**: Database reads replicated to edge locations
- **Serverless**: No database management overhead
- **SQLite compatibility**: Standard SQL with familiar tooling
- **Integration**: Native integration with Workers

### Why Cloudflare R2
- **S3-compatible**: Standard object storage API
- **Zero egress fees**: Unlike AWS S3, no charges for data transfer out
- **CDN integration**: Automatic global distribution for plugin downloads

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

1. **Vendor lock-in**: Abstract database layer behind interface for easier future migration
2. **D1 size limits**: Plan migration to Postgres if user base exceeds 100K members
3. **Workers CPU limits**: Design API endpoints to complete within 50ms; offload heavy work to async queues if needed
4. **D1 maturity**: Monitor Cloudflare status page; have rollback plan; start with non-critical data

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

## References

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Cloudflare D1 Docs](https://developers.cloudflare.com/d1/)
- [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)
