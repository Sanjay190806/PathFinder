/**
 * timerSounds.ts
 * Web Audio API-based peaceful alarm sounds for the Pomodoro timer.
 * No external files needed — all synthesized in the browser.
 */

let audioCtx: AudioContext | null = null;

const getCtx = (): AudioContext => {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
};

/** Play a peaceful temple-bell gong */
export const playGong = (volume = 0.6) => {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(528, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(264, ctx.currentTime + 2.5);
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 3);
};

/** Play a soft chime (3-note ascending) */
export const playChime = (volume = 0.5) => {
  const ctx = getCtx();
  const notes = [523.25, 659.25, 783.99]; // C5 E5 G5
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = freq;
    const t = ctx.currentTime + i * 0.22;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(volume, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
    osc.start(t);
    osc.stop(t + 0.85);
  });
};

/** Play a soft XP-gain ding */
export const playXPDing = (volume = 0.4) => {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(880, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(1100, ctx.currentTime + 0.1);
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.55);
};

/** Play achievement unlock fanfare */
export const playAchievementFanfare = (volume = 0.5) => {
  const ctx = getCtx();
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C E G C8
  const times =  [0,      0.18,   0.36,   0.54];
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = i === notes.length - 1 ? 'sine' : 'triangle';
    osc.frequency.value = freq;
    const t = ctx.currentTime + times[i];
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(volume, t + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, t + (i === notes.length - 1 ? 1.2 : 0.3));
    osc.start(t);
    osc.stop(t + (i === notes.length - 1 ? 1.25 : 0.35));
  });
};

/** Gentle 5-minute warning — soft low pulse */
export const playWarningPulse = (volume = 0.35) => {
  const ctx = getCtx();
  [0, 0.4].forEach(delay => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = 330;
    const t = ctx.currentTime + delay;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(volume, t + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    osc.start(t);
    osc.stop(t + 0.55);
  });
};
