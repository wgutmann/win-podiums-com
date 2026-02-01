# Optional tests

Tests in this folder run **only after all required tests pass** (see `test/required/`).

Use optional for:

- Non-critical or exploratory tests
- Slower or flaky tests you still want in CI when required are green
- Integration-style tests that depend on required unit behavior

Add `*.test.ts` here; they are executed by `npm run test:unit` after the required group.
