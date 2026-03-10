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

/** Pre-decoded audio buffer for zero-latency playback via Web Audio API. */
let taskCompleteBuffer: AudioBuffer | null = null;
let bufferLoading = false;

/**
 * Fetches and decodes the task completion sound into a Web Audio buffer.
 * Called lazily on first play; subsequent plays are instant.
 */
async function ensureBuffer(): Promise<AudioBuffer | null> {
  const ctx = getAudioContext();
  if (!ctx) return null;
  if (taskCompleteBuffer) return taskCompleteBuffer;
  if (bufferLoading) return null;
  bufferLoading = true;
  try {
    const res = await fetch("/sounds/task-complete.mp3");
    const arrayBuf = await res.arrayBuffer();
    taskCompleteBuffer = await ctx.decodeAudioData(arrayBuf);
    return taskCompleteBuffer;
  } catch {
    bufferLoading = false;
    return null;
  }
}

// Kick off preload as soon as module is imported (non-blocking)
if (typeof window !== "undefined") {
  ensureBuffer();
}

/**
 * Plays the Apple Pay success "ding" sound when a task is completed.
 * Uses Web Audio API with a pre-decoded buffer for instant playback.
 */
export function playTaskComplete(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  function play() {
    if (!taskCompleteBuffer || !ctx) return;
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    source.buffer = taskCompleteBuffer;
    gain.gain.value = 0.5;
    source.connect(gain).connect(ctx.destination);
    source.start(0);
  }

  if (ctx.state === "suspended") {
    ctx.resume().then(play).catch(() => {});
  } else {
    play();
  }
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
