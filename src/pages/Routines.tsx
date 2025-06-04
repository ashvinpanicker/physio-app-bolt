import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Routine } from '../types/types';
import { Plus, Clock, ArrowLeft, Trash, Edit, Play } from 'lucide-react';
import RoutineForm from '../components/RoutineForm';
import ExerciseCard from '../components/ExerciseCard';

const Routines: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  
  const [showForm, setShowForm] = useState(false);
  const [currentRoutine, setCurrentRoutine] = useState<Routine | undefined>(undefined);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  
  const handleAddRoutine = () => {
    setCurrentRoutine(undefined);
    setShowForm(true);
  };
  
  const handleEditRoutine = (routine: Routine) => {
    setCurrentRoutine(routine);
    setShowForm(true);
  };
  
  const handleSaveRoutine = (routine: Routine) => {
    if (currentRoutine) {
      dispatch({ type: 'UPDATE_ROUTINE', payload: routine });
    } else {
      dispatch({ type: 'ADD_ROUTINE', payload: routine });
    }
    setShowForm(false);
    setCurrentRoutine(undefined);
  };
  
  const handleDeleteRoutine = (routineId: string) => {
    dispatch({ type: 'DELETE_ROUTINE', payload: routineId });
    setShowDeleteConfirm(null);
  };
  
  const handleStartWorkout = (routine: Routine) => {
    dispatch({ type: 'SET_CURRENT_ROUTINE', payload: routine });
    navigate(`/workout/${routine.id}`);
  };
  
  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-lg mx-auto p-4">
      {showForm ? (
        <RoutineForm
          routine={currentRoutine}
          onSave={handleSaveRoutine}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft size={20} className="mr-1" />
              Back
            </button>
            <h1 className="text-2xl font-bold text-gray-800">My Routines</h1>
            <button
              onClick={handleAddRoutine}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              aria-label="Add routine"
            >
              <Plus size={20} />
            </button>
          </div>
          
          {state.routines.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Clock className="text-blue-600" size={28} />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">No Routines Yet</h2>
              <p className="text-gray-600 mb-6">Create your first physiotherapy routine to get started.</p>
              <button
                onClick={handleAddRoutine}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Routine
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {state.routines.map(routine => (
                <div key={routine.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h2 className="text-xl font-semibold text-gray-800">{routine.name}</h2>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleEditRoutine(routine)}
                          className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                          aria-label="Edit routine"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(routine.id)}
                          className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                          aria-label="Delete routine"
                        >
                          <Trash size={18} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      <div className="bg-gray-100 px-3 py-1 rounded-full text-xs text-gray-700">
                        {routine.exercises.length} {routine.exercises.length === 1 ? 'exercise' : 'exercises'}
                      </div>
                      {routine.lastPerformed && (
                        <div className="bg-blue-100 px-3 py-1 rounded-full text-xs text-blue-700">
                          Last: {formatDate(routine.lastPerformed)}
                        </div>
                      )}
                    </div>
                    
                    {routine.exercises.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <h3 className="text-sm font-medium text-gray-700 mb-1">Exercises:</h3>
                        {routine.exercises.slice(0, 3).map(exercise => (
                          <ExerciseCard
                            key={exercise.id}
                            exercise={exercise}
                            className="border border-gray-100"
                          />
                        ))}
                        {routine.exercises.length > 3 && (
                          <p className="text-sm text-gray-500 italic">
                            +{routine.exercises.length - 3} more exercises
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="px-5 py-3 bg-gray-50 flex justify-end">
                    <button
                      onClick={() => handleStartWorkout(routine)}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Play size={16} className="mr-1" />
                      Start Workout
                    </button>
                  </div>
                  
                  {/* Delete confirmation modal */}
                  {showDeleteConfirm === routine.id && (
                    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                      <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm mx-auto">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Delete Routine</h3>
                        <p className="text-gray-600 mb-4">
                          Are you sure you want to delete "{routine.name}"? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                          <button
                            onClick={() => setShowDeleteConfirm(null)}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleDeleteRoutine(routine.id)}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Routines;