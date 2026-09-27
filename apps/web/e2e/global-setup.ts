import { execSync } from 'node:child_process';

// Bring the E2E database up to date and reload the sample data, so every run starts the same.
export default function globalSetup() {
  const env = {
    ...process.env,
    NODE_ENV: 'test',
    DATABASE_URL:
      process.env.E2E_DATABASE_URL ?? 'postgresql://clinicq:clinicq@localhost:5432/clinicq_e2e',
  };
  execSync('npx prisma migrate deploy', { cwd: '../api', env, stdio: 'inherit' });
  execSync('npx prisma db seed', { cwd: '../api', env, stdio: 'inherit' });
}
