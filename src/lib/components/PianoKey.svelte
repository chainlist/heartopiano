<script lang="ts">
	import type { PianoKey } from '$lib/piano-keys';

	interface Props {
		key: PianoKey;
		isPressed: boolean;
		onpress: () => void;
		onrelease: () => void;
	}

	let { key, isPressed, onpress, onrelease }: Props = $props();

	function getDisplayKey(kb: string): string {
		const special: Record<string, string> = {
			',': ',',
			'.': '.',
			'/': '/',
			';': ';',
			"'": "'",
			'[': '[',
			']': ']',
			'-': '-',
			'=': '='
		};
		return special[kb] ?? kb.toUpperCase();
	}

	let dotPosition = $derived(
		key.octaveLabel === 'upper' ? 'above' : key.octaveLabel === 'lower' ? 'below' : 'none'
	);
</script>

<button
	class="piano-key"
	class:black={key.isBlack}
	class:white={!key.isBlack}
	class:pressed={isPressed}
	onpointerdown={onpress}
	onpointerup={onrelease}
	onpointerleave={onrelease}
>
	<span class="note-number" class:dot-above={dotPosition === 'above'} class:dot-below={dotPosition === 'below'}>
		{key.noteNumber}
	</span>
	{#if !key.isBlack}
		<span class="solfege">{key.solfege}</span>
	{/if}
	<span class="keyboard-label">{getDisplayKey(key.keyboard)}</span>
</button>

<style>
	.piano-key {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		border: none;
		cursor: pointer;
		font-family: 'Segoe UI', system-ui, sans-serif;
		transition: transform 0.06s, filter 0.06s;
		user-select: none;
		-webkit-user-select: none;
		touch-action: none;
		gap: 2px;
	}

	.white {
		width: 64px;
		height: 80px;
		background: radial-gradient(ellipse at 50% 40%, #fff 0%, #f0ece4 70%, #d9d3c7 100%);
		border-radius: 50%;
		box-shadow:
			0 4px 8px rgba(0, 0, 0, 0.2),
			0 1px 3px rgba(0, 0, 0, 0.15),
			inset 0 -2px 4px rgba(0, 0, 0, 0.05);
		z-index: 1;
	}

	.white.pressed {
		background: radial-gradient(ellipse at 50% 40%, #fffde0 0%, #f5e6a0 70%, #d4c478 100%);
		transform: scale(0.95);
		box-shadow:
			0 2px 4px rgba(0, 0, 0, 0.2),
			inset 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.black {
		width: 44px;
		height: 52px;
		background: radial-gradient(ellipse at 50% 40%, #5a5a5a 0%, #3a3a3a 60%, #252525 100%);
		border-radius: 50%;
		box-shadow:
			0 3px 6px rgba(0, 0, 0, 0.35),
			inset 0 1px 2px rgba(255, 255, 255, 0.1);
		z-index: 2;
		margin: 0 -8px;
	}

	.black.pressed {
		background: radial-gradient(ellipse at 50% 40%, #7a7a6a 0%, #5a5a4a 60%, #3a3a2a 100%);
		transform: scale(0.93);
		box-shadow:
			0 1px 3px rgba(0, 0, 0, 0.3),
			inset 0 1px 2px rgba(0, 0, 0, 0.2);
	}

	.note-number {
		font-size: 20px;
		font-weight: 700;
		line-height: 1;
		position: relative;
	}

	.white .note-number {
		color: #333;
	}

	.black .note-number {
		color: #e0e0e0;
		font-size: 16px;
	}

	.dot-above::before {
		content: '\00B7';
		position: absolute;
		top: -10px;
		left: 50%;
		transform: translateX(-50%);
		font-size: 20px;
		font-weight: 900;
	}

	.dot-below::after {
		content: '\00B7';
		position: absolute;
		bottom: -10px;
		left: 50%;
		transform: translateX(-50%);
		font-size: 20px;
		font-weight: 900;
	}

	.solfege {
		font-size: 9px;
		font-weight: 600;
		color: #888;
		text-transform: uppercase;
		line-height: 1;
	}

	.keyboard-label {
		font-size: 11px;
		font-weight: 600;
		line-height: 1;
		padding: 2px 5px;
		border-radius: 3px;
	}

	.white .keyboard-label {
		color: #666;
		background: rgba(0, 0, 0, 0.06);
	}

	.black .keyboard-label {
		color: #bbb;
		background: rgba(255, 255, 255, 0.1);
	}
</style>
