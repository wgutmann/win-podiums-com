# API Documentation

REST API for WinPodiums, hosted on Cloudflare Workers.

**Base URL**: `https://winpodiums.com/api`

## Overview

The WinPodiums API provides endpoints for:
- **Authentication**: Discord OAuth2 flows (web, plugin browser, plugin QR, plugin manual token)
- **Plugin Integration**: Telemetry submission, heartbeat, version checking
- **User Profiles**: Member data, podium history, preferences
- **Verification**: Race result validation and anti-cheat

## Authentication

All API endpoints (except authentication endpoints) require a valid Discord access token.

**Web**: Session token (HTTP-only cookie)  
**Plugin**: Bearer token in `Authorization` header

```http
Authorization: Bearer {ACCESS_TOKEN}
```

## Endpoint Categories

### Authentication Endpoints

Discord OAuth2 integration for all authentication methods.

**Key Endpoints**:
- `POST /auth/discord/callback` — Web OAuth2 callback
- `POST /auth/discord/exchange` — Plugin token exchange (PKCE)
- `GET /auth/qr-status/:sessionId` — QR code polling
- `POST /auth/token-exchange` — Manual token validation

📄 [Full Authentication API Spec](./authentication.md)

### Plugin Integration Endpoints

SimHub plugin telemetry submission and health monitoring.

**Key Endpoints**:
- `POST /plugin/verify` — Submit race result for verification
- `POST /plugin/heartbeat` — Plugin health check
- `GET /plugin/download/:type` — Download plugin installer

📄 [Full Plugin API Spec](./plugin.md)

### User Profile Endpoints

Member profile data and podium history.

**Key Endpoints**:
- `GET /profile/me` — Current user's profile
- `GET /profile/:discordId` — Public profile (if enabled)
- `PATCH /profile/me` — Update user preferences

📄 [Full Profile API Spec](./user-profile.md)

## Error Handling

All API endpoints follow consistent error formatting:

```json
{
  "success": false,
  "error": "error_code_snake_case",
  "message": "Human-readable error message",
  "details": {
    "field": "specific field that caused error",
    "reason": "additional context"
  }
}
```

### Common HTTP Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 OK | Success | Request completed successfully |
| 400 Bad Request | Invalid input | Validation failure, malformed request |
| 401 Unauthorized | Missing/invalid auth | No token, expired token, invalid token |
| 403 Forbidden | Insufficient permissions | Authenticated but not authorized |
| 404 Not Found | Resource doesn't exist | User not found, result not found |
| 409 Conflict | Resource state conflict | Duplicate submission, race condition |
| 429 Too Many Requests | Rate limit exceeded | User exceeded rate limit |
| 500 Internal Server Error | Server-side failure | Unexpected error |

## Rate Limiting

| Endpoint Category | Limit | Window | Penalty |
|------------------|-------|--------|---------|
| Plugin verification | 10 submissions | per day per user | 24hr suspension |
| Auth token generation | 3 tokens | per hour per user | 1hr cooldown |
| QR status polling | 30 polls | per session | Session invalidated |
| Plugin heartbeat | 1 heartbeat | per 5 minutes per user | Warning logged |
| All auth endpoints | 10 failures | per hour per IP | 1hr IP ban |

## Versioning

**Current Version**: v1 (implicit in base URL)

Future API versions will be namespaced:
- `/api/v1/...` (current, default)
- `/api/v2/...` (future breaking changes)

## Security

- **HTTPS Only**: All requests must use TLS 1.3
- **CORS**: Restricted to `winpodiums.com` domain
- **CSRF Protection**: State parameter validation for OAuth2, CSRF tokens for state-changing operations
- **Rate Limiting**: Per-user and per-IP rate limits enforced

## Development

### Local Testing

Use Wrangler to run API locally:

```bash
wrangler dev
# API available at http://localhost:8787/api
```

### API Client Examples

**JavaScript (Fetch)**:
```javascript
const response = await fetch('https://winpodiums.com/api/profile/me', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});

const profile = await response.json();
```

**C# (Plugin)**:
```csharp
var client = new HttpClient();
client.DefaultRequestHeaders.Authorization = 
    new AuthenticationHeaderValue("Bearer", accessToken);

var response = await client.GetAsync("https://winpodiums.com/api/profile/me");
var profile = await response.Content.ReadAsAsync<UserProfile>();
```

## Related Documentation

- [Discord Integration LLD](../design/integrations/discord-integration.md) — Authentication flow details
- [SimHub Plugin LLD](../design/components/simhub-plugin.md) — Plugin-side API client
- [Database Schema](../design/data-models/database-schema.md) — Data models and entities
