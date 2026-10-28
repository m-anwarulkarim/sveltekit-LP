/**
 * Enterprise Web Audio Notification Sound Engine
 * Generates a crisp, pleasant harmonic chime without any external audio asset dependencies.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
	if (typeof window === 'undefined') return null;
	if (!audioCtx) {
		const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
		if (AudioContextClass) {
			audioCtx = new AudioContextClass();
		}
	}
	if (audioCtx && audioCtx.state === 'suspended') {
		audioCtx.resume().catch(() => {});
	}
	return audioCtx;
}

/**
 * Checks if sound alert is enabled in user settings (persisted in localStorage)
 */
export function isSoundEnabled(): boolean {
	if (typeof window === 'undefined') return true;
	const saved = localStorage.getItem('aura_notif_sound');
	return saved !== null ? saved === 'true' : true;
}

/**
 * Toggles or sets sound alert preference
 */
export function setSoundEnabled(enabled: boolean): void {
	if (typeof window === 'undefined') return;
	localStorage.setItem('aura_notif_sound', String(enabled));
}

/**
 * Plays a pleasant luxury dual-tone notification chime (D5 -> A5 with exponential decay)
 */
export function playNotificationSound(force: boolean = false): void {
	if (!force && !isSoundEnabled()) return;

	try {
		const ctx = getAudioContext();
		if (!ctx) return;

		const now = ctx.currentTime;

		// Master Gain to prevent clipping
		const masterGain = ctx.createGain();
		masterGain.gain.setValueAtTime(0.28, now);
		masterGain.connect(ctx.destination);

		// 1. Primary Tone (587.33 Hz - D5)
		const osc1 = ctx.createOscillator();
		const gain1 = ctx.createGain();
		osc1.type = 'sine';
		osc1.frequency.setValueAtTime(587.33, now);
		osc1.frequency.exponentialRampToValueAtTime(880.0, now + 0.12);

		gain1.gain.setValueAtTime(0, now);
		gain1.gain.linearRampToValueAtTime(0.35, now + 0.02);
		gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

		osc1.connect(gain1);
		gain1.connect(masterGain);

		osc1.start(now);
		osc1.stop(now + 0.56);

		// 2. Harmonic Shimmer (1174.66 Hz - D6)
		const osc2 = ctx.createOscillator();
		const gain2 = ctx.createGain();
		osc2.type = 'triangle';
		osc2.frequency.setValueAtTime(880.0, now + 0.08);
		osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.18);

		gain2.gain.setValueAtTime(0, now + 0.08);
		gain2.gain.linearRampToValueAtTime(0.18, now + 0.11);
		gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

		osc2.connect(gain2);
		gain2.connect(masterGain);

		osc2.start(now + 0.08);
		osc2.stop(now + 0.66);
	} catch (e) {
		console.warn('Could not play notification sound:', e);
	}
}

/**
 * Test chime for admin settings preview
 */
export function testNotificationSound(): void {
	playNotificationSound(true);
}

