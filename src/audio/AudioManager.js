/**
 * AudioManager — handles synthesized retro sound effects using Web Audio API.
 * No external sound files are needed.
 */

export class AudioManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.ambientNoise = null;
    this.ambientGain = null;
    this.tickTimer = null;
    this.isInitialized = false;
  }

  /**
   * Must be called inside a user interaction (like a button click)
   * to unlock the AudioContext in modern browsers.
   */
  init() {
    if (this.isInitialized) return;
    
    // Initialize AudioContext
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContext();
    
    // Master volume
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.6; // 60% master volume
    this.masterGain.connect(this.ctx.destination);
    
    this.isInitialized = true;
    this._startAmbientHum();
    this._startClockTick();
  }

  _startAmbientHum() {
    // A low, continuous hum to simulate a computer fan / air conditioning
    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.value = 0.05; // Very quiet
    this.ambientGain.connect(this.masterGain);

    this.ambientNoise = this.ctx.createOscillator();
    this.ambientNoise.type = 'sine';
    this.ambientNoise.frequency.value = 55; // Low hum (A1)
    
    const humFilter = this.ctx.createBiquadFilter();
    humFilter.type = 'lowpass';
    humFilter.frequency.value = 200;
    
    this.ambientNoise.connect(humFilter);
    humFilter.connect(this.ambientGain);
    this.ambientNoise.start();
  }

  _startClockTick() {
    // Subtle clock ticking every second
    this.tickTimer = setInterval(() => {
      this._playTick();
    }, 1000);
  }

  _playTick() {
    if (!this.ctx || this.ctx.state !== 'running') return;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime); // High pitched click
    
    gain.gain.setValueAtTime(0.02, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  playStamp() {
    if (!this.isInitialized) return;
    
    // Low, punchy thud sound
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.8, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  playTypewriter() {
    if (!this.isInitialized) return;
    // Rapid, semi-random pitched clicks
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'square';
    // Random frequency between 400 and 600
    const freq = 400 + Math.random() * 200;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  playSuccess() {
    if (!this.isInitialized) return;
    
    // Pleasant major chord (C E G) arpeggio
    const time = this.ctx.currentTime;
    this._playTone(523.25, time, 0.4); // C5
    this._playTone(659.25, time + 0.1, 0.4); // E5
    this._playTone(783.99, time + 0.2, 0.6); // G5 
  }

  playError() {
    if (!this.isInitialized) return;
    
    // Harsh buzz
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(80, this.ctx.currentTime + 0.3);
    
    gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.4);
  }

  _playTone(freq, time, duration) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.value = freq;
    
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.3, time + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, time + duration);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(time);
    osc.stop(time + duration);
  }

  dispose() {
    if (this.tickTimer) clearInterval(this.tickTimer);
    if (this.ambientNoise) this.ambientNoise.stop();
    if (this.ctx) this.ctx.close();
  }
}
