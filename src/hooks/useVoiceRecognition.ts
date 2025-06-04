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
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  // Check if the browser supports SpeechRecognition
  const SpeechRecognition = window.SpeechRecognition || window['webkitSpeechRecognition'];
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  // Check microphone permissions
  const checkMicrophonePermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setHasPermission(true);
      setError(null);
    } catch (err) {
      setHasPermission(false);
      setError('Microphone permission denied. Please enable microphone access.');
      console.error('Microphone permission error:', err);
    }
  }, []);

  const parseCommand = useCallback((text: string): VoiceCommand | null => {
    const lowerText = text.toLowerCase().trim();

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

  const startListening = useCallback(async () => {
    if (!recognition) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }

    // Check permission before starting
    if (hasPermission === null) {
      await checkMicrophonePermission();
    }

    if (hasPermission === false) {
      return;
    }

    try {
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
        console.log('Voice recognition started');
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const current = event.resultIndex;
        const newTranscript = event.results[current][0].transcript;
        console.log('Recognized text:', newTranscript);
        setTranscript(newTranscript);

        const command = parseCommand(newTranscript);
        if (command) {
          console.log('Parsed command:', command);
          onCommand(command);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setError(`Speech recognition error: ${event.error}`);
        setIsListening(false);
      };

      recognition.onend = () => {
        console.log('Voice recognition ended');
        if (isListening) {
          recognition.start();
        }
      };

      recognition.start();
    } catch (err) {
      console.error('Error starting speech recognition:', err);
      setError(`Error starting speech recognition: ${err}`);
      setIsListening(false);
    }
  }, [recognition, isListening, parseCommand, onCommand, hasPermission, checkMicrophonePermission]);

  const stopListening = useCallback(() => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
      console.log('Voice recognition stopped');
    }
  }, [recognition]);

  useEffect(() => {
    // Check microphone permission on mount
    checkMicrophonePermission();

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [checkMicrophonePermission, recognition]);

  useEffect(() => {
    if (isEnabled && !isListening && hasPermission) {
      startListening();
    } else if (!isEnabled && isListening) {
      stopListening();
    }
  }, [isEnabled, isListening, startListening, stopListening, hasPermission]);

  return {
    isListening,
    transcript,
    error,
    hasPermission,
    startListening,
    stopListening,
    checkMicrophonePermission
  };
};

export default useVoiceRecognition;