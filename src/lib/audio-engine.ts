import { base } from '$app/paths';
import type { Instrument } from '$lib/types';

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

interface ActiveNote {
	source: AudioBufferSourceNode;
	releaseGain: GainNode;
}

export interface AudioEngine {
	init(): Promise<void>;
	playNote(noteId: string): void;
	stopNote(noteId: string): void;
}

export function createAudioEngine(instrument: Instrument): AudioEngine {
	const sampleBuffers = new Map<string, AudioBuffer>();
	const activeNotes = new Map<string, ActiveNote>();
	let samplesLoaded = false;
	let loadingPromise: Promise<void> | null = null;

	async function loadSamples(): Promise<void> {
		if (samplesLoaded) return;
		if (loadingPromise) return loadingPromise;

		loadingPromise = (async () => {
			const ctx = getAudioContext();
			await Promise.all(
				instrument.sampleList.map(async (name) => {
					const url = `${base}/samples/${instrument.sampleDir}/${name}.${instrument.sampleExtension}`;
					const response = await fetch(url);
					const arrayBuffer = await response.arrayBuffer();
					const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
					sampleBuffers.set(name, audioBuffer);
				})
			);
			samplesLoaded = true;
		})();

		return loadingPromise;
	}

	function playSample(noteId: string): void {
		const ctx = getAudioContext();
		const { sampleName, detune } = instrument.noteToSample(noteId);
		const buffer = sampleBuffers.get(sampleName);

		if (!buffer) return;

		const source = ctx.createBufferSource();
		source.buffer = buffer;
		if (detune !== 0) {
			source.detune.value = detune;
		}

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

	return {
		init: loadSamples,

		playNote(noteId: string): void {
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
		},

		stopNote(noteId: string): void {
			const active = activeNotes.get(noteId);
			if (!active) return;

			activeNotes.delete(noteId);

			const ctx = getAudioContext();
			const now = ctx.currentTime;

			active.releaseGain.gain.setValueAtTime(1.0, now);
			active.releaseGain.gain.linearRampToValueAtTime(0.0001, now + 1);
			active.source.stop(now + 1.05);
		}
	};
}
