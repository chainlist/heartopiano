import type { Instrument, SampleMapping } from '$lib/types';
import { buildDiatonicKeys, buildKeyMap, type DiatonicRowConfig } from '$lib/keyboard-map';

const ROW_CONFIGS: DiatonicRowConfig[] = [
	{
		// Bottom row (C4-B4)
		octaveNum: 4,
		keys: ['KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ'],
		includeNextC: false,
		octaveLabel: 'lower',
		row: 0
	},
	{
		// Top row (C5-C6)
		octaveNum: 5,
		keys: ['KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU'],
		includeNextC: true,
		nextCKey: 'KeyI',
		octaveLabel: 'upper',
		row: 1
	}
];

// Available samples: C, E, G, A per octave + C6
// Missing notes are pitch-shifted from the nearest sample (max 2 semitones)
// Semitone distances from C: C=0, D=2, E=4, F=5, G=7, A=9, B=11
const SAMPLE_MAP: Record<string, SampleMapping> = {
	C4: { sampleName: 'C4', detune: 0 },
	D4: { sampleName: 'E4', detune: -100 },    // E4 down 1 semitone
	E4: { sampleName: 'E4', detune: 0 },
	F4: { sampleName: 'E4', detune: 100 },     // E4 up 1 semitone
	G4: { sampleName: 'G4', detune: 0 },
	A4: { sampleName: 'A4', detune: 0 },
	B4: { sampleName: 'C5', detune: -100 },    // C5 down 1 semitone

	C5: { sampleName: 'C5', detune: 0 },
	D5: { sampleName: 'E5', detune: -100 },    // E5 down 1 semitone
	E5: { sampleName: 'E5', detune: 0 },
	F5: { sampleName: 'E5', detune: 100 },     // E5 up 1 semitone
	G5: { sampleName: 'G5', detune: 0 },
	A5: { sampleName: 'A5', detune: 0 },
	B5: { sampleName: 'C6', detune: -100 },    // C6 down 1 semitone

	C6: { sampleName: 'C6', detune: 0 }
};

// Only load the actual sample files we have
const ACTUAL_SAMPLES = ['C4', 'E4', 'G4', 'A4', 'C5', 'E5', 'G5', 'A5', 'C6'];

const keys = buildDiatonicKeys(ROW_CONFIGS);

export const violin: Instrument = {
	id: 'violin',
	displayName: 'Violin',
	sampleDir: 'violin',
	sampleExtension: 'mp3',
	noteToSample: (noteId: string) => SAMPLE_MAP[noteId] ?? { sampleName: noteId, detune: 0 },
	sampleList: ACTUAL_SAMPLES,
	keys,
	keyMap: buildKeyMap(keys)
};
