import fs from 'fs';
import path from 'path';

const SAMPLE_RATE = 44100;

function writeWavFile(filepath, samples) {
  const numChannels = 1;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = SAMPLE_RATE * blockAlign;
  const dataSize = samples.length * bytesPerSample;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt subchunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size
  buffer.writeUInt16LE(1, 20);  // PCM format
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34); // BitsPerSample

  // data subchunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    const val = s < 0 ? s * 0x8000 : s * 0x7FFF;
    buffer.writeInt16LE(Math.floor(val), 44 + i * 2);
  }

  fs.mkdirSync(path.dirname(filepath), { recursive: true });
  fs.writeFileSync(filepath, buffer);
  console.log(`Generated: ${filepath} (${(samples.length / SAMPLE_RATE).toFixed(1)}s)`);
}

// 1. SHOCK 1: Triple Zoom Crash
function genShock1() {
  const dur = 2.5;
  const numSamples = Math.floor(SAMPLE_RATE * dur);
  const out = new Float32Array(numSamples);

  const hitOffsets = [0, 0.18, 0.36];
  hitOffsets.forEach((t0, idx) => {
    const scale = idx === 0 ? 1.0 : idx === 1 ? 0.75 : 0.55;
    const startIdx = Math.floor(t0 * SAMPLE_RATE);
    const hitDur = 0.45;
    const hitSamples = Math.floor(hitDur * SAMPLE_RATE);

    for (let i = 0; i < hitSamples && startIdx + i < numSamples; i++) {
      const t = i / SAMPLE_RATE;
      const decay = Math.exp(-t * 12);

      // Sub drop
      const fSub = 110 * Math.exp(-t * 3.5);
      const sub = Math.sin(2 * Math.PI * fSub * t) * 0.5 * decay;

      // Saw brass hit
      const fSaw = 140 * Math.exp(-t * 2.5);
      const saw = (2 * ((t * fSaw) % 1) - 1) * 0.35 * decay;

      // Crash noise on first hit
      let noise = 0;
      if (idx === 0) {
        const noiseDecay = Math.exp(-t * 6);
        noise = (Math.random() * 2 - 1) * 0.45 * noiseDecay;
      }

      out[startIdx + i] += (sub + saw + noise) * scale;
    }
  });

  return out;
}

// 2. SHOCK 2: Descending Glissando
function genShock2() {
  const dur = 1.6;
  const numSamples = Math.floor(SAMPLE_RATE * dur);
  const out = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const decay = Math.exp(-t * 2.5);
    const f1 = 880 * Math.exp(-t * 1.5);
    const f2 = 1108 * Math.exp(-t * 1.5);
    const saw1 = 2 * ((t * f1) % 1) - 1;
    const saw2 = 2 * ((t * f2) % 1) - 1;
    out[i] = (saw1 * 0.4 + saw2 * 0.4) * decay;
  }
  return out;
}

// 3. VILLAIN 1: Doom Drone & Heartbeat
function genVillain1() {
  const dur = 5.5;
  const numSamples = Math.floor(SAMPLE_RATE * dur);
  const out = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const env = t < 0.6 ? t / 0.6 : t > dur - 1 ? (dur - t) : 1;
    // Dissonant minor 2nd drone (55Hz and 58.27Hz)
    const drone1 = Math.sin(2 * Math.PI * 55 * t);
    const drone2 = Math.sin(2 * Math.PI * 58.27 * t);
    const sawHarmonic = (2 * ((t * 110) % 1) - 1) * 0.25;

    // Heartbeat pulse every 1.1s
    const beatPhase = (t % 1.1);
    let pulse = 0;
    if (beatPhase < 0.35) {
      const pDecay = Math.exp(-beatPhase * 10);
      pulse = Math.sin(2 * Math.PI * 50 * beatPhase) * 0.5 * pDecay;
    }

    out[i] = (drone1 * 0.3 + drone2 * 0.3 + sawHarmonic + pulse) * env * 0.7;
  }
  return out;
}

// 4. VILLAIN 2: Tritone Brass Stabs
function genVillain2() {
  const dur = 3.2;
  const numSamples = Math.floor(SAMPLE_RATE * dur);
  const out = new Float32Array(numSamples);

  const notes = [
    { f: 130.81, t0: 0.0, d: 0.35 },
    { f: 185.00, t0: 0.45, d: 0.35 },
    { f: 196.00, t0: 0.90, d: 0.40 },
    { f: 130.81, t0: 1.45, d: 1.50 },
  ];

  notes.forEach(({ f, t0, d }) => {
    const startIdx = Math.floor(t0 * SAMPLE_RATE);
    const len = Math.floor(d * SAMPLE_RATE);
    for (let i = 0; i < len && startIdx + i < numSamples; i++) {
      const t = i / SAMPLE_RATE;
      const decay = Math.exp(-t * 4);
      const saw1 = 2 * ((t * f) % 1) - 1;
      const saw2 = 2 * ((t * (f * 1.01)) % 1) - 1;
      out[startIdx + i] += (saw1 * 0.35 + saw2 * 0.35) * decay;
    }
  });

  return out;
}

// 5. SAD 1: Weeping Cello Lament (A3 -> G3 -> F3 -> E3)
function genSad1() {
  const dur = 6.0;
  const numSamples = Math.floor(SAMPLE_RATE * dur);
  const out = new Float32Array(numSamples);

  const notes = [
    { f: 220.00, t0: 0.0, d: 1.4 },
    { f: 196.00, t0: 1.3, d: 1.4 },
    { f: 174.61, t0: 2.6, d: 1.4 },
    { f: 164.81, t0: 3.9, d: 2.0 },
  ];

  notes.forEach(({ f, t0, d }) => {
    const startIdx = Math.floor(t0 * SAMPLE_RATE);
    const len = Math.floor(d * SAMPLE_RATE);
    for (let i = 0; i < len && startIdx + i < numSamples; i++) {
      const t = i / SAMPLE_RATE;
      const env = t < 0.25 ? t / 0.25 : t > d - 0.4 ? (d - t) / 0.4 : 1;
      const vibrato = Math.sin(2 * Math.PI * 5.2 * t) * 4.0;
      const currentF = f + vibrato;
      const saw1 = 2 * ((t * currentF) % 1) - 1;
      const saw2 = 2 * ((t * (currentF * 1.006)) % 1) - 1;
      out[startIdx + i] += (saw1 * 0.3 + saw2 * 0.3) * env * 0.7;
    }
  });

  return out;
}

// 6. SAD 2: Tears of Betrayal (D Minor 9th Swell)
function genSad2() {
  const dur = 5.0;
  const numSamples = Math.floor(SAMPLE_RATE * dur);
  const out = new Float32Array(numSamples);
  const freqs = [146.83, 174.61, 220.00, 261.63, 329.63];

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const env = t < 1.2 ? t / 1.2 : t > dur - 1.2 ? (dur - t) / 1.2 : 1;
    let sum = 0;
    freqs.forEach((f) => {
      sum += (2 * ((t * f) % 1) - 1) * 0.12;
    });
    out[i] = sum * env;
  }
  return out;
}

// 7. SUSPENSE 1: 9.5Hz Violin Tremolo
function genSuspense1() {
  const dur = 4.8;
  const numSamples = Math.floor(SAMPLE_RATE * dur);
  const out = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const env = t < 0.4 ? t / 0.4 : t > dur - 0.6 ? (dur - t) / 0.6 : 1;
    const tremolo = 0.5 + 0.5 * Math.sin(2 * Math.PI * 9.5 * t);
    const saw = 2 * ((t * 740) % 1) - 1;
    out[i] = saw * tremolo * env * 0.5;
  }
  return out;
}

// 8. CLIFFHANGER 1: Escalating Mega Riser + Sudden Silence
function genCliffhanger1() {
  const dur = 4.5;
  const numSamples = Math.floor(SAMPLE_RATE * dur);
  const out = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    if (t >= dur - 0.05) {
      out[i] = 0; // sudden dead silence!
      continue;
    }
    const env = Math.pow(t / (dur - 0.05), 1.5) * 0.85;
    const f = 110 * Math.pow(1200 / 110, t / dur);
    const saw = 2 * ((t * f) % 1) - 1;
    const noise = (Math.random() * 2 - 1) * (t / dur) * 0.35;
    out[i] = (saw * 0.5 + noise) * env;
  }
  return out;
}

// 9. ENTRANCE STING
function genEntranceSting() {
  const dur = 1.0;
  const numSamples = Math.floor(SAMPLE_RATE * dur);
  const out = new Float32Array(numSamples);
  const freqs = [196, 293.66, 392];

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const decay = Math.exp(-t * 4);
    let sum = 0;
    freqs.forEach((f) => {
      sum += (2 * ((t * f) % 1) - 1) * 0.25;
    });
    out[i] = sum * decay;
  }
  return out;
}

// 10. EXIT STING
function genExitSting() {
  const dur = 1.4;
  const numSamples = Math.floor(SAMPLE_RATE * dur);
  const out = new Float32Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const f = 261.63 * Math.exp(-t * 0.4);
    const decay = Math.exp(-t * 2.2);
    out[i] = Math.sin(2 * Math.PI * f * t) * decay * 0.6;
  }
  return out;
}

// 11. VILLAIN 3: Sinister Conspiracy
function genVillain3() {
  const dur = 5.0;
  const numSamples = Math.floor(SAMPLE_RATE * dur);
  const out = new Float32Array(numSamples);
  const notes = [110, 130.81, 155.56, 123.47];
  notes.forEach((freq, idx) => {
    const t0 = idx * 0.9;
    const startIdx = Math.floor(t0 * SAMPLE_RATE);
    for (let i = 0; i < Math.floor(2.0 * SAMPLE_RATE) && startIdx + i < numSamples; i++) {
      const t = i / SAMPLE_RATE;
      const decay = Math.exp(-t * 1.5);
      out[startIdx + i] += Math.sin(2 * Math.PI * freq * t) * 0.35 * decay;
    }
  });
  return out;
}

// 12. SAD 3: Ghost of the Past
function genSad3() {
  const dur = 4.8;
  const numSamples = Math.floor(SAMPLE_RATE * dur);
  const out = new Float32Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const f = 659.25 * Math.pow(493.88 / 659.25, t / dur);
    const env = t < 0.6 ? t / 0.6 : t > dur - 1 ? (dur - t) : 1;
    out[i] = Math.sin(2 * Math.PI * f * t) * env * 0.5;
  }
  return out;
}

// 13. SUSPENSE 2: Ticking Clock
function genSuspense2() {
  const dur = 4.5;
  const numSamples = Math.floor(SAMPLE_RATE * dur);
  const out = new Float32Array(numSamples);
  for (let p = 0; p < 6; p++) {
    const t0 = p * 0.7;
    const startIdx = Math.floor(t0 * SAMPLE_RATE);
    const f = 1200 + p * 60;
    for (let i = 0; i < Math.floor(0.25 * SAMPLE_RATE) && startIdx + i < numSamples; i++) {
      const t = i / SAMPLE_RATE;
      const decay = Math.exp(-t * 20);
      out[startIdx + i] += Math.sin(2 * Math.PI * f * t) * 0.5 * decay;
    }
  }
  return out;
}

// 14. ROMANTIC 1: Major 7th Swell
function genRomantic1() {
  const dur = 4.5;
  const numSamples = Math.floor(SAMPLE_RATE * dur);
  const out = new Float32Array(numSamples);
  const freqs = [174.61, 220.0, 261.63, 329.63];
  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const env = t < 0.8 ? t / 0.8 : t > dur - 1.2 ? (dur - t) / 1.2 : 1;
    let sum = 0;
    freqs.forEach((f) => { sum += Math.sin(2 * Math.PI * f * t) * 0.18; });
    out[i] = sum * env;
  }
  return out;
}

// 15. COMEDY 1: Jaw Harp Boing
function genComedy1() {
  const dur = 0.8;
  const numSamples = Math.floor(SAMPLE_RATE * dur);
  const out = new Float32Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const f = 150 + 400 * Math.sin(Math.PI * (t / 0.8));
    const decay = Math.exp(-t * 3);
    out[i] = Math.sin(2 * Math.PI * f * t) * 0.6 * decay;
  }
  return out;
}

// Generate all samples to public/audio_samples/
const targetDir = path.resolve('public/audio_samples');
writeWavFile(path.join(targetDir, 'shock_1.wav'), genShock1());
writeWavFile(path.join(targetDir, 'shock_2.wav'), genShock2());
writeWavFile(path.join(targetDir, 'villain_1.wav'), genVillain1());
writeWavFile(path.join(targetDir, 'villain_2.wav'), genVillain2());
writeWavFile(path.join(targetDir, 'villain_3.wav'), genVillain3());
writeWavFile(path.join(targetDir, 'sad_1.wav'), genSad1());
writeWavFile(path.join(targetDir, 'sad_2.wav'), genSad2());
writeWavFile(path.join(targetDir, 'sad_3.wav'), genSad3());
writeWavFile(path.join(targetDir, 'suspense_1.wav'), genSuspense1());
writeWavFile(path.join(targetDir, 'suspense_2.wav'), genSuspense2());
writeWavFile(path.join(targetDir, 'cliffhanger_1.wav'), genCliffhanger1());
writeWavFile(path.join(targetDir, 'entrance_sting.wav'), genEntranceSting());
writeWavFile(path.join(targetDir, 'exit_sting.wav'), genExitSting());
writeWavFile(path.join(targetDir, 'romantic_1.wav'), genRomantic1());
writeWavFile(path.join(targetDir, 'comedy_1.wav'), genComedy1());

console.log('All 15 audio presets generated successfully!');
