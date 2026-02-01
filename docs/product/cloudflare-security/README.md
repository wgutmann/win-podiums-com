# Cloudflare Security - Product Requirements

This directory contains Product Requirements Documents (PRDs) for using **free Cloudflare security features** to protect the WinPodiums application, website, endpoints, and data.

## Documents

| Document | Status | Version | Description |
|----------|--------|---------|-------------|
| [PRD-006: Free Cloudflare Security Integration](001-free-cloudflare-security.md) | Draft | 1.0 | Maximize free-tier DDoS, SSL, WAF, Bot Fight, Security Level, optional Zero Trust, and Worker rate limiting |

## Overview

We rely on Cloudflare for edge compute (Workers), storage (D1, R2, KV), and DNS. This feature area ensures we use **all applicable free security capabilities** so that:

- **Traffic** is protected by DDoS mitigation, SSL/TLS, WAF (free managed ruleset), and Bot Fight Mode at the edge.
- **Operators** can adjust Security Level (including Under Attack mode) during incidents.
- **Internal or admin endpoints** (if any) can be protected by Cloudflare Access (Zero Trust free tier, 50 users).
- **Critical API paths** can be rate-limited in Worker code without paid WAF rate limiting rules.

No paid Cloudflare security add-ons are in scope; the PRD aligns with our cost-optimized Cloudflare strategy (ADR-005).

## Related Documentation

- [Technical Plans](../../tech-plans/) – Implementation details (to be added when tech plan is created)
- [ADR-001: Cloudflare Stack](../../architecture/decisions/001-cloudflare-stack.md)
- [ADR-005: Cost-Optimized Cloudflare](../../architecture/decisions/005-cost-optimized-cloudflare.md)
- [API Specification](../../api/README.md)
- [Documentation Standards](../../standards/documentation-standards.md)
