/// <reference types="vitest" />

import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import inspect from 'vite-plugin-inspect';

export default defineConfig({
  plugins: [
    svelte(),
    inspect({
      dev: true,
      build: true,
    }),
  ],
  test: {
    dir: './src/',
    environment: 'happy-dom',
    globals: true,
  },
});
