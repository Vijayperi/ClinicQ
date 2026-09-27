import { readFileSync } from 'node:fs';
import { parse } from 'dotenv';
import { defineConfig } from 'vitest/config';

// Tests use their own database, configured in .env.test.
const testEnv = parse(readFileSync('.env.test'));

export default defineConfig({
  test: {
    env: testEnv,
    globalSetup: './tests/globalSetup.ts',
    // The API tests share one database, so run test files one at a time.
    fileParallelism: false,
  },
});
