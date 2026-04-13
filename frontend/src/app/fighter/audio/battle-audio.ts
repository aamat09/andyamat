export class BattleAudio {
  private ctx?: AudioContext;

  private ensure() {
    if (!this.ctx) this.ctx = new AudioContext();
    return this.ctx;
  }

  private tone(freq: number, dur: number, type: OscillatorType = 'square', gain = 0.06) {
    const c = this.ensure();
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.value = gain;
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
    o.connect(g).connect(c.destination);
    o.start();
    o.stop(c.currentTime + dur);
  }

  click()   { this.tone(523, 0.08); this.tone(659, 0.08); }
  hit()     { this.tone(150, 0.15, 'sawtooth', 0.08); }
  crit()    { this.tone(200, 0.1, 'sawtooth', 0.1); setTimeout(() => this.tone(100, 0.2, 'sawtooth', 0.1), 50); }
  dodge()   { this.tone(800, 0.08, 'sine', 0.04); this.tone(1000, 0.06, 'sine', 0.03); }
  skill()   { this.tone(440, 0.1, 'triangle'); setTimeout(() => this.tone(660, 0.15, 'triangle'), 80); }
  stun()    { this.tone(300, 0.3, 'square', 0.05); }
  poison()  { this.tone(200, 0.2, 'sine', 0.04); this.tone(180, 0.3, 'sine', 0.03); }
  block()   { this.tone(400, 0.06, 'square', 0.04); }

  victory() {
    [523, 659, 784, 1047].forEach((f, i) =>
      setTimeout(() => this.tone(f, 0.3, 'triangle', 0.07), i * 140));
  }

  defeat() {
    [400, 350, 300, 200].forEach((f, i) =>
      setTimeout(() => this.tone(f, 0.4, 'sawtooth', 0.04), i * 200));
  }
}
