<script lang="ts">
	import { ALL_KEYS, KEY_MAP, type PianoKey } from '$lib/piano-keys';
	import { playNote, stopNote, initAudio } from '$lib/audio-engine';
	import PianoRow from './PianoRow.svelte';
	import { onMount } from 'svelte';

	let pressedKeys = $state(new Set<string>());
	let loading = $state(true);

	onMount(() => {
		initAudio().then(() => {
			loading = false;
		});
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
		pressedKeys.add(key.keyboard);
		pressedKeys = new Set(pressedKeys);
		playNote(key.frequency, key.note);
	}

	function handleKeyRelease(key: PianoKey) {
		pressedKeys.delete(key.keyboard);
		pressedKeys = new Set(pressedKeys);
		stopNote(key.note);
	}

	function onKeyDown(e: KeyboardEvent) {
		if (e.repeat) return;
		const keyStr = e.key.toLowerCase();
		const pianoKey = KEY_MAP.get(keyStr);
		if (pianoKey) {
			e.preventDefault();
			handleKeyPress(pianoKey);
		}
	}

	function onKeyUp(e: KeyboardEvent) {
		const keyStr = e.key.toLowerCase();
		const pianoKey = KEY_MAP.get(keyStr);
		if (pianoKey) {
			e.preventDefault();
			handleKeyRelease(pianoKey);
		}
	}

	const ROW_LABELS = ['Low', 'Mid', 'High'];
</script>

<svelte:window onkeydown={onKeyDown} onkeyup={onKeyUp} />

<div class="piano-container">
	{#if loading}
		<p class="loading">Loading piano samples...</p>
	{/if}
	<div class="piano-body">
		{#each [2, 1, 0] as rowIdx}
			{@const rowKeys = rows.get(rowIdx) ?? []}
			<PianoRow
				keys={rowKeys}
				{pressedKeys}
				onkeypress={handleKeyPress}
				onkeyrelease={handleKeyRelease}
				label={ROW_LABELS[rowIdx]}
			/>
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

	.piano-body {
		display: flex;
		flex-direction: column;
		gap: 12px;
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
