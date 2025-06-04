import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import AIRecommendationService from '../services/aiRecommendationService';
import ExerciseRecommendationService from '../services/exerciseRecommendationService';
import { Exercise, Routine } from '../types/types';
import { Dumbbell, RefreshCw, Brain, Clock, Repeat } from 'lucide-react';
import ExerciseCard from './ExerciseCard';

interface RoutineFormProps {
  routine?: Routine;
  onSave: (routine: Routine) => void;
  onCancel: () => void;
}

const RoutineForm: React.FC<RoutineFormProps> = ({ routine, onSave, onCancel }) => {
  const { state } = useAppContext();
  const [name, setName] = useState(routine?.name || '');
  const [selectedInjuryType, setSelectedInjuryType] = useState<string>('');
  const [recommendedExercises, setRecommendedExercises] = useState<Exercise[]>(routine?.exercises || []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (routine) {
      setName(routine.name);
      setRecommendedExercises(routine.exercises);
    }
  }, [routine]);

  const handleShuffleRecommendations = async () => {
    if (!selectedInjuryType) {
      setError('Please select an injury type first');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      if (state.aiSuggestionsEnabled) {
        const aiService = AIRecommendationService.getInstance();
        const newRecommendations = await aiService.generateExercises(selectedInjuryType);
        
        if (newRecommendations.length > 0) {
          setRecommendedExercises(newRecommendations);
        } else {
          throw new Error('No recommendations generated');
        }
      } else {
        const recommendationService = ExerciseRecommendationService.getInstance();
        const newRecommendations = recommendationService.getRecommendations(selectedInjuryType);
        
        if (newRecommendations.length > 0) {
          setRecommendedExercises(newRecommendations);
        } else {
          throw new Error('No recommendations found');
        }
      }
    } catch (err) {
      setError('Failed to generate recommendations. Please try again.');
      console.error('Error getting recommendations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Please enter a routine name');
      return;
    }

    if (recommendedExercises.length === 0) {
      setError('Please add at least one exercise to the routine');
      return;
    }
    
    const newRoutine: Routine = {
      id: routine?.id || crypto.randomUUID(),
      name: name.trim(),
      exercises: recommendedExercises,
      createdAt: routine?.createdAt || Date.now(),
      lastPerformed: routine?.lastPerformed || null
    };
    
    onSave(newRoutine);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
            <Dumbbell className="text-blue-600" size={20} />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800">
            {routine ? 'Edit Routine' : 'Create New Routine'}
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Routine Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Morning Shoulder Recovery"
          />
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="injuryType" className="block text-sm font-medium text-gray-700 mb-1">
              Target Area
            </label>
            <select
              id="injuryType"
              value={selectedInjuryType}
              onChange={(e) => {
                setSelectedInjuryType(e.target.value);
                setError(null);
              }}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select target area</option>
              <option value="shoulder">Shoulder</option>
              <option value="knee">Knee</option>
              <option value="back">Back</option>
              <option value="ankle">Ankle</option>
              <option value="hip">Hip</option>
              <option value="neck">Neck</option>
              <option value="wrist">Wrist</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleShuffleRecommendations}
              disabled={!selectedInjuryType || isLoading}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                !selectedInjuryType || isLoading
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              {isLoading ? (
                <RefreshCw size={18} className="mr-2 animate-spin" />
              ) : state.aiSuggestionsEnabled ? (
                <Brain size={18} className="mr-2" />
              ) : (
                <RefreshCw size={18} className="mr-2" />
              )}
              {isLoading ? 'Generating...' : 'Generate Exercises'}
            </button>

            {state.aiSuggestionsEnabled && (
              <div className="flex items-center text-sm text-gray-500">
                <Brain size={14} className="mr-1" />
                AI-powered
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800 flex items-center">
            Exercises
            {recommendedExercises.length > 0 && (
              <span className="ml-2 text-sm text-gray-500">
                ({recommendedExercises.length} total)
              </span>
            )}
          </h3>

          {recommendedExercises.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              <Dumbbell size={32} className="mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">
                No exercises added yet. Select a target area and generate exercises.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recommendedExercises.map((exercise, index) => (
                <div key={exercise.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-800">{exercise.name}</h4>
                    <div className="flex space-x-2">
                      {exercise.type === 'timed' ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <Clock size={12} className="mr-1" />
                          {exercise.duration}s
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <Repeat size={12} className="mr-1" />
                          {exercise.reps} reps
                        </span>
                      )}
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {exercise.sets} sets
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{exercise.instructions}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            disabled={!name.trim() || recommendedExercises.length === 0}
          >
            {routine ? 'Update' : 'Create'} Routine
          </button>
        </div>
      </form>
    </div>
  );
};

export default RoutineForm;