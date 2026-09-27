import path from 'node:path';
import { defineConfig } from 'vitepress';

const REPO_URL = 'https://github.com/Vijayperi/ClinicQ';
// Where the lesson files live inside the repo, for turning relative links into GitHub links.
const COURSE_DIR = 'docs/course';

const weeks = [
  ['week-00', 'Week 0: Setup and tour'],
  ['week-01', 'Week 1: The big picture'],
  ['week-02', 'Week 2: TypeScript in ClinicQ'],
  ['week-03', 'Week 3: Backend I'],
  ['week-04', 'Week 4: Backend II'],
  ['week-05', 'Week 5: Database'],
  ['week-06', 'Week 6: Auth and security'],
  ['week-07', 'Week 7: Frontend I'],
  ['week-08', 'Week 8: Frontend II'],
  ['week-09', 'Week 9: Quality'],
  ['week-10', 'Week 10: Shipping and capstone'],
];

export default defineConfig({
  title: 'Reading ClinicQ',
  description: 'A code-literacy course that uses a real clinic booking app as its textbook.',
  srcDir: 'course',
  // GitHub Pages serves the site from /ClinicQ/; locally it's served from /.
  base: process.env.DOCS_BASE ?? '/',
  // The course home is README.md so it also works on GitHub; the site serves it as the home page.
  rewrites: { 'README.md': 'index.md' },
  cleanUrls: true,
  // Lessons link to the app running on your machine (localhost), which the build can't check.
  ignoreDeadLinks: 'localhostLinks',
  head: [
    [
      'link',
      { rel: 'icon', type: 'image/svg+xml', href: `${process.env.DOCS_BASE ?? '/'}favicon.svg` },
    ],
  ],

  markdown: {
    config(md) {
      // Draw ```mermaid blocks as diagrams in the browser.
      const defaultFence = md.renderer.rules.fence!;
      md.renderer.rules.fence = (tokens, idx, options, env, self) => {
        const token = tokens[idx];
        if (token.info.trim() === 'mermaid') {
          return `<Mermaid code="${encodeURIComponent(token.content)}" />`;
        }
        return defaultFence(tokens, idx, options, env, self);
      };

      // Lessons quote JSX and GitHub Actions syntax like `{{ … }}` in inline code. VitePress would
      // treat that as a Vue template expression, so mark inline code as "don't interpret".
      const defaultCodeInline = md.renderer.rules.code_inline!;
      md.renderer.rules.code_inline = (tokens, idx, options, env, self) =>
        defaultCodeInline(tokens, idx, options, env, self).replace(/^<code/, '<code v-pre');

      // Lessons link to code with relative paths like ../../apps/api/src/app.ts, which work on GitHub
      // and in VS Code. On the website those files don't exist, so point them at GitHub instead.
      md.core.ruler.after('inline', 'clinicq-links', (state) => {
        const currentDir = path.posix.dirname(state.env.relativePath ?? '');
        for (const block of state.tokens) {
          for (const token of block.children ?? []) {
            if (token.type !== 'link_open') continue;
            const href = token.attrGet('href');
            if (!href || /^([a-z]+:|#|\/)/i.test(href)) continue;

            const [target, hash] = href.split('#');
            const fromCourseRoot = path.posix.normalize(path.posix.join(currentDir, target));
            const anchor = hash ? `#${hash}` : '';

            if (fromCourseRoot === 'README.md') {
              token.attrSet('href', `/${anchor}`);
            } else if (fromCourseRoot.startsWith('../')) {
              const repoPath = path.posix.normalize(path.posix.join(COURSE_DIR, fromCourseRoot));
              token.attrSet('href', `${REPO_URL}/blob/main/${repoPath}${anchor}`);
            }
          }
        }
      });
    },
  },

  // Mermaid is a large library, loaded only on pages with diagrams; its bundle size is expected.
  vite: { build: { chunkSizeWarningLimit: 3000 } },

  themeConfig: {
    logo: '/favicon.svg',
    nav: [
      { text: 'Course home', link: '/' },
      { text: 'Start: Week 0', link: '/week-00' },
      { text: 'Capstone', link: '/week-10#capstone' },
    ],
    sidebar: [
      {
        text: 'Start here',
        items: [
          { text: 'Course home', link: '/' },
          { text: 'Architecture', link: '/#architecture-overview' },
          { text: 'Folder map', link: '/#folder-map' },
          { text: 'How to build with AI', link: '/#how-to-build-with-ai' },
        ],
      },
      {
        text: 'Lessons',
        items: weeks.map(([slug, text]) => ({ text, link: `/${slug}` })),
      },
    ],
    outline: { level: [2, 3], label: 'On this page' },
    search: { provider: 'local' },
    socialLinks: [{ icon: 'github', link: REPO_URL }],
    editLink: {
      pattern: `${REPO_URL}/edit/main/${COURSE_DIR}/:path`,
      text: 'Suggest a fix to this page on GitHub',
    },
    docFooter: { prev: 'Previous lesson', next: 'Next lesson' },
    footer: {
      message: 'The code quoted in these lessons is the real, running ClinicQ code.',
    },
  },
});
