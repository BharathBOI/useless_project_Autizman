import { DramaticAudioPreset } from '../types/audio';

/**
 * Web Audio API Synthesis Engine for exaggerated Indian TV Serial Dramatic Sound Presets.
 * Uses Web Audio synthesis nodes (Oscillators, Filters, LFOs, Gain envelopes) to play
 * recognizable soap opera musical motifs without external audio file dependencies.
 */

export function playPresetSynthesis(
  ctx: AudioContext,
  masterGain: GainNode,
  preset: DramaticAudioPreset,
  intensity: number = 80,
  durationSec: number = 5
): { stop: () => void } {
  const activeNodes: (OscillatorNode | AudioBufferSourceNode | BiquadFilterNode | GainNode)[] = [];
  const normalizedVol = Math.max(0.1, Math.min(1.0, intensity / 100));

  const now = ctx.currentTime;
  const presetGain = ctx.createGain();
  presetGain.gain.setValueAtTime(0.001, now);
  presetGain.connect(masterGain);
  activeNodes.push(presetGain);

  // Envelope helpers
  const attack = 0.15;
  const release = 0.8;
  const dur = Math.max(2, durationSec);

  presetGain.gain.exponentialRampToValueAtTime(normalizedVol, now + attack);
  presetGain.gain.setValueAtTime(normalizedVol, now + dur - release);
  presetGain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

  switch (preset) {
    case 'VILLAIN_1':
    case 'VILLAIN_2':
    case 'VILLAIN_3': {
      // Menacing Low Drone + Tremolo Minor Triad (D minor)
      const baseFreq = preset === 'VILLAIN_1' ? 73.42 : preset === 'VILLAIN_2' ? 65.41 : 55.0; // D2, C2, A1
      const freqs = [baseFreq, baseFreq * 1.2, baseFreq * 1.5, baseFreq * 2.4]; // Minor chord

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        osc.type = idx % 2 === 0 ? 'sawtooth' : 'square';
        osc.frequency.setValueAtTime(freq, now);

        // Lowpass filter for dark menacing tone
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600 + idx * 200, now);
        filter.frequency.exponentialRampToValueAtTime(300, now + dur);

        // Tremolo LFO (rapid volume oscillation typical of serial suspense)
        const lfo = ctx.createOscillator();
        lfo.frequency.setValueAtTime(6.5, now); // 6.5 Hz tremolo
        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(0.3, now);

        lfo.connect(lfoGain.gain);
        osc.connect(filter);
        filter.connect(presetGain);

        osc.start(now);
        lfo.start(now);
        osc.stop(now + dur);
        lfo.stop(now + dur);

        activeNodes.push(osc, lfo, filter, lfoGain);
      });
      break;
    }

    case 'SHOCK_1':
    case 'SHOCK_2': {
      // Explosive Orchestral Brass Shock Hit with descending pitch & crash burst
      const freqs = [110, 138.59, 164.81, 220, 293.66, 440]; // D dissonant cluster
      
      freqs.forEach((freq) => {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq * 1.5, now);
        // Sudden pitch drop sweep
        osc.frequency.exponentialRampToValueAtTime(freq * 0.7, now + 0.6);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(3000, now);
        filter.frequency.exponentialRampToValueAtTime(400, now + 1.2);

        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(0.001, now);
        oscGain.gain.linearRampToValueAtTime(1.0, now + 0.03); // Instant sharp hit
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

        osc.connect(filter);
        filter.connect(oscGain);
        oscGain.connect(presetGain);

        osc.start(now);
        osc.stop(now + 2.5);
        activeNodes.push(osc, filter, oscGain);
      });

      // White Noise Crash Burst
      const bufferSize = ctx.sampleRate * 1.5;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(1200, now);
      noiseFilter.Q.setValueAtTime(1.5, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.8, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      whiteNoise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(presetGain);

      whiteNoise.start(now);
      activeNodes.push(whiteNoise, noiseFilter, noiseGain);
      break;
    }

    case 'SAD_1':
    case 'SAD_2':
    case 'SAD_3': {
      // Melancholic Violin String Motif (A minor melody: A4 -> G4 -> F4 -> E4)
      const melody = [
        { note: 440.0, time: 0, dur: 1.2 },    // A4
        { note: 392.0, time: 1.2, dur: 1.2 },  // G4
        { note: 349.23, time: 2.4, dur: 1.2 }, // F4
        { note: 329.63, time: 3.6, dur: 2.0 }  // E4
      ];

      melody.forEach(item => {
        const noteTime = now + item.time;
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(item.note, noteTime);

        // Violin Vibrato LFO
        const vibrato = ctx.createOscillator();
        vibrato.frequency.setValueAtTime(5.5, noteTime);
        const vibratoGain = ctx.createGain();
        vibratoGain.gain.setValueAtTime(3.5, noteTime);

        vibrato.connect(vibratoGain);
        vibratoGain.connect(osc.frequency);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, noteTime);

        const noteGain = ctx.createGain();
        noteGain.gain.setValueAtTime(0.001, noteTime);
        noteGain.gain.linearRampToValueAtTime(0.6, noteTime + 0.2);
        noteGain.gain.exponentialRampToValueAtTime(0.001, noteTime + item.dur);

        osc.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(presetGain);

        osc.start(noteTime);
        vibrato.start(noteTime);
        osc.stop(noteTime + item.dur);
        vibrato.stop(noteTime + item.dur);

        activeNodes.push(osc, vibrato, vibratoGain, filter, noteGain);
      });
      break;
    }

    case 'SUSPENSE_1':
    case 'SUSPENSE_2': {
      // Low Sub-Bass Pulse (45Hz) + High Metallic Ringing (1200Hz) with Pitch Bend
      const subOsc = ctx.createOscillator();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(45, now);
      subOsc.frequency.linearRampToValueAtTime(50, now + dur);

      const highOsc = ctx.createOscillator();
      highOsc.type = 'sine';
      highOsc.frequency.setValueAtTime(1250, now);
      highOsc.frequency.linearRampToValueAtTime(1210, now + dur);

      subOsc.connect(presetGain);
      highOsc.connect(presetGain);

      subOsc.start(now);
      highOsc.start(now);
      subOsc.stop(now + dur);
      highOsc.stop(now + dur);

      activeNodes.push(subOsc, highOsc);
      break;
    }

    case 'ROMANTIC_1': {
      // Warm Major 7th Chord Pad with Sine Sweep (Cmaj7: C4, E4, G4, B4)
      const freqs = [261.63, 329.63, 392.0, 493.88];
      freqs.forEach(freq => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.linearRampToValueAtTime(1500, now + dur / 2);

        osc.connect(filter);
        filter.connect(presetGain);

        osc.start(now);
        osc.stop(now + dur);
        activeNodes.push(osc, filter);
      });
      break;
    }

    case 'COMEDY_1': {
      // Playful Descending Pizzicato (Bounce effect)
      const notes = [523.25, 493.88, 440, 392, 349.23, 261.63];
      notes.forEach((freq, i) => {
        const noteTime = now + i * 0.18;
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.8, noteTime + 0.15);

        const noteGain = ctx.createGain();
        noteGain.gain.setValueAtTime(0.8, noteTime);
        noteGain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.2);

        osc.connect(noteGain);
        noteGain.connect(presetGain);

        osc.start(noteTime);
        osc.stop(noteTime + 0.22);
        activeNodes.push(osc, noteGain);
      });
      break;
    }

    case 'CLIFFHANGER_1': {
      // Tense Rising Pitch Minor Chord Sweep with Abrupt Cutoff!
      const freqs = [146.83, 174.61, 220.0, 293.66]; // Dm
      freqs.forEach(freq => {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 3.0); // Tense pitch rise!

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(500, now);
        filter.frequency.exponentialRampToValueAtTime(2500, now + 3.0);

        osc.connect(filter);
        filter.connect(presetGain);

        osc.start(now);
        osc.stop(now + 3.2); // Sudden cliffhanger stop!
        activeNodes.push(osc, filter);
      });
      break;
    }

    case 'ENTRANCE_STING': {
      // Quick 2-note orchestral entrance sting
      const notes = [
        { freq: 220, time: 0, dur: 0.15 },
        { freq: 440, time: 0.15, dur: 0.6 }
      ];
      notes.forEach(n => {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(n.freq, now + n.time);

        const g = ctx.createGain();
        g.gain.setValueAtTime(0.8, now + n.time);
        g.gain.exponentialRampToValueAtTime(0.001, now + n.time + n.dur);

        osc.connect(g);
        g.connect(presetGain);

        osc.start(now + n.time);
        osc.stop(now + n.time + n.dur);
        activeNodes.push(osc, g);
      });
      break;
    }

    case 'EXIT_STING': {
      // Gentle 2-note descending minor exit sting
      const notes = [
        { freq: 349.23, time: 0, dur: 0.2 },
        { freq: 220, time: 0.2, dur: 0.8 }
      ];
      notes.forEach(n => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(n.freq, now + n.time);

        const g = ctx.createGain();
        g.gain.setValueAtTime(0.6, now + n.time);
        g.gain.exponentialRampToValueAtTime(0.001, now + n.time + n.dur);

        osc.connect(g);
        g.connect(presetGain);

        osc.start(now + n.time);
        osc.stop(now + n.time + n.dur);
        activeNodes.push(osc, g);
      });
      break;
    }

    default:
      break;
  }

  return {
    stop: () => {
      try {
        const stopTime = ctx.currentTime;
        presetGain.gain.cancelScheduledValues(stopTime);
        presetGain.gain.setValueAtTime(presetGain.gain.value || 0.001, stopTime);
        presetGain.gain.exponentialRampToValueAtTime(0.0001, stopTime + 0.1);
        setTimeout(() => {
          activeNodes.forEach(node => {
            try {
              if ('stop' in node) (node as OscillatorNode).stop();
              node.disconnect();
            } catch (e) {}
          });
        }, 120);
      } catch (e) {}
    }
  };
}

