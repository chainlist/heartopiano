<script lang="ts">
  interface Props {
    notation: "solfege" | "letter";
    scale: number;
  }

  let { notation = $bindable(), scale = $bindable() }: Props = $props();

  let open = $state(false);
</script>

<div class="settings">
  <button class="cog-button" onclick={() => (open = !open)} aria-label="Settings">
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round">
      <circle cx="10" cy="10" r="3" />
      <path
        d="M10 1.5v2M10 16.5v2M3.4 3.4l1.4 1.4M15.2 15.2l1.4 1.4M1.5 10h2M16.5 10h2M3.4 16.6l1.4-1.4M15.2 4.8l1.4-1.4" />
    </svg>
  </button>

  {#if open}
    <div class="dropdown">
      <label class="row">
        <span class="label">Notation</span>
        <select bind:value={notation}>
          <option value="solfege">DO RE MI</option>
          <option value="letter">C D E</option>
        </select>
      </label>
      <label class="row">
        <span class="label">Size</span>
        <input type="range" min="0.5" max="2" step="0.01" bind:value={scale} />
      </label>
    </div>
  {/if}
</div>

<style>
  .settings {
    position: fixed;
    top: 16px;
    right: 16px;
    z-index: 20;
  }

  .cog-button {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.5);
    cursor: pointer;
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition:
      background 0.15s,
      color 0.15s;
  }

  .cog-button:hover {
    background: rgba(255, 255, 255, 0.14);
    color: rgba(255, 255, 255, 0.8);
  }

  .dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 6px;
    background: rgba(30, 28, 40, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    min-width: 200px;
    backdrop-filter: blur(12px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    z-index: 10;
  }

  .row {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .label {
    font-size: 12px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  select {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 6px;
    color: #e0e0e0;
    padding: 6px 10px;
    font-size: 14px;
    cursor: pointer;
  }

  input[type="range"] {
    width: 100%;
    accent-color: #b482dc;
  }
</style>
