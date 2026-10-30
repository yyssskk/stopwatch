// 30s 120BPM brass-pop beat, fully synthesized. Shared by tools/music.cjs (WAV file) and player.html (browser).
export function synthesize() {
  const SR = 44100, DUR = 30, N = SR * DUR, BEAT = 0.5;
  const L = new Float32Array(N), R = new Float32Array(N);

  let seed = 7;
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;
  const NOTE = { C: 0, Db: 1, D: 2, Eb: 3, E: 4, F: 5, Gb: 6, G: 7, Ab: 8, A: 9, Bb: 10, B: 11 };
  const hz = (n) => {
    const m = n.match(/^([A-G]b?)(\d)$/);
    return 440 * Math.pow(2, (NOTE[m[1]] + (+m[2] + 1) * 12 - 69) / 12);
  };
  const add = (i, v, pan = 0) => {
    if (i < 0 || i >= N) return;
    L[i] += v * (1 - pan) ;
    R[i] += v * (1 + pan);
  };

  function kick(t, g = 1) {
    const s = Math.floor(t * SR);
    for (let i = 0; i < SR * 0.35; i++) {
      const x = i / SR, f = 50 + 110 * Math.exp(-x * 30);
      add(s + i, Math.sin(2 * Math.PI * f * x) * Math.exp(-x * 9) * 0.9 * g);
    }
  }
  function clap(t, g = 1) {
    const s = Math.floor(t * SR);
    let lp = 0;
    for (let i = 0; i < SR * 0.25; i++) {
      const x = i / SR, n = rnd();
      lp += (n - lp) * 0.5;
      const env = Math.exp(-x * 18) * (x < 0.03 ? (Math.floor(x * 100) % 1 === 0 ? 1 : 0.6) : 1);
      add(s + i, (n - lp) * env * 0.45 * g, 0.1);
    }
  }
  function hat(t, g = 1, open = false) {
    const s = Math.floor(t * SR);
    let prev = 0;
    for (let i = 0; i < SR * (open ? 0.2 : 0.05); i++) {
      const x = i / SR, n = rnd(), hp = n - prev;
      prev = n;
      add(s + i, hp * Math.exp(-x * (open ? 14 : 70)) * 0.18 * g, -0.3);
    }
  }
  function crash(t) {
    const s = Math.floor(t * SR);
    let prev = 0;
    for (let i = 0; i < SR * 1.6; i++) {
      const x = i / SR, n = rnd(), hp = n - prev;
      prev = n * 0.6;
      add(s + i, hp * Math.exp(-x * 2.6) * 0.22, 0.25);
    }
  }
  function bass(t, note, len) {
    const s = Math.floor(t * SR), f = hz(note);
    let lp = 0;
    for (let i = 0; i < SR * len; i++) {
      const x = i / SR, ph = (f * x) % 1, saw = ph * 2 - 1;
      lp += (saw - lp) * 0.08;
      const env = Math.min(1, x / 0.005) * Math.exp(-x * 3) * (x > len - 0.02 ? (len - x) / 0.02 : 1);
      add(s + i, (lp * 0.8 + Math.sin(2 * Math.PI * f * x) * 0.5) * env * 0.5);
    }
  }
  // Brass: additive harmonics whose brightness follows the envelope, pitch scoop + delayed vibrato.
  function trumpet(t, note, len, g = 1, pan = 0.15) {
    const s = Math.floor(t * SR), f0 = hz(note);
    let ph = 0;
    const tail = 0.12;
    for (let i = 0; i < SR * (len + tail); i++) {
      const x = i / SR;
      const att = Math.min(1, x / 0.035);
      const rel = x > len ? Math.max(0, 1 - (x - len) / tail) : 1;
      const env = att * rel * (0.85 + 0.15 * Math.exp(-x * 6));
      const scoop = Math.pow(2, (-0.45 * Math.exp(-x * 25)) / 12);
      const vib = 1 + (x > 0.15 ? 0.006 * Math.sin(2 * Math.PI * 5.6 * x) : 0);
      ph += (f0 * scoop * vib) / SR;
      let v = 0;
      const bright = 0.35 + 0.65 * env;
      for (let h = 1; h <= 12; h++) v += (Math.sin(2 * Math.PI * h * ph) / Math.pow(h, 1.6 - bright)) * (h > 1 ? 0.7 : 1);
      add(s + i, Math.tanh(v * 0.55) * env * 0.32 * g, pan);
    }
  }
  const play = (start, seq, g, pan) => seq.forEach(([b, n, l]) => trumpet(start + b * BEAT, n, l * BEAT * 0.92, g, pan));

  // --- arrangement ---
  const roots = ["Bb1", "Eb2", "F1", "Bb1"];
  for (let bar = 0; bar < 15; bar++) {
    const t0 = bar * 2;
    const full = t0 >= 5 && t0 < 28;
    const intro = t0 < 4;
    for (let b = 0; b < 4; b++) {
      const t = t0 + b * BEAT;
      if (t >= 29) continue;
      if (!intro || b % 2 === 0) kick(t, intro ? 0.7 : 1);
      if (!intro && (b === 1 || b === 3)) clap(t);
      hat(t + BEAT / 2, 1, full && b === 3);
      if (full) hat(t, 0.5);
    }
    if (full || (t0 >= 2 && t0 < 4)) {
      const root = roots[bar % 4];
      const up = root.replace(/\d$/, (d) => +d + 1);
      for (let e = 0; e < 8; e++) bass(t0 + e * BEAT / 2, e % 2 ? up : root, BEAT / 2 * 0.9);
    }
  }
  // clock ticks during the countdown
  for (let t = 0; t < 4; t += BEAT) hat(t, 1.4);
  // snare roll into the shout
  for (let i = 0; i < 8; i++) clap(4 + i * 0.125, 0.4 + i * 0.08);

  // "아 줴줴이야!" fanfare at 5s, harmonised
  const fan = [[0, "F4", 0.25], [0.25, "Bb4", 0.25], [0.5, "D5", 0.25], [0.75, "F5", 2.5]];
  const fan3 = [[0, "D4", 0.25], [0.25, "F4", 0.25], [0.5, "Bb4", 0.25], [0.75, "D5", 2.5]];
  crash(5);
  play(5, fan, 1.1, 0.1);
  play(5, fan3, 0.7, -0.2);

  // riff every two bars from 7s
  const riffA = [[0, "F5", 0.25], [0.5, "F5", 0.25], [1, "D5", 0.5], [1.5, "F5", 0.5], [2, "Bb5", 1], [3.5, "A5", 0.25],
    [4, "G5", 0.5], [4.5, "F5", 0.5], [5, "D5", 0.5], [5.5, "Eb5", 0.5], [6, "F5", 1.5]];
  const riffB = [[0, "Bb4", 0.5], [0.5, "D5", 0.5], [1, "F5", 0.5], [1.5, "G5", 0.25], [2, "F5", 0.5], [2.5, "D5", 1],
    [4, "Eb5", 0.5], [4.5, "G5", 0.5], [5, "Bb5", 0.75], [6, "A5", 0.5], [6.5, "Bb5", 1]];
  [7, 11, 15, 19].forEach((t, i) => play(t, i % 2 ? riffB : riffA, 0.85, 0.15));
  crash(13);
  crash(21);
  // stabs during "주말 준비"
  [23, 23.75, 24.5, 25].forEach((t) => { trumpet(t, "Bb4", 0.2, 0.9, 0.1); trumpet(t, "D5", 0.2, 0.7, -0.1); trumpet(t, "F5", 0.2, 0.7, 0.2); });
  // final shout + ending hit
  crash(26);
  play(26, fan, 1.1, 0.1);
  play(26, fan3, 0.7, -0.2);
  crash(29);
  kick(29, 1.2);
  trumpet(29, "Bb4", 0.8, 1, 0); trumpet(29, "D5", 0.8, 0.8, -0.2); trumpet(29, "F5", 0.8, 0.8, 0.2); trumpet(29, "Bb5", 0.8, 0.7, 0);

  // --- master: soft clip and normalise ---
  let peak = 0;
  for (let i = 0; i < N; i++) {
    L[i] = Math.tanh(L[i] * 1.2); R[i] = Math.tanh(R[i] * 1.2);
    peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
  }
  for (let i = 0; i < N; i++) {
    const fade = Math.min(1, (N - i) / (SR * 0.3));
    L[i] = (L[i] / peak) * 0.89 * fade; R[i] = (R[i] / peak) * 0.89 * fade;
  }
  return { sampleRate: SR, left: L, right: R };
}
