# Data Flow Diagram

Request/response patterns: web auth flow (GET /auth/discord, OAuth2, callback, session); plugin API flow (POST /api/plugin/heartbeat, GET /api/profile/me); Workers, D1, KV, Discord OAuth2. See [architecture README](../README.md).

Source: [data-flow.mmd](data-flow.mmd)

```mermaid
%% Data Flow — Request/response patterns (see architecture README)
sequenceDiagram
    participant User
    participant Worker as Workers (Web + API)
    participant D1 as D1
    participant KV as Workers KV
    participant Discord as Discord OAuth2

    Note over User, Discord: Web auth flow
    User->>Worker: GET /auth/discord (redirect)
    Worker->>Discord: OAuth2 authorize
    User->>Discord: Login/consent
    Discord->>Worker: Callback with code
    Worker->>Discord: Exchange code for tokens
    Worker->>D1: Store user / session
    Worker->>User: Redirect with session

    Note over User, Discord: Plugin API flow
    User->>Worker: POST /api/plugin/heartbeat (token)
    Worker->>KV: Read/write heartbeat state
    Worker->>D1: Optional user lookup
    Worker->>User: 200 OK

    User->>Worker: GET /api/profile/me (token)
    Worker->>KV: Optional cache
    Worker->>D1: User profile
    Worker->>User: Profile JSON
```
