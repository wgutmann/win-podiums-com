# ContextStream Knowledge Ingest API Reference

**Related**: [PRD-011: ContextStream Knowledge Ingest (GitHub API)](../product/contextstream-agents/002-contextstream-knowledge-ingest.md), [ContextStream knowledge ingest guide](../guides/contextstream-ingest.md)

## Overview

This document describes the API contract between the ingestion script (`scripts/contextstream-ingest.js`) and the Knowledge Center endpoint. The script uploads documents with metadata to enable knowledge graph linking.

## Endpoint

**URL**: `/api/v1/knowledge/upload` (configurable via `KNOWLEDGE_API_URL`)

**Method**: `POST`

**Authentication**: Bearer token (via `Authorization: Bearer <token>` header)

## Upload Modes

The script supports three upload modes, configurable via `KNOWLEDGE_UPLOAD_MODE`:

### Mode 1: Stream (Default)

**Content-Type**: `application/octet-stream`

**Headers**:
```
Authorization: Bearer <api_key>
X-Document-Metadata: <base64_encoded_json>
Content-Type: application/octet-stream
```

**Body**: Raw document content (UTF-8 encoded)

**Metadata Header Format**:
- `X-Document-Metadata`: Base64-encoded JSON string of metadata object
- Decode: `JSON.parse(Buffer.from(header_value, 'base64').toString('utf8'))`

**Example Request**:
```http
POST /api/v1/knowledge/upload HTTP/1.1
Host: api.contextstream.io
Authorization: Bearer cs_...
X-Document-Metadata: eyJzb3VyY2UiOiJnaXRodWIiLCJyZXBvc2l0b3J5Ijoib3duZXIvcmVwbyIsInBhdGgiOiJkb2NzL3Byb2R1Y3QvcHJkLTEwLm1kIiwiZG9jX2lkIjoiUFJELTAxMCIsImRvY190eXBlIjoiUFJEIn0=
Content-Type: application/octet-stream
Content-Length: 1234

# PRD-010: ContextStream Knowledge Ingest
...
```

### Mode 2: JSON

**Content-Type**: `application/json`

**Headers**:
```
Authorization: Bearer <api_key>
Content-Type: application/json
```

**Body**: JSON object with `metadata`, `content`, and `encoding` fields

**Example Request**:
```http
POST /api/v1/knowledge/upload HTTP/1.1
Host: api.contextstream.io
Authorization: Bearer cs_...
Content-Type: application/json
Content-Length: 2345

{
  "metadata": {
    "source": "github",
    "repository": "owner/repo",
    "ref": "main",
    "path": "docs/product/prd-011.md",
    "doc_id": "PRD-011",
    "doc_type": "PRD",
    "related_ids": ["TP-010"],
    "implements_ids": [],
    "related_paths": ["docs/tech-plans/tp-010.md"],
    "source_url": "https://github.com/owner/repo/blob/main/docs/product/prd-011.md",
    "raw_url": "https://raw.githubusercontent.com/owner/repo/main/docs/product/prd-011.md",
    "content_sha256": "abc123...",
    "content_bytes": 1234
  },
  "content": "# PRD-011: ContextStream Knowledge Ingest\n\n...",
  "encoding": "utf-8"
}
```

### Mode 3: Multipart

**Content-Type**: `multipart/form-data`

**Headers**:
```
Authorization: Bearer <api_key>
Content-Type: multipart/form-data; boundary=<boundary>
```

**Body**: Form data with two fields:
- `metadata`: JSON string of metadata object
- `file`: File content as Blob/Buffer

**Example Request**:
```http
POST /api/v1/knowledge/upload HTTP/1.1
Host: api.contextstream.io
Authorization: Bearer cs_...
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW

------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="metadata"
Content-Type: application/json

{"source":"github","repository":"owner/repo",...}
------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="file"; filename="prd-010.md"
Content-Type: text/markdown

# PRD-010: ContextStream Knowledge Ingest
...
------WebKitFormBoundary7MA4YWxkTrZu0gW--
```

## Metadata Schema

The metadata object follows this schema:

```typescript
interface DocumentMetadata {
  // Source information
  source: 'github';
  repository: string;        // Format: "owner/repo"
  ref: string;               // Branch, tag, or commit SHA
  path: string;             // File path relative to repo root
  blob_sha: string;          // Git blob SHA-1 hash
  source_url: string;        // GitHub web URL
  raw_url: string;          // GitHub raw content URL

  // Document identity
  doc_id: string | null;     // PRD-XXX, TP-XXX, ADR-XXX, or null
  doc_id_source: 'traceability_map' | 'content' | 'unknown';
  doc_type: string;          // PRD, Tech Plan, ADR, Architecture, etc.
  file_type: string;        // File extension (e.g., ".md", ".yaml")

  // Relationships
  related_ids: string[];     // Array of doc IDs from "Related" section
  implements_ids: string[];  // Array of doc IDs from "Implements" section
  related_paths: string[];  // Array of resolved file paths (max 50)
  related_paths_truncated: boolean; // True if more than 50 paths found

  // Content metadata
  content_sha256: string;    // SHA-256 hash of content
  content_bytes: number;     // Content size in bytes

  // Warnings (optional, present only if issue detected)
  doc_id_missing?: boolean;  // True if doc ID expected but missing
  doc_id_mismatch?: {       // Present if mapping and content disagree
    mapping: string;         // Doc ID from traceability mapping
    content: string;         // Doc ID from document content
  };
}
```

### Field Descriptions

#### `source`
Always `"github"` for documents ingested via GitHub API.

#### `repository`
Repository slug in format `"owner/repo"` (e.g., `"wgutmann/win-podiums-com"`).

#### `ref`
Git reference: branch name (e.g., `"main"`), tag name, or commit SHA.

#### `path`
File path relative to repository root (e.g., `"docs/product/prd-010.md"`).

#### `blob_sha`
Git blob SHA-1 hash of the file content (40-character hex string).

#### `source_url`
Full GitHub web URL to the file (e.g., `"https://github.com/owner/repo/blob/main/docs/product/prd-010.md"`).

#### `raw_url`
GitHub raw content URL (e.g., `"https://raw.githubusercontent.com/owner/repo/main/docs/product/prd-010.md"`).

#### `doc_id`
Document identifier (e.g., `"PRD-010"`, `"TP-010"`, `"ADR-001"`) or `null` if not found.

#### `doc_id_source`
Source of the doc ID:
- `"traceability_map"`: From `.github/traceability-mapping.yaml`
- `"content"`: From document header or content
- `"unknown"`: Not found

#### `doc_type`
Document type inferred from path or header:
- `"PRD"` for `docs/product/`
- `"Tech Plan"` for `docs/tech-plans/`
- `"ADR"` for `docs/architecture/decisions/`
- `"Architecture"`, `"Design"`, `"Guide"`, `"README"`, etc.

#### `file_type`
File extension (e.g., `".md"`, `".yaml"`, `".json"`).

#### `related_ids`
Array of document IDs found in the "Related" section of the document (e.g., `["PRD-009", "TP-010"]`).

#### `implements_ids`
Array of document IDs found in the "Implements" section (typically tech plans implementing PRDs).

#### `related_paths`
Array of file paths resolved from:
- Markdown links in the document
- Traceability mapping (for Related/Implements IDs)

Limited to 50 paths; `related_paths_truncated` indicates if more exist.

#### `content_sha256`
SHA-256 hash of the document content (64-character hex string). Used for deduplication and change detection.

#### `content_bytes`
Size of the document content in bytes.

#### `doc_id_missing` (optional)
Present and `true` if the document is expected to have a doc ID (PRD/TP/ADR) but none was found.

#### `doc_id_mismatch` (optional)
Present if the doc ID from the traceability mapping differs from the doc ID in the document content. Contains both values for debugging.

## Response Format

### Success Response

**Status Code**: `200 OK` or `201 Created`

**Body**: Implementation-dependent (may be empty or contain upload confirmation)

**Example**:
```json
{
  "status": "success",
  "document_id": "doc_abc123",
  "uploaded_at": "2026-02-01T12:00:00Z"
}
```

### Error Response

**Status Code**: `4xx` or `5xx`

**Body**: Error message (format implementation-dependent)

**Example**:
```json
{
  "error": "Invalid metadata format",
  "message": "Missing required field: doc_id"
}
```

## Rate Limiting

The script implements client-side rate limiting:
- Batches files (default: 20 per batch)
- Limits concurrency (default: 4 parallel uploads)
- Adds delays between batches (default: 1500ms)

The Knowledge Center endpoint may also enforce rate limits. If the endpoint returns `429 Too Many Requests`, the script will log the error and continue with remaining files.

## Error Handling

The script handles errors as follows:

1. **Network errors**: Logged, processing continues
2. **4xx errors**: Logged as failures, processing continues
3. **5xx errors**: Logged as failures, processing continues
4. **Exit code**: Non-zero if any uploads failed

The Knowledge Center endpoint should return appropriate HTTP status codes:
- `200`/`201`: Success
- `400`: Bad request (invalid metadata/content)
- `401`: Unauthorized (invalid API key)
- `429`: Rate limited
- `500`: Server error

## Configuration

The script reads configuration from environment variables:

| Variable | Purpose | Default |
|----------|---------|---------|
| `KNOWLEDGE_API_URL` | Endpoint URL | `${CONTEXTSTREAM_API_URL}/api/v1/knowledge/upload` |
| `KNOWLEDGE_API_KEY` | API key for authentication | `CONTEXTSTREAM_API_KEY` |
| `KNOWLEDGE_UPLOAD_MODE` | Upload mode: `stream`, `json`, `multipart` | `stream` |
| `KNOWLEDGE_UPLOAD_CONCURRENCY` | Parallel uploads | `4` |
| `KNOWLEDGE_UPLOAD_BATCH_SIZE` | Files per batch | `20` |
| `KNOWLEDGE_UPLOAD_DELAY_MS` | Delay between batches (ms) | `1500` |

## Related Documentation

- [PRD-011: ContextStream Knowledge Ingest (GitHub API)](../product/contextstream-agents/002-contextstream-knowledge-ingest.md)
- [TP-011: ContextStream Knowledge Ingest Implementation](../tech-plans/contextstream-agents/002-contextstream-knowledge-ingest-implementation.md)
- [ContextStream knowledge ingest guide](../guides/contextstream-ingest.md)
- [ContextStream ingest architecture](../architecture/contextstream-ingest-architecture.md)
