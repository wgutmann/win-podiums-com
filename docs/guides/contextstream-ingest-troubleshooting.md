# ContextStream Knowledge Ingest Troubleshooting

**Related**: [ContextStream knowledge ingest guide](contextstream-ingest.md), [PRD-010: ContextStream Knowledge Ingest (GitHub API)](../product/contextstream-agents/002-contextstream-knowledge-ingest.md)

## Common Issues

### Issue: GitHub API Rate Limit

**Symptoms**:
- Script logs: `GitHub rate limit hit. Waiting Xs...`
- Script takes a long time to complete
- Some requests fail with 403/429

**Solutions**:
1. **Wait for reset**: Script automatically waits for rate limit reset; let it complete
2. **Reduce batch size**: Set `KNOWLEDGE_UPLOAD_BATCH_SIZE=10` to process fewer files
3. **Increase delays**: Set `KNOWLEDGE_UPLOAD_DELAY_MS=3000` to slow down requests
4. **Use GitHub PAT**: If running locally, use a Personal Access Token with higher limits (5,000/hour vs 60/hour for unauthenticated)

**Prevention**:
- Script already implements rate limit detection and retry
- Default batching and delays should prevent most rate limit issues
- For very large repositories (1000+ files), consider splitting into multiple runs

### Issue: Missing Doc IDs

**Symptoms**:
- Script logs: `Doc ID missing for docs/product/prd-010.md (expected for doc type).`
- Documents appear in Knowledge Center without doc_id

**Solutions**:
1. **Add doc ID to document**: Add to document header:
   ```markdown
   **Doc type**: PRD | **ID**: PRD-010 | ...
   ```
2. **Add to traceability mapping**: Add entry to `.github/traceability-mapping.yaml`:
   ```yaml
   prds:
     PRD-010: docs/product/contextstream-agents/002-contextstream-knowledge-ingest.md
   ```
3. **Check path**: Ensure document path matches mapping exactly

**Prevention**:
- Always include doc ID in PRD/TP/ADR document headers
- Keep traceability mapping in sync with new documents
- Run doc-check workflow to catch missing IDs

### Issue: Doc ID Mismatch

**Symptoms**:
- Script logs: `Doc ID mismatch for docs/product/prd-010.md: mapping=PRD-010 content=PRD-011`

**Solutions**:
1. **Fix mapping**: Update `.github/traceability-mapping.yaml` to match document content
2. **Fix document**: Update document header to match mapping
3. **Choose source of truth**: Prefer traceability mapping (it's used for PR traceability)

**Prevention**:
- Keep traceability mapping as source of truth
- Update mapping when renaming doc IDs
- Use CI checks to validate mapping matches documents

### Issue: Upload Failures

**Symptoms**:
- Script logs: `Upload failed (400) for docs/product/prd-010.md: Invalid metadata format`
- Script exits with non-zero code
- Some documents missing from Knowledge Center

**Solutions**:
1. **Check API key**: Verify `CONTEXTSTREAM_API_KEY` or `KNOWLEDGE_API_KEY` is set correctly
2. **Check endpoint URL**: Verify `KNOWLEDGE_API_URL` or `CONTEXTSTREAM_API_URL` is correct
3. **Check upload mode**: Try different mode (`stream`, `json`, `multipart`) if endpoint doesn't support default
4. **Check metadata size**: If using stream mode, ensure `X-Document-Metadata` header isn't too large (some proxies limit header size)
5. **Check logs**: Review Knowledge Center logs for specific error messages

**Debugging**:
- Run with `DRY_RUN=true` to see what would be uploaded without actually uploading
- Check metadata extraction: Look for warnings about missing/mismatched doc IDs
- Test with single file: Modify script temporarily to process only one file

### Issue: Large Files Skipped

**Symptoms**:
- Script logs: `Found X docs to ingest (Y skipped for size).`
- Some documents not uploaded

**Solutions**:
1. **Increase size limit**: Set `KNOWLEDGE_MAX_FILE_SIZE_KB=1024` (or higher)
2. **Split large files**: Break large documents into smaller files
3. **Exclude large files**: Add to `DOC_EXCLUDE_FILES` if they're not needed

**Prevention**:
- Keep documents focused and reasonably sized (< 512KB recommended)
- Use diagrams and external links instead of embedding large content

### Issue: Workflow Not Running

**Symptoms**:
- GitHub Actions workflow doesn't trigger on push to `main`
- Workflow shows as skipped or not found

**Solutions**:
1. **Check workflow file**: Ensure `.github/workflows/contextstream-ingest.yml` exists and is valid YAML
2. **Check branch**: Workflow only runs on `main` by default; check if you're pushing to correct branch
3. **Check path filters**: If workflow has path filters, ensure changed files match
4. **Check permissions**: Ensure workflow has `contents: read` permission
5. **Manual trigger**: Try `workflow_dispatch` to test workflow manually

**Debugging**:
- Check GitHub Actions tab for workflow runs
- Look for workflow syntax errors in Actions logs
- Verify secrets are configured (workflow may fail silently if secrets missing)

### Issue: Secrets Not Available

**Symptoms**:
- Script logs: `Missing KNOWLEDGE_API_URL/CONTEXTSTREAM_API_URL or KNOWLEDGE_API_KEY/CONTEXTSTREAM_API_KEY`
- Workflow fails immediately

**Solutions**:
1. **Configure secrets**: Add `CONTEXTSTREAM_API_KEY` (or `KNOWLEDGE_API_KEY`) to repository secrets
2. **Optional URL**: Add `CONTEXTSTREAM_API_URL` (or `KNOWLEDGE_API_URL`) if using non-default endpoint
3. **Check secret names**: Ensure secret names match workflow env var names exactly

**Setup**:
1. Go to repository Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add `CONTEXTSTREAM_API_KEY` with your API key
4. (Optional) Add `CONTEXTSTREAM_API_URL` if using custom endpoint

### Issue: Metadata Not Extracted Correctly

**Symptoms**:
- Documents uploaded but missing related_ids, implements_ids, or related_paths
- Knowledge graph doesn't show expected relationships

**Solutions**:
1. **Check document format**: Ensure documents follow format:
   ```markdown
   **Doc type**: PRD | **ID**: PRD-010 | **Related**: [PRD-009](...), [TP-010](...)
   ```
2. **Check markdown links**: Use proper markdown link format: `[text](path)`
3. **Check traceability mapping**: Ensure related docs are in mapping
4. **Verify extraction**: Run with `DRY_RUN=true` and check logs for extracted metadata

**Debugging**:
- Script logs warnings for missing/mismatched doc IDs
- Check script output for "Extracted metadata" logs (if added for debugging)
- Review document headers to ensure they match expected format

## Debugging Tips

### Enable Verbose Logging

The script logs key steps, but you can add more logging for debugging:

```javascript
// In extractMetadata function, add:
console.log(`Extracted metadata for ${filePath}:`, JSON.stringify(metadata, null, 2));
```

### Test Locally

1. **Dry run**:
   ```bash
   GITHUB_TOKEN=ghp_... DRY_RUN=true node scripts/contextstream-ingest.js
   ```

2. **Single file test**: Temporarily modify script to process only one file:
   ```javascript
   const filtered = candidates.filter((item) => item.path === 'docs/product/prd-010.md');
   ```

3. **Check metadata extraction**: Review logs to see what metadata is extracted

### Check GitHub API Response

Test GitHub API directly:

```bash
curl -H "Authorization: Bearer $GITHUB_TOKEN" \
  "https://api.github.com/repos/owner/repo/contents/docs/product/prd-010.md?ref=main"
```

### Check Knowledge Center Endpoint

Test endpoint directly:

```bash
curl -X POST \
  -H "Authorization: Bearer $CONTEXTSTREAM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"metadata": {...}, "content": "...", "encoding": "utf-8"}' \
  "$CONTEXTSTREAM_API_URL/api/v1/knowledge/upload"
```

## Performance Optimization

### For Large Repositories

1. **Increase concurrency**: Set `KNOWLEDGE_UPLOAD_CONCURRENCY=8` (if endpoint supports)
2. **Reduce batch delays**: Set `KNOWLEDGE_UPLOAD_DELAY_MS=500` (if not hitting rate limits)
3. **Filter documents**: Use `DOC_PATH_PREFIXES` to ingest only specific areas

### For Slow Networks

1. **Reduce concurrency**: Set `KNOWLEDGE_UPLOAD_CONCURRENCY=2`
2. **Increase delays**: Set `KNOWLEDGE_UPLOAD_DELAY_MS=3000`
3. **Use JSON mode**: May be more efficient than stream mode for small files

## Getting Help

1. **Check logs**: Review GitHub Actions workflow logs for detailed error messages
2. **Review documentation**: See [ContextStream knowledge ingest guide](contextstream-ingest.md)
3. **Check related docs**: See [PRD-010](../product/contextstream-agents/002-contextstream-knowledge-ingest.md) and [TP-010](../tech-plans/contextstream-agents/002-contextstream-knowledge-ingest-implementation.md)
4. **Open issue**: If problem persists, open an issue with:
   - Error messages from logs
   - Configuration (sanitized, no secrets)
   - Steps to reproduce

## Related Documentation

- [ContextStream knowledge ingest guide](contextstream-ingest.md)
- [ContextStream ingest architecture](../architecture/contextstream-ingest-architecture.md)
- [ContextStream ingest API reference](../api/contextstream-ingest-api.md)
- [PRD-010: ContextStream Knowledge Ingest (GitHub API)](../product/contextstream-agents/002-contextstream-knowledge-ingest.md)
