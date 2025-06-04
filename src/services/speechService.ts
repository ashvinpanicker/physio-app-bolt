class SpeechService {
  private static instance: SpeechService;
  private synthesis: SpeechSynthesis | null = null;
  private voice: SpeechSynthesisVoice | null = null;
  private volume = 1;
  private rate = 1;
  private pitch = 1;
  private enabled = true;

  private constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
      // Initialize voices immediately if available
      this.setPreferredVoice();
      // Also listen for voices changed event
      this.synthesis.addEventListener('voiceschanged', () => {
        this.setPreferredVoice();
      });
    }
  }

  static getInstance(): SpeechService {
    if (!SpeechService.instance) {
      SpeechService.instance = new SpeechService();
    }
    return SpeechService.instance;
  }

  private setPreferredVoice() {
    if (!this.synthesis) return;
    
    const voices = this.synthesis.getVoices();
    // Prefer English voices
    this.voice = voices.find(voice => 
      voice.lang.startsWith('en-')
    ) || voices[0];
  }

  setVoiceSettings(settings: {
    enabled: boolean;
    volume: number;
    rate: number;
    pitch: number;
    voice?: SpeechSynthesisVoice | null;
  }) {
    this.enabled = settings.enabled;
    this.volume = settings.volume || 1;
    this.rate = settings.rate || 1;
    this.pitch = settings.pitch || 1;
    if (settings.voice) {
      this.voice = settings.voice;
    }
  }

  speak(text: string, priority: boolean = false) {
    if (!this.synthesis || !this.enabled) return;

    // Cancel any ongoing speech if this is a priority message
    if (priority) {
      this.synthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    if (this.voice) {
      utterance.voice = this.voice;
    }
    utterance.volume = this.volume;
    utterance.rate = this.rate;
    utterance.pitch = this.pitch;

    this.synthesis.speak(utterance);
  }

  announceExerciseStart(exerciseName: string, setNumber: number, totalSets: number) {
    if (!this.enabled) return;
    this.speak(`${exerciseName}, set ${setNumber} of ${totalSets}`, true);
  }

  announceCountdown(number: number) {
    if (!this.enabled) return;
    this.speak(number.toString());
  }

  announceRestPeriod(duration: number) {
    if (!this.enabled) return;
    this.speak(`Rest period, ${duration} seconds`, true);
  }

  announceSetComplete() {
    if (!this.enabled) return;
    this.speak("Set complete", true);
  }

  announceNextSet() {
    if (!this.enabled) return;
    this.speak("Next set", true);
  }

  announceWorkoutComplete() {
    if (!this.enabled) return;
    this.speak("Workout complete", true);
  }

  stop() {
    if (!this.synthesis) return;
    this.synthesis.cancel();
  }

  getVoices(): SpeechSynthesisVoice[] {
    return this.synthesis ? this.synthesis.getVoices() : [];
  }

  getCurrentVoice(): SpeechSynthesisVoice | null {
    return this.voice;
  }
}

export default SpeechService;