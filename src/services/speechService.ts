class SpeechService {
  private static instance: SpeechService;
  private synthesis: SpeechSynthesis | null = null;
  private voice: SpeechSynthesisVoice | null = null;
  private volume = 1;
  private rate = 1;
  private pitch = 1;

  private constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
      // Handle voice loading which may be asynchronous
      if (this.synthesis.getVoices().length > 0) {
        this.setPreferredVoice();
      } else {
        this.synthesis.addEventListener('voiceschanged', () => {
          this.setPreferredVoice();
        });
      }
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
      voice.lang.startsWith('en-') && voice.localService
    ) || voices[0];
  }

  setVoiceSettings(settings?: {
    volume?: number;
    rate?: number;
    pitch?: number;
    voice?: SpeechSynthesisVoice;
  }) {
    if (!settings) return;

    if (settings.volume !== undefined) this.volume = settings.volume;
    if (settings.rate !== undefined) this.rate = settings.rate;
    if (settings.pitch !== undefined) this.pitch = settings.pitch;
    if (settings.voice) this.voice = settings.voice;
  }

  speak(text: string, priority: boolean = false) {
    if (!this.synthesis) return;

    // Cancel any ongoing speech if this is a priority message
    if (priority) {
      this.synthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = this.voice;
    utterance.volume = this.volume;
    utterance.rate = this.rate;
    utterance.pitch = this.pitch;

    this.synthesis.speak(utterance);
  }

  announceExerciseStart(exerciseName: string, setNumber: number, totalSets: number) {
    this.speak(`Beginning ${exerciseName}, set ${setNumber} of ${totalSets}`, true);
  }

  announceCountdown(number: number) {
    this.speak(number.toString());
  }

  announceRestPeriod(duration: number) {
    this.speak(`Rest period begins now. ${duration} seconds rest.`, true);
  }

  announceSetComplete() {
    this.speak("Set complete. Well done!", true);
  }

  announceNextSet() {
    this.speak("Prepare for the next set.", true);
  }

  announceWorkoutComplete() {
    this.speak("Excellent work! Workout complete.", true);
  }

  provideMotivation() {
    const phrases = [
      "Maintain proper form",
      "Keep going, you're doing great",
      "Focus on controlled movements",
      "Excellent form",
      "Stay strong",
      "You've got this"
    ];
    this.speak(phrases[Math.floor(Math.random() * phrases.length)]);
  }

  stop() {
    if (!this.synthesis) return;
    this.synthesis.cancel();
  }
}

export default SpeechService;