<script context="module" lang="ts">
  const hints: Record<number, string> = {
    1: 'Enter the site URL above',
    2: 'Set depth & file filters',
    3: 'Click ▶︎ Run to start scraping',
    4: 'All done—download your data!'
  };

  let agentRef: any;

  export function stepTo(n: number) {
    if (!agentRef) return;
    const text = hints[n] || 'Let me know if you need help!';
    agentRef.animate();
    agentRef.speak(text);
  }
</script>

<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import clippy from 'clippyjs';

  const dispatch = createEventDispatcher();
  let agent: any;

  onMount(() => {
    clippy.load('Clippy', (a: any) => {
      agent = a;
      agentRef = a;
      agent.show();
      agent.moveTo(window.innerWidth - 200, window.innerHeight - 200);
      agent.speak('🔍 Hi! I’m Clippr, your scraping assistant.');
      dispatch('ready');
    });

    return () => agent && agent.hide();
  });
</script>

<style>
  :global(body) { position: relative; }
</style>

<!-- no visible markup; Clippy attachments go to <body> -->
