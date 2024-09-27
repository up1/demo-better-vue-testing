import path from 'path';
import { defineConfig } from 'vitest/config';

import viteConfig from './vite.config';

export default defineConfig({
  ...viteConfig,
  test: {
    clearMocks: true,
    coverage: {
      all: true,
      exclude: [
        `**/__test__/**/*`,
        `**/.eslintrc.js`,
        `**/*.spec.ts`,
        `test/**/*`,
      ],
      provider: `v8`,
      reporter: [`html`, `text`],
    },
    environment: `happy-dom`,
    setupFiles: [`./test/drivers/vitest/setup.ts`],
  },
});