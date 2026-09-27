// Keeps the lessons honest:
// 1. Every line of code a lesson quotes (```ts, ```tsx, ```prisma, ```yaml, ```sql, ```css, ```json,
//    ```dockerfile, ```nginx)
//    must exist somewhere in the repo, so lessons fail CI when the code they quote changes.
//    Put <!-- example --> on the line before a block that is illustrative, not quoted.
// 2. Every relative link must point at a file or folder that exists.
import { execSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const courseDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'course');
const repoRoot = path.resolve(courseDir, '..', '..');
const CHECKED_LANGUAGES = new Set([
  'ts',
  'tsx',
  'prisma',
  'yaml',
  'sql',
  'css',
  'json',
  'dockerfile',
  'nginx',
]);

// Tracked files plus new files not yet committed (but never ignored ones like .env).
const trackedFiles = execSync('git ls-files --cached --others --exclude-standard', {
  cwd: repoRoot,
  encoding: 'utf8',
})
  .split('\n')
  .filter(
    (file) => file && !file.startsWith('docs/course/') && !file.endsWith('package-lock.json'),
  );
const repoLines = new Set();
for (const file of trackedFiles) {
  for (const line of readFileSync(path.join(repoRoot, file), 'utf8').split('\n')) {
    repoLines.add(line.trim());
  }
}

const problems = [];
const lessons = readdirSync(courseDir).filter((file) => file.endsWith('.md'));

for (const lesson of lessons) {
  const text = readFileSync(path.join(courseDir, lesson), 'utf8');

  const blockPattern = /(<!-- example -->\s*)?```(\w+)[^\n]*\n([\s\S]*?)```/g;
  for (const [, exampleMarker, language, body] of text.matchAll(blockPattern)) {
    if (exampleMarker || !CHECKED_LANGUAGES.has(language)) continue;
    for (const line of body.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed === '...' || trimmed === '// ...' || trimmed === '{/* ... */}')
        continue;
      if (!repoLines.has(trimmed)) {
        problems.push(`${lesson}: quoted line not found in the repo: ${trimmed}`);
      }
    }
  }

  for (const [, href] of text.matchAll(/\]\(([^)\s]+)\)/g)) {
    if (/^([a-z]+:|#)/i.test(href)) continue;
    const target = path.resolve(courseDir, href.split('#')[0]);
    if (!existsSync(target)) {
      problems.push(`${lesson}: broken link: ${href}`);
    }
  }
}

if (problems.length > 0) {
  console.error(problems.join('\n'));
  console.error(`\n${problems.length} problem(s) found in the lessons.`);
  process.exit(1);
}
console.log(`Checked ${lessons.length} lessons: all quoted code and links are current.`);
