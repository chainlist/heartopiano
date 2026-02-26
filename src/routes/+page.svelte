<script lang="ts">
  import Piano from "$lib/components/Piano.svelte";
</script>

<svelte:head>
  <title>Heartopiano</title>
</svelte:head>

<main>
  <div class="header">
    <h1 class="title">Heartopiano</h1>
    <p class="subtitle">By ChainList</p>
  </div>
  <Piano />
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
</style>
