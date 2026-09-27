import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { parse } from 'dotenv';

// Runs once before all tests: bring the test database schema up to date.
export default function setup() {
  const testEnv = parse(readFileSync('.env.test'));
  execSync('npx prisma migrate deploy', {
    env: { ...process.env, ...testEnv },
    stdio: 'ignore',
  });
}
