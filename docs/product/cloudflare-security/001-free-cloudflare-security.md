# PRD-006: Free Cloudflare Security Integration

**Status**: Draft  
**Version**: 1.0  
**Date**: 2026-01-31  
**Owner**: Engineering  
**Related**: [High-Level Design](../../architecture/high-level-design.md), [ADR-001 Cloudflare Stack](../../architecture/decisions/001-cloudflare-stack.md), [ADR-005 Cost-Optimized Cloudflare](../../architecture/decisions/005-cost-optimized-cloudflare.md), [API README](../../api/README.md)

---

## Overview

### Problem Statement

WinPodiums exposes a public website, API endpoints (auth, telemetry, plugin downloads), and internal/admin surfaces. We need to protect the application, website, endpoints, and data from common threats (DDoS, bots, abuse, credential stuffing, data interception) without incurring paid security add-ons, in line with our cost-optimized Cloudflare strategy.

### Solution

Adopt and configure **all applicable free Cloudflare security features** so that traffic is protected at the edge before reaching our Workers, D1, R2, and KV. This includes: DDoS mitigation, Universal SSL, WAF (free managed ruleset), Bot Fight Mode, Security Level, optional Zero Trust (Access, Gateway, Tunnels) for protected endpoints, and application-level rate limiting inside Workers where needed.

### Success Criteria

- All public traffic to winpodiums.com and API routes benefits from free DDoS, SSL, WAF, and bot protections.
- Admin or internal endpoints (if any) are optionally protected by Zero Trust Access within the free 50-user tier.
- No paid Cloudflare security add-ons are required for baseline protection.
- Security choices are documented and traceable to this PRD and future tech plans.

---

## User Stories

| ID | As a… | I want… | So that… |
|----|--------|---------|----------|
| US-1 | Operator | All traffic to our domain to be behind Cloudflare proxy (orange cloud) | DDoS, WAF, and SSL are applied at the edge |
| US-2 | Operator | SSL/TLS to be always on for the site and API | Data in transit is encrypted and tampering is mitigated |
| US-3 | Operator | The free WAF managed ruleset to be enabled | High-impact and common web vulnerabilities are mitigated |
| US-4 | Operator | Bot Fight Mode to be enabled | Simple bots and abusive crawlers are challenged |
| US-5 | Operator | Security Level (and Under Attack mode when needed) to be configurable | We can tighten protection during incidents |
| US-6 | Operator | Sensitive or internal routes to be behind Cloudflare Access (optional) | Only authenticated users or allowlisted identities can reach them |
| US-7 | Developer | API and Worker routes to be protected by the same edge security | No bypass of DDoS/WAF/bot for API traffic |
| US-8 | Developer | Rate limiting for critical paths (e.g. login, telemetry submit) in Worker code | We can cap abuse without paid WAF rate limiting rules |

---

## Requirements

### Functional Requirements

#### FR-001: Traffic Proxied Through Cloudflare

- **Priority**: P0 Critical  
- **Description**: All traffic to the application (website and API) must be proxied through Cloudflare (DNS “orange cloud”) so that edge security features apply.
- **Acceptance Criteria**:
  - Domain(s) used for the app are added to Cloudflare and DNS A/AAAA (or CNAME) records are proxied.
  - Worker routes (e.g. `*.<domain>/*`) attach to the same zone; traffic to Workers goes through the proxy.

#### FR-002: Universal SSL Enabled

- **Priority**: P0 Critical  
- **Description**: Universal SSL must be enabled so all connections use TLS.
- **Acceptance Criteria**:
  - SSL/TLS mode is “Full” or “Full (Strict)” for the zone (or equivalent for custom hostnames).
  - No intentional mixed content or HTTP-only user flows for the main app.

#### FR-003: Free WAF Managed Ruleset Enabled

- **Priority**: P1 High  
- **Description**: The Cloudflare Free Managed Ruleset (WAF) must be enabled for the zone/application.
- **Acceptance Criteria**:
  - Free managed ruleset is enabled in Security → WAF.
  - Ruleset is configured to run on appropriate phases (e.g. request) for our routes.
  - No requirement for paid rulesets (OWASP/Cloudflare Managed); only free ruleset is in scope.

#### FR-004: Bot Fight Mode Enabled

- **Priority**: P1 High  
- **Description**: Bot Fight Mode (free) must be enabled to challenge simple bots.
- **Acceptance Criteria**:
  - Bot Fight Mode is turned on for the zone or applicable hostnames.
  - Documentation states where and how it applies (e.g. all proxied traffic).

#### FR-005: Security Level Configurable

- **Priority**: P2 Medium  
- **Description**: Security Level (including “Under Attack”) must be configurable so operators can raise it during incidents.
- **Acceptance Criteria**:
  - Security Level setting is documented (default and when to change).
  - Runbook or ops guide describes when to use “Under Attack” and how to revert.

#### FR-006: Optional Zero Trust Access for Protected Routes

- **Priority**: P2 Medium  
- **Description**: Where internal or admin endpoints exist, they may be protected by Cloudflare Access (Zero Trust free tier, up to 50 users).
- **Acceptance Criteria**:
  - If Access is used, applications and routes are documented.
  - Access policies (identity/allowlist) are defined; no requirement to use Access for public API.
  - Usage stays within Zero Trust free plan (e.g. 50 users, 3 network locations).

#### FR-007: Worker-Level Rate Limiting for Critical Paths

- **Priority**: P2 Medium  
- **Description**: Critical paths (e.g. login, telemetry submission, token exchange) must have rate limiting implemented in Worker code (or equivalent) where needed to reduce abuse.
- **Acceptance Criteria**:
  - At least one critical path (e.g. auth or submit) has rate limiting (e.g. per identifier per time window) implemented in the Worker.
  - Limits are documented (e.g. requests per minute per IP or per user).
  - No dependency on paid WAF Rate Limiting rules; use Workers Rate Limiting API or custom logic (e.g. KV counters).

### Non-Functional Requirements

#### NFR-001: No Paid Security Add-Ons Required

- **Priority**: P0 Critical  
- **Description**: Baseline security must be achievable with Cloudflare free plan and free Zero Trust tier only.
- **Acceptance Criteria**:
  - List of used features is documented; all are available on free plans.
  - Any future paid add-ons are explicitly out of scope for this PRD unless separately approved.

#### NFR-002: Security Configuration Documented

- **Priority**: P1 High  
- **Description**: All security-related Cloudflare settings (WAF, Bot Fight, SSL, Security Level, Access if used) must be documented so they can be audited and reproduced.
- **Acceptance Criteria**:
  - Tech plan or runbook describes each setting and where it is configured (Dashboard vs Terraform vs wrangler).
  - New team members can understand what protections are in place.

#### NFR-003: Consistency with Cost-Optimized Strategy

- **Priority**: P1 High  
- **Description**: Security choices must align with ADR-005 (cost-optimized Cloudflare) and not introduce required paid features without approval.
- **Acceptance Criteria**:
  - No mandatory use of paid WAF rules, paid rate limiting rules, or paid Zero Trust features for baseline protection.

---

## Technical Constraints

- **Cloudflare Free Plan**: DDoS, SSL, free WAF ruleset, Bot Fight Mode, Security Level are available on the free plan. OWASP/Cloudflare Managed Rulesets and WAF Rate Limiting rules are paid and out of scope for this PRD.
- **Zero Trust Free**: Access, Gateway, Tunnels are free for up to 50 users; we must stay within that limit if we use them.
- **Workers**: Rate limiting inside Workers is implemented via application code (e.g. Workers Rate Limiting API or KV-based counters); no dependency on WAF rate limiting rules.
- **Terraform**: Where Cloudflare resources are managed in Terraform (e.g. zone, routes), security-related settings that can be managed as code should be documented; some settings may remain Dashboard-only (e.g. WAF ruleset enablement) depending on provider support.

---

## Out of Scope

- **Paid WAF**: Cloudflare Managed Ruleset, OWASP Core Ruleset, Exposed Credentials Check (paid), Sensitive Data Detection.
- **Paid Rate Limiting**: WAF Rate Limiting rules (priced on traffic); only Worker-level rate limiting is in scope.
- **Zero Trust beyond free**: More than 50 users, paid DLP, Remote Browser Isolation, long-term log retention beyond 24 hours.
- **DDoS alerts**: Real-time DDoS alerts are free and may be adopted but are not a mandatory requirement of this PRD.
- **Third-party security**: WAF or security features outside Cloudflare are not part of this PRD.

---

## Dependencies

- **ADR-001 (Cloudflare Stack)**: Use of Cloudflare Workers, D1, R2, KV and zone/Worker routes.
- **ADR-005 (Cost-Optimized Cloudflare)**: Preference for free-tier features.
- **Infrastructure**: Zone and Worker routes (e.g. `infra/terraform/routes.tf`, `wrangler.toml`) must be in place so that proxied traffic reaches the Worker and security settings apply.
- **Zero Trust**: If Access is used, a Zero Trust organization (free) and identity provider or allowlist configuration.

---

## Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Free WAF ruleset causes false positives on API | Medium | Low | Use WAF sensitivity or rule overrides if needed; document and test critical API paths. |
| Bot Fight Mode blocks legitimate automation | Low | Low | Rely on Cloudflare defaults; add exceptions only if evidence of legitimate traffic blocked. |
| Zero Trust 50-user limit too low for future team | Low | Medium | Document limit; plan upgrade path if team or internal users grow. |
| Some security settings only in Dashboard | Low | Medium | Document which settings are in Terraform vs Dashboard; aim to codify where provider supports it. |

---

## Success Metrics

- **Coverage**: 100% of public application traffic (website + API) is proxied through Cloudflare with SSL, WAF (free ruleset), and Bot Fight Mode enabled.
- **Cost**: $0 additional Cloudflare spend for the security features in scope.
- **Operational**: Security configuration is documented and can be re-applied or audited within one working day.
- **Incident readiness**: Security Level and (if used) Under Attack mode are documented so they can be applied during an incident.

---

## Related Documentation

- [High-Level Design](../../architecture/high-level-design.md) – System architecture and security principles  
- [ADR-001: Cloudflare Stack](../../architecture/decisions/001-cloudflare-stack.md)  
- [ADR-005: Cost-Optimized Cloudflare](../../architecture/decisions/005-cost-optimized-cloudflare.md)  
- [Infrastructure](../../architecture/infrastructure.md)  
- [API README](../../api/README.md)  
- [Documentation Standards](../../standards/documentation-standards.md)  

*A Technical Plan for Free Cloudflare Security (implementation details, Terraform/Dashboard steps, Worker rate-limiting design) should be created after this PRD is approved.*
