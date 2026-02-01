# PR and testing flow

Flow of a pull request and how tests run: automatic CI (path-filtered), manual Security trigger, and merge gate. See [testing harness](../../guides/testing-harness.md).

**Source:** [pr-testing-flow.mmd](pr-testing-flow.mmd)

```mermaid
%% PR and testing flow — CI (path-filtered), Security (manual), merge gate
%% See docs/guides/testing-harness.md

flowchart TB
    subgraph PR["Pull request (opened / push / reopened)"]
        A[PR opened or sync]
    end

    subgraph Auto["Automatic (on push/PR)"]
        B[Paths filter]
        C{API paths changed?}
        D[CI: API job\n typecheck, lint, unit tests]
        E{Plugin paths changed?}
        F[CI: Plugin build]
        G[PR instructions workflow]
        H[Post or update comment:\n how to run required tests]
    end

    subgraph Manual["Required for merge (manual trigger)"]
        I[Author or reviewer]
        J{How to run Security?}
        K[Comment /run-security on PR]
        L[Actions tab → Security → Run workflow]
        M[Security workflow runs on PR head]
        N[Secret scan, deps audit, CodeQL]
        O[security-gate job passes]
    end

    subgraph Merge["Merge"]
        P{CI passed?\n security-gate passed?}
        Q[Merge allowed]
        R[Merge blocked]
    end

    A --> B
    A --> G
    B --> C
    B --> E
    C -->|yes| D
    E -->|yes| F
    G --> H

    H -.->|"Comment explains"| I
    I --> J
    J -->|Option 1| K
    J -->|Option 2| L
    K --> M
    L --> M
    M --> N
    N --> O

    D --> P
    F --> P
    O --> P
    P -->|yes| Q
    P -->|no| R
```
