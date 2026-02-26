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

// One sample per note from C3 to C6 (Salamander Grand Piano, CC-BY Alexander Holm)
// Filename convention: natural = "C3", sharp = "Cs3" (lowercase "s" for sharp)
const NOTE_NAMES = ['C', 'Cs', 'D', 'Ds', 'E', 'F', 'Fs', 'G', 'Gs', 'A', 'As', 'B'];

function buildSampleList(): string[] {
	const samples: string[] = [];
	for (let octave = 3; octave <= 5; octave++) {
		for (const name of NOTE_NAMES) {
			samples.push(`${name}${octave}`);
		}
	}
	samples.push('C6');
	return samples;
}

const ALL_SAMPLES = buildSampleList();

// Map from noteId (e.g. "C#4") to sample filename (e.g. "Cs4")
function noteIdToSampleName(noteId: string): string {
	return noteId.replace('#', 's');
}

const sampleBuffers = new Map<string, AudioBuffer>();
let samplesLoaded = false;
let loadingPromise: Promise<void> | null = null;

async function loadSamples(): Promise<void> {
	if (samplesLoaded) return;
	if (loadingPromise) return loadingPromise;

	loadingPromise = (async () => {
		const ctx = getAudioContext();
		await Promise.all(
			ALL_SAMPLES.map(async (name) => {
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

interface ActiveNote {
	source: AudioBufferSourceNode;
	releaseGain: GainNode;
}

const activeNotes = new Map<string, ActiveNote>();

export async function initAudio(): Promise<void> {
	await loadSamples();
}

export function playNote(noteId: string): void {
	if (activeNotes.has(noteId)) return;

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
	const sampleName = noteIdToSampleName(noteId);
	const buffer = sampleBuffers.get(sampleName);

	if (!buffer) return;

	const source = ctx.createBufferSource();
	source.buffer = buffer;

	const releaseGain = ctx.createGain();
	source.connect(releaseGain);
	releaseGain.connect(ctx.destination);
	source.start();

	const entry: ActiveNote = { source, releaseGain };
	activeNotes.set(noteId, entry);

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

	active.releaseGain.gain.setValueAtTime(1.0, now);
	active.releaseGain.gain.linearRampToValueAtTime(0.0001, now + 1);
	active.source.stop(now + 1.05);
}
