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
        {/* Progress circle */}
        <svg className="absolute inset-0 transform -rotate-90" viewBox="0 0 100 100">
          {targetReps && (
            <>
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="4"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                className={`${isComplete ? 'text-green-500' : 'text-blue-500'} transition-all duration-300`}
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="1"
                className="text-gray-200"
              />
            </>
          )}
        </svg>
        
        {/* Rep count display */}
        <div className="relative z-10 text-center">
          <div className={`text-5xl font-bold ${isComplete ? 'text-green-500' : 'text-gray-800'} transition-colors duration-300`}>
            {count}
          </div>
          {targetReps && (
            <div className="text-lg text-gray-500 mt-1">
              of {targetReps}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex space-x-3">
        <button 
          onClick={decrement}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500 text-white hover:bg-red-600 transition-all duration-300 transform hover:scale-105"
          aria-label="Decrease repetition count"
        >
          <Minus size={20} />
        </button>
        
        <button 
          onClick={increment}
          className={`flex items-center justify-center w-16 h-16 rounded-full text-white transition-all duration-300 transform hover:scale-105 ${
            isComplete ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'
          }`}
          aria-label="Increase repetition count"
        >
          <Plus size={24} />
        </button>
        
        <button 
          onClick={reset}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-500 text-white hover:bg-yellow-600 transition-all duration-300 transform hover:scale-105"
          aria-label="Reset repetition count"
        >
          <RotateCcw size={20} />
        </button>

        {onSkip && (
          <button 
            onClick={handleSkip}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-500 text-white hover:bg-gray-600 transition-all duration-300 transform hover:scale-105"
            aria-label="Skip exercise"
          >
            <X size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export default RepCounter;