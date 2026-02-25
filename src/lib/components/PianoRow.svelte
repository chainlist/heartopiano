<script lang="ts">
	import type { PianoKey as PianoKeyType } from '$lib/piano-keys';
	import PianoKey from './PianoKey.svelte';

	interface Props {
		keys: PianoKeyType[];
		pressedKeys: Set<string>;
		onkeypress: (key: PianoKeyType) => void;
		onkeyrelease: (key: PianoKeyType) => void;
		label: string;
	}

	let { keys, pressedKeys, onkeypress, onkeyrelease, label }: Props = $props();
</script>

<div class="piano-row">
	<span class="row-label">{label}</span>
	<div class="keys-container">
		{#each keys as key (key.note)}
			<PianoKey
				{key}
				isPressed={pressedKeys.has(key.keyboard)}
				onpress={() => onkeypress(key)}
				onrelease={() => onkeyrelease(key)}
			/>
		{/each}
	</div>
</div>

<style>
	.piano-row {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.row-label {
		font-size: 11px;
		font-weight: 700;
		color: rgba(255, 255, 255, 0.5);
		text-transform: uppercase;
		letter-spacing: 1px;
		writing-mode: vertical-rl;
		text-orientation: mixed;
		transform: rotate(180deg);
		min-width: 20px;
	}

	.keys-container {
		display: flex;
		align-items: center;
		gap: 4px;
	}
</style>
