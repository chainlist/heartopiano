<script lang="ts">
  import { resolveDisplayLabels, type KeyMapping } from "$lib/keyboard-map";
  import { createAudioEngine } from "$lib/audio-engine";
  import { violin } from "$lib/instruments/violin";
  import { INSTRUMENT_KEY, type InstrumentContext } from "$lib/types";
  import Row from "./Row.svelte";
  import Settings from "./Settings.svelte";
  import { onMount, setContext } from "svelte";

  setContext<InstrumentContext>(INSTRUMENT_KEY, { instrument: violin });

  const audioEngine = createAudioEngine(violin);
  const { keys, keyMap } = violin;

  let pressedKeys = $state(new Set<string>());
  let loading = $state(true);
  let notation: "solfege" | "letter" = $state("solfege");
  let scale = $state(1);

  onMount(async () => {
    await Promise.all([audioEngine.init(), resolveDisplayLabels(keys)]);
    loading = false;
  });

  let rows = $derived.by(() => {
    const grouped = new Map<number, KeyMapping[]>();
    for (const key of keys) {
      if (!grouped.has(key.row)) grouped.set(key.row, []);
      grouped.get(key.row)!.push(key);
    }
    return grouped;
  });

  function handleKeyPress(key: KeyMapping) {
    pressedKeys.add(key.code);
    pressedKeys = new Set(pressedKeys);
    audioEngine.playNote(key.note);
  }

  function handleKeyRelease(key: KeyMapping) {
    pressedKeys.delete(key.code);
    pressedKeys = new Set(pressedKeys);
    audioEngine.stopNote(key.note);
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.ctrlKey || e.metaKey || e.repeat) return;
    const mapping = keyMap.get(e.code);
    if (mapping) {
      e.preventDefault();
      handleKeyPress(mapping);
    }
  }

  function onKeyUp(e: KeyboardEvent) {
    if (e.ctrlKey || e.metaKey) return;
    const mapping = keyMap.get(e.code);
    if (mapping) {
      e.preventDefault();
      handleKeyRelease(mapping);
    }
  }

  const ROW_LABELS = ["Low", "High"];
</script>

<svelte:window onkeydown={onKeyDown} onkeyup={onKeyUp} />

<Settings bind:notation bind:scale />

<div class="instrument-container">
  {#if loading}
    <p class="loading">Loading {violin.displayName} samples...</p>
  {/if}
  <div class="instrument-body" style="zoom: {scale}">
    {#each [1, 0] as rowIdx}
      {@const rowKeys = rows.get(rowIdx) ?? []}
      <Row
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

  .instrument-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 30px;
  }

  .instrument-body {
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
