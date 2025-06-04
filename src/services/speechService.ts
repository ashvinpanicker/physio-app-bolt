class SpeechService {
  private static instance: SpeechService;
  private synthesis: SpeechSynthesis | null = null;
  private voice: SpeechSynthesisVoice | null = null;
  private volume = 1;
  private rate = 1;
  private enabled = true;
  private queue: SpeechSynthesisUtterance[] = [];
  private speaking = false;
  private initialized = false;
  private initializationPromise: Promise<void> | null = null;

  private constructor() {
    this.initializationPromise = this.initializeSynthesis();
  }

  private async initializeSynthesis() {
    if (this.initialized) return;

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.error('Speech synthesis not supported');
      return;
    }

    this.synthesis = window.speechSynthesis;

    try {
      await this.loadVoices();
      this.handleSpeechEvents();
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize speech synthesis:', error);
    }
  }

  private async loadVoices(): Promise<void> {
    if (!this.synthesis) return;

    let voices = this.synthesis.getVoices();
    
    if (voices.length === 0) {
      try {
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Timeout waiting for voices'));
          }, 5000);

          const voicesChangedHandler = () => {
            clearTimeout(timeout);
            this.synthesis?.removeEventListener('voiceschanged', voicesChangedHandler);
            resolve();
          };

          this.synthesis.addEventListener('voiceschanged', voicesChangedHandler);
        });

        voices = this.synthesis.getVoices();
      } catch (error) {
        console.error('Error loading voices:', error);
        return;
      }
    }

    this.setDefaultVoice(voices);
  }

  private setDefaultVoice(voices: SpeechSynthesisVoice[]) {
    this.voice = voices.find(voice => 
      voice.lang === 'en-US' && voice.name.includes('Samantha')
    ) || voices.find(voice => 
      voice.lang === 'en-US' && !voice.name.includes('Google')
    ) || voices.find(voice => 
      voice.lang === 'en-US'
    ) || voices[0];

    if (this.voice) {
      console.log('Selected voice:', this.voice.name);
    } else {
      console.error('No suitable voice found');
    }
  }

  private handleSpeechEvents() {
    if (!this.synthesis) return;

    const handleEnd = () => {
      this.speaking = false;
      this.processQueue();
    };

    const handleError = (event: ErrorEvent) => {
      console.error('Speech synthesis error:', event);
      this.speaking = false;
      this.processQueue();
    };

    this.synthesis.addEventListener('end', handleEnd);
    this.synthesis.addEventListener('error', handleError);
  }

  private async processQueue() {
    if (!this.synthesis || !this.enabled || this.speaking || this.queue.length === 0) return;
    
    if (!this.initialized) {
      await this.initializationPromise;
    }

    this.speaking = true;
    const utterance = this.queue.shift()!;

    try {
      this.synthesis.speak(utterance);
    } catch (error) {
      console.error('Error speaking:', error);
      this.speaking = false;
      this.processQueue();
    }
  }

  static getInstance(): SpeechService {
    if (!SpeechService.instance) {
      SpeechService.instance = new SpeechService();
    }
    return SpeechService.instance;
  }

  setVoiceSettings(settings: { enabled: boolean; volume?: number; rate?: number }) {
    if (!settings) return;
    
    this.enabled = settings.enabled;
    if (settings.volume !== undefined) this.volume = settings.volume;
    if (settings.rate !== undefined) this.rate = settings.rate;
    
    console.log('Voice settings updated:', settings);
  }

  async speak(text: string, priority: boolean = false) {
    if (!this.synthesis || !this.enabled || !text) return;

    // Ensure synthesis is ready
    if (!this.initialized) {
      await this.initializeSynthesis();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    if (this.voice) {
      utterance.voice = this.voice;
    }
    
    utterance.volume = this.volume;
    utterance.rate = this.rate;

    // Add error handling for the utterance
    utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
      // Check if the error is due to cancellation
      if (event.error === 'canceled') {
        console.log('Speech synthesis canceled');
      } else {
        console.error('Speech synthesis error:', event.error);
      }
    };

    // Cancel current speech and clear queue for priority messages
    if (priority) {
      this.synthesis.cancel();
      this.queue = [];
      this.speaking = false;
    }

    this.queue.push(utterance);
    this.processQueue();
  }

  testVoice() {
    this.speak("Voice feedback is working correctly.", true);
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
}

export default SpeechService;