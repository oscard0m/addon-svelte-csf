<script lang="ts">
  import type { Component } from 'svelte';

  import type { Cmp } from '$lib/types.js';

  import {
    type StoriesRepository,
    createStoriesExtractorContext,
  } from '$lib/runtime/contexts/extractor.svelte';

  interface Props {
    Stories: Component;
    repository: () => StoriesRepository<Cmp>;
  }

  const { Stories, repository }: Props = $props();

  createStoriesExtractorContext(repository());
</script>

<Stories />
