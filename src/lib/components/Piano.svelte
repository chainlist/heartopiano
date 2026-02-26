<script lang="ts">
  import { ALL_KEYS, KEY_MAP, resolveDisplayLabels, type PianoKey } from "$lib/piano-keys";
  import { playNote, stopNote, initAudio } from "$lib/audio-engine";
  import PianoRow from "./PianoRow.svelte";
  import { onMount } from "svelte";

  let pressedKeys = $state(new Set<string>());
  let loading = $state(true);
  let settingsOpen = $state(false);
  let notation: "solfege" | "letter" = $state("solfege");
  let scale = $state(1);

  onMount(async () => {
    await Promise.all([initAudio(), resolveDisplayLabels(ALL_KEYS)]);
    loading = false;
  });

  // Group keys by row
  let rows = $derived.by(() => {
    const grouped = new Map<number, PianoKey[]>();
    for (const key of ALL_KEYS) {
      if (!grouped.has(key.row)) grouped.set(key.row, []);
      grouped.get(key.row)!.push(key);
    }
    return grouped;
  });

  function handleKeyPress(key: PianoKey) {
    pressedKeys.add(key.code);
    pressedKeys = new Set(pressedKeys);
    playNote(key.frequency, key.note);
  }

  function handleKeyRelease(key: PianoKey) {
    pressedKeys.delete(key.code);
    pressedKeys = new Set(pressedKeys);
    stopNote(key.note);
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.repeat) return;
    const pianoKey = KEY_MAP.get(e.code);
    if (pianoKey) {
      e.preventDefault();
      handleKeyPress(pianoKey);
    }
  }

  function onKeyUp(e: KeyboardEvent) {
    const pianoKey = KEY_MAP.get(e.code);
    if (pianoKey) {
      e.preventDefault();
      handleKeyRelease(pianoKey);
    }
  }

  const ROW_LABELS = ["Low", "Mid", "High"];
</script>

<svelte:window onkeydown={onKeyDown} onkeyup={onKeyUp} />

<div class="settings-bar">
  <button class="cog-button" onclick={() => (settingsOpen = !settingsOpen)} aria-label="Settings">
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
  {#if settingsOpen}
    <div class="settings-dropdown">
      <label class="setting-row">
        <span class="setting-label">Notation</span>
        <select bind:value={notation}>
          <option value="solfege">DO RE MI</option>
          <option value="letter">C D E</option>
        </select>
      </label>
      <label class="setting-row">
        <span class="setting-label">Size</span>
        <input type="range" min="0.5" max="2" step="0.01" bind:value={scale} />
      </label>
    </div>
  {/if}
</div>

<div class="piano-container">
  {#if loading}
    <p class="loading">Loading piano samples...</p>
  {/if}
  <div class="piano-body" style="zoom: {scale}">
    {#each [2, 1, 0] as rowIdx}
      {@const rowKeys = rows.get(rowIdx) ?? []}
      <PianoRow
        keys={rowKeys}
        {pressedKeys}
        {notation}
        onkeypress={handleKeyPress}
        onkeyrelease={handleKeyRelease}
        label={ROW_LABELS[rowIdx]} />
    {/each}
  </div>
</div>

<style>
  .loading {
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.85rem;
    margin-bottom: 12px;
  }

  .piano-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 30px;
  }

  .settings-bar {
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

  .settings-dropdown {
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

  .setting-row {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .setting-label {
    font-size: 12px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .settings-dropdown select {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 6px;
    color: #e0e0e0;
    padding: 6px 10px;
    font-size: 14px;
    cursor: pointer;
  }

  .settings-dropdown input[type="range"] {
    width: 100%;
    accent-color: #b482dc;
  }

  .piano-body {
    display: flex;
    flex-direction: column;
    gap: 32px;
    padding: 28px 32px;
    background: linear-gradient(145deg, rgba(40, 35, 50, 0.85), rgba(25, 22, 35, 0.92));
    border-radius: 24px;
    box-shadow:
      0 8px 32px rgba(0, 0, 0, 0.4),
      0 2px 8px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.06);
  }
</style>
