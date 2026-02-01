# Cloudflare Workers — Examples

Illustrative snippets only. Use Cloudflare docs and MCP for current API.

## wrangler.toml (bindings)

```toml
name = "winpodiums-api"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[[d1_databases]]
binding = "DB"
database_name = "winpodiums-dev-db"
database_id = "<d1-database-id-from-cloudflare>"

[[r2_buckets]]
binding = "BUCKET"
bucket_name = "winpodiums-r2"

[[kv_namespaces]]
binding = "KV"
id = "<kv-namespace-id>"
```

## .dev.vars (local secrets, do not commit)

```
DISCORD_CLIENT_ID=...
DISCORD_CLIENT_SECRET=...
API_SIGNING_SECRET=...
```

## Worker handler (D1 + KV)

```typescript
export default {
  async fetch(request: Request, env: { DB: D1Database; KV: KVNamespace }) {
    const cached = await env.KV.get("config:latest");
    if (cached) return new Response(cached, { headers: { "Content-Type": "application/json" } });
    const stmt = env.DB.prepare("SELECT * FROM config LIMIT 1");
    const row = await stmt.first();
    if (row) await env.KV.put("config:latest", JSON.stringify(row), { expirationTtl: 60 });
    return Response.json(row ?? {});
  },
};
```

## D1 migration (file in Worker app)

```sql
-- migrations/0001_initial.sql
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  discord_id TEXT UNIQUE NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);
```

Run: `wrangler d1 execute <database_name> --remote --file=./migrations/0001_initial.sql` (or local with `--local`).
