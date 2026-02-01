# System Overview Diagram

Component relationships: User Devices, Desktop (SimHub + Plugin), Cloudflare Edge (Workers, D1, R2), External Services (Discord OAuth, Webhooks). See [high-level-design](../high-level-design.md) and [architecture README](../README.md).

Source: [system-overview.mmd](system-overview.mmd)

```mermaid
%% System Overview Diagram — WinPodiums architecture (see HLD and architecture README)
graph TB
    subgraph User_Devices [User Devices]
        Browser[Web Browser]
        Phone[Mobile Phone]
        SimRig[Sim Racing Rig]
    end

    subgraph Desktop_Environment [Desktop Environment]
        SimHub[SimHub Application]
        Plugin["WinPodiums Plugin (.NET Framework 4.8)"]
        SimHub -->|Telemetry Events| Plugin
    end

    subgraph Cloudflare_Edge [Cloudflare Edge Network]
        Pages["Cloudflare Workers (Web + API)"]
        D1["Cloudflare D1 (SQLite Database)"]
        R2["Cloudflare R2 (Plugin Downloads)"]

        Pages -->|Read/Write| D1
        Pages -->|Serve Files| R2
    end

    subgraph External_Services [External Services]
        DiscordOAuth[Discord OAuth2 API]
        DiscordWebhook[Discord Webhooks]
    end

    Browser -->|HTTPS| Pages
    Browser -->|OAuth Flow| DiscordOAuth
    Phone -->|QR Scan OAuth| DiscordOAuth
    Plugin -->|HTTPS API| Pages
    Plugin -->|Download Updates| R2

    Pages -->|Verify Tokens| DiscordOAuth
    Pages -->|Send Notifications| DiscordWebhook

    SimRig -.->|Runs| SimHub
```
