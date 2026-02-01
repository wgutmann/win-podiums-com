#!/usr/bin/env node
/**
 * ContextStream ingestion via GitHub REST API (contents endpoint).
 * - Lists repo files with Git Trees API
 * - Fetches doc content with Get Repository Content API
 * - Wraps content in a ContentStream (Readable)
 * - Maps metadata (doc IDs, related/implements, paths)
 * - Uploads to a Knowledge Center ingestion endpoint
 */

const { Readable } = require('node:stream');
const { createHash } = require('node:crypto');
const path = require('node:path');

const GITHUB_API_BASE = 'https://api.github.com';
const DEFAULT_DOC_PREFIXES = [
  'docs/',
  '.cursor/docs/',
  '.cursor/agents/',
  '.cursor/skills/',
  '.cursor/rules/',
  '.github/',
];
const DEFAULT_EXTRA_FILES = [
  'README.md',
  'CHANGELOG.md',
  'CONTRIBUTING.md',
  'SECURITY.md',
  'AGENTS.md',
  '.cursorrules',
];
const DEFAULT_EXTENSIONS = ['.md', '.mdx', '.txt', '.mmd', '.yaml', '.yml', '.json', '.mdc'];
const DEFAULT_EXCLUDE_PREFIXES = [
  '.git/',
  'node_modules/',
  'apps/api/node_modules/',
  'apps/api/dist/',
  'apps/plugin/bin/',
  'apps/plugin/obj/',
];
const DEFAULT_EXCLUDE_FILES = ['package-lock.json', 'apps/api/package-lock.json', 'package.json', 'apps/api/package.json'];

const ID_REGEX = /\b(PRD-\d+|ADR-\d+|TP-[A-Z0-9-]+)\b/g;

function parseCsvEnv(value, fallback = []) {
  if (!value) return fallback;
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function parseIntEnv(value, fallback) {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

const CONFIG = {
  githubToken: process.env.GITHUB_TOKEN || process.env.GH_TOKEN,
  repoSlug: process.env.GITHUB_REPOSITORY,
  ref:
    process.env.GITHUB_REF_NAME ||
    (process.env.GITHUB_REF || '').replace('refs/heads/', '') ||
    process.env.GITHUB_SHA ||
    'main',
  knowledgeApiUrl:
    process.env.KNOWLEDGE_API_URL ||
    (process.env.CONTEXTSTREAM_API_URL
      ? `${process.env.CONTEXTSTREAM_API_URL.replace(/\/$/, '')}/api/v1/knowledge/upload`
      : null),
  knowledgeApiKey: process.env.KNOWLEDGE_API_KEY || process.env.CONTEXTSTREAM_API_KEY,
  uploadMode: (process.env.KNOWLEDGE_UPLOAD_MODE || 'stream').toLowerCase(),
  concurrency: parseIntEnv(process.env.KNOWLEDGE_UPLOAD_CONCURRENCY, 4),
  batchSize: parseIntEnv(process.env.KNOWLEDGE_UPLOAD_BATCH_SIZE, 20),
  delayMs: parseIntEnv(process.env.KNOWLEDGE_UPLOAD_DELAY_MS, 1500),
  maxFileSizeBytes: parseIntEnv(process.env.KNOWLEDGE_MAX_FILE_SIZE_KB, 512) * 1024,
  dryRun: String(process.env.DRY_RUN).toLowerCase() === 'true',
  docPrefixes: parseCsvEnv(process.env.DOC_PATH_PREFIXES, DEFAULT_DOC_PREFIXES),
  extraFiles: new Set(parseCsvEnv(process.env.DOC_EXTRA_FILES, DEFAULT_EXTRA_FILES)),
  extensions: new Set(parseCsvEnv(process.env.DOC_EXTENSIONS, DEFAULT_EXTENSIONS).map((ext) => ext.toLowerCase())),
  excludePrefixes: parseCsvEnv(process.env.DOC_EXCLUDE_PREFIXES, DEFAULT_EXCLUDE_PREFIXES),
  excludeFiles: new Set(parseCsvEnv(process.env.DOC_EXCLUDE_FILES, DEFAULT_EXCLUDE_FILES)),
};

class ContentStream extends Readable {
  constructor(data, options = {}) {
    super(options);
    this.data = data;
    this.sent = false;
  }

  _read() {
    if (this.sent) {
      this.push(null);
      return;
    }
    this.sent = true;
    this.push(toBuffer(this.data));
  }
}

function toBuffer(data) {
  if (Buffer.isBuffer(data)) return data;
  if (typeof data === 'string') return Buffer.from(data, 'utf8');
  return Buffer.from(JSON.stringify(data), 'utf8');
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function encodePath(filePath) {
  return filePath
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

function shouldIncludePath(filePath) {
  if (CONFIG.excludeFiles.has(filePath)) return false;
  if (CONFIG.excludePrefixes.some((prefix) => filePath.startsWith(prefix))) return false;
  if (CONFIG.extraFiles.has(filePath)) return true;
  if (CONFIG.docPrefixes.some((prefix) => filePath.startsWith(prefix))) return true;
  const ext = path.posix.extname(filePath).toLowerCase();
  if (CONFIG.extensions.has(ext) && !filePath.includes('/')) return true;
  return false;
}

async function githubRequestJson(url, token, options = {}) {
  const headers = {
    'User-Agent': 'contextstream-ingest',
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  const response = await fetch(url, { ...options, headers });
  if (response.status === 403 || response.status === 429) {
    const remaining = Number(response.headers.get('x-ratelimit-remaining') || '1');
    if (remaining === 0) {
      const reset = Number(response.headers.get('x-ratelimit-reset') || '0') * 1000;
      const waitMs = Math.max(reset - Date.now(), 1000);
      console.warn(`GitHub rate limit hit. Waiting ${Math.ceil(waitMs / 1000)}s...`);
      await sleep(waitMs);
      return githubRequestJson(url, token, options);
    }
  }
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GitHub API error ${response.status} for ${url}: ${text}`);
  }
  return response.json();
}

async function fetchGitTree(owner, repo, ref) {
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/trees/${encodeURIComponent(ref)}?recursive=1`;
  const data = await githubRequestJson(url, CONFIG.githubToken);
  if (data.truncated) {
    console.warn('Git tree response was truncated. Consider narrowing DOC_PATH_PREFIXES.');
  }
  return data.tree || [];
}

async function fetchRepoContent(owner, repo, ref, filePath) {
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${encodePath(filePath)}?ref=${encodeURIComponent(ref)}`;
  const data = await githubRequestJson(url, CONFIG.githubToken);
  if (!data || !data.content) {
    throw new Error(`Missing content for ${filePath}`);
  }
  if (data.encoding && data.encoding !== 'base64') {
    throw new Error(`Unexpected encoding ${data.encoding} for ${filePath}`);
  }
  const cleaned = data.content.replace(/\n/g, '');
  const buffer = Buffer.from(cleaned, 'base64');
  return buffer;
}

function parseTraceabilityMapping(text) {
  const pathById = new Map();
  const idByPath = new Map();
  let section = null;
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trimEnd();
    if (!line || line.startsWith('#')) continue;
    if (line.startsWith('prds:')) {
      section = 'prds';
      continue;
    }
    if (line.startsWith('tech_plans:')) {
      section = 'tech_plans';
      continue;
    }
    if (!section) continue;
    const match = line.match(/^\s*([A-Z0-9-]+):\s*(\S+)\s*$/);
    if (match) {
      const id = match[1];
      const docPath = match[2];
      pathById.set(id, docPath);
      idByPath.set(docPath, id);
    }
  }
  return { pathById, idByPath };
}

function extractIds(text) {
  const matches = text.match(ID_REGEX);
  return matches ? Array.from(new Set(matches)) : [];
}

function inferDocType(filePath) {
  if (filePath.startsWith('docs/product/')) return 'PRD';
  if (filePath.startsWith('docs/tech-plans/')) return 'Tech Plan';
  if (filePath.startsWith('docs/architecture/decisions/')) return 'ADR';
  if (filePath.startsWith('docs/architecture/')) return 'Architecture';
  if (filePath.startsWith('docs/design/')) return 'Design';
  if (filePath.startsWith('docs/api/')) return 'API Doc';
  if (filePath.startsWith('docs/guides/')) return 'Guide';
  if (filePath.startsWith('.cursor/')) return 'Cursor Doc';
  if (filePath.startsWith('.github/')) return 'GitHub Doc';
  if (filePath.endsWith('README.md')) return 'README';
  return 'Documentation';
}

function extractMetadata({ content, filePath, blobSha, repoInfo, mapping }) {
  const lines = content.split(/\r?\n/);
  const header = lines.slice(0, 60);
  const headerText = header.join('\n');
  const docTypeLine = header.find((line) => line.includes('Doc type'));
  let docType = null;
  let docId = null;
  let docIdFromContent = null;
  if (docTypeLine) {
    const typeMatch = docTypeLine.match(/Doc type\*\*:\s*([^|]+)\s*\|/i);
    if (typeMatch) {
      docType = typeMatch[1].trim();
    }
    const idMatch = docTypeLine.match(/\bID\*\*:\s*([A-Z0-9-]+)\b/i);
    if (idMatch) {
      docId = idMatch[1].trim();
      docIdFromContent = docId;
    }
  }

  const idsInHeader = extractIds(headerText);
  const mappingId = mapping.idByPath.get(filePath);
  if (!docId && idsInHeader.length > 0) {
    docId = idsInHeader[0];
    docIdFromContent = docId;
  }
  if (mappingId) {
    docId = mappingId;
  }

  if (!docType) {
    docType = inferDocType(filePath);
  }

  const implementsIds = new Set();
  const relatedIds = new Set();
  for (const line of header) {
    if (/Implements/i.test(line)) {
      for (const id of extractIds(line)) {
        implementsIds.add(id);
      }
    }
    if (/Related/i.test(line)) {
      for (const id of extractIds(line)) {
        relatedIds.add(id);
      }
    }
  }

  const linkPaths = new Set();
  const linkRegex = /\[[^\]]+]\(([^)]+)\)/g;
  let match;
  while ((match = linkRegex.exec(content)) !== null) {
    const rawTarget = match[1].split('#')[0];
    if (!rawTarget || rawTarget.startsWith('http') || rawTarget.startsWith('#')) continue;
    const normalized = rawTarget.startsWith('/')
      ? rawTarget.slice(1)
      : path.posix.normalize(path.posix.join(path.posix.dirname(filePath), rawTarget));
    linkPaths.add(normalized);
  }

  const relatedPaths = new Set();
  for (const id of [...implementsIds, ...relatedIds]) {
    const mappedPath = mapping.pathById.get(id);
    if (mappedPath) relatedPaths.add(mappedPath);
  }
  for (const linkPath of linkPaths) {
    relatedPaths.add(linkPath);
  }

  const ext = path.posix.extname(filePath).toLowerCase();
  const tags = new Set();
  for (const segment of filePath.split('/')) {
    if (segment) tags.add(segment.replace(/\.[^/.]+$/, ''));
  }
  if (docType) tags.add(docType.toLowerCase().replace(/\s+/g, '-'));
  if (docId) tags.add(docId.toLowerCase());

  const contentHash = createHash('sha256').update(content).digest('hex');
  const relatedPathsList = Array.from(relatedPaths).slice(0, 50);
  const metadata = {
    source: 'github',
    repository: repoInfo.slug,
    ref: repoInfo.ref,
    path: filePath,
    blob_sha: blobSha,
    doc_type: docType,
    doc_id: docId,
    doc_id_source: mappingId ? 'traceability_map' : docId ? 'content' : 'unknown',
    related_ids: Array.from(relatedIds),
    implements_ids: Array.from(implementsIds),
    related_paths: relatedPathsList,
    related_paths_truncated: relatedPaths.size > relatedPathsList.length,
    file_type: ext || 'unknown',
    tags: Array.from(tags),
    source_url: `https://github.com/${repoInfo.slug}/blob/${repoInfo.ref}/${filePath}`,
    raw_url: `https://raw.githubusercontent.com/${repoInfo.slug}/${repoInfo.ref}/${filePath}`,
    content_sha256: contentHash,
    content_bytes: Buffer.byteLength(content, 'utf8'),
  };

  const expectsDocId =
    filePath.startsWith('docs/product/') ||
    filePath.startsWith('docs/tech-plans/') ||
    filePath.startsWith('docs/architecture/decisions/');
  if (expectsDocId && !docId) {
    metadata.doc_id_missing = true;
  }

  if (mappingId && docIdFromContent && mappingId !== docIdFromContent) {
    metadata.doc_id_mismatch = { mapping: mappingId, content: docIdFromContent };
  }

  return metadata;
}

async function uploadDocument({ content, metadata }) {
  if (CONFIG.dryRun) {
    console.log(`[dry-run] ${metadata.path}`);
    return { ok: true, skipped: true };
  }
  if (!CONFIG.knowledgeApiUrl || !CONFIG.knowledgeApiKey) {
    throw new Error('Missing KNOWLEDGE_API_URL/CONTEXTSTREAM_API_URL or KNOWLEDGE_API_KEY/CONTEXTSTREAM_API_KEY');
  }

  const contentStream = new ContentStream(content);
  const metadataJson = JSON.stringify(metadata);
  const headers = {
    Authorization: `Bearer ${CONFIG.knowledgeApiKey}`,
  };

  let body;
  let contentType;
  if (CONFIG.uploadMode === 'json') {
    contentType = 'application/json';
    body = JSON.stringify({ metadata, content: content.toString('utf8'), encoding: 'utf-8' });
  } else if (CONFIG.uploadMode === 'multipart') {
    const form = new FormData();
    form.set('metadata', metadataJson);
    form.set('file', new Blob([content]), path.posix.basename(metadata.path));
    body = form;
  } else {
    contentType = 'application/octet-stream';
    headers['X-Document-Metadata'] = Buffer.from(metadataJson, 'utf8').toString('base64');
    body = contentStream;
  }

  const fetchOptions = {
    method: 'POST',
    headers: contentType ? { ...headers, 'Content-Type': contentType } : headers,
    body,
  };
  // Node.js 18+ requires duplex: 'half' when body is a Readable stream.
  if (CONFIG.uploadMode === 'stream') {
    fetchOptions.duplex = 'half';
  }
  const response = await fetch(CONFIG.knowledgeApiUrl, fetchOptions);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Upload failed (${response.status}) for ${metadata.path}: ${text}`);
  }
  return { ok: true };
}

async function mapWithConcurrency(items, limit, handler) {
  let idx = 0;
  const results = [];
  const workers = Array.from({ length: limit }, async () => {
    while (true) {
      const current = idx++;
      if (current >= items.length) break;
      results[current] = await handler(items[current]);
    }
  });
  await Promise.all(workers);
  return results;
}

async function main() {
  if (!CONFIG.githubToken) {
    throw new Error('Missing GITHUB_TOKEN or GH_TOKEN for GitHub API access.');
  }
  if (!CONFIG.repoSlug) {
    throw new Error('Missing GITHUB_REPOSITORY (expected owner/repo).');
  }
  const [owner, repo] = CONFIG.repoSlug.split('/');
  const repoInfo = { slug: CONFIG.repoSlug, ref: CONFIG.ref };

  console.log(`Fetching repo tree for ${CONFIG.repoSlug}@${CONFIG.ref}...`);
  const tree = await fetchGitTree(owner, repo, CONFIG.ref);

  const candidates = tree.filter((item) => item.type === 'blob' && shouldIncludePath(item.path));
  const filtered = candidates.filter((item) => (item.size || 0) <= CONFIG.maxFileSizeBytes);
  const skippedBySize = candidates.length - filtered.length;

  console.log(`Found ${filtered.length} docs to ingest (${skippedBySize} skipped for size).`);

  let mapping = { pathById: new Map(), idByPath: new Map() };
  try {
    const mappingBuffer = await fetchRepoContent(owner, repo, CONFIG.ref, '.github/traceability-mapping.yaml');
    mapping = parseTraceabilityMapping(mappingBuffer.toString('utf8'));
  } catch (error) {
    console.warn(`Traceability mapping not loaded: ${error.message}`);
  }

  const batches = [];
  for (let i = 0; i < filtered.length; i += CONFIG.batchSize) {
    batches.push(filtered.slice(i, i + CONFIG.batchSize));
  }

  let processed = 0;
  let failed = 0;
  let uploaded = 0;

  for (const batch of batches) {
    await mapWithConcurrency(batch, CONFIG.concurrency, async (item) => {
      try {
        const buffer = await fetchRepoContent(owner, repo, CONFIG.ref, item.path);
        const content = buffer.toString('utf8');
        const metadata = extractMetadata({
          content,
          filePath: item.path,
          blobSha: item.sha,
          repoInfo,
          mapping,
        });
        if (metadata.doc_id_missing) {
          console.warn(`Doc ID missing for ${item.path} (expected for doc type).`);
        }
        if (metadata.doc_id_mismatch) {
          console.warn(
            `Doc ID mismatch for ${item.path}: mapping=${metadata.doc_id_mismatch.mapping} content=${metadata.doc_id_mismatch.content}`
          );
        }
        await uploadDocument({ content: buffer, metadata });
        uploaded += 1;
      } catch (error) {
        failed += 1;
        console.error(`Failed to ingest ${item.path}: ${error.message}`);
      } finally {
        processed += 1;
      }
    });
    if (CONFIG.delayMs > 0) {
      await sleep(CONFIG.delayMs);
    }
  }

  console.log(`Ingest complete. Uploaded: ${uploaded}, Failed: ${failed}, Total: ${processed}.`);
  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
