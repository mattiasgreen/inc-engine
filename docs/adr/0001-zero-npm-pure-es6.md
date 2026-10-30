# Zero NPM and Pure ES6 Modules

We build and run `inc-engine` using pure, native ES6 modules (`import`/`export`) without `npm`, `package.json`, `node_modules`, bundlers, or compilation steps. Numerical scaling beyond IEEE 754 `Number` limits is handled by an in-repo `BigNum` module (`{ m, e }`), and automated tests run directly as ES6 modules via an in-browser test harness (`/test.html`) driven by external Playwright. This eliminates build-tool complexity and dependency churn while ensuring the code running in tests is byte-for-byte identical to the code running in the browser.
