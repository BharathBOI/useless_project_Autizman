/**
 * SERIALOS Web Audio Synthesizer
 * Generates exaggerated Indian & Malayalam TV Serial orchestral stings,
 * weeping violins, dissonant villain drones, and shock impacts using native Web Audio API.
 */

export class SerialSynthesizer {
  private ctx: AudioContext;
  private activeNodes: Array<{ stop?: () => void; disconnect?: () => void }> = [];

  constructor(ctx: AudioContext) {
    this.ctx = ctx;
  }

  private registerNode(node: { stop?: () => void; disconnect?: () => void }) {
    this.activeNodes.push(node);
  }

  stopAll(fadeMs = 100): void {
    const fadeSec = fadeMs / 1000;
    const now = this.ctx.currentTime;

    for (const node of this.activeNodes) {
      try {
        if ('gain' in node && (node as any).gain instanceof AudioParam) {
          (node as any).gain.setTargetAtTime(0, now, fadeSec);
        }
        if (node.stop) {
          node.stop();
        }
      } catch (e) {
        // Ignore already stopped nodes
      }
    }
    this.activeNodes = [];
  }

  // ==========================================
  // 1. SHOCK PRESETS
  // ==========================================

  /**
   * SHOCK_1: The Classic Indian TV Serial Triple Dramatic Zoom Crash!
   * Heavy sub-impact + metallic crash + 2 echoing rapid stabs.
   */
  playShock1(volume = 1.0, masterGain: GainNode): number {
    const now = this.ctx.currentTime;
    const hitTimes = [now, now + 0.18, now + 0.36];

    hitTimes.forEach((t, index) => {
      const hitScale = index === 0 ? 1.0 : index === 1 ? 0.8 : 0.65;

      // 1. Sub Bass Punch
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(110, t);
      subOsc.frequency.exponentialRampToValueAtTime(35, t + 0.35);

      subGain.gain.setValueAtTime(0.85 * volume * hitScale, t);
      subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

      subOsc.connect(subGain);
      subGain.connect(masterGain);
      subOsc.start(t);
      subOsc.stop(t + 0.45);
      this.registerNode(subOsc);

      // 2. Harsh Brass / Sawtooth Hit
      const sawOsc = this.ctx.createOscillator();
      const sawGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      sawOsc.type = 'sawtooth';
      sawOsc.frequency.setValueAtTime(140, t);
      sawOsc.frequency.exponentialRampToValueAtTime(60, t + 0.25);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2800, t);
      filter.frequency.exponentialRampToValueAtTime(300, t + 0.3);
      filter.Q.setValueAtTime(6, t);

      sawGain.gain.setValueAtTime(0.7 * volume * hitScale, t);
      sawGain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      sawOsc.connect(filter);
      filter.connect(sawGain);
      sawGain.connect(masterGain);
      sawOsc.start(t);
      sawOsc.stop(t + 0.4);
      this.registerNode(sawOsc);

      // 3. Noise Cymbal / Thunder Crash (on first hit only)
      if (index === 0) {
        this.playNoiseCrash(t, 0.75 * volume, masterGain);
      }
    });

    return 2.5; // duration in seconds
  }

  /**
   * SHOCK_2: Dizzying descending panic glissando
   */
  playShock2(volume = 1.0, masterGain: GainNode): number {
    const now = this.ctx.currentTime;

    [880, 1108.73, 1318.5].forEach((freq) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.25, now + 1.2);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(freq * 0.8, now);
      filter.frequency.exponentialRampToValueAtTime(200, now + 1.2);
      filter.Q.setValueAtTime(4, now);

      gain.gain.setValueAtTime(0.4 * volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.3);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 1.35);
      this.registerNode(osc);
    });

    return 1.5;
  }

  // ==========================================
  // 2. VILLAIN PRESETS
  // ==========================================

  /**
   * VILLAIN_1: The Ominous Minor-2nd Drone of Doom & Evil Heartbeat
   */
  playVillain1(volume = 1.0, masterGain: GainNode): number {
    const now = this.ctx.currentTime;
    const duration = 6.5;

    // Dissonant minor second clashing drone (A1 = 55Hz, Bb1 = 58.27Hz)
    [55, 58.27, 110].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = idx === 2 ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, now);
      filter.Q.setValueAtTime(5, now);

      // Slow pulsation LFO
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(1.2, now);
      lfoGain.gain.setValueAtTime(150, now);
      lfo.connect(filter.frequency);
      lfo.start(now);
      lfo.stop(now + duration);
      this.registerNode(lfo);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.35 * volume, now + 0.8);
      gain.gain.setValueAtTime(0.35 * volume, now + duration - 1.2);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + duration);
      this.registerNode(osc);
    });

    // Sinister sub-bass heartbeat pulse (at 0s, 1.2s, 2.4s, 3.6s, 4.8s)
    for (let beat = 0; beat < 5; beat++) {
      const beatTime = now + beat * 1.2;
      this.playSubPulse(beatTime, 0.7 * volume, masterGain);
    }

    return duration;
  }

  /**
   * VILLAIN_2: Aggressive Orchestral Brass Stabs (C -> F# Tritone -> G -> C)
   */
  playVillain2(volume = 1.0, masterGain: GainNode): number {
    const now = this.ctx.currentTime;
    const notes = [
      { f: 130.81, t: now, d: 0.35 },        // C3
      { f: 185.00, t: now + 0.45, d: 0.35 }, // F#3 (evil tritone!)
      { f: 196.00, t: now + 0.9, d: 0.4 },  // G3
      { f: 130.81, t: now + 1.45, d: 1.2 }, // Low C3 hit with sustained decay
    ];

    notes.forEach(({ f, t, d }) => {
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc1.type = 'sawtooth';
      osc2.type = 'square';
      osc1.frequency.setValueAtTime(f, t);
      osc2.frequency.setValueAtTime(f * 1.01, t); // Detuned

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1800, t);
      filter.frequency.exponentialRampToValueAtTime(400, t + d);
      filter.Q.setValueAtTime(4, t);

      gain.gain.setValueAtTime(0.55 * volume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + d);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + d + 0.05);
      osc2.stop(t + d + 0.05);
      this.registerNode(osc1);
      this.registerNode(osc2);
    });

    return 3.0;
  }

  /**
   * VILLAIN_3: Whispering Conspiracy
   */
  playVillain3(volume = 1.0, masterGain: GainNode): number {
    const now = this.ctx.currentTime;
    const duration = 5.0;

    // Dark minor 3rd arpeggio low in frequency
    const notes = [110, 130.81, 155.56, 123.47];
    notes.forEach((freq, idx) => {
      const t = now + idx * 0.9;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.4 * volume, t + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.8);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(t);
      osc.stop(t + 2.0);
      this.registerNode(osc);
    });

    return duration;
  }

  // ==========================================
  // 3. SAD PRESETS (CRITICAL SETCASES)
  // ==========================================

  /**
   * SAD_1: The Weeping Cello / Violin Lament
   * Iconic descending minor lament progression: A -> G -> F -> E with weeping vibrato.
   */
  playSad1(volume = 1.0, masterGain: GainNode): number {
    const now = this.ctx.currentTime;
    const notes = [
      { f: 220.00, t: now, d: 1.4 },        // A3
      { f: 196.00, t: now + 1.3, d: 1.4 },  // G3
      { f: 174.61, t: now + 2.6, d: 1.4 },  // F3
      { f: 164.81, t: now + 3.9, d: 2.2 },  // E3 (resolving weeping tone)
    ];

    notes.forEach(({ f, t, d }) => {
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // Expressive weeping vibrato (5.2 Hz LFO)
      const vibrato = this.ctx.createOscillator();
      const vibratoGain = this.ctx.createGain();
      vibrato.frequency.setValueAtTime(5.2, t);
      vibratoGain.gain.setValueAtTime(4.5, t);
      vibrato.connect(osc1.frequency);
      vibrato.connect(osc2.frequency);
      vibrato.start(t);
      vibrato.stop(t + d);
      this.registerNode(vibrato);

      osc1.type = 'sawtooth';
      osc2.type = 'sawtooth';
      osc1.frequency.setValueAtTime(f, t);
      osc2.frequency.setValueAtTime(f * 1.005, t); // Detuned string warmth

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(750, t);
      filter.Q.setValueAtTime(2.5, t);

      // Smooth sorrowful swell
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.45 * volume, t + 0.35);
      gain.gain.setValueAtTime(0.4 * volume, t + d - 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, t + d);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + d + 0.1);
      osc2.stop(t + d + 0.1);
      this.registerNode(osc1);
      this.registerNode(osc2);
    });

    return 6.2;
  }

  /**
   * SAD_2: Tears of Betrayal (D Minor 9th Melancholy String Swell)
   */
  playSad2(volume = 1.0, masterGain: GainNode): number {
    const now = this.ctx.currentTime;
    const chord = [146.83, 174.61, 220.00, 261.63, 329.63]; // D3, F3, A3, C4, E4
    const duration = 5.5;

    chord.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.25 * volume, now + 1.2 + idx * 0.1);
      gain.gain.setValueAtTime(0.25 * volume, now + duration - 1.5);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + duration);
      this.registerNode(osc);
    });

    return duration;
  }

  /**
   * SAD_3: Ghost of the Past (High solo flute/violin descending glide)
   */
  playSad3(volume = 1.0, masterGain: GainNode): number {
    const now = this.ctx.currentTime;
    const duration = 4.8;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(659.25, now); // E5
    osc.frequency.exponentialRampToValueAtTime(493.88, now + duration); // glide to B4

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.5 * volume, now + 0.6);
    gain.gain.setValueAtTime(0.4 * volume, now + duration - 1.0);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    osc.start(now);
    osc.stop(now + duration);
    this.registerNode(osc);

    return duration;
  }

  // ==========================================
  // 4. SUSPENSE PRESETS
  // ==========================================

  /**
   * SUSPENSE_1: High-Stakes Violin Tremolo (9 Hz shivering modulation)
   */
  playSuspense1(volume = 1.0, masterGain: GainNode): number {
    const now = this.ctx.currentTime;
    const duration = 5.0;

    [739.99, 745.0].forEach((freq) => {
      const osc = this.ctx.createOscillator();
      const tremoloGain = this.ctx.createGain();
      const masterTremolo = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);

      // Tremolo LFO at 9.5 Hz
      const lfo = this.ctx.createOscillator();
      lfo.frequency.setValueAtTime(9.5, now);
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(0.4, now);
      lfo.connect(lfoGain);
      lfoGain.connect(tremoloGain.gain);
      lfo.start(now);
      lfo.stop(now + duration);
      this.registerNode(lfo);

      masterTremolo.gain.setValueAtTime(0.001, now);
      masterTremolo.gain.linearRampToValueAtTime(0.35 * volume, now + 0.5);
      masterTremolo.gain.setValueAtTime(0.35 * volume, now + duration - 0.8);
      masterTremolo.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(tremoloGain);
      tremoloGain.connect(masterTremolo);
      masterTremolo.connect(masterGain);

      osc.start(now);
      osc.stop(now + duration);
      this.registerNode(osc);
    });

    return duration;
  }

  /**
   * SUSPENSE_2: The Ticking Clock of Destiny
   */
  playSuspense2(volume = 1.0, masterGain: GainNode): number {
    const now = this.ctx.currentTime;
    const pings = 6;
    for (let i = 0; i < pings; i++) {
      const t = now + i * 0.7;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200 + i * 60, t); // creeping pitch

      gain.gain.setValueAtTime(0.5 * volume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(t);
      osc.stop(t + 0.25);
      this.registerNode(osc);
    }

    return pings * 0.7 + 0.5;
  }

  // ==========================================
  // 5. CLIFFHANGER PRESET
  // ==========================================

  /**
   * CLIFFHANGER_1: Massive Multi-Octave Escalating Riser + Sudden Silence Cutoff!
   */
  playCliffhanger1(volume = 1.0, masterGain: GainNode): number {
    const now = this.ctx.currentTime;
    const duration = 4.5;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + duration);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, now);
    filter.frequency.exponentialRampToValueAtTime(4500, now + duration);
    filter.Q.setValueAtTime(8, now);

    // Build volume up to a climax, then cut to dead silence!
    gain.gain.setValueAtTime(0.1 * volume, now);
    gain.gain.exponentialRampToValueAtTime(0.85 * volume, now + duration - 0.05);
    gain.gain.setValueAtTime(0.0001, now + duration); // Sudden cutoff!

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    osc.start(now);
    osc.stop(now + duration + 0.05);
    this.registerNode(osc);

    return duration;
  }

  // ==========================================
  // 6. INSTANT LOW-LEVEL STINGS (0ms)
  // ==========================================

  /**
   * Short Dramatic Entrance Sting (0ms reaction)
   */
  playEntranceSting(volume = 1.0, masterGain: GainNode): number {
    const now = this.ctx.currentTime;
    [196, 293.66, 392].forEach((freq) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.6 * volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.95);
      this.registerNode(osc);
    });

    return 1.0;
  }

  /**
   * Short Dramatic Exit Sting
   */
  playExitSting(volume = 1.0, masterGain: GainNode): number {
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(261.63, now); // C4
    osc.frequency.exponentialRampToValueAtTime(146.83, now + 1.2); // drop to D3

    gain.gain.setValueAtTime(0.5 * volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.3);

    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(now);
    osc.stop(now + 1.35);
    this.registerNode(osc);

    return 1.4;
  }

  // ==========================================
  // 7. ROMANTIC & COMEDY PRESETS
  // ==========================================

  playRomantic1(volume = 1.0, masterGain: GainNode): number {
    const now = this.ctx.currentTime;
    const duration = 4.5;
    // Warm Major 7th chord (F3, A3, C4, E4)
    [174.61, 220.0, 261.63, 329.63].forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.3 * volume, now + 0.8 + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + duration);
      this.registerNode(osc);
    });

    return duration;
  }

  playComedy1(volume = 1.0, masterGain: GainNode): number {
    const now = this.ctx.currentTime;
    // Cartoonish boing
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(550, now + 0.25);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.6);

    gain.gain.setValueAtTime(0.7 * volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(now);
    osc.stop(now + 0.75);
    this.registerNode(osc);

    return 0.8;
  }

  // Helper: Sub-bass pulse
  private playSubPulse(t: number, volume: number, masterGain: GainNode) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(65, t);
    osc.frequency.exponentialRampToValueAtTime(32, t + 0.35);

    gain.gain.setValueAtTime(0.7 * volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(t);
    osc.stop(t + 0.45);
    this.registerNode(osc);
  }

  // Helper: Filtered White Noise Crash
  private playNoiseCrash(t: number, volume: number, masterGain: GainNode) {
    const bufferSize = this.ctx.sampleRate * 0.8;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2200, t);
    filter.Q.setValueAtTime(2.5, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.6 * volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);

    noise.start(t);
    noise.stop(t + 0.85);
    this.registerNode(noise);
  }
}
