 # Examples
 
 ## Example 1: PR review with change control
 
 **User request:** "Review this PR and confirm change control standards."
 
 **Assistant response (checklist + template):**
 - [ ] Scope: Update auth token refresh logic for API clients.
 - [ ] Risk: Medium; auth changes could impact login reliability.
 - [ ] Review: Require security reviewer and backend owner.
 - [ ] Testing: Add/confirm integration test for refresh flow.
 - [ ] Rollback: Revert commit and redeploy previous build.
 - [ ] Documentation: Update CHANGELOG and README auth notes.
 
 ```
 ## Summary
 - Refresh flow now retries once on 401 before re-auth
 - Reduced login failures for expired tokens
 
 ## Risk
 - medium: auth flow touchpoint
 
 ## Test Plan
 - [ ] Run auth integration tests
 - [ ] Verify refresh path in staging
 
 ## Rollback
 - Revert PR commit and redeploy
 ```
 
 ## Example 2: Repo governance audit
 
 **User request:** "Audit our repo protections and recommend changes."
 
 **Assistant response:**
 ```
 ## Findings
 - main branch lacks required status checks
 - linear history disabled
 - 6 admins with merge rights
 
 ## Recommendations
 - Require CI checks for merge (build, test, lint)
 - Enable linear history to reduce merge complexity
 - Reduce admins to repo owners only
 ```
 
 ## Example 3: Gitignore + secret hygiene
 
 **User request:** "We accidentally committed a .env file, what should we do?"
 
 **Assistant response:**
 - [ ] Stop the change: remove `.env` from the repo.
 - [ ] Rotate and revoke exposed secrets immediately.
 - [ ] Add `.env` to `.gitignore` and add `.env.example`.
 - [ ] Document secure workflow in `SECURITY.md` or `CONTRIBUTING.md`.
 - [ ] Enable secret scanning or pre-commit checks.
 
 ```
 Files ignored:
 - .env (local env variables)
 
 Safety checks:
 - Verified no required artifacts are hidden
 - Added .env.example
 ```
 
 ## Example 4: Documentation update request
 
 **User request:** "Add change control guidance to CONTRIBUTING."
 
 **Assistant response:**
 - [ ] Add section describing required reviews and checks.
 - [ ] Reference PR template and test plan expectations.
 - [ ] Mention rollback expectations for risky changes.
 
 **Suggested section (template):**
 ```
 ## Change control
 - All changes require PRs with a summary, risk, test plan, and rollback.
 - At least one code owner must approve before merge.
 - CI checks must pass prior to merge.
 ```
