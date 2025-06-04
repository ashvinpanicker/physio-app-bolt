import { useState, useEffect, useCallback } from 'react';
import { VoiceCommand } from '../types/types';

interface VoiceRecognitionHookProps {
  onCommand: (command: VoiceCommand) => void;
  isEnabled: boolean;
}

const useVoiceRecognition = ({ onCommand, isEnabled }: VoiceRecognitionHookProps) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Check if the browser supports SpeechRecognition
  const SpeechRecognition = window.SpeechRecognition || window['webkitSpeechRecognition'];
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  const parseCommand = useCallback((text: string): VoiceCommand | null => {
    // Convert to lowercase for easier matching
    const lowerText = text.toLowerCase();

    // Timer commands
    if (lowerText.includes('timer') || lowerText.includes('time')) {
      const matches = lowerText.match(/(\d+)\s*(seconds|second)/);
      if (matches && matches[1]) {
        return { type: 'timer', value: parseInt(matches[1], 10) };
      }
    }

    // Rep commands
    if (lowerText.includes('rep') || lowerText.includes('repetition')) {
      const matches = lowerText.match(/(\d+)\s*(reps|rep|repetitions|repetition)/);
      if (matches && matches[1]) {
        return { type: 'rep', value: parseInt(matches[1], 10) };
      }
    }

    // Set commands
    if (lowerText.includes('set')) {
      const matches = lowerText.match(/(\d+)\s*(sets|set)/);
      if (matches && matches[1]) {
        return { type: 'set', value: parseInt(matches[1], 10) };
      }
    }

    // Rest commands
    if (lowerText.includes('rest')) {
      const matches = lowerText.match(/rest\s*(\d+)/);
      if (matches && matches[1]) {
        return { type: 'rest', value: parseInt(matches[1], 10) };
      }
    }

    // Navigation commands
    if (lowerText === 'start') return { type: 'start' };
    if (lowerText === 'stop') return { type: 'stop' };
    if (lowerText === 'next') return { type: 'next' };
    if (lowerText === 'previous') return { type: 'previous' };

    // Routine selection
    const routineMatch = lowerText.match(/routine\s+(.+)/);
    if (routineMatch && routineMatch[1]) {
      return { type: 'routine', value: routineMatch[1] };
    }

    return null;
  }, []);

  const startListening = useCallback(() => {
    if (!recognition) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }

    try {
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const current = event.resultIndex;
        const newTranscript = event.results[current][0].transcript;
        setTranscript(newTranscript);

        const command = parseCommand(newTranscript);
        if (command) {
          onCommand(command);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        setError(`Speech recognition error: ${event.error}`);
        setIsListening(false);
      };

      recognition.onend = () => {
        if (isListening) {
          recognition.start();
        }
      };

      recognition.start();
    } catch (err) {
      setError(`Error starting speech recognition: ${err}`);
      setIsListening(false);
    }
  }, [recognition, isListening, parseCommand, onCommand]);

  const stopListening = useCallback(() => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  }, [recognition]);

  useEffect(() => {
    if (isEnabled && !isListening) {
      startListening();
    } else if (!isEnabled && isListening) {
      stopListening();
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [isEnabled, isListening, startListening, stopListening, recognition]);

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening
  };
};

export default useVoiceRecognition;