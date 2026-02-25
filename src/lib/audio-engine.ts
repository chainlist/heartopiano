import { base } from '$app/paths';

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
	if (!audioContext) {
		audioContext = new AudioContext();
	}
	if (audioContext.state === 'suspended') {
		audioContext.resume();
	}
	return audioContext;
}

// Salamander Grand Piano samples - one every 3 semitones
// Semitone 0 = C3, mapped to MIDI note numbers
const SAMPLE_MAP: { name: string; semitone: number }[] = [
	{ name: 'C3', semitone: 0 },
	{ name: 'Ds3', semitone: 3 },
	{ name: 'Fs3', semitone: 6 },
	{ name: 'A3', semitone: 9 },
	{ name: 'C4', semitone: 12 },
	{ name: 'Ds4', semitone: 15 },
	{ name: 'Fs4', semitone: 18 },
	{ name: 'A4', semitone: 21 },
	{ name: 'C5', semitone: 24 },
	{ name: 'Ds5', semitone: 27 },
	{ name: 'Fs5', semitone: 30 },
	{ name: 'A5', semitone: 33 },
	{ name: 'C6', semitone: 36 }
];

const sampleBuffers = new Map<string, AudioBuffer>();
let samplesLoaded = false;
let loadingPromise: Promise<void> | null = null;

async function loadSamples(): Promise<void> {
	if (samplesLoaded) return;
	if (loadingPromise) return loadingPromise;

	loadingPromise = (async () => {
		const ctx = getAudioContext();
		await Promise.all(
			SAMPLE_MAP.map(async ({ name }) => {
				const response = await fetch(`${base}/samples/${name}.mp3`);
				const arrayBuffer = await response.arrayBuffer();
				const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
				sampleBuffers.set(name, audioBuffer);
			})
		);
		samplesLoaded = true;
	})();

	return loadingPromise;
}

// Find the nearest sample for a given semitone and return the detune amount
function findNearestSample(semitone: number): { sampleName: string; detuneCents: number } {
	let closest = SAMPLE_MAP[0];
	let minDist = Math.abs(semitone - closest.semitone);

	for (const entry of SAMPLE_MAP) {
		const dist = Math.abs(semitone - entry.semitone);
		if (dist < minDist) {
			minDist = dist;
			closest = entry;
		}
	}

	// Each semitone = 100 cents
	const detuneCents = (semitone - closest.semitone) * 100;
	return { sampleName: closest.name, detuneCents };
}

// Convert note string (e.g. "C#4") to semitone offset from C3
function noteToSemitone(note: string): number {
	const match = note.match(/^([A-G]#?)(\d)$/);
	if (!match) return 0;

	const noteNames: Record<string, number> = {
		C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5,
		'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11
	};

	const name = match[1];
	const octave = parseInt(match[2]);
	return noteNames[name] + (octave - 3) * 12;
}

interface ActiveNote {
	source: AudioBufferSourceNode;
	gain: GainNode;
	releaseGain: GainNode;
}

const activeNotes = new Map<string, ActiveNote>();

export async function initAudio(): Promise<void> {
	await loadSamples();
}

export function playNote(_frequency: number, noteId: string): void {
	if (activeNotes.has(noteId)) return;

	// Start loading if not already loaded, play immediately when ready
	if (!samplesLoaded) {
		loadSamples().then(() => {
			if (!activeNotes.has(noteId)) {
				playSample(noteId);
			}
		});
		return;
	}

	playSample(noteId);
}

function playSample(noteId: string): void {
	const ctx = getAudioContext();
	const semitone = noteToSemitone(noteId);
	const { sampleName, detuneCents } = findNearestSample(semitone);
	const buffer = sampleBuffers.get(sampleName);

	if (!buffer) return;

	const source = ctx.createBufferSource();
	source.buffer = buffer;
	source.detune.value = detuneCents;

	// Main gain (always 1.0, just for the signal chain)
	const gain = ctx.createGain();

	// Separate release gain node - untouched until key release
	const releaseGain = ctx.createGain();

	source.connect(gain);
	gain.connect(releaseGain);
	releaseGain.connect(ctx.destination);
	source.start();

	const entry: ActiveNote = { source, gain, releaseGain };
	activeNotes.set(noteId, entry);

	// Auto-cleanup when sample finishes naturally
	source.onended = () => {
		if (activeNotes.get(noteId) === entry) {
			activeNotes.delete(noteId);
		}
	};
}

export function stopNote(noteId: string): void {
	const active = activeNotes.get(noteId);
	if (!active) return;

	activeNotes.delete(noteId);

	const ctx = getAudioContext();
	const now = ctx.currentTime;

	// Fade out using the dedicated release gain node (no scheduling conflicts)
	active.releaseGain.gain.setValueAtTime(1.0, now);
	active.releaseGain.gain.linearRampToValueAtTime(0.0001, now + 1);

	active.source.stop(now + 1.05);
}
