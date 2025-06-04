import React, { useState, useEffect } from 'react';
import { Plus, Minus, RotateCcw, X } from 'lucide-react';
import SpeechService from '../services/speechService';

interface RepCounterProps {
  initialCount?: number;
  targetReps?: number;
  onComplete?: () => void;
  onSkip?: () => void;
  className?: string;
}

const RepCounter: React.FC<RepCounterProps> = ({ 
  initialCount = 0, 
  targetReps, 
  onComplete,
  onSkip,
  className = ''
}) => {
  const [count, setCount] = useState(initialCount);
  const [isComplete, setIsComplete] = useState(false);
  const speechService = SpeechService.getInstance();
  
  useEffect(() => {
    setCount(initialCount);
    setIsComplete(false);
  }, [initialCount]);
  
  useEffect(() => {
    if (targetReps && count >= targetReps && !isComplete) {
      setIsComplete(true);
      speechService.speak("Target reps completed!", true);
      if (onComplete) {
        onComplete();
      }
    } else if (count > 0 && count % 5 === 0) {
      // Announce every 5 reps
      speechService.speak(count.toString());
    }
  }, [count, targetReps, onComplete, isComplete]);
  
  const increment = () => {
    setCount(prev => prev + 1);
  };
  
  const decrement = () => {
    if (count > 0) {
      setCount(prev => prev - 1);
    }
  };
  
  const reset = () => {
    speechService.stop();
    setCount(initialCount);
    setIsComplete(false);
  };

  const handleSkip = () => {
    speechService.stop();
    if (onSkip) {
      onSkip();
    }
  };
  
  // Calculate progress percentage
  const progress = targetReps ? (count / targetReps) * 100 : 0;

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative w-40 h-40 flex items-center justify-center mb-4">
        {/* Circle background */}
        <div className="absolute inset-0 rounded-full bg-gray-200"></div>
        
        {/* Progress circle */}
        {targetReps && (
          <svg className="absolute inset-0 transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="transparent"
              stroke={isComplete ? '#10B981' : '#3B82F6'}
              strokeWidth="8"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
              style={{ transition: 'stroke-dashoffset 0.3s ease' }}
            />
          </svg>
        )}
        
        {/* Rep count display */}
        <div className="text-5xl font-bold text-gray-800">
          {count}
          {targetReps && (
            <span className="text-2xl text-gray-500">/{targetReps}</span>
          )}
        </div>
      </div>
      
      <div className="flex space-x-3">
        <button 
          onClick={decrement}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
          aria-label="Decrease repetition count"
        >
          <Minus size={20} />
        </button>
        
        <button 
          onClick={increment}
          className={`flex items-center justify-center w-16 h-16 rounded-full text-white transition-colors ${
            isComplete ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'
          }`}
          aria-label="Increase repetition count"
        >
          <Plus size={24} />
        </button>
        
        <button 
          onClick={reset}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-500 text-white hover:bg-yellow-600 transition-colors"
          aria-label="Reset repetition count"
        >
          <RotateCcw size={20} />
        </button>

        <button 
          onClick={handleSkip}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-500 text-white hover:bg-gray-600 transition-colors"
          aria-label="Skip exercise"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

export default RepCounter;