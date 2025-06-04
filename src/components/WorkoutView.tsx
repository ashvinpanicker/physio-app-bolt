import React, { useEffect, useState } from 'react';
import { Exercise } from '../types/types';
import Timer from './Timer';
import RepCounter from './RepCounter';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import SpeechService from '../services/speechService';

interface WorkoutViewProps {
  exercise: Exercise;
  setIndex: number;
  onComplete: () => void;
  onPrevious: () => void;
}

const WorkoutView: React.FC<WorkoutViewProps> = ({
  exercise,
  setIndex,
  onComplete,
  onPrevious
}) => {
  const [isResting, setIsResting] = useState(false);
  const [showCompletionMessage, setShowCompletionMessage] = useState(false);
  const speechService = SpeechService.getInstance();
  
  useEffect(() => {
    speechService.announceExerciseStart(exercise.name, setIndex + 1, exercise.sets);
    
    if (exercise.instructions) {
      setTimeout(() => {
        speechService.speak(exercise.instructions!, false);
      }, 2000);
    }
  }, [exercise, setIndex]);

  const handleExerciseComplete = () => {
    speechService.announceSetComplete();

    if (setIndex < exercise.sets - 1) {
      setIsResting(true);
      speechService.announceRestPeriod(exercise.restBetweenSets);
    } else {
      showCompletionAndProceed();
    }
  };
  
  const handleRestComplete = () => {
    setIsResting(false);
    speechService.announceNextSet();
  };

  const showCompletionAndProceed = () => {
    setShowCompletionMessage(true);
    speechService.announceWorkoutComplete();
    const timer = setTimeout(() => {
      setShowCompletionMessage(false);
      onComplete();
    }, 1500);
    return () => clearTimeout(timer);
  };

  const handleSkip = () => {
    speechService.stop();
    onComplete();
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
      <div className="p-8">
        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">{exercise.name}</h2>
          
          <div className="mb-6 w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${((setIndex + 1) / exercise.sets) * 100}%` }}
            ></div>
          </div>
          
          <p className="text-lg text-gray-600 mb-6">
            Set {setIndex + 1} of {exercise.sets}
          </p>
          
          {isResting ? (
            <div className="flex flex-col items-center">
              <div className="bg-yellow-100 rounded-full px-4 py-2 text-yellow-800 mb-4">
                Rest Period
              </div>
              <Timer 
                initialTime={exercise.restBetweenSets} 
                onComplete={handleRestComplete}
                onSkip={handleRestComplete}
                autoStart={true}
                announceProgress={true}
              />
            </div>
          ) : (
            <>
              {exercise.type === 'timed' && exercise.duration ? (
                <Timer 
                  initialTime={exercise.duration} 
                  onComplete={handleExerciseComplete}
                  onSkip={handleSkip}
                  autoStart={true}
                  announceProgress={true}
                />
              ) : (
                <RepCounter 
                  targetReps={exercise.reps} 
                  onComplete={handleExerciseComplete}
                  onSkip={handleSkip}
                />
              )}
              
              {exercise.instructions && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-800 mb-1">Instructions:</h3>
                  <p className="text-blue-700">{exercise.instructions}</p>
                </div>
              )}
            </>
          )}
          
          {showCompletionMessage && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
              <div className="bg-white rounded-lg shadow-xl p-6 animate-bounce-small">
                <CheckCircle className="mx-auto mb-2 text-green-500" size={48} />
                <p className="text-xl font-semibold text-center text-gray-800">
                  Exercise Complete!
                </p>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-between mt-8">
          <button
            onClick={onPrevious}
            className="flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowLeft size={16} className="mr-1" />
            Previous
          </button>
          
          <button
            onClick={handleSkip}
            className="flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Skip
            <ArrowRight size={16} className="ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutView;