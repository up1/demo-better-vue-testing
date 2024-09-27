import type { PlaywrightTestConfig } from '@playwright/test';
import { devices } from '@playwright/test';

const config: PlaywrightTestConfig = {
  fullyParallel: true,
  workers: process.env.CI ? 1 : `100%`,
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        headless: false,
        screenshot: 'on',
        video: 'on',
        launchOptions: {
          args: ["--start-maximized"],
        },
      },
    },
  ],
};

export default config;
