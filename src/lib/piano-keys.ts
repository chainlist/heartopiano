export interface PianoKey {
	note: string; // e.g. "C3", "C#3"
	code: string; // KeyboardEvent.code (physical key position)
	displayLabel: string; // resolved label for the user's keyboard layout
	isBlack: boolean;
	noteNumber: number; // 1-7 solfege number
	solfege: string; // DO, RE, MI, FA, SOL, LA, SI
	octaveLabel: 'lower' | 'middle' | 'upper';
	row: number; // 0=bottom, 1=middle, 2=top
}

const SOLFEGE = ['DO', 'DO#', 'RE', 'RE#', 'MI', 'FA', 'FA#', 'SOL', 'SOL#', 'LA', 'LA#', 'SI'];
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NOTE_NUMBERS = [1, 1, 2, 2, 3, 4, 4, 5, 5, 6, 6, 7];
const IS_BLACK = [false, true, false, true, false, false, true, false, true, false, true, false];

interface RowConfig {
	octaveNum: number; // 3, 4, or 5
	whiteKeys: string[]; // KeyboardEvent.code values for white notes
	blackKeys: string[]; // KeyboardEvent.code values for black notes (C#, D#, F#, G#, A#)
	includeNextC: boolean; // whether to include the C of the next octave
	nextCKey?: string; // KeyboardEvent.code for the next octave's C
	octaveLabel: 'lower' | 'middle' | 'upper';
	row: number;
}

const ROW_CONFIGS: RowConfig[] = [
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

// QWERTY fallback: physical code → display character (used when Keyboard API is unavailable)
const QWERTY_FALLBACK: Record<string, string> = {
	Comma: ',', Period: '.', Slash: '/', Semicolon: ';',
	BracketLeft: '[', BracketRight: ']', Minus: '-', Equal: '=',
	KeyL: 'L', KeyO: 'O', KeyP: 'P',
	KeyZ: 'Z', KeyX: 'X', KeyC: 'C', KeyV: 'V', KeyB: 'B', KeyN: 'N', KeyM: 'M',
	KeyS: 'S', KeyD: 'D', KeyG: 'G', KeyH: 'H', KeyJ: 'J',
	KeyQ: 'Q', KeyW: 'W', KeyE: 'E', KeyR: 'R', KeyT: 'T', KeyY: 'Y', KeyU: 'U', KeyI: 'I',
	Digit0: '0', Digit2: '2', Digit3: '3', Digit5: '5', Digit6: '6', Digit7: '7'
};

export function buildPianoKeys(): PianoKey[] {
	const keys: PianoKey[] = [];

	for (const config of ROW_CONFIGS) {
		let whiteIdx = 0;
		let blackIdx = 0;

		for (let i = 0; i < 12; i++) {
			const isBlack = IS_BLACK[i];

			let code: string;
			if (isBlack) {
				code = config.blackKeys[blackIdx++];
			} else {
				code = config.whiteKeys[whiteIdx++];
			}

			keys.push({
				note: `${NOTE_NAMES[i]}${config.octaveNum}`,
				code,
				displayLabel: QWERTY_FALLBACK[code] ?? code,
				isBlack,
				noteNumber: NOTE_NUMBERS[i],
				solfege: SOLFEGE[i],
				octaveLabel: config.octaveLabel,
				row: config.row
			});
		}

		// Add next octave's C if configured
		if (config.includeNextC && config.nextCKey) {
			keys.push({
				note: `C${config.octaveNum + 1}`,
				code: config.nextCKey,
				displayLabel: QWERTY_FALLBACK[config.nextCKey] ?? config.nextCKey,
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

// Build a lookup map from KeyboardEvent.code to piano key
export function buildKeyMap(keys: PianoKey[]): Map<string, PianoKey> {
	const map = new Map<string, PianoKey>();
	for (const key of keys) {
		map.set(key.code, key);
	}
	return map;
}

// Resolve display labels using the Keyboard API (Chromium) or QWERTY fallback
export async function resolveDisplayLabels(keys: PianoKey[]): Promise<void> {
	if (!('keyboard' in navigator) || !('getLayoutMap' in (navigator as any).keyboard)) {
		return; // keep QWERTY fallback labels
	}
	try {
		const layoutMap: Map<string, string> = await (navigator as any).keyboard.getLayoutMap();
		for (const key of keys) {
			const label = layoutMap.get(key.code);
			if (label) {
				key.displayLabel = label.length === 1 ? label.toUpperCase() : label;
			}
		}
	} catch {
		// Keyboard API denied or unavailable — keep QWERTY fallback
	}
}

export const ALL_KEYS = buildPianoKeys();
export const KEY_MAP = buildKeyMap(ALL_KEYS);
