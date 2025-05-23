import { describe, it } from 'vitest';

import { getStoryContentRawCode } from './content.js';

import { getSvelteAST } from '$lib/parser/ast.js';
import { extractSvelteASTNodes } from '$lib/parser/extract/svelte/nodes.js';
import dedent from 'dedent';

describe(getStoryContentRawCode.name, () => {
  describe('When a `<Story />` is a self-closing tag...', () => {
    it('works when `template` attribute was provided with a reference to snippet at the root of fragment', async ({
      expect,
    }) => {
      const code = `
        <script module>
          import { defineMeta } from "@storybook/addon-svelte-csf";

          import SampleComponent from "./SampleComponent.svelte";

          const { Story } = defineMeta({
            component: SampleComponent,
          });
        </script>

        {#snippet template(args)}
          <SomeComponent {...args} />
        {/snippet}

        <Story name="Default" {template} />
      `;
      const ast = getSvelteAST({ code });
      const svelteASTNodes = await extractSvelteASTNodes({ ast });
      const { storyComponents } = svelteASTNodes;
      const component = storyComponents[0].component;
      const rawSource = getStoryContentRawCode({
        nodes: {
          component,
          svelte: svelteASTNodes,
        },
        originalCode: code,
      });

      expect(rawSource).toBe('<SomeComponent {...args} />');
    });

    it('works when `render` is set in `defineMeta`', async ({ expect }) => {
      const code = `
        <script module>
          import { defineMeta } from "@storybook/addon-svelte-csf";

          import SampleComponent from "./SampleComponent.svelte";

          const { Story } = defineMeta({
            component: SampleComponent,
            render: template,
          });
        </script>

        {#snippet template(args)}
          <SomeComponent {...args} />
        {/snippet}

        <Story name="Default" />
      `;
      const ast = getSvelteAST({ code });
      const svelteASTNodes = await extractSvelteASTNodes({ ast });
      const { storyComponents } = svelteASTNodes;
      const component = storyComponents[0].component;
      const rawSource = getStoryContentRawCode({
        nodes: {
          component,
          svelte: svelteASTNodes,
        },
        originalCode: code,
      });

      expect(rawSource).toBe('<SomeComponent {...args} />');
    });

    it('works implicit `template` attribute takes precedence over `render` in `defineMeta`', async ({
      expect,
    }) => {
      const code = `
        <script module>
          import { defineMeta } from "@storybook/addon-svelte-csf";

          import SampleComponent from "./SampleComponent.svelte";

          const { Story } = defineMeta({
            component: SampleComponent,
            render: templateForRender,
          });
        </script>

        {#snippet templateForRender(args)}
          <SomeComponent wins="render" {...args} />
        {/snippet}

        {#snippet templateForTemplateAttribute(args)}
          <SomeComponent wins="templateAttribute" {...args} />
        {/snippet}

        <Story name="Default" template={templateForTemplateAttribute} />
      `;
      const ast = getSvelteAST({ code });
      const svelteASTNodes = await extractSvelteASTNodes({ ast });
      const { storyComponents } = svelteASTNodes;
      const component = storyComponents[0].component;
      const rawSource = getStoryContentRawCode({
        nodes: {
          component,
          svelte: svelteASTNodes,
        },
        originalCode: code,
      });

      expect(rawSource).toBe(`<SomeComponent wins="templateAttribute" {...args} />`);
    });

    it('works when no `render` in `defineMeta`, no `template` attribute, just a story', async ({
      expect,
    }) => {
      const code = `
        <script module>
          import { defineMeta } from "@storybook/addon-svelte-csf";

          import SampleComponent from "./SampleComponent.svelte";

          const { Story } = defineMeta({
            component: SampleComponent,
          });
        </script>

        <Story name="Default" />
      `;
      const ast = getSvelteAST({ code });
      const svelteASTNodes = await extractSvelteASTNodes({ ast });
      const { storyComponents } = svelteASTNodes;
      const component = storyComponents[0].component;
      const rawSource = getStoryContentRawCode({
        nodes: {
          component,
          svelte: svelteASTNodes,
        },
        originalCode: code,
      });

      expect(rawSource).toBe(`<SampleComponent {...args} />`);
    });
  });

  describe('When a `<Story />` is NOT a self-closing tag...', () => {
    it('works when a static children content provided with asChild', async ({ expect }) => {
      const code = `
        <script module>
          import { defineMeta } from "@storybook/addon-svelte-csf";

          import SampleComponent from "./SampleComponent.svelte";

          const { Story } = defineMeta({
            component: SampleComponent,
          });
        </script>

        <Story name="Default" asChild>
          <h1>Static content</h1>
        </Story>
      `;
      const ast = getSvelteAST({ code });
      const svelteASTNodes = await extractSvelteASTNodes({ ast });
      const { storyComponents } = svelteASTNodes;
      const component = storyComponents[0].component;
      const rawSource = getStoryContentRawCode({
        nodes: {
          component,
          svelte: svelteASTNodes,
        },
        originalCode: code,
      });

      expect(rawSource).toBe(`<h1>Static content</h1>`);
    });

    it('works when a static children content provided as a child to the component', async ({
      expect,
    }) => {
      const code = `
        <script module>
          import { defineMeta } from "@storybook/addon-svelte-csf";

          import SampleComponent from "./SampleComponent.svelte";

          const { Story } = defineMeta({
            component: SampleComponent,
          });
        </script>

        <Story name="Default">
          <h1>Static children content</h1>
        </Story>
      `;
      const ast = getSvelteAST({ code });
      const svelteASTNodes = await extractSvelteASTNodes({ ast });
      const { storyComponents } = svelteASTNodes;
      const component = storyComponents[0].component;
      const rawSource = getStoryContentRawCode({
        nodes: {
          component,
          svelte: svelteASTNodes,
        },
        originalCode: code,
      });

      expect(rawSource).toBe(dedent`<SampleComponent {...args}>
          <h1>Static children content</h1>
        </SampleComponent>`);
    });

    it("works when a `template` svelte's snippet block used inside", async ({ expect }) => {
      const code = `
        <script module>
          import { defineMeta } from "@storybook/addon-svelte-csf";

          import SampleComponent from "./SampleComponent.svelte";

          const { Story } = defineMeta({
            component: SampleComponent,
          });
        </script>

        <Story name="Default">
          {#snippet template(args)}
            <SomeComponent {...args} />
          {/snippet}
        </Story>
      `;
      const ast = getSvelteAST({ code });
      const svelteASTNodes = await extractSvelteASTNodes({ ast });
      const { storyComponents } = svelteASTNodes;
      const component = storyComponents[0].component;
      const rawSource = getStoryContentRawCode({
        nodes: {
          component,
          svelte: svelteASTNodes,
        },
        originalCode: code,
      });

      expect(rawSource).toBe(`<SomeComponent {...args} />`);
    });

    it("inner `<Story>`'s template content takes precedence over `render` in `defineMeta`", async ({
      expect,
    }) => {
      const code = `
        <script module>
          import { defineMeta } from "@storybook/addon-svelte-csf";

          import SampleComponent from "./SampleComponent.svelte";

          const { Story } = defineMeta({
            component: SampleComponent,
          });
        </script>

        {#snippet templateForRender(args)}
          <SomeComponent wins="render" {...args} />
        {/snippet}

        <Story name="Default">
          {#snippet template(args)}
            <SomeComponent wins="inner-template" {...args} />
          {/snippet}
        </Story>
      `;
      const ast = getSvelteAST({ code });
      const svelteASTNodes = await extractSvelteASTNodes({ ast });
      const { storyComponents } = svelteASTNodes;
      const component = storyComponents[0].component;
      const rawSource = getStoryContentRawCode({
        nodes: {
          component,
          svelte: svelteASTNodes,
        },
        originalCode: code,
      });

      expect(rawSource).toBe(`<SomeComponent wins="inner-template" {...args} />`);
    });
  });
});
