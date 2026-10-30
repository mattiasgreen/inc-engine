# Zero NPM Playwright E2E Testing

We run browser end-to-end tests for `inc-engine` using Playwright without committing `package.json` or `node_modules` to the repository.

1. **Test Location**: E2E test scenarios live in `test/e2e/game.spec.js` using standard Playwright syntax.
2. **CI Automation**: GitHub Actions runs `npx --yes playwright install --with-deps chromium` on the ephemeral Ubuntu runner and executes the tests against a local static web server.
3. **Local Runs**: Developers can invoke Playwright on demand via `npx --yes @playwright/test test` without creating or committing package manifests in the project root.

This ensures full end-to-end browser verification of the DOM, persistence, and dev tools while preserving our strict Zero NPM constraint.
