import React, { useEffect } from 'react';
import useTimer from '../hooks/useTimer';
import { Clock, Play, Pause, RotateCcw, X } from 'lucide-react';
import SpeechService from '../services/speechService';

interface TimerProps {
  initialTime: number;
  onComplete?: () => void;
  onSkip?: () => void;
  autoStart?: boolean;
  className?: string;
  announceProgress?: boolean;
}

const Timer: React.FC<TimerProps> = ({ 
  initialTime, 
  onComplete, 
  onSkip,
  autoStart = false,
  className = '',
  announceProgress = true
}) => {
  const { time, isActive, isPaused, start, pause, resume, reset } = useTimer(initialTime);
  const speechService = SpeechService.getInstance();

  // Reset timer when initialTime changes
  useEffect(() => {
    reset(initialTime);
    if (autoStart) {
      start();
    }
  }, [initialTime, autoStart, reset, start]);

  useEffect(() => {
    if (time === 0) {
      if (onComplete) {
        onComplete();
      }
    } else if (announceProgress && isActive && !isPaused) {
      if (time <= 5) {
        speechService.announceCountdown(time);
      }
    }
  }, [time, onComplete, announceProgress, isActive, isPaused]);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const progress = (time / initialTime) * 100;
  
  // Determine color based on remaining time
  const getColorClass = () => {
    if (progress > 66) return 'text-green-500';
    if (progress > 33) return 'text-yellow-500';
    return 'text-red-500';
  };

  const handleReset = () => {
    speechService.stop();
    reset(initialTime);
    start();
  };

  const handleSkip = () => {
    speechService.stop();
    if (onSkip) {
      onSkip();
    }
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative w-40 h-40 flex items-center justify-center mb-4">
        {/* Circle background */}
        <div className="absolute inset-0 rounded-full bg-gray-200"></div>
        
        {/* Progress circle */}
        <svg className="absolute inset-0 transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
            className={getColorClass()}
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        
        {/* Time display */}
        <div className={`text-4xl font-bold ${getColorClass()}`}>
          {formatTime(time)}
        </div>
      </div>
      
      <div className="flex space-x-2">
        {!isActive && !isPaused ? (
          <button 
            onClick={start}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            aria-label="Start timer"
          >
            <Play size={20} />
          </button>
        ) : isPaused ? (
          <>
            <button 
              onClick={resume}
              className="flex items-center justify-center w-12 h-12 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors"
              aria-label="Resume timer"
            >
              <Play size={20} />
            </button>
            <button 
              onClick={handleReset}
              className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-500 text-white hover:bg-yellow-600 transition-colors"
              aria-label="Restart timer"
            >
              <RotateCcw size={20} />
            </button>
            <button 
              onClick={handleSkip}
              className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
              aria-label="Skip timer"
            >
              <X size={20} />
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={pause}
              className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-500 text-white hover:bg-yellow-600 transition-colors"
              aria-label="Pause timer"
            >
              <Pause size={20} />
            </button>
            <button 
              onClick={handleSkip}
              className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
              aria-label="Skip timer"
            >
              <X size={20} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Timer;