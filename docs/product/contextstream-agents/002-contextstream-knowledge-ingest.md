# PRD-011: ContextStream Knowledge Ingest (GitHub API)

**Doc type**: PRD | **ID**: PRD-011 | **Related**: [PRD-009: ContextStream and Agent/Cursor Interactions](001-contextstream-agent-cursor-interactions.md), [ContextStream mapping](../../guides/contextstream-mapping.md), [ContextStream knowledge ingest guide](../../guides/contextstream-ingest.md) | **Technical Plans**: [TP-011](../../tech-plans/contextstream-agents/002-contextstream-knowledge-ingest-implementation.md)

**Status**: Draft  
**Version**: 1.0  
**Date**: 2026-02-01  
**Owner**: Product / Engineering  
**Related**: [PRD-009: ContextStream and Agent/Cursor Interactions](001-contextstream-agent-cursor-interactions.md), [ContextStream mapping](../../guides/contextstream-mapping.md), [ContextStream knowledge ingest guide](../../guides/contextstream-ingest.md), [development guide – AI tooling](../../guides/development.md#ai-tooling-optional)

## Overview

### Problem Statement

ContextStream's knowledge graph requires documents to be indexed. Manual ingestion via `project(action="ingest_local")` works but:
- Must be run manually after each change
- Requires local setup and ContextStream MCP connection
- Does not automatically sync with GitHub repository state
- Does not leverage GitHub metadata (commit SHA, file paths, traceability mapping) for richer graph linking

### Solution

Automate document ingestion via GitHub REST API:
- GitHub Actions workflow runs on every push to `main` (and can be triggered manually)
- Script fetches repository documents using GitHub API (Git Trees API for file listing, Contents API for file content)
- Extracts metadata (doc IDs, Related/Implements, paths, SHA) from documents and traceability mapping
- Streams documents to ContextStream (or any Knowledge Center) ingestion endpoint with proper metadata for knowledge graph linking

### Success Criteria

- GitHub Actions workflow (`.github/workflows/contextstream-ingest.yml`) runs automatically on push to `main`
- Script (`scripts/contextstream-ingest.js`) successfully fetches all relevant documents from GitHub API
- Metadata extraction correctly identifies doc IDs (PRD-XXX, TP-XXX, ADR-XXX) from content and traceability mapping
- Documents are uploaded to Knowledge Center endpoint with metadata that enables PR ↔ Tech Plan ↔ PRD linking in the graph
- Documentation explains the ingestion flow, configuration, and metadata mapping

## User Stories

### As a Maintainer
- I want documents to be automatically ingested into ContextStream when pushed to `main` so the knowledge graph stays up to date without manual steps
- I want the ingestion to respect GitHub API rate limits and handle errors gracefully so it doesn't break CI/CD

### As a Contributor
- I want to understand how document metadata (doc IDs, Related/Implements) affects knowledge graph linking so I can write docs that link correctly
- I want to be able to run the ingestion script locally for testing (with `DRY_RUN=true`) without needing ContextStream API keys

### As an Agent (Cursor / AI)
- I want all repository documents to be indexed in ContextStream so search and graph tools can find and relate content accurately
- I want document metadata (doc IDs, paths, related links) to be correctly extracted so the knowledge graph shows PR ↔ Tech Plan ↔ PRD relationships

## Requirements

### Functional Requirements

#### FR-001: GitHub API Integration
- **Priority**: P0 (Critical)
- **Description**: Script must use GitHub REST API to list repository files (Git Trees API, recursive) and fetch file content (Contents API, Base64 decode). Must handle GitHub API rate limits (wait for reset, retry) and authentication (GITHUB_TOKEN).
- **Acceptance Criteria**:
  - Script successfully lists all files in repository using Git Trees API
  - Script fetches file content using Contents API and correctly decodes Base64
  - Rate limit handling: detects 403/429, reads `x-ratelimit-reset`, waits appropriately
  - Works with GitHub Actions `GITHUB_TOKEN` and local GitHub PAT

#### FR-002: Document Discovery and Filtering
- **Priority**: P0 (Critical)
- **Description**: Script must identify which files are documents to ingest. Include files under `docs/`, `.cursor/docs/`, `.cursor/agents/`, `.cursor/skills/`, `.cursor/rules/`, `.github/`, and root-level docs (README.md, CHANGELOG.md, etc.). Exclude `node_modules/`, build artifacts, binary files, and files over size limit.
- **Acceptance Criteria**:
  - Configurable via env vars (`DOC_PATH_PREFIXES`, `DOC_EXTRA_FILES`, `DOC_EXTENSIONS`, `DOC_EXCLUDE_PREFIXES`)
  - Defaults include all relevant doc paths and exclude build artifacts
  - Files over `KNOWLEDGE_MAX_FILE_SIZE_KB` are skipped with a warning

#### FR-003: Metadata Extraction
- **Priority**: P0 (Critical)
- **Description**: For each document, extract metadata that enables knowledge graph linking:
  - Doc ID (PRD-XXX, TP-XXX, ADR-XXX) from doc header, content, or traceability mapping
  - Doc type (PRD, Tech Plan, ADR, etc.) from path or doc header
  - Related IDs and Implements IDs from doc content
  - Related paths from markdown links and traceability mapping
  - Repository metadata (path, blob SHA, ref, source URL, raw URL)
- **Acceptance Criteria**:
  - Doc ID extracted from traceability mapping (`.github/traceability-mapping.yaml`) takes precedence
  - Doc ID from doc header ("Doc type: ... | ID: ...") is used if mapping not available
  - Related/Implements IDs parsed from doc content (header section)
  - Related paths resolved from markdown links and traceability mapping
  - Warning logged if doc ID missing for PRD/TP/ADR files
  - Warning logged if doc ID mismatch between mapping and content

#### FR-004: Knowledge Center Upload
- **Priority**: P0 (Critical)
- **Description**: Upload documents to Knowledge Center ingestion endpoint (`/api/v1/knowledge/upload` or configurable). Support multiple upload modes: stream (default, metadata in header), JSON (metadata + content in body), multipart (metadata + file as form data). Include all extracted metadata in upload.
- **Acceptance Criteria**:
  - Configurable endpoint URL via `KNOWLEDGE_API_URL` or `CONTEXTSTREAM_API_URL`
  - Authentication via `KNOWLEDGE_API_KEY` or `CONTEXTSTREAM_API_KEY`
  - Upload modes: stream (default), JSON, multipart
  - All metadata included in upload (doc_id, doc_type, related_ids, implements_ids, related_paths, etc.)
  - Error handling: log failures, continue with other files, exit non-zero if any failures

#### FR-005: GitHub Actions Workflow
- **Priority**: P0 (Critical)
- **Description**: GitHub Actions workflow runs ingestion script on every push to `main` and supports manual trigger (workflow_dispatch). Uses GitHub Actions secrets for API keys. Includes concurrency control to prevent duplicate runs.
- **Acceptance Criteria**:
  - Workflow triggers on `push` to `main` branch
  - Workflow supports `workflow_dispatch` with optional `dry_run` input
  - Uses `secrets.CONTEXTSTREAM_API_KEY` or `secrets.KNOWLEDGE_API_KEY`
  - Uses `secrets.CONTEXTSTREAM_API_URL` or `secrets.KNOWLEDGE_API_URL` (optional, defaults to ContextStream API)
  - Concurrency group prevents duplicate runs
  - Workflow logs show upload progress and any failures

#### FR-006: Rate Limiting and Batching
- **Priority**: P1 (High)
- **Description**: Implement batching and rate limiting to stay within GitHub API limits (5,000 requests/hour for authenticated users) and avoid overwhelming the Knowledge Center endpoint. Process files in batches with configurable concurrency and delay between batches.
- **Acceptance Criteria**:
  - Configurable batch size (`KNOWLEDGE_UPLOAD_BATCH_SIZE`, default 20)
  - Configurable concurrency (`KNOWLEDGE_UPLOAD_CONCURRENCY`, default 4)
  - Configurable delay between batches (`KNOWLEDGE_UPLOAD_DELAY_MS`, default 1500ms)
  - GitHub API rate limit handling (wait for reset, retry)
  - Progress logging shows batches processed

#### FR-007: Documentation
- **Priority**: P1 (High)
- **Description**: Document the ingestion flow, configuration options, metadata mapping, and how it enables knowledge graph linking. Link from development guide and ContextStream mapping docs.
- **Acceptance Criteria**:
  - Guide at `docs/guides/contextstream-ingest.md` explains:
    - What the script does (GitHub API → Knowledge Center)
    - Metadata mapping (doc IDs, related/implements, paths)
    - Configuration (env vars, upload modes)
    - Running locally vs GitHub Actions
  - Development guide references the ingestion guide
  - ContextStream mapping doc references the ingestion guide

### Non-Functional Requirements

#### NFR-001: Performance
- Script should process typical repository (100-500 docs) in under 5 minutes
- Batch processing and concurrency should minimize total time while respecting rate limits

#### NFR-002: Reliability
- Script should handle network errors, API rate limits, and malformed content gracefully
- Continue processing remaining files if one fails
- Exit with non-zero code if any uploads fail (so CI can detect failures)

#### NFR-003: Security
- Never log or expose API keys or tokens
- Use GitHub Actions secrets for sensitive configuration
- Script should work with read-only repository access (contents: read permission)

## Technical Constraints

- Must work with Node.js 20+ (for native fetch, FormData, Blob)
- Must respect GitHub API rate limits (5,000 requests/hour authenticated)
- Knowledge Center endpoint must accept the upload format (stream/JSON/multipart)
- Script should not require local repository clone (uses GitHub API only)

## Risks

- **GitHub API rate limits**: Large repositories may hit rate limits; mitigate with batching, delays, and rate limit detection/retry
- **Knowledge Center endpoint changes**: If endpoint format changes, script may break; mitigate with configurable upload mode and clear error messages
- **Metadata extraction failures**: Malformed docs may not extract metadata correctly; mitigate with warnings and fallback to path-based inference

## Related Documentation

- [TP-011: ContextStream Knowledge Ingest Implementation](../../tech-plans/contextstream-agents/002-contextstream-knowledge-ingest-implementation.md)
- [ContextStream knowledge ingest guide](../../guides/contextstream-ingest.md)
- [ContextStream mapping](../../guides/contextstream-mapping.md)
- [PRD-009: ContextStream and Agent/Cursor Interactions](001-contextstream-agent-cursor-interactions.md)
- [Development guide – AI tooling](../../guides/development.md#ai-tooling-optional)
