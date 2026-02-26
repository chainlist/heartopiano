<script lang="ts">
  import Piano from "$lib/components/Piano.svelte";
</script>

<svelte:head>
  <title>Heartopiano</title>
</svelte:head>

<main>
  <div class="header">
    <h1>Heartopiano</h1>
    <p>Made by ChainList</p>
  </div>
  <Piano />
</main>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    min-height: 100vh;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    font-family:
      "Segoe UI",
      system-ui,
      -apple-system,
      sans-serif;
    color: #e0e0e0;
    overflow-x: hidden;
  }

  main {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 20px;
  }

  .header {
    text-align: center;
    margin-bottom: 20px;
  }

  h1 {
    font-size: 2rem;
    font-weight: 300;
    letter-spacing: 4px;
    color: #e8d5f5;
    text-shadow: 0 0 30px rgba(180, 130, 220, 0.3);
    margin: 0 0 8px;
  }

  p {
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.4);
    margin: 0;
  }

  .legend {
    display: flex;
    gap: 24px;
    margin-top: 24px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.45);
  }

  .dot {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 700;
    position: relative;
  }

  .upper-dot {
    background: radial-gradient(ellipse at 50% 40%, #fff 0%, #e8e2d8 100%);
    color: #333;
  }

  .upper-dot::before {
    content: "\00B7";
    position: absolute;
    top: -6px;
    font-size: 18px;
    font-weight: 900;
    color: #333;
  }

  .mid-dot {
    background: radial-gradient(ellipse at 50% 40%, #fff 0%, #e8e2d8 100%);
    color: #333;
  }

  .lower-dot {
    background: radial-gradient(ellipse at 50% 40%, #fff 0%, #e8e2d8 100%);
    color: #333;
  }

  .lower-dot::after {
    content: "\00B7";
    position: absolute;
    bottom: -6px;
    font-size: 18px;
    font-weight: 900;
    color: #333;
  }
</style>
