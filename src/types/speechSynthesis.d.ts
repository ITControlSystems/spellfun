// Type declarations for Speech Synthesis API
declare global {
  interface Window {
    speechSynthesis: SpeechSynthesis;
  }

  interface SpeechSynthesis {
    speak(utterance: SpeechSynthesisUtterance): void;
    cancel(): void;
    pause(): void;
    resume(): void;
    getVoices(): SpeechSynthesisVoice[];
    addEventListener(type: 'voiceschanged', listener: () => void): void;
    removeEventListener(type: 'voiceschanged', listener: () => void): void;
    pending: boolean;
    speaking: boolean;
    paused: boolean;
  }

  interface SpeechSynthesisUtterance {
    text: string;
    lang: string;
    voice: SpeechSynthesisVoice | null;
    volume: number;
    rate: number;
    pitch: number;
    onstart: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => any) | null;
    onend: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => any) | null;
    onerror: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisErrorEvent) => any) | null;
    onpause: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => any) | null;
    onresume: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => any) | null;
    onmark: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => any) | null;
    onboundary: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => any) | null;
  }

  interface SpeechSynthesisVoice {
    voiceURI: string;
    name: string;
    lang: string;
    localService: boolean;
    default: boolean;
  }

  interface SpeechSynthesisEvent extends Event {
    charIndex: number;
    charLength: number;
    elapsedTime: number;
    name: string;
  }

  interface SpeechSynthesisErrorEvent extends SpeechSynthesisEvent {
    error: string;
  }

  const speechSynthesis: SpeechSynthesis;
}

export {};
