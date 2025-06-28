
class SoundSystem {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    // Initialize audio context on first user interaction
    this.initAudioContext();
  }

  private initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported');
      this.enabled = false;
    }
  }

  private async ensureAudioContext() {
    if (!this.audioContext || !this.enabled) return null;
    
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
    
    return this.audioContext;
  }

  private createOscillator(frequency: number, type: OscillatorType = 'sine'): OscillatorNode | null {
    const context = this.audioContext;
    if (!context) return null;

    const oscillator = context.createOscillator();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, context.currentTime);
    return oscillator;
  }

  private createGain(initialValue: number = 0.1): GainNode | null {
    const context = this.audioContext;
    if (!context) return null;

    const gainNode = context.createGain();
    gainNode.gain.setValueAtTime(initialValue, context.currentTime);
    return gainNode;
  }

  async playCardDrop() {
    const context = await this.ensureAudioContext();
    if (!context) return;

    // Military "thunk" sound
    const oscillator = this.createOscillator(120, 'square');
    const gain = this.createGain(0.15);
    
    if (!oscillator || !gain) return;

    oscillator.connect(gain);
    gain.connect(context.destination);

    // Envelope
    gain.gain.setValueAtTime(0.15, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.1);

    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.1);
  }

  async playStageTransition() {
    const context = await this.ensureAudioContext();
    if (!context) return;

    // Radio static "bzzt" sound
    const noise = context.createBufferSource();
    const buffer = context.createBuffer(1, context.sampleRate * 0.15, context.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Generate white noise
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    noise.buffer = buffer;

    const filter = context.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(2000, context.currentTime);

    const gain = this.createGain(0.08);
    if (!gain) return;

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(context.destination);

    // Quick fade
    gain.gain.setValueAtTime(0.08, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.15);

    noise.start(context.currentTime);
    noise.stop(context.currentTime + 0.15);
  }

  async playArchive() {
    const context = await this.ensureAudioContext();
    if (!context) return;

    // Confirmation beep sequence
    const frequencies = [800, 600];
    
    for (let i = 0; i < frequencies.length; i++) {
      const oscillator = this.createOscillator(frequencies[i], 'sine');
      const gain = this.createGain(0.1);
      
      if (!oscillator || !gain) continue;

      oscillator.connect(gain);
      gain.connect(context.destination);

      const startTime = context.currentTime + (i * 0.08);
      gain.gain.setValueAtTime(0.1, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.06);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.06);
    }
  }

  async playModalOpen() {
    const context = await this.ensureAudioContext();
    if (!context) return;

    // Tactical "boop" sound
    const oscillator = this.createOscillator(1200, 'sine');
    const gain = this.createGain(0.12);
    
    if (!oscillator || !gain) return;

    oscillator.connect(gain);
    gain.connect(context.destination);

    gain.gain.setValueAtTime(0, context.currentTime);
    gain.gain.linearRampToValueAtTime(0.12, context.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.1);

    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.1);
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}

export const soundSystem = new SoundSystem();
