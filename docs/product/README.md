# Product Requirements Documents (PRDs)

Product Requirements Documents define **what to build and why**. They are written for product managers, stakeholders, architects, and senior engineers.

## Structure

PRDs follow the [WinPodiums Documentation Standards](../standards/documentation-standards.md), which incorporate WHOOP principles:
- **Automation**: Coupled with code changes
- **Discoverability**: Clear structure, index files
- **Standardization**: Uniform format
- **Collaboration**: Direct links, traceability

## Document Format

Each PRD includes:
- **Overview**: Problem statement, solution, success criteria
- **User Stories**: As a... I want... So that...
- **Requirements**: Functional (FR-XXX) and Non-Functional (NFR-XXX)
- **Technical Constraints**: Limitations and dependencies
- **Risks**: Risk assessment and mitigation
- **Success Metrics**: Quantifiable success criteria
- **Related Documentation**: Links to Technical Plans, ADRs, API specs

## Feature Areas

- [Brand and Design](brand/) - Design system, web presence, PM personality; Gate and landing align to brand (PRD-010, TP-010)
- [Cloudflare Security](cloudflare-security/) - Free Cloudflare security (DDoS, SSL, WAF, Bot Fight, Zero Trust, Worker rate limiting)
- [ContextStream and Agents](contextstream-agents/) - ContextStream MCP integration and agent/Cursor interaction rules (PRD-009, TP-009)
- [GitHub Traceability](github-traceability/) - Labels as code, traceability mapping, PR template (PRD-008, TP-008)
- [SimHub Auth](simhub-auth/) - Long-lived tokens and extended login for the SimHub plugin (PRD-001)
- [SimHub Plugin POC](simhub-plugin-poc/) - Minimal plugin proof-of-concept (browser auth primary; manual token debug-only, feature-flagged; one verification API call)
- [Telemetry Proof System](telemetry-proof-system/) - Multi-layered security system

## Traceability

PRDs trace to:
- **Technical Plans** (`docs/tech-plans/`) - Implementation details
- **ADRs** (`docs/architecture/decisions/`) - Architecture decisions
- **API Specs** (`docs/api/`) - API endpoints

## Standards

See [Documentation Standards](../standards/documentation-standards.md) for complete format and structure requirements.
