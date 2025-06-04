import React, { useEffect, useState } from 'react';
import { Mic, MicOff } from 'lucide-react';

interface VoiceCommandIndicatorProps {
  isListening: boolean;
  transcript: string;
  error: string | null;
  onToggle: () => void;
}

const VoiceCommandIndicator: React.FC<VoiceCommandIndicatorProps> = ({
  isListening,
  transcript,
  error,
  onToggle
}) => {
  const [showTranscript, setShowTranscript] = useState(false);
  
  // Show transcript for a few seconds when it changes
  useEffect(() => {
    if (transcript) {
      setShowTranscript(true);
      const timer = setTimeout(() => {
        setShowTranscript(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [transcript]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Transcript bubble */}
      {showTranscript && transcript && (
        <div className="mb-3 p-3 bg-white rounded-lg shadow-lg max-w-xs animate-fade-in">
          <p className="text-sm text-gray-700">"{transcript}"</p>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg shadow-lg max-w-xs">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      
      {/* Mic button */}
      <button
        onClick={onToggle}
        className={`flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-300 ${
          isListening 
            ? 'bg-blue-500 text-white scale-110 animate-pulse' 
            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
        }`}
        aria-label={isListening ? 'Stop listening' : 'Start listening'}
      >
        {isListening ? <Mic size={24} /> : <MicOff size={24} />}
      </button>
    </div>
  );
};

export default VoiceCommandIndicator;