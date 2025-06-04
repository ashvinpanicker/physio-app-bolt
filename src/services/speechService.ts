class SpeechService {
  private static instance: SpeechService;
  private synthesis: SpeechSynthesis | null = null;
  private voice: SpeechSynthesisVoice | null = null;
  private volume = 1;
  private rate = 1;
  private pitch = 1;
  private enabled = true;
  private queue: SpeechSynthesisUtterance[] = [];
  private speaking = false;

  private constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
      
      // Initialize voices
      this.setPreferredVoice();
      
      // Listen for voices changed event
      this.synthesis.addEventListener('voiceschanged', () => {
        this.setPreferredVoice();
      });

      // Handle speech end events
      this.handleSpeechEvents();
    }
  }

  private handleSpeechEvents() {
    if (!this.synthesis) return;

    this.synthesis.addEventListener('end', () => {
      this.speaking = false;
      this.processQueue();
    });

    this.synthesis.addEventListener('error', () => {
      this.speaking = false;
      this.processQueue();
    });
  }

  private processQueue() {
    if (!this.synthesis || !this.enabled || this.speaking || this.queue.length === 0) return;
    
    this.speaking = true;
    const utterance = this.queue.shift()!;
    this.synthesis.speak(utterance);
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
      voice.lang.startsWith('en-') && !voice.name.includes('Google')
    ) || voices.find(voice => 
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
    if (!settings) return;
    
    this.enabled = settings.enabled;
    this.volume = settings.volume;
    this.rate = settings.rate;
    this.pitch = settings.pitch;
    if (settings.voice) {
      this.voice = settings.voice;
    }
  }

  speak(text: string, priority: boolean = false) {
    if (!this.synthesis || !this.enabled || !text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    if (this.voice) {
      utterance.voice = this.voice;
    }
    utterance.volume = this.volume;
    utterance.rate = this.rate;
    utterance.pitch = this.pitch;

    // Cancel current speech and clear queue for priority messages
    if (priority) {
      this.synthesis.cancel();
      this.queue = [];
      this.speaking = false;
    }

    this.queue.push(utterance);
    this.processQueue();
  }

  announceExerciseStart(exerciseName: string, setNumber: number, totalSets: number) {
    if (!this.enabled) return;
    const message = `Starting ${exerciseName}. Set ${setNumber} of ${totalSets}`;
    this.speak(message, true);
  }

  announceCountdown(number: number) {
    if (!this.enabled || number > 5) return;
    this.speak(number.toString(), true);
  }

  announceRestPeriod(duration: number) {
    if (!this.enabled) return;
    this.speak(`Rest for ${duration} seconds`, true);
  }

  announceSetComplete() {
    if (!this.enabled) return;
    this.speak("Set complete", true);
  }

  announceNextSet() {
    if (!this.enabled) return;
    this.speak("Starting next set", true);
  }

  announceWorkoutComplete() {
    if (!this.enabled) return;
    this.speak("Workout complete! Great job!", true);
  }

  stop() {
    if (!this.synthesis) return;
    this.synthesis.cancel();
    this.queue = [];
    this.speaking = false;
  }

  getVoices(): SpeechSynthesisVoice[] {
    if (!this.synthesis) return [];
    return this.synthesis.getVoices();
  }

  getCurrentVoice(): SpeechSynthesisVoice | null {
    return this.voice;
  }
}

export default SpeechService;