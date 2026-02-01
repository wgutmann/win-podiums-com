# Product Manager Skill — Examples

## Example 1: Invoke PM for PR review

**User:** "Review this PR as product manager — it changes docs/product/simhub-plugin-poc/README.md."

**Agent:** Uses the product-manager skill; adopts the PM personality; runs the [PM review checklist](docs/brand/product-manager-personality.md#review-process) (phase alignment, user value, brand voice, doc hierarchy); comments with pass/fail per item and links to docs.

---

## Example 2: Scope check

**User:** "Is adding a public leaderboard in scope for Phase 1?"

**Agent:** Uses the product-manager skill; answers with phase alignment from [Phase 1 MVP scope](docs/product/phase-1-mvp-scope.md) — leaderboards are Phase 2+; states rationale and points to the scope doc.

---

## Example 3: Brand voice for copy

**User:** "Draft the message we show when a user's first podium is verified."

**Agent:** Uses the product-manager skill; applies [brand voice](docs/brand/design-system.md#brand-voice--messaging) (formal but not stiff, earned not arrogant); proposes microcopy like "Verification complete: 1st Place, [track name]" and avoids "Congrats! You're in!"

---

## Example 4: PM as dedicated session (subagent chat)

**User:** Opens a new chat, @-mentions only `docs/brand/product-manager-personality.md`, and asks: "Run the PM review checklist on the current PR."

**Agent:** That chat is a PM-only session (subagent). Agent adopts the personality, fetches or infers PR context, and runs the checklist without mixing in coding or implementation.
