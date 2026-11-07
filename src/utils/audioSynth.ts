// Ambient Web Audio Synthesizer for notifications, focus sessions, and nature soundscapes

class SoundEngine {
  private ctx: AudioContext | null = null;
  private ambientGain: GainNode | null = null;
  private ambientSource: AudioNode | null = null;
  private isAmbientPlaying = false;
  private currentAmbientType: string | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Plays a crystal, gentle chime for reminders or completed tasks
  playChime(type: 'gentle' | 'alert' | 'complete' = 'gentle') {
    try {
      const ctx = this.initCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'gentle') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
        osc.start(now);
        osc.stop(now + 1.2);
      } else if (type === 'alert') {
        // Soft double-pulse bell
        osc.type = 'sine';
        osc.frequency.setValueAtTime(659.25, now); // E5
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(987.77, now + 0.2); // B5
        gain2.gain.setValueAtTime(0, now);
        gain2.gain.setValueAtTime(0.25, now + 0.2);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
        
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        
        osc.start(now);
        osc.stop(now + 0.4);
        osc2.start(now + 0.2);
        osc2.stop(now + 0.9);
      } else {
        // Chord resolution for task completion
        const freqs = [523.25, 659.25, 783.99, 1046.5]; // C major
        freqs.forEach((f, idx) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = 'sine';
          o.frequency.setValueAtTime(f, now + idx * 0.08);
          g.gain.setValueAtTime(0.12, now + idx * 0.08);
          g.gain.exponentialRampToValueAtTime(0.0001, now + 1.5 + idx * 0.1);
          o.connect(g);
          g.connect(ctx.destination);
          o.start(now + idx * 0.08);
          o.stop(now + 1.6);
        });
      }
    } catch {
      // Audio might be blocked until user gesture, ignore gracefully
    }
  }

  // Synthesizes procedural soothing white/pink noise for rain, waterfall, or stream
  playAmbient(type: 'rain' | 'waterfall' | 'river' | 'whitenoise', volume = 0.25) {
    try {
      this.stopAmbient();
      const ctx = this.initCtx();
      
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        if (type === 'rain' || type === 'river') {
          // Pink noise filter approximation
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
          b6 = white * 0.115926;
        } else if (type === 'waterfall') {
          // Brown noise (deeper rumble)
          b0 = (b0 + (0.02 * white)) / 1.02;
          data[i] = b0 * 2.5;
        } else {
          data[i] = white * 0.3;
        }
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      // Filter to shape water texture
      const filter = ctx.createBiquadFilter();
      if (type === 'rain') {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, ctx.currentTime);
      } else if (type === 'waterfall') {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(900, ctx.currentTime);
      } else if (type === 'river') {
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1100, ctx.currentTime);
        filter.Q.setValueAtTime(0.8, ctx.currentTime);
      } else {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2000, ctx.currentTime);
      }

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.01, ctx.currentTime);
      masterGain.gain.exponentialRampToValueAtTime(Math.min(volume, 0.4), ctx.currentTime + 1.2);

      noise.connect(filter);
      filter.connect(masterGain);
      masterGain.connect(ctx.destination);

      noise.start();
      this.ambientSource = noise;
      this.ambientGain = masterGain;
      this.isAmbientPlaying = true;
      this.currentAmbientType = type;
    } catch {
      // Audio not supported or blocked
    }
  }

  setAmbientVolume(volume: number) {
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.linearRampToValueAtTime(Math.max(0, Math.min(volume, 0.5)), this.ctx.currentTime + 0.1);
    }
  }

  stopAmbient() {
    if (this.ambientSource) {
      try {
        if (this.ambientGain && this.ctx) {
          this.ambientGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);
          setTimeout(() => {
            try {
              (this.ambientSource as AudioBufferSourceNode)?.stop();
              this.ambientSource?.disconnect();
              this.ambientSource = null;
              this.ambientGain = null;
            } catch {
              // already stopped
            }
          }, 450);
        } else {
          (this.ambientSource as AudioBufferSourceNode)?.stop();
          this.ambientSource = null;
        }
      } catch {
        this.ambientSource = null;
      }
    }
    this.isAmbientPlaying = false;
    this.currentAmbientType = null;
  }

  getPlayingAmbient() {
    return this.isAmbientPlaying ? this.currentAmbientType : null;
  }
}

export const soundEngine = new SoundEngine();
