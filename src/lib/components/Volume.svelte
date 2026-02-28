<script lang="ts">
  import { setMasterVolume } from "$lib/audio-engine";

  let volume = $state(0.4);
  let muted = $state(false);
  let previousVolume = 0.4;

  $effect(() => {
    setMasterVolume(muted ? 0 : volume);
  });

  function toggleMute() {
    if (muted) {
      muted = false;
      volume = previousVolume || 0.8;
    } else {
      previousVolume = volume;
      muted = true;
    }
  }

  let iconLevel = $derived(
    muted || volume === 0 ? "muted" : volume < 0.35 ? "low" : volume < 0.7 ? "mid" : "high",
  );
</script>

<div class="volume">
  <button class="icon-btn" onclick={toggleMute} aria-label={muted ? "Unmute" : "Mute"}>
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" opacity="0.15" />
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      {#if iconLevel === "muted"}
        <line x1="18" y1="9" x2="22" y2="15" />
        <line x1="22" y1="9" x2="18" y2="15" />
      {:else if iconLevel === "low"}
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      {:else if iconLevel === "mid"}
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" opacity="0.4" />
      {:else}
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      {/if}
    </svg>
  </button>

  <div class="slider-track">
    <div class="slider-fill" style="width: {muted ? 0 : volume * 100}%"></div>
    <input
      type="range"
      min="0"
      max="1"
      step="0.01"
      bind:value={volume}
      oninput={() => {
        if (muted) muted = false;
      }}
      aria-label="Volume" />
  </div>
</div>

<style>
  .volume {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 14px;
    background: rgba(255, 255, 255, 0.06);
    border-radius: 10px;
    min-width: 180px;
  }

  .icon-btn {
    flex-shrink: 0;
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.55);
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    transition:
      color 0.15s,
      background 0.15s;
  }

  .icon-btn:hover {
    color: #e8d5f5;
    background: rgba(255, 255, 255, 0.08);
  }

  .slider-track {
    position: relative;
    flex: 1;
    height: 6px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    overflow: hidden;
  }

  .slider-fill {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background: linear-gradient(90deg, #9b6bbf, #c99ef2);
    border-radius: 3px;
    pointer-events: none;
    transition: width 0.08s ease-out;
  }

  input[type="range"] {
    position: absolute;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
    width: 100%;
    height: 20px;
    margin: 0;
    -webkit-appearance: none;
    appearance: none;
    background: transparent;
    cursor: pointer;
  }

  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #e8d5f5;
    border: 2px solid rgba(155, 107, 191, 0.6);
    box-shadow: 0 0 8px rgba(180, 130, 220, 0.4);
    transition:
      transform 0.15s,
      box-shadow 0.15s;
  }

  input[type="range"]::-webkit-slider-thumb:hover {
    transform: scale(1.2);
    box-shadow: 0 0 14px rgba(180, 130, 220, 0.6);
  }

  input[type="range"]::-moz-range-thumb {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #e8d5f5;
    border: 2px solid rgba(155, 107, 191, 0.6);
    box-shadow: 0 0 8px rgba(180, 130, 220, 0.4);
    transition:
      transform 0.15s,
      box-shadow 0.15s;
  }

  input[type="range"]::-moz-range-track {
    background: transparent;
    border: none;
    height: 6px;
  }
</style>
