import React, { useState, useEffect } from 'react';
import { Exercise, Routine } from '../types/types';
import { Plus, X, ChevronUp, ChevronDown, Brain, Shuffle } from 'lucide-react';
import ExerciseCard from './ExerciseCard';
import ExerciseForm from './ExerciseForm';
import ExerciseRecommendationService from '../services/exerciseRecommendationService';
import AIRecommendationService from '../services/aiRecommendationService';

interface RoutineFormProps {
  routine?: Routine;
  onSave: (routine: Routine) => void;
  onCancel: () => void;
}

const RoutineForm: React.FC<RoutineFormProps> = ({ routine, onSave, onCancel }) => {
  const [name, setName] = useState(routine?.name || '');
  const [exercises, setExercises] = useState<Exercise[]>(routine?.exercises || []);
  const [showExerciseForm, setShowExerciseForm] = useState(false);
  const [currentExercise, setCurrentExercise] = useState<Exercise | undefined>(undefined);
  const [nameError, setNameError] = useState<string | undefined>(undefined);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [selectedInjuryType, setSelectedInjuryType] = useState<string>('');
  const [recommendedExercises, setRecommendedExercises] = useState<Exercise[]>([]);
  
  const recommendationService = ExerciseRecommendationService.getInstance();
  const injuryTypes = recommendationService.getSupportedInjuryTypes();

  useEffect(() => {
    if (selectedInjuryType) {
      const recommendations = recommendationService.getRecommendations(selectedInjuryType);
      setRecommendedExercises(recommendations);
    }
  }, [selectedInjuryType]);

  const handleAddExercise = () => {
    setCurrentExercise(undefined);
    setShowExerciseForm(true);
  };

  const handleEditExercise = (exercise: Exercise) => {
    setCurrentExercise(exercise);
    setShowExerciseForm(true);
  };

  const handleDeleteExercise = (exerciseId: string) => {
    setExercises(exercises.filter(ex => ex.id !== exerciseId));
  };

  const handleSaveExercise = (exercise: Exercise) => {
    if (currentExercise) {
      setExercises(exercises.map(ex => 
        ex.id === exercise.id ? exercise : ex
      ));
    } else {
      setExercises([...exercises, exercise]);
    }
    setShowExerciseForm(false);
    setCurrentExercise(undefined);
  };

  const handleMoveExercise = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === exercises.length - 1)
    ) {
      return;
    }

    const newExercises = [...exercises];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newExercises[index], newExercises[newIndex]] = [newExercises[newIndex], newExercises[index]];
    setExercises(newExercises);
  };

  const handleAddRecommendedExercises = () => {
    if (!selectedInjuryType) return;
    setExercises([...exercises, ...recommendedExercises]);
    setShowRecommendations(false);
    setSelectedInjuryType('');
  };

  const handleShuffleRecommendations = async () => {
    if (!selectedInjuryType) return;
    
    try {
      const aiService = AIRecommendationService.getInstance();
      const newRecommendations = await aiService.generateExercises(selectedInjuryType);
      
      if (newRecommendations.length > 0) {
        setRecommendedExercises(newRecommendations);
      }
    } catch (error) {
      console.error('Error getting AI recommendations:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setNameError('Routine name is required');
      return;
    }
    
    if (exercises.length === 0) {
      alert('Please add at least one exercise to the routine');
      return;
    }
    
    const newRoutine: Routine = {
      id: routine?.id || `routine-${Date.now()}`,
      name: name.trim(),
      exercises,
      createdAt: routine?.createdAt || Date.now(),
      lastPerformed: routine?.lastPerformed
    };
    
    onSave(newRoutine);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg mx-auto">
      {showExerciseForm ? (
        <ExerciseForm
          exercise={currentExercise}
          onSave={handleSaveExercise}
          onCancel={() => setShowExerciseForm(false)}
        />
      ) : showRecommendations ? (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              AI Exercise Recommendations
            </h2>
            <button
              onClick={() => setShowRecommendations(false)}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close recommendations"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Injury Area
                </label>
                <select
                  value={selectedInjuryType}
                  onChange={(e) => setSelectedInjuryType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select an area...</option>
                  {injuryTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              {selectedInjuryType && (
                <button
                  onClick={handleShuffleRecommendations}
                  className="mt-6 p-2 text-gray-600 hover:text-blue-600 transition-colors"
                  aria-label="Shuffle recommendations"
                >
                  <Shuffle size={20} />
                </button>
              )}
            </div>
          </div>
          
          {selectedInjuryType && (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-700">Recommended Exercises:</h3>
              <div className="space-y-2">
                {recommendedExercises.map(exercise => (
                  <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    className="border border-gray-100"
                  />
                ))}
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowRecommendations(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddRecommendedExercises}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Add Exercises
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {routine ? 'Edit Routine' : 'Create New Routine'}
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close form"
            >
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Routine Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (e.target.value.trim()) setNameError(undefined);
                }}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  nameError ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Morning Physiotherapy"
              />
              {nameError && <p className="mt-1 text-sm text-red-600">{nameError}</p>}
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium text-gray-700">Exercises</h3>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowRecommendations(true)}
                    className="flex items-center text-sm text-purple-600 hover:text-purple-800"
                  >
                    <Brain size={16} className="mr-1" />
                    AI Suggestions
                  </button>
                  <button
                    type="button"
                    onClick={handleAddExercise}
                    className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                  >
                    <Plus size={16} className="mr-1" />
                    Add Exercise
                  </button>
                </div>
              </div>
              
              {exercises.length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 border-dashed rounded-lg p-6 text-center">
                  <p className="text-gray-500">No exercises added yet. Click "Add Exercise" or use AI suggestions to start building your routine.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {exercises.map((exercise, index) => (
                    <div key={exercise.id} className="flex items-center gap-2">
                      <div className="flex flex-col">
                        <button
                          type="button"
                          onClick={() => handleMoveExercise(index, 'up')}
                          disabled={index === 0}
                          className={`text-gray-500 ${index === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:text-gray-700'}`}
                          aria-label="Move exercise up"
                        >
                          <ChevronUp size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveExercise(index, 'down')}
                          disabled={index === exercises.length - 1}
                          className={`text-gray-500 ${index === exercises.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:text-gray-700'}`}
                          aria-label="Move exercise down"
                        >
                          <ChevronDown size={18} />
                        </button>
                      </div>
                      
                      <div className="flex-1">
                        <ExerciseCard
                          exercise={exercise}
                          onEdit={() => handleEditExercise(exercise)}
                          onDelete={() => handleDeleteExercise(exercise.id)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {routine ? 'Update' : 'Create'} Routine
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default RoutineForm;