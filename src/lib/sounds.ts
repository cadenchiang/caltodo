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
 * Plays a synthesized "wooden tap" when a task is completed. Subtle,
 * smooth, and quick — feels like flicking a small wooden block. No
 * external audio file: WebAudio only, so it works offline and starts
 * instantly without a fetch/decode round-trip.
 *
 * The sound is built from two layers:
 *  1. A short band-passed white-noise burst (~25ms) that gives the
 *     percussive transient — that's what makes it feel "tap-y" rather
 *     than "beep-y".
 *  2. A muted low sine resonance (~180Hz, 90ms) that gives a hint of
 *     wooden body underneath, with an exponential decay so it doesn't
 *     ring.
 */
export function playTaskComplete(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  function play() {
    if (!ctx) return;
    const now = ctx.currentTime;

    // ── Layer 1: noise transient (the "tap") ─────────────────────────
    // Build a 60ms buffer of white noise; the band-pass filter selects
    // a wooden mid-band so it sounds like a knock instead of a hiss.
    const noiseDuration = 0.06;
    const noiseFrames = Math.floor(ctx.sampleRate * noiseDuration);
    const noiseBuffer = ctx.createBuffer(1, noiseFrames, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseFrames; i++) data[i] = Math.random() * 2 - 1;

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.value = 1100;
    noiseFilter.Q.value = 4.5;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.001, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.18, now + 0.004);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    noiseSource.connect(noiseFilter).connect(noiseGain).connect(ctx.destination);
    noiseSource.start(now);
    noiseSource.stop(now + noiseDuration);

    // ── Layer 2: low sine body (the "wood") ──────────────────────────
    const body = ctx.createOscillator();
    body.type = "sine";
    body.frequency.setValueAtTime(220, now);
    body.frequency.exponentialRampToValueAtTime(170, now + 0.09);

    const bodyGain = ctx.createGain();
    bodyGain.gain.setValueAtTime(0.001, now);
    bodyGain.gain.exponentialRampToValueAtTime(0.09, now + 0.005);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    body.connect(bodyGain).connect(ctx.destination);
    body.start(now);
    body.stop(now + 0.1);
  }

  if (ctx.state === "suspended") {
    ctx.resume().then(play).catch(() => {});
  } else {
    play();
  }
}

/**
 * Plays a soft synthesized "blip" when a task is created. Lighter and
 * higher than the wooden completion tap so the two events stay
 * distinguishable: completion is a confident knock, creation is a quick
 * acknowledging tick. WebAudio only — no asset fetch.
 *
 * Single sine layer at ~660Hz with a fast exponential decay (~70ms).
 * Quiet enough to fire on every task add without becoming annoying.
 */
export function playTaskCreated(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  function play() {
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(660, now);
    osc.frequency.exponentialRampToValueAtTime(820, now + 0.05);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.07, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.075);

    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.085);
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
 * Plays a mechanical clock tick for pomodoro button presses.
 * Short noise burst through a bandpass filter at 3200Hz.
 */
export function playPomodoroClick(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  function play() {
    if (!ctx) return;
    const t = ctx.currentTime;
    const bufferSize = Math.floor(ctx.sampleRate * 0.015);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 3200;
    filter.Q.value = 5;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.8, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    noise.connect(filter).connect(gain).connect(ctx.destination);
    noise.start(t);
    noise.stop(t + 0.03);
  }

  if (ctx.state === "suspended") {
    ctx.resume().then(play).catch(() => {});
  } else {
    play();
  }
}

/**
 * Plays a classic twin-bell alarm clock ring. 8 alternating strikes
 * at 2200Hz/2600Hz with metallic overtones. Used when a pomodoro
 * timer finishes.
 */
export function playPomodoroAlarm(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  function play() {
    if (!ctx) return;
    const t = ctx.currentTime;
    const strikes = 8;
    const interval = 0.12;
    for (let i = 0; i < strikes; i++) {
      const offset = t + i * interval;
      const freq = i % 2 === 0 ? 2200 : 2600;
      const osc = ctx.createOscillator();
      osc.type = "square";
      osc.frequency.value = freq;
      const osc2 = ctx.createOscillator();
      osc2.type = "sine";
      osc2.frequency.value = freq * 2.76;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, offset);
      gain.gain.linearRampToValueAtTime(0.6, offset + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, offset + 0.09);
      const gain2 = ctx.createGain();
      gain2.gain.setValueAtTime(0, offset);
      gain2.gain.linearRampToValueAtTime(0.2, offset + 0.005);
      gain2.gain.exponentialRampToValueAtTime(0.001, offset + 0.07);
      osc.connect(gain).connect(ctx.destination);
      osc2.connect(gain2).connect(ctx.destination);
      osc.start(offset);
      osc.stop(offset + 0.1);
      osc2.start(offset);
      osc2.stop(offset + 0.1);
    }
  }

  if (ctx.state === "suspended") {
    ctx.resume().then(play).catch(() => {});
  } else {
    play();
  }
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
