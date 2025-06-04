import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import AIRecommendationService from '../services/aiRecommendationService';
import ExerciseRecommendationService from '../services/exerciseRecommendationService';
import { Exercise, Routine } from '../types/types';

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

  const handleShuffleRecommendations = async () => {
    if (!selectedInjuryType) return;
    
    try {
      if (state.aiSuggestionsEnabled) {
        const aiService = AIRecommendationService.getInstance();
        const newRecommendations = await aiService.generateExercises(selectedInjuryType);
        
        if (newRecommendations.length > 0) {
          setRecommendedExercises(newRecommendations);
        }
      } else {
        // Use local recommendations when AI is disabled
        const recommendationService = ExerciseRecommendationService.getInstance();
        const newRecommendations = recommendationService.getRecommendations(selectedInjuryType);
        setRecommendedExercises(newRecommendations);
      }
    } catch (error) {
      console.error('Error getting recommendations:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newRoutine: Routine = {
      id: routine?.id || crypto.randomUUID(),
      name,
      exercises: recommendedExercises,
      createdAt: routine?.createdAt || Date.now(),
      lastPerformed: routine?.lastPerformed || null
    };
    
    onSave(newRoutine);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Routine Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label htmlFor="injuryType" className="block text-sm font-medium text-gray-700">
          Injury Type
        </label>
        <select
          id="injuryType"
          value={selectedInjuryType}
          onChange={(e) => setSelectedInjuryType(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        >
          <option value="">Select injury type</option>
          <option value="shoulder">Shoulder</option>
          <option value="knee">Knee</option>
          <option value="back">Back</option>
          <option value="ankle">Ankle</option>
        </select>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={handleShuffleRecommendations}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          disabled={!selectedInjuryType}
        >
          Shuffle Recommendations
        </button>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Recommended Exercises</h3>
        {recommendedExercises.map((exercise, index) => (
          <div key={exercise.id} className="p-4 bg-gray-50 rounded-md">
            <h4 className="font-medium">{exercise.name}</h4>
            <p className="text-sm text-gray-600">{exercise.description}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          disabled={!name || recommendedExercises.length === 0}
        >
          Save Routine
        </button>
      </div>
    </form>
  );
};

export default RoutineForm;