<script lang="ts">
  import type { KeyMapping } from "$lib/keyboard-map";
  import Key from "./Key.svelte";

  interface Props {
    keys: KeyMapping[];
    pressedKeys: Set<string>;
    notation: "solfege" | "letter";
    onkeypress: (key: KeyMapping) => void;
    onkeyrelease: (key: KeyMapping) => void;
    label: string;
  }

  let { keys, pressedKeys, notation, onkeypress, onkeyrelease, label }: Props = $props();
</script>

<div class="piano-row">
  <span class="row-label">{label}</span>
  <div class="keys-container">
    {#each keys as key (key.note)}
      <Key
        {key}
        isPressed={pressedKeys.has(key.code)}
        {notation}
        onpress={() => onkeypress(key)}
        onrelease={() => onkeyrelease(key)} />
    {/each}
  </div>
</div>

<style>
  .piano-row {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .row-label {
    font-size: 13px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
    letter-spacing: 1px;
    writing-mode: vertical-rl;
    text-orientation: mixed;
    transform: rotate(180deg);
    min-width: 24px;
  }

  .keys-container {
    display: flex;
    align-items: center;
    gap: 20px;
  }
</style>
