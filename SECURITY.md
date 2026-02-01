# Security Policy

**Status: stub** — full policy will be added before production use.

## Supported versions

No production release yet. Security policy and supported versions will be defined when the project ships.

## Reporting a vulnerability

If you believe you have found a security vulnerability:

1. **Do not** open a public issue.
2. Contact the maintainers privately (e.g. via GitHub Security Advisories or the contact method listed in the repo when available).
3. Provide a clear description and steps to reproduce.

We will acknowledge receipt and work with you to understand and address the issue.

## Recommended security automation

The repository does **not** ship GitHub Actions by default. We **recommend** adding a security workflow under `.github/workflows/` for teams that want automated checks on push/PR:

- **Secret scanning**: e.g. TruffleHog to scan commits and the working tree for leaked credentials.
- **Dependency audits**: `npm audit` (API) and `dotnet list package --vulnerable` (plugin); fail on high/critical or known-vulnerable packages.
- **Code scanning (SAST)**: e.g. CodeQL for TypeScript and C#; results in the Security tab and on pull requests.

[Dependabot](.github/dependabot.yml) opens PRs for npm, NuGet, and GitHub Actions updates on a weekly schedule.

## Good practices (for contributors)

- Do not commit secrets, tokens, or credentials. Use `.dev.vars` (Cloudflare) or env-specific files; keep them out of version control (see [.gitignore](.gitignore)).
- Follow least-privilege for Discord OAuth scopes and API access (see [discord-authentication](.cursor/skills/discord-authentication/) and [ADR-002](docs/architecture/decisions/002-discord-oauth.md)).
