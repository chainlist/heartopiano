import type { Instrument } from '$lib/types';
import { buildChromaticKeys, buildKeyMap, type ChromaticRowConfig } from '$lib/keyboard-map';

const SAMPLE_NAMES = ['C', 'Cs', 'D', 'Ds', 'E', 'F', 'Fs', 'G', 'Gs', 'A', 'As', 'B'];

function buildSampleList(): string[] {
	const samples: string[] = [];
	for (let octave = 3; octave <= 5; octave++) {
		for (const name of SAMPLE_NAMES) {
			samples.push(`${name}${octave}`);
		}
	}
	samples.push('C6');
	return samples;
}

const ROW_CONFIGS: ChromaticRowConfig[] = [
	{
		// Bottom row - Lower octave (C3-B3)
		octaveNum: 3,
		whiteKeys: ['Comma', 'Period', 'Slash', 'KeyO', 'KeyP', 'BracketLeft', 'BracketRight'],
		blackKeys: ['KeyL', 'Semicolon', 'Digit0', 'Minus', 'Equal'],
		includeNextC: false,
		octaveLabel: 'lower',
		row: 0
	},
	{
		// Middle row - Middle octave (C4-B4)
		octaveNum: 4,
		whiteKeys: ['KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM'],
		blackKeys: ['KeyS', 'KeyD', 'KeyG', 'KeyH', 'KeyJ'],
		includeNextC: false,
		octaveLabel: 'middle',
		row: 1
	},
	{
		// Top row - Upper octave (C5-C6)
		octaveNum: 5,
		whiteKeys: ['KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU'],
		blackKeys: ['Digit2', 'Digit3', 'Digit5', 'Digit6', 'Digit7'],
		includeNextC: true,
		nextCKey: 'KeyI',
		octaveLabel: 'upper',
		row: 2
	}
];

const keys = buildChromaticKeys(ROW_CONFIGS);

export const piano: Instrument = {
	id: 'piano',
	displayName: 'Grand Piano',
	sampleDir: 'piano',
	sampleExtension: 'mp3',
	noteToSample: (noteId: string) => ({ sampleName: noteId.replace('#', 's'), detune: 0 }),
	sampleList: buildSampleList(),
	keys,
	keyMap: buildKeyMap(keys)
};
