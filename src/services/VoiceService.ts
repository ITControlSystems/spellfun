import * as tts from '@diffusionstudio/vits-web';
import { Capacitor } from '@capacitor/core';
import { TTS } from 'capacitor-tts';

export type TtsDownloadProgress = {
  url: string;
  loaded: number;
  total: number;
};

export type VoiceMethod = 'built-in' | 'vits-web';

class VoiceService {
  private initializedVoiceId: string | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private isDownloading = false;
  private voiceMethod: VoiceMethod = 'built-in';
  private builtInVoice: SpeechSynthesisVoice | null = null;
  private voicesLoaded = false;

  setVoiceMethod(method: VoiceMethod): void {
    this.voiceMethod = method;
    if (method === 'built-in') {
      this.initializeBuiltInVoice();
    }
  }

  private initializeBuiltInVoice(): void {
    // Check if speechSynthesis is available
    if (typeof speechSynthesis === 'undefined') {
      console.warn('Speech synthesis not available in this environment');
      return;
    }

    // Check if voices are already loaded
    if (this.voicesLoaded) {
      this.selectBuiltInVoice();
      return;
    }

    // Try to get voices immediately
    const voices = speechSynthesis.getVoices();
    if (voices.length > 0) {
      this.voicesLoaded = true;
      this.selectBuiltInVoice();
      return;
    }

    // Voices not loaded yet, listen for the voiceschanged event
    const handleVoicesChanged = () => {
      this.voicesLoaded = true;
      this.selectBuiltInVoice();
      speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
    };

    speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);

    // Fallback: try again after a short delay
    setTimeout(() => {
      if (!this.voicesLoaded) {
        const delayedVoices = speechSynthesis.getVoices();
        if (delayedVoices.length > 0) {
          this.voicesLoaded = true;
          this.selectBuiltInVoice();
          speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
        }
      }
    }, 1000);
  }

  private selectBuiltInVoice(): void {
    if (typeof speechSynthesis === 'undefined') {
      console.warn('Speech synthesis not available in this environment');
      return;
    }

    const voices = speechSynthesis.getVoices();
    // Prefer English voices, fallback to first available
    this.builtInVoice = voices.find(v => v.lang.startsWith('en')) || voices[0] || null;
    
    if (!this.builtInVoice) {
      console.warn('No speech synthesis voices available');
    } else {
      console.log('Selected voice:', this.builtInVoice.name, this.builtInVoice.lang);
    }
  }

  async init(voiceId: string, onProgress?: (p: TtsDownloadProgress) => void): Promise<void> {
    if (this.voiceMethod === 'built-in') {
      this.initializeBuiltInVoice();
      return;
    }

    if (this.initializedVoiceId === voiceId) return;

    // Download voice/model files. Library caches to OPFS automatically.
    this.isDownloading = true;
    await tts.download(voiceId as any, (p: any) => {
      if (onProgress && p && typeof p.loaded === 'number' && typeof p.total === 'number') {
        onProgress({ url: p.url, loaded: p.loaded, total: p.total });
      }
    });
    this.isDownloading = false;
    this.initializedVoiceId = voiceId;
  }

  async speak(text: string, voiceId: string): Promise<void> {
    if (!text.trim()) return;

    // Stop any ongoing playback
    this.stop();

    if (this.voiceMethod === 'built-in') {
      await this.speakBuiltIn(text);
    } else {
      if (this.initializedVoiceId !== voiceId) {
        await this.init(voiceId);
      }
      await this.speakVitsWeb(text, voiceId);
    }
  }

  private async speakBuiltIn(text: string): Promise<void> {
    // Use Capacitor TTS plugin if running in native environment
    if (Capacitor.isNativePlatform()) {
      try {
        await TTS.speak({
          text: text,
          rate: 0.8,
          pitch: 1.0,
          volume: 1.0
        });
        return;
      } catch (error) {
        console.error('Capacitor TTS error:', error);
        // Fall through to web-based speech synthesis if Capacitor TTS fails
      }
    }

    return new Promise((resolve, reject) => {
      // Check if speechSynthesis is available
      if (typeof speechSynthesis === 'undefined') {
        console.warn('Speech synthesis not available in this environment');
        resolve(); // Resolve silently to prevent app crashes
        return;
      }

      // Ensure voices are loaded before speaking
      if (!this.voicesLoaded) {
        this.initializeBuiltInVoice();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      
      if (this.builtInVoice) {
        utterance.voice = this.builtInVoice;
      }
      
      utterance.rate = 0.8; // Slightly slower for clarity
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onend = () => resolve();
      utterance.onerror = (error) => {
        console.error('Speech synthesis error:', error);
        reject(error);
      };
      
      try {
        speechSynthesis.speak(utterance);
      } catch (error) {
        console.error('Failed to start speech synthesis:', error);
        reject(error);
      }
    });
  }

  private async speakVitsWeb(text: string, voiceId: string): Promise<void> {
    // Generate WAV Blob via vits-web
    const wavBlob: Blob = await tts.predict({
      text,
      voiceId: voiceId as any,
    });

    const audio = new Audio();
    audio.src = URL.createObjectURL(wavBlob);
    audio.onended = () => {
      if (audio.src) URL.revokeObjectURL(audio.src);
      if (this.currentAudio === audio) this.currentAudio = null;
    };
    this.currentAudio = audio;
    await audio.play();
  }

  stop(): void {
    if (this.voiceMethod === 'built-in') {
      // Use Capacitor TTS plugin if running in native environment
      if (Capacitor.isNativePlatform()) {
        try {
          TTS.stop();
        } catch (error) {
          console.error('Capacitor TTS stop error:', error);
        }
      } else if (typeof speechSynthesis !== 'undefined') {
        speechSynthesis.cancel();
      }
    } else if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        if (this.currentAudio.src) URL.revokeObjectURL(this.currentAudio.src);
      } catch {}
      this.currentAudio = null;
    }
  }

  get downloading(): boolean {
    return this.isDownloading;
  }

  get isInitialized(): boolean {
    if (this.voiceMethod === 'built-in') {
      return this.voicesLoaded && this.builtInVoice !== null;
    }
    return this.initializedVoiceId !== null;
  }

  get currentVoiceId(): string | null {
    return this.initializedVoiceId;
  }

  get currentVoiceMethod(): VoiceMethod {
    return this.voiceMethod;
  }
}

export const voiceService = new VoiceService();


