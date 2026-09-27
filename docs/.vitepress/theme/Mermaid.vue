<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useData } from 'vitepress';

const props = defineProps<{ code: string }>();
const { isDark } = useData();
const svg = ref('');
const error = ref('');

// Mermaid needs the browser, so it's loaded and run only after the page appears.
async function render() {
  const { default: mermaid } = await import('mermaid');
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'strict',
    theme: isDark.value ? 'dark' : 'default',
    // Sequence diagrams have many columns: pack them tightly so they fit the page readably.
    sequence: {
      actorMargin: 24,
      width: 120,
      messageFontSize: 13,
      actorFontSize: 13,
      noteFontSize: 13,
      mirrorActors: false,
    },
  });
  try {
    const id = `mermaid-${Math.random().toString(36).slice(2)}`;
    const result = await mermaid.render(id, decodeURIComponent(props.code));
    svg.value = result.svg;
    error.value = '';
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err);
  }
}

onMounted(render);
watch(isDark, render);
</script>

<template>
  <div class="mermaid-diagram">
    <div v-if="svg" v-html="svg" />
    <pre v-else-if="error" class="mermaid-error">Diagram failed to render: {{ error }}</pre>
    <p v-else class="mermaid-loading">Drawing diagram…</p>
  </div>
</template>
