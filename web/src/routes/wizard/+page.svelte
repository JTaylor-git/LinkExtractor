<script lang="ts">
  import ClippyAssistant, { stepTo } from '$lib/ClippyAssistant.svelte';
  let wizardStep = 1;

  function nextStep() {
    wizardStep += 1;
    stepTo(wizardStep);
  }
</script>

<ClippyAssistant on:ready={() => stepTo(1)} />

<div class="wizard text-white p-4 space-y-4 bg-gray-900 min-h-screen">
  {#if wizardStep === 1}
    <div>
      <label class="block mb-2" for="start-url">Start URL</label>
      <input class="text-black" id="start-url" type="text" />
      <button class="ml-2 px-3 py-1 bg-blue-600" on:click={nextStep}>Set URL →</button>
    </div>
  {:else if wizardStep === 2}
    <div>
      <label class="block mb-2" for="depth">Depth</label>
      <input class="text-black" id="depth" type="number" min="1" max="5" />
      <button class="ml-2 px-3 py-1 bg-blue-600" on:click={nextStep}>Set Depth & Filters →</button>
    </div>
  {:else if wizardStep === 3}
    <div>
      <button class="px-3 py-1 bg-green-600" on:click={nextStep}>Run Scrape →</button>
    </div>
  {:else}
    <p>🎉 All steps done! Download your data.</p>
  {/if}
</div>
