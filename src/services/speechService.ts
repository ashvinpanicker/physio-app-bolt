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

  private constructor() {
    this.initializeSynthesis();
  }

  private async initializeSynthesis() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.error('Speech synthesis not supported');
      return;
    }

    this.synthesis = window.speechSynthesis;

    // Force voices to load
    await this.loadVoices();
    
    // Set up event listeners
    this.synthesis.addEventListener('voiceschanged', () => {
      this.setDefaultVoice();
    });

    this.handleSpeechEvents();
    this.initialized = true;
  }

  private async loadVoices(): Promise<void> {
    if (!this.synthesis) return;

    // Try to get voices immediately
    let voices = this.synthesis.getVoices();
    
    // If no voices are available, wait for them to load
    if (voices.length === 0) {
      try {
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Timeout waiting for voices'));
          }, 5000);

          this.synthesis!.addEventListener('voiceschanged', () => {
            clearTimeout(timeout);
            resolve();
          }, { once: true });
        });

        voices = this.synthesis.getVoices();
      } catch (error) {
        console.error('Error loading voices:', error);
      }
    }

    if (voices.length > 0) {
      this.setDefaultVoice();
    }
  }

  private handleSpeechEvents() {
    if (!this.synthesis) return;

    this.synthesis.addEventListener('end', () => {
      console.log('Speech ended');
      this.speaking = false;
      this.processQueue();
    });

    this.synthesis.addEventListener('error', (event) => {
      console.error('Speech synthesis error:', event);
      this.speaking = false;
      this.processQueue();
    });
  }

  private setDefaultVoice() {
    if (!this.synthesis) return;
    
    const voices = this.synthesis.getVoices();
    console.log('Available voices:', voices.map(v => `${v.name} (${v.lang})`));

    // Try to find a high-quality English voice
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

  private async processQueue() {
    if (!this.synthesis || !this.enabled || this.speaking || this.queue.length === 0) return;
    
    // Ensure synthesis is ready
    if (!this.initialized) {
      await this.initializeSynthesis();
    }

    this.speaking = true;
    const utterance = this.queue.shift()!;

    try {
      this.synthesis.speak(utterance);
      console.log('Speaking:', utterance.text);
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
    utterance.onerror = (event) => {
      console.error('Utterance error:', event);
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