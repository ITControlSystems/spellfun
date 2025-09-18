import * as tts from '@diffusionstudio/vits-web';

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

  setVoiceMethod(method: VoiceMethod): void {
    this.voiceMethod = method;
    if (method === 'built-in') {
      this.initializeBuiltInVoice();
    }
  }

  private initializeBuiltInVoice(): void {
    const voices = speechSynthesis.getVoices();
    // Prefer English voices, fallback to first available
    this.builtInVoice = voices.find(v => v.lang.startsWith('en')) || voices[0] || null;
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
    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      
      if (this.builtInVoice) {
        utterance.voice = this.builtInVoice;
      }
      
      utterance.rate = 0.8; // Slightly slower for clarity
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onend = () => resolve();
      utterance.onerror = (error) => reject(error);
      
      speechSynthesis.speak(utterance);
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
      speechSynthesis.cancel();
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
      return this.builtInVoice !== null;
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


