import type { KeyMapping } from '$lib/keyboard-map';

export interface SampleMapping {
	sampleName: string;
	detune: number; // cents (100 = 1 semitone)
}

export interface Instrument {
	id: string;
	displayName: string;
	sampleDir: string;
	noteToSample: (noteId: string) => SampleMapping;
	sampleExtension: string;
	sampleList: string[];
	keys: KeyMapping[];
	keyMap: Map<string, KeyMapping>;
}

export interface InstrumentContext {
	instrument: Instrument;
}

export const INSTRUMENT_KEY = Symbol('INSTRUMENT');
