import type { StorybookConfig } from '@storybook/svelte-vite';

const examplesOnly = process.env.EXAMPLES_ONLY === 'true';

const config: StorybookConfig = {
  stories: [
    '../**/*.mdx',
    {
      directory: '../examples',
      files: '**/*.stories.@(ts|svelte)',
      titlePrefix: examplesOnly ? undefined : 'Examples',
    },
    !examplesOnly && {
      directory: '../tests/stories',
      files: '**/*.stories.@(ts|svelte)',
      titlePrefix: 'Tests',
    },
  ].filter(Boolean) as StorybookConfig['stories'],
  framework: '@storybook/svelte-vite',
  addons: ['../dist/preset.js', '@storybook/addon-essentials', '@storybook/addon-interactions'],
};

export default config;
