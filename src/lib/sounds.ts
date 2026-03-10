/**
 * Sound effects using the Web Audio API.
 * Synthesizes short, subtle tones without external audio files.
 * Includes task completion, chat send/receive sounds.
 */

let audioCtx: AudioContext | null = null;

/**
 * Returns a shared AudioContext, creating one lazily on first use.
 * Returns null if Web Audio is unavailable.
 *
 * @returns AudioContext instance or null
 */
function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    try {
      audioCtx = new AudioContext();
    } catch {
      return null;
    }
  }
  return audioCtx;
}

/**
 * Plays a satisfying "pop" sound when a task is completed.
 * Short rising tone with a soft harmonic — feels like checking something off.
 */
export function playTaskComplete(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }

  const now = ctx.currentTime;

  // Main pop — bright rising tone
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = "sine";
  osc1.frequency.setValueAtTime(600, now);
  osc1.frequency.exponentialRampToValueAtTime(1200, now + 0.08);
  gain1.gain.setValueAtTime(0.12, now);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
  osc1.connect(gain1).connect(ctx.destination);
  osc1.start(now);
  osc1.stop(now + 0.15);

  // Soft harmonic shimmer — adds warmth
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = "triangle";
  osc2.frequency.setValueAtTime(1800, now + 0.03);
  gain2.gain.setValueAtTime(0.04, now + 0.03);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
  osc2.connect(gain2).connect(ctx.destination);
  osc2.start(now + 0.03);
  osc2.stop(now + 0.12);
}

/**
 * Plays the iMessage-style "sent" sound — a short ascending two-tone chirp.
 * Fires after a message is optimistically sent.
 */
export function playMessageSent(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Resume context if suspended (browser autoplay policy)
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }

  const now = ctx.currentTime;

  // First tone — lower pitch
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = "sine";
  osc1.frequency.setValueAtTime(1200, now);
  gain1.gain.setValueAtTime(0.08, now);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
  osc1.connect(gain1).connect(ctx.destination);
  osc1.start(now);
  osc1.stop(now + 0.08);

  // Second tone — higher pitch, slight delay
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = "sine";
  osc2.frequency.setValueAtTime(1500, now + 0.06);
  gain2.gain.setValueAtTime(0.08, now + 0.06);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
  osc2.connect(gain2).connect(ctx.destination);
  osc2.start(now + 0.06);
  osc2.stop(now + 0.15);
}

/**
 * Plays the iMessage-style "received" sound — a short descending tri-tone.
 * Fires when a new message arrives from another user.
 */
export function playMessageReceived(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }

  const now = ctx.currentTime;

  // Three-note descending chime
  const notes = [1400, 1100, 1300];
  const offsets = [0, 0.08, 0.16];

  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now + offsets[i]);
    gain.gain.setValueAtTime(0.06, now + offsets[i]);
    gain.gain.exponentialRampToValueAtTime(0.001, now + offsets[i] + 0.1);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now + offsets[i]);
    osc.stop(now + offsets[i] + 0.1);
  });
}
