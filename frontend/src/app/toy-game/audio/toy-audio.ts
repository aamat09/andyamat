export class ToyAudio {
  private ctx: AudioContext | null = null;

  private ensure() {
    if (!this.ctx) this.ctx = new AudioContext();
  }

  private tone(freq: number, dur: number, type: OscillatorType = 'sine', gain = 0.06) {
    this.ensure();
    const osc = this.ctx!.createOscillator();
    const g = this.ctx!.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(gain, this.ctx!.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + dur);
    osc.connect(g).connect(this.ctx!.destination);
    osc.start();
    osc.stop(this.ctx!.currentTime + dur);
  }

  click() {
    this.tone(523, 0.1, 'sine');
    setTimeout(() => this.tone(659, 0.08, 'sine'), 60);
  }

  reveal() {
    this.tone(440, 0.2, 'triangle');
    setTimeout(() => this.tone(554, 0.2, 'triangle'), 100);
    setTimeout(() => this.tone(659, 0.25, 'triangle'), 200);
  }

  fanfare() {
    // Music box major chord build
    const notes = [523, 659, 784, 1047];
    notes.forEach((f, i) => {
      setTimeout(() => this.tone(f, 0.4, 'triangle', 0.04), i * 140);
    });
  }

  typeChar() {
    this.tone(400 + Math.random() * 200, 0.03, 'sine', 0.03);
  }

  colorIn() {
    // Ascending shimmer — 8 notes in 0.4s
    const base = 523;
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        this.tone(base + i * 80, 0.12, 'sine', 0.03);
      }, i * 50);
    }
  }
}
