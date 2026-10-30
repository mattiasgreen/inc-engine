// Pure ES6 zero-dependency test runner for inc-engine
// Runs in both browser (test.html) and Node (node test/runner.js)

class AssertionError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AssertionError';
  }
}

function deepEqual(a, b) {
  if (Object.is(a, b)) return true;
  if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) {
    return false;
  }
  if (a.constructor !== b.constructor) return false;
  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
    if (!deepEqual(a[key], b[key])) return false;
  }
  return true;
}

export function expect(actual) {
  return {
    toBe(expected) {
      if (!Object.is(actual, expected)) {
        throw new AssertionError(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
      }
    },
    toEqual(expected) {
      if (!deepEqual(actual, expected)) {
        throw new AssertionError(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
      }
    },
    toBeGreaterThan(expected) {
      if (!(actual > expected)) {
        throw new AssertionError(`Expected ${actual} > ${expected}`);
      }
    },
    toBeGreaterThanOrEqual(expected) {
      if (!(actual >= expected)) {
        throw new AssertionError(`Expected ${actual} >= ${expected}`);
      }
    },
    toBeLessThan(expected) {
      if (!(actual < expected)) {
        throw new AssertionError(`Expected ${actual} < ${expected}`);
      }
    },
    toBeLessThanOrEqual(expected) {
      if (!(actual <= expected)) {
        throw new AssertionError(`Expected ${actual} <= ${expected}`);
      }
    },
    toBeCloseTo(expected, delta = 1e-6) {
      if (Math.abs(actual - expected) > delta) {
        throw new AssertionError(`Expected ${actual} close to ${expected} (within ${delta})`);
      }
    },
    toBeTruthy() {
      if (!actual) {
        throw new AssertionError(`Expected truthy, got ${actual}`);
      }
    },
    toBeFalsy() {
      if (actual) {
        throw new AssertionError(`Expected falsy, got ${actual}`);
      }
    },
    toThrow(pattern) {
      let threw = false;
      let error = null;
      try {
        actual();
      } catch (err) {
        threw = true;
        error = err;
      }
      if (!threw) {
        throw new AssertionError('Expected function to throw an error, but it did not');
      }
      if (pattern && error) {
        const msg = error.message || String(error);
        if (typeof pattern === 'string' && !msg.includes(pattern)) {
          throw new AssertionError(`Expected error message to include "${pattern}", got "${msg}"`);
        }
      }
    }
  };
}

const suites = [];
let currentSuite = null;

export function describe(name, fn) {
  const suite = { name, tests: [], passed: 0, failed: 0 };
  suites.push(suite);
  const prevSuite = currentSuite;
  currentSuite = suite;
  try {
    fn();
  } finally {
    currentSuite = prevSuite;
  }
}

export function it(name, fn) {
  if (!currentSuite) {
    describe('Default Suite', () => it(name, fn));
    return;
  }
  currentSuite.tests.push({ name, fn });
}

export async function runTests() {
  const summary = {
    total: 0,
    passed: 0,
    failed: 0,
    suites: []
  };

  const isNode = typeof process !== 'undefined' && process.release?.name === 'node';

  for (const suite of suites) {
    const suiteResult = { name: suite.name, tests: [], passed: 0, failed: 0 };
    if (isNode) console.log(`\n• ${suite.name}`);

    for (const test of suite.tests) {
      summary.total++;
      try {
        await test.fn();
        suiteResult.passed++;
        summary.passed++;
        suiteResult.tests.push({ name: test.name, passed: true });
        if (isNode) console.log(`  ✓ ${test.name}`);
      } catch (err) {
        suiteResult.failed++;
        summary.failed++;
        suiteResult.tests.push({ name: test.name, passed: false, error: err.stack || err.message });
        if (isNode) {
          console.error(`  ✗ ${test.name}`);
          console.error(`    ${err.message}`);
        }
      }
    }
    summary.suites.push(suiteResult);
  }

  if (isNode) {
    console.log(`\n========================================`);
    console.log(`Total: ${summary.total} | Passed: ${summary.passed} | Failed: ${summary.failed}`);
    console.log(`========================================\n`);
    if (summary.failed > 0) {
      process.exitCode = 1;
    }
  }

  if (typeof window !== 'undefined') {
    window.__TEST_RESULTS__ = { ...summary, done: true };
    renderToDom(summary);
  }

  return summary;
}

function renderToDom(summary) {
  const container = document.getElementById('test-output');
  if (!container) return;

  const statusClass = summary.failed === 0 ? 'all-passed' : 'has-failures';
  container.innerHTML = `
    <header class="header ${statusClass}">
      <h1>inc-engine Test Suite</h1>
      <div class="summary-badge">
        <span>Total: ${summary.total}</span>
        <span class="passed">Passed: ${summary.passed}</span>
        <span class="failed">Failed: ${summary.failed}</span>
      </div>
    </header>
    <main class="suites">
      ${summary.suites.map(s => `
        <section class="suite">
          <h2>${s.name} (${s.passed}/${s.tests.length})</h2>
          <ul>
            ${s.tests.map(t => `
              <li class="${t.passed ? 'pass' : 'fail'}">
                <span class="symbol">${t.passed ? '✓' : '✗'}</span>
                <span class="name">${t.name}</span>
                ${t.error ? `<pre class="error">${t.error}</pre>` : ''}
              </li>
            `).join('')}
          </ul>
        </section>
      `).join('')}
    </main>
  `;
}
