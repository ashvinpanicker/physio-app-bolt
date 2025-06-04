import React from 'react';
import { Exercise } from '../types/types';
import { Clock, Repeat, Edit, Trash } from 'lucide-react';

interface ExerciseCardProps {
  exercise: Exercise;
  onEdit?: () => void;
  onDelete?: () => void;
  onClick?: () => void;
  isActive?: boolean;
  className?: string;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  onEdit,
  onDelete,
  onClick,
  isActive = false,
  className = '',
}) => {
  const { name, type, duration, reps, sets, restBetweenSets, instructions } = exercise;

  return (
    <div 
      className={`
        rounded-lg shadow-md overflow-hidden transition-all duration-200
        ${isActive ? 'border-2 border-blue-500 bg-blue-50' : 'border border-gray-200 bg-white hover:shadow-lg'}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      <div className="px-6 py-4">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">{name}</h3>
          
          <div className="flex space-x-1">
            {type === 'timed' ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <Clock size={14} className="mr-1" />
                Timed
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <Repeat size={14} className="mr-1" />
                Reps
              </span>
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-3 mb-3">
          <div className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700">
            {sets} {sets === 1 ? 'set' : 'sets'}
          </div>
          
          {type === 'timed' && duration && (
            <div className="bg-green-100 px-3 py-1 rounded-full text-sm text-green-700">
              <Clock size={14} className="inline mr-1" />
              {duration}s
            </div>
          )}
          
          {type === 'reps' && reps && (
            <div className="bg-blue-100 px-3 py-1 rounded-full text-sm text-blue-700">
              <Repeat size={14} className="inline mr-1" />
              {reps} reps
            </div>
          )}
          
          <div className="bg-yellow-100 px-3 py-1 rounded-full text-sm text-yellow-700">
            {restBetweenSets}s rest
          </div>
        </div>
        
        {instructions && (
          <p className="text-gray-600 text-sm mt-2">{instructions}</p>
        )}
      </div>
      
      {(onEdit || onDelete) && (
        <div className="px-6 py-2 bg-gray-50 flex justify-end space-x-2">
          {onEdit && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
              aria-label="Edit exercise"
            >
              <Edit size={18} />
            </button>
          )}
          
          {onDelete && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1 text-red-600 hover:text-red-800 transition-colors"
              aria-label="Delete exercise"
            >
              <Trash size={18} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ExerciseCard;