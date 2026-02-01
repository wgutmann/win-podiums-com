# Leveragable Lessons (Actionable)

Project-specific lessons for agents and contributors. See also [AGENTS.md](../../AGENTS.md) and [development guide](development.md).

## Lessons

1. **Maintain Docker ⇄ Worker parity**
   - **Lesson:** The Worker and Docker runtime must remain 1:1 (same app/config).
   - **Leverage:** Always test the API via Docker (`docker compose up`) and run tests against the Dockerized API. Do not create divergent "local vs Worker" flows.

2. **Terraform is out of scope**
   - **Lesson:** Terraform exists but is not part of the workflow.
   - **Leverage:** Avoid documenting or relying on Terraform unless explicitly requested.

3. **Phase 1 is implemented, but not activated**
   - **Lesson:** Phase 1 code is done, but the system isn't live.
   - **Leverage:** Your "activation" steps are: apply D1 migrations, configure Discord + `.dev.vars`, test locally, deploy with Wrangler.

4. **D1 schema exists but must be applied**
   - **Lesson:** Tables are defined but not created yet.
   - **Leverage:** Run `wrangler d1 migrations apply` when ready; expect empty tables until you do.

5. **Auth flow priorities are fixed**
   - **Lesson:** Plugin auth should be browser PKCE as primary; manual token is debug-only.
   - **Leverage:** Keep manual token gated/flagged and avoid treating it as a production path.

6. **Secrets must never be committed**
   - **Lesson:** `.dev.vars` and secrets stay local only.
   - **Leverage:** Use `.dev.vars.example` as a template; never commit the real file.

7. **Docs & API spec must stay aligned**
   - **Lesson:** OpenAPI is authoritative; routes must match docs.
   - **Leverage:** Update `docs/api/openapi.yaml` whenever endpoints change and keep `/api-docs` valid.

8. **Traceability is required**
   - **Lesson:** PRs must connect code to PRD/TP docs via template + labels.
   - **Leverage:** Always include traceability mappings and doc links in PRs.

9. **Testing gate before pushing**
   - **Lesson:** At least 80% of tests must pass before pushing.
   - **Leverage:** Use the pre-push check (`scripts/pre-push-check.js`) and block pushes below the threshold.

10. **SimHub plugin scope is deliberately minimal**
    - **Lesson:** SimHub SDK wiring and position detection are deferred.
    - **Leverage:** Don't expand plugin scope beyond PKCE auth + heartbeat unless Phase 2 is explicitly started.

11. **"Next steps" are fixed sequence**
    - **Lesson:** The documented progression is: test locally → deploy.
    - **Leverage:** Don't skip local validation; deployment should follow successful local runs.

12. **Use domain skills/subagents**
    - **Lesson:** Domain-specific guidance exists (Cloudflare Workers, SimHub plugin, Discord auth, security).
    - **Leverage:** Apply the matching skill/subagent for any related change.

## ContextStream

When ContextStream MCP is enabled, these lessons can be synthesized from project memory. See [AI tooling (optional)](development.md#ai-tooling-optional).

### Enable ContextStream MCP

1. **Copy MCP config:** Copy `.cursor/mcp.json.example` to `.cursor/mcp.json` (or merge into existing).
2. **Set API key:** Replace `PASTE_YOUR_CONTEXTSTREAM_API_KEY_HERE` with a real ContextStream API key.
3. **Restart Cursor** so MCP loads.

### Bootstrap project memory (one-time)

ContextStream needs project context before it can synthesize lessons. From the development guide:

1. Call `session_init(folder_path=<repo root>, context_hint="WinPodiums Phase 1 MVP: Worker + SimHub plugin; Docker and Worker 1:1")`.
2. Use `session(action="capture", event_type="decision", ...)` for each key decision (ADRs, Worker=Docker, Terraform out of scope, etc.).
3. Use `session(action="capture_lesson", ...)` for each of the 12 lessons so they live in ContextStream memory.

### Use ContextStream for lessons

Once bootstrapped:

- **`session(action="get_lessons", query="<topic>")`** — Returns lessons relevant to a topic.
- **`context(user_message="...")`** — Surfaces relevant decisions and lessons when you ask questions.

The static list above remains the source of truth; ContextStream returns contextualized subsets when you query (e.g. "lessons for auth changes" or "lessons for deployment").
