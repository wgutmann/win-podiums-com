# PR Description: SimHub Plugin + Phase 1 (ContextStream traceability)

**Use this when opening a PR** for the SimHub plugin / Phase 1 branch. Copy the sections below into the PR description so the PR is linked to PRD-001 and TP-SPOC-001–005 for ContextStream (PR ↔ Tech Plan ↔ PRD). See [ContextStream mapping §1.4](docs/guides/contextstream-mapping.md#14-linking-pull-requests-to-tech-plans-and-prds-graph-visible).

---

## Summary

- **Doc-check**: Excluded localhost URLs in Lychee; fixed plugin README path in development.md (`../../apps/plugin/README.md`).
- **Login (API)**: D1 migrations at Docker startup; CA certificates in image for Discord TLS; production callback `/api/auth/callback` to match Discord redirects; docs updated.
- **SimHub plugin**: Deploy script defaults to SimHub install root; simhub-plugin-deploy skill; IWPFSettings + SettingsControl (WPF) so UI is **accessible via the enabled feature menu on the left** (status, API URL, Link to Discord, manual token, Send heartbeat, Log out).
- **Docs**: Phase 1 scope, PRD-001 (FR-004, NFR-001), TP-SPOC-004, TP-SPOC-005, SimHub LLD, next-steps, plugin README, .cursor/docs updated for left-menu UI requirements.
- **PRD:** [PRD-001 SimHub Plugin POC](docs/product/simhub-plugin-poc/001-simhub-plugin-poc.md)
- **Tech Plan(s):** [TP-SPOC-001](docs/tech-plans/simhub-plugin-poc/001-plugin-skeleton-sdk-config.md), [TP-SPOC-002](docs/tech-plans/simhub-plugin-poc/002-auth-pkce-token-storage.md), [TP-SPOC-003](docs/tech-plans/simhub-plugin-poc/003-api-client-heartbeat.md), [TP-SPOC-004](docs/tech-plans/simhub-plugin-poc/004-minimal-simhub-ui.md), [TP-SPOC-005](docs/tech-plans/simhub-plugin-poc/005-poc-testing-completion.md)

### PRD and tech plan docs (link the ones this PR touches)

| Doc | Link |
|-----|------|
| **PRD-001** SimHub Plugin POC | [docs/product/simhub-plugin-poc/001-simhub-plugin-poc.md](docs/product/simhub-plugin-poc/001-simhub-plugin-poc.md) |
| **TP-SPOC-001** Plugin Skeleton, SDK, Config | [docs/tech-plans/simhub-plugin-poc/001-plugin-skeleton-sdk-config.md](docs/tech-plans/simhub-plugin-poc/001-plugin-skeleton-sdk-config.md) |
| **TP-SPOC-002** Auth (PKCE, Token Storage) | [docs/tech-plans/simhub-plugin-poc/002-auth-pkce-token-storage.md](docs/tech-plans/simhub-plugin-poc/002-auth-pkce-token-storage.md) |
| **TP-SPOC-003** API Client and Heartbeat | [docs/tech-plans/simhub-plugin-poc/003-api-client-heartbeat.md](docs/tech-plans/simhub-plugin-poc/003-api-client-heartbeat.md) |
| **TP-SPOC-004** Minimal SimHub UI | [docs/tech-plans/simhub-plugin-poc/004-minimal-simhub-ui.md](docs/tech-plans/simhub-plugin-poc/004-minimal-simhub-ui.md) |
| **TP-SPOC-005** POC Testing and Completion | [docs/tech-plans/simhub-plugin-poc/005-poc-testing-completion.md](docs/tech-plans/simhub-plugin-poc/005-poc-testing-completion.md) |
| **Phase 1 MVP Scope** | [docs/product/phase-1-mvp-scope.md](docs/product/phase-1-mvp-scope.md) |

## Traceability (ContextStream / knowledge graph)

**Required.** Same IDs and doc paths as in the Summary so the ContextStream knowledge graph can show PR ↔ Tech Plan ↔ PRD. See [ContextStream mapping §1.4](docs/guides/contextstream-mapping.md#14-linking-pull-requests-to-tech-plans-and-prds-graph-visible).

- **Implements (Tech Plan):** `TP-SPOC-001`, `TP-SPOC-002`, `TP-SPOC-003`, `TP-SPOC-004`, `TP-SPOC-005`
- **PRD:** `PRD-001`
- **Doc paths (for implementation event):**  
  `docs/product/simhub-plugin-poc/001-simhub-plugin-poc.md`,  
  `docs/tech-plans/simhub-plugin-poc/001-plugin-skeleton-sdk-config.md`,  
  `docs/tech-plans/simhub-plugin-poc/002-auth-pkce-token-storage.md`,  
  `docs/tech-plans/simhub-plugin-poc/003-api-client-heartbeat.md`,  
  `docs/tech-plans/simhub-plugin-poc/004-minimal-simhub-ui.md`,  
  `docs/tech-plans/simhub-plugin-poc/005-poc-testing-completion.md`,  
  `docs/product/phase-1-mvp-scope.md`,  
  `docs/design/components/simhub-plugin.md`

*(When capturing an implementation event in ContextStream, include the PR URL and these doc paths so the graph UI shows PR → implementation → TP docs → PRD.)*

## After opening the PR (ContextStream + labels)

1. **ContextStream (when MCP available):** Capture an implementation event so the graph shows **PR ↔ Tech Plan ↔ PRD**:
   - `session(action="capture", event_type="implementation", title="PR #<number>: <short summary> (TP-SPOC-004)", content="<PR URL>. Implements TP-SPOC-001–005, PRD-001.", provenance={ pr_url: "<PR URL>" }, code_refs=[ { file_path: "docs/product/simhub-plugin-poc/001-simhub-plugin-poc.md" }, { file_path: "docs/tech-plans/simhub-plugin-poc/001-plugin-skeleton-sdk-config.md" }, { file_path: "docs/tech-plans/simhub-plugin-poc/002-auth-pkce-token-storage.md" }, { file_path: "docs/tech-plans/simhub-plugin-poc/003-api-client-heartbeat.md" }, { file_path: "docs/tech-plans/simhub-plugin-poc/004-minimal-simhub-ui.md" }, { file_path: "docs/tech-plans/simhub-plugin-poc/005-poc-testing-completion.md" }, { file_path: "docs/product/phase-1-mvp-scope.md" }, { file_path: "docs/design/components/simhub-plugin.md" } ])`
   - See [ContextStream mapping §1.4](docs/guides/contextstream-mapping.md#14-linking-pull-requests-to-tech-plans-and-prds-graph-visible).
2. **Labels:** Labels are created from [.github/labels.yml](.github/labels.yml) (labels-as-code). To add or change labels, edit that file in a PR and merge; [sync-repo-labels](.github/workflows/sync-repo-labels.yml) will create/update them. If [.github/workflows/pr-labels.yml](.github/workflows/pr-labels.yml) is enabled, **prd-PRD-001** and **tech-plan-TP-SPOC-004** (and **tech-plan-TP-SPOC-001** through **TP-SPOC-005** as desired) may be added automatically when this PR body is used; otherwise add manually or via `gh pr edit --add-label prd-PRD-001 tech-plan-TP-SPOC-004`.

## Risk

- [ ] low — Doc and config changes; plugin UI and API fixes are backward-compatible; deploy script path change documented.

## Test plan

- [ ] Run pre-push checks (typecheck, lint, plugin build, worker smoke, OpenAPI validation).
- [ ] Doc-check passes (Lychee, markdownlint, Mermaid, Spectral).
- [ ] Manual: Docker up → login flow (Gate → Discord → callback); plugin deploy → SimHub → select WinPodiums in left menu → see settings panel; heartbeat and manual token.

## Rollback

- Revert merge; redeploy Worker if needed; plugin users re-deploy previous DLL.

## Product impact

- [x] **Does this change scope, requirements, or user-facing copy?** Yes — PRD/TP and Phase 1 scope docs updated; plugin UI strings and doc copy.
  - Product review optional for this PR; changes align to existing PRD-001 and TP-SPOC-004.
