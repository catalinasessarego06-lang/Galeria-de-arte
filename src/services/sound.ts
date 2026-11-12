/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class SoundService {
  private ctx: AudioContext | null = null;
  private micStream: MediaStream | null = null;
  private analyser: AnalyserNode | null = null;
  private micDataArray: Uint8Array<ArrayBuffer> | null = null;
  private ambientGain: GainNode | null = null;
  private isMuted: boolean = false;
  private lastFootstepTime: number = 0;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setValueAtTime(muted ? 0 : 0.05, this.ctx.currentTime);
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public startAmbience() {
    try {
      this.initContext();
      if (!this.ctx) return;

      // Soft filtered pink-ish room tone
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(220, this.ctx.currentTime);

      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(this.isMuted ? 0 : 0.04, this.ctx.currentTime);

      noise.connect(filter);
      filter.connect(this.ambientGain);
      this.ambientGain.connect(this.ctx.destination);
      noise.start();
    } catch {
      // Audio context might fail before gesture, safe ignore
    }
  }

  public playFootstep() {
    if (this.isMuted) return;
    const now = performance.now();
    if (now - this.lastFootstepTime < 350) return;
    this.lastFootstepTime = now;

    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(140 + Math.random() * 40, this.ctx.currentTime);
      filter.Q.setValueAtTime(3.0, this.ctx.currentTime);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(70 + Math.random() * 20, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.06);

      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.07);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch {
      // ignore
    }
  }

  public playDiscoveryChime() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      // Pentatonic celebratory sparkle: C5, E5, G5, B5, C6
      const notes = [523.25, 659.25, 783.99, 987.77, 1046.5];
      notes.forEach((freq, idx) => {
        const start = this.ctx!.currentTime + idx * 0.07;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.18, start);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.45);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(start);
        osc.stop(start + 0.5);
      });
    } catch {
      // ignore
    }
  }

  public playMissTap() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(90, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.06);
    } catch {
      // ignore
    }
  }

  public playVictoryFanfare() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const notes = [
        { f: 523.25, t: 0.0, d: 0.15 },
        { f: 659.25, t: 0.15, d: 0.15 },
        { f: 783.99, t: 0.3, d: 0.18 },
        { f: 1046.5, t: 0.48, d: 0.45 },
        { f: 1318.5, t: 0.7, d: 0.6 },
      ];

      notes.forEach((n) => {
        const start = this.ctx!.currentTime + n.t;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(n.f, start);

        gain.gain.setValueAtTime(0.22, start);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + n.d);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(start);
        osc.stop(start + n.d + 0.05);
      });
    } catch {
      // ignore
    }
  }

  public async setupMicrophone(): Promise<boolean> {
    try {
      this.initContext();
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return false;
      }
      this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      if (!this.ctx) return false;

      const source = this.ctx.createMediaStreamSource(this.micStream);
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64;
      this.micDataArray = new Uint8Array(new ArrayBuffer(this.analyser.frequencyBinCount));
      source.connect(this.analyser);
      return true;
    } catch {
      return false;
    }
  }

  public getMicMetrics(): { volume: number; bassLevel: number } {
    if (!this.analyser || !this.micDataArray) {
      return { volume: 0, bassLevel: 0 };
    }
    this.analyser.getByteFrequencyData(this.micDataArray);
    let sum = 0;
    for (let i = 0; i < this.micDataArray.length; i++) {
      sum += this.micDataArray[i];
    }
    const avg = sum / (this.micDataArray.length * 255);
    const bass = this.micDataArray[1] ? this.micDataArray[1] / 255 : 0;
    return { volume: Math.min(1, avg * 2.5), bassLevel: bass };
  }

  public startAudio() {
    this.startAmbience();
  }

  public enableMicrophone(): Promise<boolean> {
    return this.setupMicrophone();
  }

  public playSuccessChime() {
    this.playDiscoveryChime();
  }

  public playClick() {
    this.playMissTap();
  }
}

export const soundService = new SoundService();
