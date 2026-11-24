import type { GameEvent } from "../sim/types";

class GameAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private muted = false;

  public unlock(): void {
    if (typeof window === "undefined") return;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.55;

      const limiter = this.ctx.createDynamicsCompressor();
      limiter.threshold.value = -6;
      limiter.ratio.value = 12;

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 256;

      this.master.connect(limiter);
      limiter.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") {
      void this.ctx.resume();
    }
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(muted ? 0 : 0.55, this.ctx.currentTime, 0.02);
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public play(event: GameEvent): void {
    if (this.muted || !this.ctx || !this.master || this.ctx.state !== "running") return;
    const now = this.ctx.currentTime;

    if (event === "lane") {
      this.tone(now, "triangle", 260, 420, 0.07, 0.16);
    } else if (event === "jump") {
      this.tone(now, "square", 210, 560, 0.13, 0.14);
    } else if (event === "duck") {
      this.tone(now, "triangle", 320, 140, 0.1, 0.16);
    } else if (event === "tier_up") {
      this.tone(now, "triangle", 523.25, 523.25, 0.09, 0.12);
      this.tone(now + 0.09, "triangle", 659.25, 783.99, 0.14, 0.12);
    } else if (event === "coin_hit") {
      // Harsh retro error buzzer when touching a forbidden golden coin!
      this.tone(now, "sawtooth", 220, 110, 0.28, 0.34);
      this.tone(now + 0.02, "square", 155, 82, 0.36, 0.28);
      this.tone(now + 0.16, "sawtooth", 125, 65, 0.35, 0.3);
    } else if (event === "crash") {
      this.tone(now, "sawtooth", 140, 42, 0.28, 0.32);
      this.noiseBurst(now, 0.22, 0.28);
    }
  }

  private tone(
    start: number,
    type: OscillatorType,
    fStart: number,
    fEnd: number,
    dur: number,
    vol: number,
  ): void {
    if (!this.ctx || !this.master) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(fStart, start);
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, fEnd), start + dur);

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(vol, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);

    osc.connect(gain);
    gain.connect(this.master);
    osc.start(start);
    osc.stop(start + dur + 0.02);
  }

  private noiseBurst(start: number, dur: number, vol: number): void {
    if (!this.ctx || !this.master) return;
    const len = Math.floor(this.ctx.sampleRate * dur);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
    src.connect(gain);
    gain.connect(this.master);
    src.start(start);
  }

  public getMeters(): { peak: number; rms: number } {
    if (!this.analyser) return { peak: 0, rms: 0 };
    const arr = new Float32Array(this.analyser.fftSize);
    this.analyser.getFloatTimeDomainData(arr);
    let peak = 0;
    let sum = 0;
    for (let i = 0; i < arr.length; i++) {
      const v = Math.abs(arr[i] ?? 0);
      if (v > peak) peak = v;
      sum += v * v;
    }
    return { peak, rms: Math.sqrt(sum / arr.length) };
  }
}

export const gameAudio = new GameAudio();