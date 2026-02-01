# TP-010: ContextStream Knowledge Ingest Implementation

**Doc type**: Technical Plan | **ID**: TP-010 | **Implements**: [PRD-010: ContextStream Knowledge Ingest (GitHub API)](../../product/contextstream-agents/002-contextstream-knowledge-ingest.md) | **Related**: [ContextStream mapping](../../guides/contextstream-mapping.md), [ContextStream knowledge ingest guide](../../guides/contextstream-ingest.md), [PRD-009: ContextStream and Agent/Cursor Interactions](../../product/contextstream-agents/001-contextstream-agent-cursor-interactions.md)

**Status**: Draft  
**Version**: 1.0  
**Date**: 2026-02-01  
**Owner**: Development Team

## Overview

This Technical Plan implements PRD-010: a GitHub-API-based ingestion system that automatically fetches repository documents and uploads them to ContextStream (or any Knowledge Center) with metadata that enables knowledge graph linking (PR ↔ Tech Plan ↔ PRD).

## Architecture

### Components

- **`scripts/contextstream-ingest.js`** — Node.js script that:
  - Lists repository files using GitHub Git Trees API (recursive)
  - Fetches file content using GitHub Contents API (Base64 decode)
  - Extracts metadata (doc IDs, related/implements, paths) from documents and traceability mapping
  - Streams documents to Knowledge Center ingestion endpoint with metadata
- **`.github/workflows/contextstream-ingest.yml`** — GitHub Actions workflow that:
  - Triggers on push to `main` and manual dispatch
  - Runs the ingestion script with GitHub Actions secrets
  - Includes concurrency control to prevent duplicate runs
- **`docs/guides/contextstream-ingest.md`** — Documentation explaining the ingestion flow, configuration, and metadata mapping

### Data Flow

1. **GitHub Actions trigger** — Push to `main` or manual `workflow_dispatch` triggers workflow
2. **File discovery** — Script calls Git Trees API (`/repos/{owner}/{repo}/git/trees/{ref}?recursive=1`) to get all files
3. **File filtering** — Script filters files by path prefixes, extensions, excludes (build artifacts, node_modules, etc.)
4. **Content fetching** — For each file, script calls Contents API (`/repos/{owner}/{repo}/contents/{path}?ref={ref}`) and decodes Base64
5. **Traceability mapping** — Script fetches `.github/traceability-mapping.yaml` and parses doc ID → path mapping
6. **Metadata extraction** — For each document:
   - Extract doc ID from traceability mapping (preferred) or doc header/content
   - Extract doc type from path or doc header
   - Parse Related/Implements IDs from doc content
   - Resolve related paths from markdown links and traceability mapping
   - Build metadata object (doc_id, doc_type, related_ids, implements_ids, related_paths, source_url, etc.)
7. **Batching** — Files processed in batches with configurable concurrency and delay
8. **Upload** — Each document uploaded to Knowledge Center endpoint (`/api/v1/knowledge/upload`) with metadata
9. **Error handling** — Failures logged, processing continues, script exits non-zero if any failures

## Implementation Details

### Script Structure (`scripts/contextstream-ingest.js`)

#### Configuration (env vars)
- `GITHUB_TOKEN` / `GH_TOKEN` — GitHub PAT or Actions token
- `GITHUB_REPOSITORY` — Repository slug (owner/repo)
- `GITHUB_REF_NAME` / `GITHUB_REF` / `GITHUB_SHA` — Git ref (branch/tag/commit)
- `KNOWLEDGE_API_URL` / `CONTEXTSTREAM_API_URL` — Knowledge Center endpoint URL
- `KNOWLEDGE_API_KEY` / `CONTEXTSTREAM_API_KEY` — API key for authentication
- `KNOWLEDGE_UPLOAD_MODE` — Upload mode: `stream` (default), `json`, `multipart`
- `KNOWLEDGE_UPLOAD_CONCURRENCY` — Parallel uploads (default 4)
- `KNOWLEDGE_UPLOAD_BATCH_SIZE` — Batch size (default 20)
- `KNOWLEDGE_UPLOAD_DELAY_MS` — Delay between batches (default 1500ms)
- `KNOWLEDGE_MAX_FILE_SIZE_KB` — Max file size (default 512KB)
- `DRY_RUN` — Skip uploads, log only (default false)
- `DOC_PATH_PREFIXES` — Comma-separated doc path prefixes
- `DOC_EXTRA_FILES` — Comma-separated root-level files to include
- `DOC_EXTENSIONS` — Comma-separated file extensions
- `DOC_EXCLUDE_PREFIXES` — Comma-separated paths to exclude
- `DOC_EXCLUDE_FILES` — Comma-separated files to exclude

#### Key Functions

- `fetchGitTree(owner, repo, ref)` — Calls Git Trees API, returns tree array
- `fetchRepoContent(owner, repo, ref, filePath)` — Calls Contents API, returns decoded Buffer
- `parseTraceabilityMapping(text)` — Parses YAML mapping, returns `{ pathById, idByPath }`
- `extractMetadata({ content, filePath, blobSha, repoInfo, mapping })` — Extracts doc ID, type, related/implements, paths, builds metadata object
- `uploadDocument({ content, metadata })` — Uploads document to Knowledge Center endpoint
- `mapWithConcurrency(items, limit, handler)` — Processes items with concurrency limit
- `githubRequestJson(url, token, options)` — GitHub API request with rate limit handling

#### ContentStream Class

Simple `Readable` stream wrapper that converts data (Buffer/String/JSON) to a stream for upload.

#### Rate Limit Handling

- Detects 403/429 responses
- Reads `x-ratelimit-reset` header
- Calculates wait time (reset timestamp - now)
- Waits and retries request

#### Metadata Extraction Logic

1. **Doc ID** (priority order):
   - From traceability mapping (`.github/traceability-mapping.yaml`) — highest priority
   - From doc header ("Doc type: ... | ID: ...")
   - From content (first PRD-XXX/TP-XXX/ADR-XXX found in header)
2. **Doc type**:
   - From doc header ("Doc type: ...")
   - Inferred from path (docs/product/ → PRD, docs/tech-plans/ → Tech Plan, etc.)
3. **Related/Implements IDs**:
   - Parsed from doc header lines containing "Related" or "Implements"
   - Uses regex to find PRD-XXX/TP-XXX/ADR-XXX patterns
4. **Related paths**:
   - From markdown links in content (resolved relative to file path)
   - From traceability mapping (for Related/Implements IDs)
5. **Warnings**:
   - If doc ID missing for PRD/TP/ADR files
   - If doc ID mismatch between mapping and content

### GitHub Actions Workflow (`.github/workflows/contextstream-ingest.yml`)

- **Triggers**: `push` to `main`, `workflow_dispatch` (with optional `dry_run` input)
- **Concurrency**: Group `contextstream-ingest-${{ github.ref }}`, cancel in-progress
- **Permissions**: `contents: read` (for GitHub API access)
- **Steps**:
  1. Checkout repository
  2. Setup Node.js 20
  3. Run ingestion script with env vars from secrets

### Documentation (`docs/guides/contextstream-ingest.md`)

- Overview of ingestion flow (GitHub API → Knowledge Center)
- Metadata mapping explanation (how doc IDs, related/implements enable graph linking)
- Configuration reference (all env vars)
- Running locally vs GitHub Actions
- Notes on rate limiting, file filtering, metadata extraction

## Testing Strategy

### Manual Testing

1. **Local dry run**:
   ```bash
   GITHUB_TOKEN=ghp_... DRY_RUN=true node scripts/contextstream-ingest.js
   ```
   - Verify file discovery (correct files included/excluded)
   - Verify metadata extraction (doc IDs, related/implements)
   - Verify no uploads occur

2. **Local with upload**:
   ```bash
   GITHUB_TOKEN=ghp_... \
   KNOWLEDGE_API_URL=https://api.contextstream.io/api/v1/knowledge/upload \
   CONTEXTSTREAM_API_KEY=cs_... \
   node scripts/contextstream-ingest.js
   ```
   - Verify uploads succeed
   - Verify metadata included in uploads
   - Check Knowledge Center for ingested documents

3. **GitHub Actions**:
   - Push to `main` and verify workflow runs
   - Check workflow logs for progress and any failures
   - Verify documents appear in Knowledge Center

### Edge Cases

- **Rate limits**: Test with large repository, verify rate limit handling
- **Missing traceability mapping**: Verify script continues without mapping
- **Malformed docs**: Verify warnings logged, processing continues
- **Large files**: Verify files over size limit are skipped
- **Network errors**: Verify retry logic or graceful failure

## Deployment

1. **Script**: Already in `scripts/contextstream-ingest.js`
2. **Workflow**: Already in `.github/workflows/contextstream-ingest.yml`
3. **Documentation**: Already in `docs/guides/contextstream-ingest.md`
4. **Secrets**: Repository maintainer must configure:
   - `CONTEXTSTREAM_API_KEY` (or `KNOWLEDGE_API_KEY`)
   - `CONTEXTSTREAM_API_URL` (or `KNOWLEDGE_API_URL`, optional)

After merge to `main`, workflow will run automatically on next push (if secrets configured).

## Related Documentation

- [PRD-010: ContextStream Knowledge Ingest (GitHub API)](../../product/contextstream-agents/002-contextstream-knowledge-ingest.md)
- [ContextStream knowledge ingest guide](../../guides/contextstream-ingest.md)
- [ContextStream mapping](../../guides/contextstream-mapping.md)
- [PRD-009: ContextStream and Agent/Cursor Interactions](../../product/contextstream-agents/001-contextstream-agent-cursor-interactions.md)
