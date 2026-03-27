# Agent Instructions for addon-svelte-csf

Keep this file, `AGENTS.md`, up to date when the repo's architecture, tooling, workflows, or contributor guidance changes.

This file is the canonical instruction source for coding agents. `CLAUDE.md` points here instead of duplicating instructions.

## Repository Overview

`@storybook/addon-svelte-csf` is a Storybook addon that lets you write stories using the Svelte language (`.stories.svelte` files) instead of regular CSF.

- **Base branch**: `main` (all PRs should target `main`)
- **Node.js**: `24` (see `.nvmrc`)
- **Package Manager**: pnpm (see `packageManager` in `package.json`)

## Common Commands

```bash
pnpm install          # Install dependencies
pnpm build            # Build the addon
pnpm test             # Run unit tests
pnpm storybook        # Start Storybook dev server
pnpm lint             # Lint the codebase
pnpm format           # Format the codebase
pnpm svelte-check     # Run Svelte type checking
```

## Release Process

This repo uses [Changesets](https://github.com/changesets/changesets) for versioning and publishing.

```bash
pnpm changeset   # Create a changeset for your changes
pnpm release     # Build and publish (CI handles this automatically)
```

### Creating Changesets (MANDATORY for user-facing changes)

When making changes that affect users (bug fixes, new features, breaking changes, dependency updates), you **MUST** create a changeset file.

**Steps:**

1. Create a new `.md` file in the `.changeset/` directory
2. Use a descriptive kebab-case filename (e.g., `fix-story-loading.md`)
3. Format:

```markdown
---
"@storybook/addon-svelte-csf": patch
---

Short description of what changed.
```

**Version bump types:**

- `patch` — Bug fixes, internal improvements, dependency updates (non-breaking)
- `minor` — New features (backward compatible)
- `major` — Breaking changes

**Writing the description — keep it short:**

- **Default: one sentence.** Most changes need nothing more than a brief statement of what changed.
- Only write more when you are introducing a **breaking change** or a **new public API** that users need to understand or act on — in those cases add migration steps or usage examples.
- Do **not** explain why the change was made, internal implementation details, or repeat what is obvious from the diff.

**Examples:**

```markdown
---
"@storybook/addon-svelte-csf": patch
---

Fix story auto-title not respecting the `prefix` option.
```

```markdown
---
"@storybook/addon-svelte-csf": minor
---

Add `autodocs` support for `.stories.svelte` files.
```

```markdown
---
"@storybook/addon-svelte-csf": major
---

Remove the deprecated `<Story name="...">` syntax. Use the `defineMeta` / `Story` component API instead. See the [migration guide](./MIGRATION.md) for details.
```
