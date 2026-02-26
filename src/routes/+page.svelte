<script lang="ts">
  import Piano from "$lib/components/Piano.svelte";
  import Violin from "$lib/components/Violin.svelte";

  let instrument: "piano" | "violin" = $state("piano");
</script>

<svelte:head>
  <title>Heartopiano</title>
</svelte:head>

<main>
  <div class="header">
    <h1 class="title">Heartopiano</h1>
    <p class="subtitle">By ChainList</p>
  </div>
  <div class="instrument-tabs">
    <button
      class="tab"
      class:active={instrument === "piano"}
      onclick={() => (instrument = "piano")}>
      Piano
    </button>
    <button
      class="tab"
      class:active={instrument === "violin"}
      onclick={() => (instrument = "violin")}>
      Violin
    </button>
  </div>
  {#if instrument === "piano"}
    <Piano />
  {:else}
    <Violin />
  {/if}
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 20px;
  }

  .header {
    margin-bottom: 20px;
  }

  .title {
    font-size: 2rem;
    font-weight: 300;
    letter-spacing: 4px;
    color: #e8d5f5;
    text-shadow: 0 0 30px rgba(180, 130, 220, 0.3);
    margin: 0 0 -4px;
  }

  .subtitle {
    text-align: right;
    font-size: 0.85rem;
    color: #dfdfdf;
    margin: 0;
  }

  .instrument-tabs {
    display: flex;
    gap: 4px;
    margin-bottom: 8px;
    background: rgba(255, 255, 255, 0.06);
    border-radius: 10px;
    padding: 4px;
  }

  .tab {
    padding: 8px 24px;
    border: none;
    border-radius: 8px;
    background: transparent;
    color: rgba(255, 255, 255, 0.5);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition:
      background 0.15s,
      color 0.15s;
  }

  .tab:hover {
    color: rgba(255, 255, 255, 0.7);
  }

  .tab.active {
    background: rgba(255, 255, 255, 0.12);
    color: #e8d5f5;
  }
</style>
