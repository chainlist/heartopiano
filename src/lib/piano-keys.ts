export interface PianoKey {
	note: string; // e.g. "C3", "C#3"
	frequency: number;
	keyboard: string; // keyboard key to press
	isBlack: boolean;
	noteNumber: number; // 1-7 solfege number
	solfege: string; // DO, RE, MI, FA, SOL, LA, SI
	octaveLabel: 'lower' | 'middle' | 'upper';
	row: number; // 0=bottom, 1=middle, 2=top
}

// Note frequencies (A4 = 440Hz standard tuning)
function noteFrequency(semitone: number): number {
	// semitone 0 = C3, each +1 = one semitone up
	// C3 = MIDI 48, A4 = MIDI 69 = 440Hz
	// C3 frequency = 440 * 2^((48-69)/12)
	return 440 * Math.pow(2, (semitone - 21) / 12);
}

const SOLFEGE = ['DO', 'DO#', 'RE', 'RE#', 'MI', 'FA', 'FA#', 'SOL', 'SOL#', 'LA', 'LA#', 'SI'];
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NOTE_NUMBERS = [1, 1, 2, 2, 3, 4, 4, 5, 5, 6, 6, 7];
const IS_BLACK = [false, true, false, true, false, false, true, false, true, false, true, false];

interface RowConfig {
	startSemitone: number; // semitone offset from C3
	octaveNum: number; // 3, 4, or 5
	whiteKeys: string[]; // keyboard keys for white notes
	blackKeys: string[]; // keyboard keys for black notes (C#, D#, F#, G#, A#)
	includeNextC: boolean; // whether to include the C of the next octave
	nextCKey?: string; // keyboard key for the next octave's C
	octaveLabel: 'lower' | 'middle' | 'upper';
	row: number;
}

const ROW_CONFIGS: RowConfig[] = [
	{
		// Bottom row - Lower octave (C3-B3)
		startSemitone: 0,
		octaveNum: 3,
		whiteKeys: [',', '.', '/', ';', "'", '[', ']'],
		blackKeys: ['l', 'k', 'o', 'p', '-'],
		includeNextC: false,
		octaveLabel: 'lower',
		row: 0
	},
	{
		// Middle row - Middle octave (C4-B4)
		startSemitone: 12,
		octaveNum: 4,
		whiteKeys: ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
		blackKeys: ['s', 'd', 'g', 'h', 'j'],
		includeNextC: false,
		octaveLabel: 'middle',
		row: 1
	},
	{
		// Top row - Upper octave (C5-C6)
		startSemitone: 24,
		octaveNum: 5,
		whiteKeys: ['q', 'w', 'e', 'r', 't', 'y', 'u'],
		blackKeys: ['2', '3', '5', '6', '7'],
		includeNextC: true,
		nextCKey: 'i',
		octaveLabel: 'upper',
		row: 2
	}
];

export function buildPianoKeys(): PianoKey[] {
	const keys: PianoKey[] = [];

	for (const config of ROW_CONFIGS) {
		let whiteIdx = 0;
		let blackIdx = 0;

		for (let i = 0; i < 12; i++) {
			const semitone = config.startSemitone + i;
			const isBlack = IS_BLACK[i];

			let keyboard: string;
			if (isBlack) {
				keyboard = config.blackKeys[blackIdx++];
			} else {
				keyboard = config.whiteKeys[whiteIdx++];
			}

			keys.push({
				note: `${NOTE_NAMES[i]}${config.octaveNum}`,
				frequency: noteFrequency(semitone),
				keyboard,
				isBlack,
				noteNumber: NOTE_NUMBERS[i],
				solfege: SOLFEGE[i],
				octaveLabel: config.octaveLabel,
				row: config.row
			});
		}

		// Add next octave's C if configured
		if (config.includeNextC && config.nextCKey) {
			const semitone = config.startSemitone + 12;
			keys.push({
				note: `C${config.octaveNum + 1}`,
				frequency: noteFrequency(semitone),
				keyboard: config.nextCKey,
				isBlack: false,
				noteNumber: 1,
				solfege: 'DO',
				octaveLabel: config.octaveLabel,
				row: config.row
			});
		}
	}

	return keys;
}

// Build a lookup map from keyboard key to piano key
export function buildKeyMap(keys: PianoKey[]): Map<string, PianoKey> {
	const map = new Map<string, PianoKey>();
	for (const key of keys) {
		map.set(key.keyboard.toLowerCase(), key);
	}
	return map;
}

export const ALL_KEYS = buildPianoKeys();
export const KEY_MAP = buildKeyMap(ALL_KEYS);
