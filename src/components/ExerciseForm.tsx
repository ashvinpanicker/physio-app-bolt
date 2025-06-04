import React, { useState, useEffect } from 'react';
import { Exercise } from '../types/types';
import { Clock, Repeat, X } from 'lucide-react';

interface ExerciseFormProps {
  exercise?: Exercise;
  onSave: (exercise: Exercise) => void;
  onCancel: () => void;
}

const ExerciseForm: React.FC<ExerciseFormProps> = ({ exercise, onSave, onCancel }) => {
  const [name, setName] = useState(exercise?.name || '');
  const [type, setType] = useState<'timed' | 'reps'>(exercise?.type || 'timed');
  const [duration, setDuration] = useState(exercise?.duration?.toString() || '30');
  const [reps, setReps] = useState(exercise?.reps?.toString() || '12');
  const [sets, setSets] = useState(exercise?.sets?.toString() || '3');
  const [restBetweenSets, setRestBetweenSets] = useState(exercise?.restBetweenSets?.toString() || '60');
  const [instructions, setInstructions] = useState(exercise?.instructions || '');
  
  const [errors, setErrors] = useState<{
    name?: string;
    duration?: string;
    reps?: string;
    sets?: string;
    restBetweenSets?: string;
  }>({});

  // Reset form when exercise prop changes
  useEffect(() => {
    if (exercise) {
      setName(exercise.name);
      setType(exercise.type);
      setDuration(exercise.duration?.toString() || '30');
      setReps(exercise.reps?.toString() || '12');
      setSets(exercise.sets.toString());
      setRestBetweenSets(exercise.restBetweenSets.toString());
      setInstructions(exercise.instructions || '');
    }
  }, [exercise]);

  const validate = (): boolean => {
    const newErrors: {
      name?: string;
      duration?: string;
      reps?: string;
      sets?: string;
      restBetweenSets?: string;
    } = {};
    
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (type === 'timed') {
      const durationNum = parseInt(duration);
      if (isNaN(durationNum) || durationNum <= 0) {
        newErrors.duration = 'Duration must be a positive number';
      }
    } else {
      const repsNum = parseInt(reps);
      if (isNaN(repsNum) || repsNum <= 0) {
        newErrors.reps = 'Reps must be a positive number';
      }
    }
    
    const setsNum = parseInt(sets);
    if (isNaN(setsNum) || setsNum <= 0) {
      newErrors.sets = 'Sets must be a positive number';
    }
    
    const restNum = parseInt(restBetweenSets);
    if (isNaN(restNum) || restNum < 0) {
      newErrors.restBetweenSets = 'Rest time must be a non-negative number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    const newExercise: Exercise = {
      id: exercise?.id || `exercise-${Date.now()}`,
      name,
      type,
      sets: parseInt(sets),
      restBetweenSets: parseInt(restBetweenSets),
      instructions: instructions.trim() || undefined
    };
    
    if (type === 'timed') {
      newExercise.duration = parseInt(duration);
    } else {
      newExercise.reps = parseInt(reps);
    }
    
    onSave(newExercise);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          {exercise ? 'Edit Exercise' : 'Add New Exercise'}
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
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Exercise Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., Shoulder Stretch"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>
        
        <div className="mb-4">
          <span className="block text-sm font-medium text-gray-700 mb-1">Exercise Type</span>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                checked={type === 'timed'}
                onChange={() => setType('timed')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 flex items-center text-gray-700">
                <Clock size={16} className="mr-1" /> Timed
              </span>
            </label>
            
            <label className="flex items-center">
              <input
                type="radio"
                checked={type === 'reps'}
                onChange={() => setType('reps')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 flex items-center text-gray-700">
                <Repeat size={16} className="mr-1" /> Repetitions
              </span>
            </label>
          </div>
        </div>
        
        {type === 'timed' ? (
          <div className="mb-4">
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
              Duration (seconds)
            </label>
            <input
              type="number"
              id="duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              min="1"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.duration ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.duration && <p className="mt-1 text-sm text-red-600">{errors.duration}</p>}
          </div>
        ) : (
          <div className="mb-4">
            <label htmlFor="reps" className="block text-sm font-medium text-gray-700 mb-1">
              Repetitions
            </label>
            <input
              type="number"
              id="reps"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              min="1"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.reps ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.reps && <p className="mt-1 text-sm text-red-600">{errors.reps}</p>}
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="sets" className="block text-sm font-medium text-gray-700 mb-1">
              Sets
            </label>
            <input
              type="number"
              id="sets"
              value={sets}
              onChange={(e) => setSets(e.target.value)}
              min="1"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.sets ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.sets && <p className="mt-1 text-sm text-red-600">{errors.sets}</p>}
          </div>
          
          <div>
            <label htmlFor="restBetweenSets" className="block text-sm font-medium text-gray-700 mb-1">
              Rest Between Sets (seconds)
            </label>
            <input
              type="number"
              id="restBetweenSets"
              value={restBetweenSets}
              onChange={(e) => setRestBetweenSets(e.target.value)}
              min="0"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.restBetweenSets ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.restBetweenSets && <p className="mt-1 text-sm text-red-600">{errors.restBetweenSets}</p>}
          </div>
        </div>
        
        <div className="mb-4">
          <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-1">
            Instructions (optional)
          </label>
          <textarea
            id="instructions"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="How to perform this exercise correctly..."
          />
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
            {exercise ? 'Update' : 'Add'} Exercise
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExerciseForm;