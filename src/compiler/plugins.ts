/**
 * NOTE:
 *
 * 1. Why Svelte AST nodes had to be included?
 *    - During the compilation from Svelte to JS, HTML comments are removed.
 *    - Rollup' internal `this.parse()` excludes `leadingComments` from parsing.
 *      I couldn't find an option to override this behavior.
 *      I wanted to avoid adding another package for parsing _(getting AST)_ - e.g. `acorn`
 */

import fs from 'node:fs';

import MagicString from 'magic-string';
import { preprocess } from 'svelte/compiler';
import type { Plugin } from 'vite';

import { transformStoriesCode } from './post-transform';

import { getSvelteAST } from '#parser/ast';
import { extractCompiledASTNodes } from '#parser/extract/compiled/nodes';
import { extractSvelteASTNodes } from '#parser/extract/svelte/nodes';
import { extractLegacyNodes } from '#compiler/pre-transform/extractor';
import { codemodLegacyNodes } from '#compiler/pre-transform/index';

export async function preTransformPlugin(): Promise<Plugin> {
  const [{ createFilter }, { loadSvelteConfig }] = await Promise.all([
    import('vite'),
    import('@sveltejs/vite-plugin-svelte'),
  ]);

  const svelteConfig = await loadSvelteConfig();

  const include = /\.stories\.svelte$/;
  const filter = createFilter(include);

  return {
    name: 'storybook:addon-svelte-csf-plugin-pre',
    enforce: 'pre',
    async transform(code, id) {
      if (!filter(id)) return undefined;

      // @ts-expect-error FIXME: `this.originalCode` exists at runtime in the development mode only.
      // Need to research if its documented somewhere
      let legacyCode = this.originalCode ?? code;

      if (svelteConfig?.preprocess) {
        const processed = await preprocess(legacyCode, svelteConfig.preprocess, {
          filename: id,
        });
        legacyCode = processed.code;
      }

      let magicLegacyCode = new MagicString(legacyCode);

      const svelteAST = getSvelteAST({ code: legacyCode, filename: id });
      const legacyNodes = extractLegacyNodes(svelteAST);

      codemodLegacyNodes({
        code: magicLegacyCode,
        legacyNodes,
      });

      return {
        code: magicLegacyCode.toString(),
        map: magicLegacyCode.generateMap({ hires: true, source: id }),
      };
    },
  };
}

export async function postTransformPlugin(): Promise<Plugin> {
  const [{ createFilter }, { loadSvelteConfig }] = await Promise.all([
    import('vite'),
    import('@sveltejs/vite-plugin-svelte'),
  ]);

  const svelteConfig = await loadSvelteConfig();
  const include = /\.stories\.svelte$/;
  const filter = createFilter(include);

  return {
    name: 'storybook:addon-svelte-csf-plugin-post',
    enforce: 'post',
    async transform(compiledCode, id) {
      if (!filter(id)) return undefined;

      const compiledAST = this.parse(compiledCode);
      let magicCompiledCode = new MagicString(compiledCode);

      // @ts-expect-error FIXME: `this.originalCode` exists at runtime in the development mode only.
      // Need to research if its documented somewhere
      let rawCode = this.originalCode ?? fs.readFileSync(id).toString();

      if (svelteConfig?.preprocess) {
        const processed = await preprocess(rawCode, svelteConfig.preprocess, {
          filename: id,
        });
        rawCode = processed.code;
      }

      const svelteAST = getSvelteAST({ code: rawCode, filename: id });
      const svelteASTNodes = await extractSvelteASTNodes({
        ast: svelteAST,
        filename: id,
      });
      const compiledASTNodes = await extractCompiledASTNodes({
        ast: compiledAST,
        filename: id,
      });

      await transformStoriesCode({
        code: magicCompiledCode,
        nodes: {
          svelte: svelteASTNodes,
          compiled: compiledASTNodes,
        },
        filename: id,
        originalCode: rawCode,
      });

      return {
        code: magicCompiledCode.toString(),
        map: magicCompiledCode.generateMap({ hires: true, source: id }),
      };
    },
  };
}
