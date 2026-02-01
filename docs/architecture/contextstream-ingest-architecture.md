# ContextStream Knowledge Ingest Architecture

**Related**: [PRD-010: ContextStream Knowledge Ingest (GitHub API)](../product/contextstream-agents/002-contextstream-knowledge-ingest.md), [TP-010: ContextStream Knowledge Ingest Implementation](../tech-plans/contextstream-agents/002-contextstream-knowledge-ingest-implementation.md), [ContextStream knowledge ingest guide](../guides/contextstream-ingest.md)

## Overview

The ContextStream knowledge ingest system automates the process of indexing repository documents into ContextStream (or any Knowledge Center) using the GitHub REST API. This document describes the architecture, data flow, and design decisions.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Repository                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   docs/      │  │ .cursor/     │  │ .github/     │     │
│  │   *.md       │  │ *.mdc        │  │ mapping.yaml │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ GitHub REST API
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              GitHub Actions Workflow                        │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  contextstream-ingest.yml                            │ │
│  │  - Trigger: push to main / workflow_dispatch         │ │
│  │  - Secrets: CONTEXTSTREAM_API_KEY, API_URL           │ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ Executes
                          ▼
┌─────────────────────────────────────────────────────────────┐
│         contextstream-ingest.js Script                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ File         │  │ Metadata     │  │ Upload       │    │
│  │ Discovery    │→ │ Extraction   │→ │ & Batching   │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ HTTP POST
                          ▼
┌─────────────────────────────────────────────────────────────┐
│           Knowledge Center API                              │
│  POST /api/v1/knowledge/upload                              │
│  - Metadata: doc_id, doc_type, related_ids, paths           │
│  - Content: document body                                   │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│         ContextStream Knowledge Graph                       │
│  - Document nodes (PRD, TP, ADR)                           │
│  - Relationships (Related, Implements)                     │
│  - PR ↔ Tech Plan ↔ PRD links                              │
└─────────────────────────────────────────────────────────────┘
```

## Components

### 1. GitHub Actions Workflow

**File**: `.github/workflows/contextstream-ingest.yml`

**Responsibilities**:
- Trigger on push to `main` or manual dispatch
- Provide GitHub token for API access
- Inject secrets (API keys, endpoint URLs)
- Control concurrency to prevent duplicate runs

**Key Features**:
- Concurrency group: `contextstream-ingest-${{ github.ref }}`
- Cancels in-progress runs when new push occurs
- Supports `dry_run` input for manual testing

### 2. Ingestion Script

**File**: `scripts/contextstream-ingest.js`

**Responsibilities**:
- Discover repository files via GitHub API
- Fetch file content and decode Base64
- Extract metadata (doc IDs, related/implements, paths)
- Batch and upload documents to Knowledge Center

**Key Modules**:

#### File Discovery
- Uses Git Trees API (`/repos/{owner}/{repo}/git/trees/{ref}?recursive=1`)
- Filters by path prefixes, extensions, excludes
- Respects file size limits

#### Content Fetching
- Uses Contents API (`/repos/{owner}/{repo}/contents/{path}?ref={ref}`)
- Decodes Base64-encoded content
- Handles rate limits (403/429) with exponential backoff

#### Metadata Extraction
- Parses traceability mapping (`.github/traceability-mapping.yaml`)
- Extracts doc IDs from mapping (preferred) or doc headers
- Parses Related/Implements from doc content
- Resolves related paths from markdown links
- Builds comprehensive metadata object

#### Upload & Batching
- Processes files in batches with configurable concurrency
- Supports multiple upload modes (stream, JSON, multipart)
- Includes delay between batches to respect rate limits
- Continues on individual failures, exits non-zero if any fail

### 3. Knowledge Center API

**Endpoint**: `/api/v1/knowledge/upload` (configurable)

**Upload Modes**:

1. **Stream** (default):
   - Content: `application/octet-stream` body
   - Metadata: Base64-encoded JSON in `X-Document-Metadata` header

2. **JSON**:
   - Content: `application/json` body
   - Structure: `{ metadata: {...}, content: "...", encoding: "utf-8" }`

3. **Multipart**:
   - Content: `multipart/form-data`
   - Fields: `metadata` (JSON), `file` (Blob)

## Data Flow

### Phase 1: File Discovery

1. Script calls Git Trees API with `recursive=1`
2. Receives tree array with file paths, types, sizes, SHAs
3. Filters to documents only (by path prefixes, extensions)
4. Excludes build artifacts, node_modules, large files

### Phase 2: Traceability Mapping

1. Script fetches `.github/traceability-mapping.yaml` via Contents API
2. Parses YAML to build `pathById` and `idByPath` maps
3. Falls back gracefully if mapping missing or malformed

### Phase 3: Content & Metadata Extraction

For each document:

1. **Fetch content**: Calls Contents API, decodes Base64
2. **Extract doc ID** (priority):
   - From traceability mapping (if path matches)
   - From doc header ("Doc type: ... | ID: ...")
   - From content (first PRD-XXX/TP-XXX/ADR-XXX in header)
3. **Extract doc type**:
   - From doc header
   - Inferred from path (docs/product/ → PRD, etc.)
4. **Parse Related/Implements**:
   - Scans header lines for "Related" or "Implements"
   - Extracts IDs using regex (`PRD-\d+`, `TP-[A-Z0-9-]+`, etc.)
5. **Resolve related paths**:
   - From markdown links in content (relative to file path)
   - From traceability mapping (for Related/Implements IDs)
6. **Build metadata object**:
   - Repository info (slug, ref, path, blob SHA)
   - Document info (doc_id, doc_type, file_type)
   - Relationships (related_ids, implements_ids, related_paths)
   - URLs (source_url, raw_url)
   - Content hash (SHA-256) and size

### Phase 4: Upload & Batching

1. **Batch files**: Groups into batches of configurable size (default 20)
2. **Process with concurrency**: Uploads up to N files in parallel (default 4)
3. **Delay between batches**: Waits configurable ms (default 1500ms)
4. **Upload each document**:
   - Creates ContentStream (Readable) from content
   - Formats metadata according to upload mode
   - POSTs to Knowledge Center endpoint
   - Logs success/failure
5. **Error handling**: Continues on individual failures, logs warnings
6. **Exit status**: Non-zero if any uploads failed

## Rate Limiting Strategy

### GitHub API Limits

- **Authenticated**: 5,000 requests/hour
- **Detection**: Check `x-ratelimit-remaining` header
- **Handling**: On 403/429, read `x-ratelimit-reset`, wait until reset, retry

### Knowledge Center Limits

- **Batching**: Process in small batches (default 20)
- **Concurrency**: Limit parallel uploads (default 4)
- **Delays**: Wait between batches (default 1500ms)
- **Configurable**: All limits adjustable via env vars

## Metadata Schema

```typescript
interface DocumentMetadata {
  // Source
  source: 'github';
  repository: string;        // owner/repo
  ref: string;              // branch/tag/commit
  path: string;             // file path in repo
  blob_sha: string;         // Git blob SHA
  source_url: string;       // GitHub web URL
  raw_url: string;          // GitHub raw content URL

  // Document identity
  doc_id: string | null;    // PRD-XXX, TP-XXX, ADR-XXX
  doc_id_source: 'traceability_map' | 'content' | 'unknown';
  doc_type: string;         // PRD, Tech Plan, ADR, etc.
  file_type: string;        // .md, .yaml, etc.

  // Relationships
  related_ids: string[];    // PRD-XXX, TP-XXX from "Related"
  implements_ids: string[]; // PRD-XXX from "Implements"
  related_paths: string[]; // Resolved file paths
  related_paths_truncated: boolean;

  // Content
  content_sha256: string;   // SHA-256 of content
  content_bytes: number;   // Size in bytes

  // Warnings (optional)
  doc_id_missing?: boolean;
  doc_id_mismatch?: { mapping: string; content: string };
}
```

## Design Decisions

### 1. GitHub API vs Local Clone

**Decision**: Use GitHub API exclusively, no local clone required.

**Rationale**:
- Works in GitHub Actions without checkout step
- No need to manage Git state
- Can target any branch/tag/commit via API
- Simpler for CI/CD integration

**Trade-offs**:
- Requires GitHub token (but Actions provides automatically)
- API rate limits (mitigated with batching and retry logic)

### 2. Traceability Mapping Priority

**Decision**: Doc ID from traceability mapping takes precedence over doc header.

**Rationale**:
- Mapping is source of truth for PR traceability
- Ensures consistency with PR labels and links
- Allows fixing doc IDs without editing every doc

**Trade-offs**:
- Requires mapping to be kept in sync (mitigated by CI checks)

### 3. Multiple Upload Modes

**Decision**: Support stream, JSON, and multipart modes.

**Rationale**:
- Different Knowledge Centers may prefer different formats
- Stream mode efficient for large files
- JSON mode simple for debugging
- Multipart mode standard for file uploads

**Trade-offs**:
- More code to maintain (but isolated in upload function)

### 4. Continue on Individual Failures

**Decision**: Log failures but continue processing remaining files.

**Rationale**:
- One bad file shouldn't block all others
- Better visibility into which files failed
- Can fix issues incrementally

**Trade-offs**:
- Partial success state (mitigated by exit code and logs)

## Security Considerations

1. **API Keys**: Never logged or exposed; use GitHub Actions secrets
2. **Repository Access**: Requires only `contents: read` permission
3. **Rate Limits**: Respect GitHub API limits to avoid abuse detection
4. **Content Validation**: Script validates file size and encoding
5. **Error Messages**: Don't leak sensitive info in error logs

## Performance Characteristics

- **Typical repository** (100-500 docs): ~2-5 minutes
- **Large repository** (1000+ docs): ~10-15 minutes (with rate limiting)
- **Bottlenecks**: GitHub API rate limits, network latency, Knowledge Center processing
- **Optimization**: Batching, concurrency, and delays balance speed vs. rate limits

## Monitoring & Observability

- **Workflow logs**: Show file discovery, metadata extraction, upload progress
- **Warnings**: Logged for missing doc IDs, mismatches, skipped files
- **Exit codes**: Non-zero if any uploads failed (for CI detection)
- **Dry run mode**: Test without uploading (useful for debugging)

## Related Documentation

- [PRD-010: ContextStream Knowledge Ingest (GitHub API)](../product/contextstream-agents/002-contextstream-knowledge-ingest.md)
- [TP-010: ContextStream Knowledge Ingest Implementation](../tech-plans/contextstream-agents/002-contextstream-knowledge-ingest-implementation.md)
- [ContextStream knowledge ingest guide](../guides/contextstream-ingest.md)
- [ContextStream mapping](../guides/contextstream-mapping.md)
