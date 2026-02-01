# CI performance and filtered-running evaluation

**Last updated**: 2026-02-01

This doc evaluates GitHub Actions performance and path-/condition-based filtering so we can reduce time and cost without losing coverage.

---

## Current behavior (summary)

| Workflow   | When it runs (push to main) | When it runs (PR) | Path filter at trigger? |
|-----------|-----------------------------|-------------------|--------------------------|
| **CI**    | Every push                  | When api/plugin/docs-api change | PR only; **push has none** |
| **Security** | When apps/manifests change | Same paths        | Yes (push + PR)          |
| **Doc check** | When docs/config change   | Same paths        | Yes (push + PR)          |
| **Diagrams**  | When diagram paths change  | Same paths        | Yes (push + PR)          |

- **CI** is the only workflow that runs on **every** push to `main` (no `paths:` on `push`). The jobs inside are path-filtered, so we still pay for one job (Paths filter) on docs-only or infra-only pushes.
- **Security** and **Doc check** already use path filters on both push and PR.
- **Concurrency** (`cancel-in-progress: true`) is set in all workflows — good for saving minutes when new commits are pushed.

---

## Improvements by impact

### High impact

#### 1. Add path filter to CI on **push** (not just PR)

**Problem**: Every push to `main` triggers CI and runs at least the Paths filter job, even when only `docs/`, `infra/`, or `.github/` change.

**Change**: Add the same `paths:` to `push:` as used for `pull_request:` in `.github/workflows/ci.yml`.

```yaml
on:
  push:
    branches: [main]
    paths:
      - "apps/api/**"
      - "apps/plugin/**"
      - "docs/api/**"
      - ".github/workflows/ci.yml"
  pull_request:
    branches: [main]
    paths:
      - "apps/api/**"
      - "apps/plugin/**"
      - "docs/api/**"
      - ".github/workflows/ci.yml"
```

**Effect**: Pushes that only touch docs (outside `docs/api/`), infra, or other config no longer start CI. Saves one workflow run + one job per such push. **Recommended.**

---

#### 2. Run CodeQL only for languages that changed (Security)

**Problem**: Security runs two CodeQL matrix jobs (javascript-typescript, csharp) whenever `code` filter is true (any change under `apps/api/**` or `apps/plugin/**`). So an API-only change still runs C# CodeQL, and a plugin-only change still runs JS/TS CodeQL.

**Change**: Make CodeQL language(s) conditional on path-filter outputs in `.github/workflows/security.yml`:

- Add a job (or step) that sets a matrix or output like `languages: '[javascript-typescript]'` when only API changed, `'[csharp]'` when only plugin changed, `'[javascript-typescript,csharp]'` when both changed.
- Use that in the CodeQL job’s `strategy.matrix.language` (or run the CodeQL job twice with different `if` and single-language matrix).

**Effect**: Cuts CodeQL from 2 jobs to 1 when only one app changed. CodeQL is often the slowest part of Security; this can save several minutes per run. **Recommended.**

---

### Medium impact

#### 3. Add NuGet cache to CI plugin-build

**Problem**: In `ci.yml`, the plugin-build job does `dotnet restore` + `dotnet build` with no NuGet cache. The Security workflow already uses `cache: "nuget"` for the .NET job.

**Change**: In `.github/workflows/ci.yml`, in the plugin-build job, add the same cache as in Security:

```yaml
- name: Setup .NET
  uses: actions/setup-dotnet@v4
  with:
    dotnet-version: "8.0.x"
    cache: "nuget"
    cache-dependency-path: apps/plugin/WinPodiums.Plugin/WinPodiums.Plugin.csproj
```

**Effect**: Faster `dotnet restore` on repeated runs. **Recommended.**

---

#### 4. Cache or avoid repeated Mermaid Docker pulls (Doc check / Diagrams)

**Problem**: Doc check’s `mermaid-validate` and Diagrams’ `validate` use `docker run ... minlag/mermaid-cli`. Each run can pull the image if not cached.

**Options** (pick one or combine):

- Use a job-level `container` so the runner already has the image, or use an action that embeds Mermaid (if available).
- Add a step that pulls the image once and rely on the runner’s Docker layer cache (e.g. `docker pull minlag/mermaid-cli` in a prior step) so subsequent `docker run` steps don’t re-pull.
- If you have a self-hosted runner with the image pre-pulled, no change needed.

**Effect**: Reduces latency on doc/diagram jobs when the image isn’t cached. **Optional.**

---

#### 5. Optional: Run TruffleHog only when “sensitive” paths change

**Problem**: The Security workflow runs the Secret scan (TruffleHog) on every run, regardless of which paths triggered the workflow. So a change only to `apps/api/package-lock.json` still runs a full repo secret scan.

**Change**: Add a path filter (e.g. `sensitive`) that includes code and config that might contain secrets (e.g. `apps/**`, `.env*`, `**/*.tf`, `.github/**`), and run the `secrets` job only when that filter matches. Exclude pure lockfiles or non-sensitive config if you want.

**Risks**: If someone adds a secret in a file outside the filter, the job won’t run. So the filter must be broad enough (e.g. all of `apps/` and CI/config). **Evaluate risk vs. time; only do if you’re comfortable with the trade-off.**

---

### Lower impact / already good

- **Concurrency**: Already in place; keeps runs from piling up. **No change.**
- **Path filtering inside workflows**: CI (api vs plugin), Security (api vs plugin vs code), Doc check (docs vs mermaid vs openapi) already limit which jobs run. **No change.**
- **CodeQL skip on draft PRs**: Security already skips CodeQL on draft PRs. **No change.**
- **Caching**: CI api-validate uses `cache: "npm"`; Security uses npm and NuGet caches. **Only gap was plugin-build NuGet (see #3).**
- **Diagrams sync job**: Placeholder; low cost. **No change.**

---

## Duplicate work (optional to optimize)

- **OpenAPI validation** runs in:
  - CI `api-validate` when api/docs-api change
  - Doc check `openapi-docs` when `docs/api/**` change  
  So a change that touches both `apps/api` and `docs/api` runs Spectral twice. Acceptable for workflow independence; could be deduplicated later (e.g. single “openapi” job in one workflow) if desired.

- **Mermaid validation** appears in both Doc check (`mermaid-validate`) and Diagrams (`validate`), with slightly different path triggers. Could be consolidated into one workflow if you want one source of truth; otherwise keeping both is fine for clarity.

---

## Suggested order of implementation

1. **Add path filter to CI on push** — small change, avoids entire CI runs on irrelevant pushes.
2. **CodeQL language matrix by changed app** — one workflow file change, significant time saved on Security.
3. **NuGet cache for CI plugin-build** — one small addition in `ci.yml`.

Then, if you still want more savings:

4. Mermaid image/cache or container usage.
5. Optional TruffleHog path filter after validating the risk.

---

## Implemented (2026-02-01)

- **CI path filter on push**: Same `paths:` as PR added to `push:` so CI does not run on docs-only or infra-only pushes to `main`.
- **CodeQL language matrix by changed app**: Security filter now has `api_code` and `plugin_code`; CodeQL runs only javascript-typescript when only API changed, only csharp when only plugin changed, both when both changed.
- **NuGet cache in CI plugin-build**: `cache: "nuget"` and `cache-dependency-path` added so plugin restore is cached.

---

## Security workflow: slowness and apparent hangs

**Last updated**: 2026-02-01

### Why it feels “hung”

1. **No job timeouts** — Jobs can run up to GitHub’s default limit (6 hours). If TruffleHog or CodeQL is slow or stuck, the whole run appears hung until it finishes or hits that limit.
2. **revert-on-failure waits for all jobs** — It has `needs: [secrets, deps-npm, deps-dotnet, codeql]`. The workflow does not “complete” until the slowest of those jobs (or skipped equivalents) finishes. So one slow job makes the whole run feel long.
3. **TruffleHog** — Uses full checkout (`fetch-depth: 0`) and scans the repo. The action already scopes by event (PR = base..head, push = before..after), but clone + Docker pull + scan can still take several minutes. Using `@main` can pull a broken or slow action version.
4. **CodeQL** — SAST is heavy; `security-extended` adds more queries. Even with one language, init + build + analyze can take 10–30+ minutes. No timeout means it can run until the 6-hour cap.

### Changes that help

- **Add `timeout-minutes` to every Security job** — Fail fast instead of hanging. Suggested: filter 5, secrets 20, deps-npm 15, deps-dotnet 15, codeql 45, revert-on-failure 10.
- **Pin TruffleHog to a release tag** — Use e.g. `trufflesecurity/trufflehog@v3.x` instead of `@main` for stable, reproducible runs and to avoid bad `main` builds.
- **Keep existing optimizations** — CodeQL already runs only for changed languages; path filters already limit when the workflow runs.

### Implemented (security slowness)

- Job timeouts added to all Security jobs (filter 5, secrets 20, deps 15, codeql 45, revert 10).
- TruffleHog pinned to `v3.92.5` instead of `@main` for stable, reproducible runs.

---

## References

- Workflows: `.github/workflows/ci.yml`, `security.yml`, `doc-check.yml`, `diagrams.yml`
- Development and pre-push: `docs/guides/development.md`, `scripts/pre-push-check.js`
- [GitHub Actions job timeout](https://docs.github.com/en/actions/reference/workflows-and-activities#jobsjob_idtimeout-minutes)
- [CodeQL analysis takes too long](https://docs.github.com/en/code-security/code-scanning/troubleshooting-code-scanning/analysis-takes-too-long)
