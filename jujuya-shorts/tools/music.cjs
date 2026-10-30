// Writes the synthesized beat to a 16-bit WAV. Usage: node tools/music.cjs assets/music.wav
const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");

import(pathToFileURL(path.join(__dirname, "synth.js")).href).then(({ synthesize }) => {
  const { sampleRate: SR, left: L, right: R } = synthesize();
  const N = L.length;
  const buf = Buffer.alloc(44 + N * 4);
  buf.write("RIFF", 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write("WAVE", 8); buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write("data", 36); buf.writeUInt32LE(N * 4, 40);
  for (let i = 0; i < N; i++) {
    buf.writeInt16LE(Math.round(L[i] * 32767), 44 + i * 4);
    buf.writeInt16LE(Math.round(R[i] * 32767), 46 + i * 4);
  }
  const out = process.argv[2] || "assets/music.wav";
  fs.writeFileSync(out, buf);
  console.log("wrote", out);
});
