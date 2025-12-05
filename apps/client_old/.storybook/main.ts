import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import type { StorybookConfig } from "@storybook/nextjs-vite";

const require = createRequire(import.meta.url);

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    getAbsolutePath('@storybook/addon-a11y'),
    getAbsolutePath("@storybook/addon-vitest")
  ],

  framework: {
    name: getAbsolutePath("@storybook/nextjs-vite"),
    options: {},
  },

  staticDirs: ['../public'],

  core: {
    disableTelemetry: true,
  },
};

export default config;

function getAbsolutePath(value: string): string {
  return dirname(require.resolve(join(value, 'package.json')));
}
