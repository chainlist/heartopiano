export interface KeyMapping {
	note: string; // e.g. "C3", "C#3"
	code: string; // KeyboardEvent.code (physical key position)
	displayLabel: string; // resolved label for the user's keyboard layout
	isBlack: boolean;
	noteNumber: number; // 1-7 solfege number
	solfege: string; // DO, RE, MI, FA, SOL, LA, SI
	octaveLabel: 'lower' | 'middle' | 'upper';
	row: number; // 0=bottom, 1=middle, 2=top
}

// Shared music theory constants
export const SOLFEGE = ['DO', 'DO#', 'RE', 'RE#', 'MI', 'FA', 'FA#', 'SOL', 'SOL#', 'LA', 'LA#', 'SI'];
export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const NOTE_NUMBERS = [1, 1, 2, 2, 3, 4, 4, 5, 5, 6, 6, 7];
export const IS_BLACK = [false, true, false, true, false, false, true, false, true, false, true, false];

// QWERTY fallback: derive display label from KeyboardEvent.code
const SPECIAL_LABELS: Record<string, string> = {
	Comma: ',', Period: '.', Slash: '/', Semicolon: ';', Quote: "'",
	BracketLeft: '[', BracketRight: ']', Minus: '-', Equal: '=',
	Space: '␣', Backslash: '\\'
};

export function codeToLabel(code: string): string {
	if (code.startsWith('Key')) return code.slice(3);
	if (code.startsWith('Digit')) return code.slice(5);
	return SPECIAL_LABELS[code] ?? code;
}

// Row config for instruments with chromatic keys (white + black)
export interface ChromaticRowConfig {
	octaveNum: number;
	whiteKeys: string[];
	blackKeys: string[];
	includeNextC: boolean;
	nextCKey?: string;
	octaveLabel: 'lower' | 'middle' | 'upper';
	row: number;
}

// Build key mappings for chromatic instruments (piano-like, with black + white keys)
export function buildChromaticKeys(configs: ChromaticRowConfig[]): KeyMapping[] {
	const keys: KeyMapping[] = [];

	for (const config of configs) {
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
				displayLabel: codeToLabel(code),
				isBlack,
				noteNumber: NOTE_NUMBERS[i],
				solfege: SOLFEGE[i],
				octaveLabel: config.octaveLabel,
				row: config.row
			});
		}

		if (config.includeNextC && config.nextCKey) {
			keys.push({
				note: `C${config.octaveNum + 1}`,
				code: config.nextCKey,
				displayLabel: codeToLabel(config.nextCKey),
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

// Build key mappings for diatonic instruments (natural notes only, no black keys)
export interface DiatonicRowConfig {
	octaveNum: number;
	keys: string[]; // 7 KeyboardEvent.code values for C D E F G A B
	includeNextC: boolean;
	nextCKey?: string;
	octaveLabel: 'lower' | 'middle' | 'upper';
	row: number;
}

const NATURAL_NOTES = [
	{ name: 'C', number: 1, solfege: 'DO' },
	{ name: 'D', number: 2, solfege: 'RE' },
	{ name: 'E', number: 3, solfege: 'MI' },
	{ name: 'F', number: 4, solfege: 'FA' },
	{ name: 'G', number: 5, solfege: 'SOL' },
	{ name: 'A', number: 6, solfege: 'LA' },
	{ name: 'B', number: 7, solfege: 'SI' }
];

export function buildDiatonicKeys(configs: DiatonicRowConfig[]): KeyMapping[] {
	const keys: KeyMapping[] = [];

	for (const config of configs) {
		for (let i = 0; i < 7; i++) {
			const code = config.keys[i];
			keys.push({
				note: `${NATURAL_NOTES[i].name}${config.octaveNum}`,
				code,
				displayLabel: codeToLabel(code),
				isBlack: false,
				noteNumber: NATURAL_NOTES[i].number,
				solfege: NATURAL_NOTES[i].solfege,
				octaveLabel: config.octaveLabel,
				row: config.row
			});
		}

		if (config.includeNextC && config.nextCKey) {
			keys.push({
				note: `C${config.octaveNum + 1}`,
				code: config.nextCKey,
				displayLabel: codeToLabel(config.nextCKey),
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

// Build a lookup map from KeyboardEvent.code to key mapping
export function buildKeyMap(keys: KeyMapping[]): Map<string, KeyMapping> {
	const map = new Map<string, KeyMapping>();
	for (const key of keys) {
		map.set(key.code, key);
	}
	return map;
}

// Resolve display labels using the Keyboard API (Chromium) or QWERTY fallback
export async function resolveDisplayLabels(keys: KeyMapping[]): Promise<void> {
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
