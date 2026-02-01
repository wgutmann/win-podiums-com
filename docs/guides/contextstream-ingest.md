# ContextStream knowledge ingest (GitHub API)

**Related:** [ContextStream mapping](contextstream-mapping.md), [Development guide - AI tooling](development.md#ai-tooling-optional), [Traceability mapping](../../.github/traceability-mapping.yaml)

This guide documents the GitHub-API based ingestion flow that ensures repo documents are indexed in ContextStream (or any Knowledge Center) and linked correctly in the knowledge graph.

## What the ingest script does

The script at `scripts/contextstream-ingest.js`:

1. **Lists files** with the **Git Trees API** (recursive tree).
2. **Fetches content** using the **Get Repository Content** endpoint.
3. **Streams data** via a `ContentStream` (Node.js `Readable` wrapper).
4. **Maps metadata** (doc IDs, related/implements, paths, SHA) so the knowledge graph can build links.
5. **Uploads** to a knowledge ingestion endpoint (default: `/api/v1/knowledge/upload`).

## Metadata mapping (graph linking)

Each uploaded document includes metadata fields that help ContextStream link graph nodes:

- `doc_id` and `doc_type` (extracted from the doc header or inferred from path)
- `related_ids` and `implements_ids` (parsed from **Related** / **Implements** lines)
- `related_paths` (resolved from markdown links and traceability mapping)
- `path`, `blob_sha`, `ref`, `source_url`, `raw_url`

**Why this matters:** When docs include **Related** / **Implements** (and stable IDs like PRD-XXX / TP-XXX), the ingest metadata reinforces those links so the knowledge graph can connect PRD <-> Tech Plan <-> ADR/Design consistently.

## GitHub Actions automation

`.github/workflows/contextstream-ingest.yml` runs on every push to `main` and can be triggered manually. It uses the GitHub API to fetch documents and pushes them to the Knowledge Center endpoint.

### Required secrets

- `CONTEXTSTREAM_API_KEY` (or `KNOWLEDGE_API_KEY`)
- `KNOWLEDGE_API_URL` (or `CONTEXTSTREAM_API_URL`, which defaults to `${CONTEXTSTREAM_API_URL}/api/v1/knowledge/upload`)

`GITHUB_TOKEN` is provided by GitHub Actions for API access.

## Running locally

Use a **GitHub PAT** with `repo` scope:

```bash
GITHUB_TOKEN=ghp_... \
KNOWLEDGE_API_URL=https://api.contextstream.io/api/v1/knowledge/upload \
CONTEXTSTREAM_API_KEY=cs_... \
node scripts/contextstream-ingest.js
```

## Configuration (optional)

| Env var | Purpose | Default |
|---|---|---|
| `DOC_PATH_PREFIXES` | Comma-separated doc roots | `docs/,.cursor/docs/,.cursor/agents/,.cursor/skills/,.cursor/rules/,.github/` |
| `DOC_EXTRA_FILES` | Extra root files to ingest | `README.md,CHANGELOG.md,CONTRIBUTING.md,SECURITY.md,AGENTS.md,.cursorrules` |
| `DOC_EXTENSIONS` | File extensions considered docs | `.md,.mdx,.txt,.mmd,.yaml,.yml,.json,.mdc` |
| `DOC_EXCLUDE_PREFIXES` | Paths to skip | `node_modules/,apps/api/dist/,apps/plugin/bin/,...` |
| `KNOWLEDGE_MAX_FILE_SIZE_KB` | Max size per doc | `512` |
| `KNOWLEDGE_UPLOAD_MODE` | `stream` (default), `json`, or `multipart` | `stream` |
| `KNOWLEDGE_UPLOAD_CONCURRENCY` | Parallel uploads | `4` |
| `KNOWLEDGE_UPLOAD_BATCH_SIZE` | Batch size | `20` |
| `KNOWLEDGE_UPLOAD_DELAY_MS` | Delay between batches | `1500` |
| `DRY_RUN` | Log only, no upload | `false` |

## Notes and guardrails

- The script targets **documents only**; large/binary files are skipped.
- Keep **Related** / **Implements** lines and stable IDs in docs to ensure correct graph links.
- If a doc ID exists in `.github/traceability-mapping.yaml`, it is used as the source of truth for `doc_id`.
