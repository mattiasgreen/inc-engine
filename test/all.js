// test/all.js
// Runs the complete test suite across all seams

import './bignum.test.js';
import './engine.test.js';
import './session.test.js';
import './pacing.test.js';
import './contribution.test.js';
import './games.test.js';
import { runTests } from './runner.js';

runTests();
