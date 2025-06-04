import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import WorkoutView from '../components/WorkoutView';
import VoiceCommandIndicator from '../components/VoiceCommandIndicator';
import useVoiceRecognition from '../hooks/useVoiceRecognition';
import { VoiceCommand, WorkoutSession } from '../types/types';
import { ArrowLeft, Mic, Play, X, AlertCircle } from 'lucide-react';

const Workout: React.FC = () => {
  const { routineId } = useParams<{ routineId: string }>();
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  
  const [sessionId] = useState(`session-${Date.now()}`);
  const [startTime] = useState(Date.now());
  const [showIntro, setShowIntro] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  
  // Find the routine
  const routine = state.routines.find(r => r.id === routineId);
  
  // Redirect if routine not found
  useEffect(() => {
    if (!routine) {
      navigate('/routines');
    } else {
      // Set as current routine
      dispatch({ type: 'SET_CURRENT_ROUTINE', payload: routine });
    }
  }, [routine, navigate, dispatch]);
  
  const handleVoiceCommand = (command: VoiceCommand) => {
    dispatch({ type: 'PROCESS_VOICE_COMMAND', payload: command });
  };
  
  const { isListening, transcript, error, startListening, stopListening } = useVoiceRecognition({
    onCommand: handleVoiceCommand,
    isEnabled: voiceEnabled
  });
  
  const toggleVoiceRecognition = () => {
    if (isListening) {
      stopListening();
      setVoiceEnabled(false);
    } else {
      startListening();
      setVoiceEnabled(true);
    }
  };
  
  const startWorkout = () => {
    setShowIntro(false);
    dispatch({ type: 'START_WORKOUT' });
    
    if (!isListening && voiceEnabled) {
      startListening();
    }
  };
  
  const handleExerciseComplete = () => {
    dispatch({ type: 'NEXT_SET' });
  };
  
  const handlePreviousExercise = () => {
    dispatch({ type: 'PREVIOUS_EXERCISE' });
  };
  
  const endWorkout = (saveProgress: boolean = true) => {
    if (saveProgress) {
      // Create session record with completed exercises
      const session: WorkoutSession = {
        id: sessionId,
        routineId: routine!.id,
        startTime,
        endTime: Date.now(),
        exercisesCompleted: routine!.exercises.slice(0, state.activeExerciseIndex + 1).map(ex => ({
          exerciseId: ex.id,
          sets: state.activeExerciseIndex === routine!.exercises.indexOf(ex) ? state.activeSetIndex + 1 : ex.sets,
          reps: ex.type === 'reps' ? ex.reps : undefined,
          duration: ex.type === 'timed' ? ex.duration : undefined
        }))
      };
      
      // Update routine's last performed timestamp
      const updatedRoutine = {
        ...routine!,
        lastPerformed: Date.now()
      };
      
      dispatch({ type: 'UPDATE_ROUTINE', payload: updatedRoutine });
      dispatch({ type: 'ADD_SESSION', payload: session });
    }
    
    dispatch({ type: 'END_WORKOUT' });
    
    if (isListening) {
      stopListening();
    }
    
    navigate('/');
  };
  
  if (!routine) {
    return null;
  }
  
  const currentExercise = routine.exercises[state.activeExerciseIndex];
  
  return (
    <div className="max-w-lg mx-auto p-4">
      {showIntro ? (
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-start mb-6">
            <button
              onClick={() => navigate('/routines')}
              className="flex items-center text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft size={20} className="mr-1" />
              Back
            </button>
            <h1 className="text-2xl font-bold text-gray-800">{routine.name}</h1>
            <div className="w-6"></div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Workout Summary</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Exercises</p>
                  <p className="text-xl font-medium text-gray-800">{routine.exercises.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Sets</p>
                  <p className="text-xl font-medium text-gray-800">
                    {routine.exercises.reduce((total, ex) => total + ex.sets, 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <h2 className="text-lg font-semibold text-gray-800">Voice Commands</h2>
              <div className={`ml-2 w-3 h-3 rounded-full ${voiceEnabled ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            </div>
            
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={`flex items-center px-4 py-2 rounded-lg border mb-3 w-full ${
                voiceEnabled 
                  ? 'bg-blue-50 border-blue-200 text-blue-700' 
                  : 'bg-gray-50 border-gray-200 text-gray-700'
              }`}
            >
              <Mic size={18} className="mr-2" />
              {voiceEnabled ? 'Voice Commands Enabled' : 'Enable Voice Commands'}
            </button>
            
            <div className="text-sm text-gray-600 bg-yellow-50 border border-yellow-100 rounded-lg p-3">
              <div className="flex items-start">
                <AlertCircle size={16} className="text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                <p>
                  You can control your workout with voice commands like "start", "stop", "next", 
                  "previous", "timer 30 seconds", or "10 reps".
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <button
              onClick={startWorkout}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Play size={20} className="mr-2" />
              Start Workout
            </button>
          </div>
        </div>
      ) : (
        <>
          {state.isWorkoutActive ? (
            <>
              <div className="flex justify-between items-center mb-6">
                <button
                  onClick={() => setShowEndConfirm(true)}
                  className="flex items-center text-gray-600 hover:text-gray-800"
                >
                  <X size={20} className="mr-1" />
                  End Workout
                </button>
                <h1 className="text-xl font-bold text-gray-800">{routine.name}</h1>
                <button
                  onClick={toggleVoiceRecognition}
                  className={`w-8 h-8 flex items-center justify-center rounded-full ${
                    isListening ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                  }`}
                  aria-label={isListening ? 'Disable voice commands' : 'Enable voice commands'}
                >
                  <Mic size={16} />
                </button>
              </div>
              
              <div className="relative">
                <div className="absolute top-0 left-0 w-full">
                  <div className="bg-gray-200 h-1 w-full rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{ 
                        width: `${((state.activeExerciseIndex) / routine.exercises.length) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Start</span>
                    <span>Progress: {state.activeExerciseIndex}/{routine.exercises.length}</span>
                    <span>End</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-4">
                {currentExercise && (
                  <WorkoutView
                    exercise={currentExercise}
                    setIndex={state.activeSetIndex}
                    onComplete={handleExerciseComplete}
                    onPrevious={handlePreviousExercise}
                  />
                )}
              </div>
              
              {voiceEnabled && (
                <VoiceCommandIndicator
                  isListening={isListening}
                  transcript={transcript}
                  error={error}
                  onToggle={toggleVoiceRecognition}
                />
              )}
              
              {showEndConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm mx-auto">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">End Workout</h3>
                    <p className="text-gray-600 mb-4">
                      Do you want to save your progress before ending the workout?
                    </p>
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setShowEndConfirm(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => endWorkout(false)}
                        className="px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors"
                      >
                        End Without Saving
                      </button>
                      <button
                        onClick={() => endWorkout(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Save & End
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Workout Complete!</h2>
              <p className="text-gray-600 mb-6">Great job! You've completed your workout.</p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => navigate('/')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Return Home
                </button>
                <button
                  onClick={() => {
                    dispatch({ type: 'RESET_WORKOUT' });
                    setShowIntro(true);
                  }}
                  className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Restart Workout
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Workout;