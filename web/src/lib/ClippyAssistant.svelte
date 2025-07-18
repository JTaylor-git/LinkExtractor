<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import clippy from 'clippyjs';

  const dispatch = createEventDispatcher();
  let agent: any;

  const hints: Record<number, string> = {
    1: 'Enter the site URL above',
    2: 'Set depth & file filters',
    3: 'Click ▶︎ Run to start scraping',
    4: 'All done—download your data!'
  };

  onMount(() => {
    clippy.load('Clippy', (a: any) => {
      agent = a;
      agent.show();
      agent.moveTo(window.innerWidth - 200, window.innerHeight - 200);
      agent.speak('🔍 Hi! I’m Clippr, your scraping assistant.');
      dispatch('ready');
    });
    return () => agent && agent.hide();
  });

  export function stepTo(n: number) {
    if (!agent) return;
    const text = hints[n] || 'Let me know if you need help!';
    agent.animate();
    agent.speak(text);
  }
</script>

<style>
  :global(body) { position: relative; }
</style>

<!-- no visible markup; Clippy attachments go to <body> -->
