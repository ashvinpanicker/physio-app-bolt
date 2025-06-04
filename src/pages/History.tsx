import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { ArrowLeft, Calendar, Clock, Dumbbell } from 'lucide-react';

const History: React.FC = () => {
  const { state } = useAppContext();
  const navigate = useNavigate();
  
  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Format time
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Calculate duration
  const calculateDuration = (startTime: number, endTime: number) => {
    const durationMs = endTime - startTime;
    const minutes = Math.floor(durationMs / (1000 * 60));
    
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }
  };
  
  // Group sessions by date
  const groupedSessions = state.sessions.reduce((acc, session) => {
    const date = new Date(session.startTime).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(session);
    return acc;
  }, {} as Record<string, typeof state.sessions>);
  
  // Sort dates in descending order
  const sortedDates = Object.keys(groupedSessions).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="max-w-lg mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft size={20} className="mr-1" />
          Back
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Workout History</h1>
        <div className="w-8"></div> {/* Spacer for layout balance */}
      </div>
      
      {state.sessions.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Calendar className="text-blue-600" size={28} />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No Workout History</h2>
          <p className="text-gray-600 mb-6">Complete your first workout to start tracking your progress.</p>
          <button
            onClick={() => navigate('/routines')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Find a Workout
          </button>
        </div>
      ) : (
        <div>
          {sortedDates.map(date => (
            <div key={date} className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-3 pl-2">
                {formatDate(new Date(date).getTime())}
              </h2>
              
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                {groupedSessions[date]
                  .sort((a, b) => b.startTime - a.startTime)
                  .map(session => {
                    const routine = state.routines.find(r => r.id === session.routineId);
                    return (
                      <div 
                        key={session.id} 
                        className="p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-1">
                            <Dumbbell className="text-blue-600" size={18} />
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-800">{routine?.name || 'Unknown Routine'}</h3>
                            
                            <div className="flex flex-wrap gap-2 mt-2">
                              <div className="flex items-center text-xs text-gray-500">
                                <Clock size={14} className="mr-1" />
                                {formatTime(session.startTime)}
                              </div>
                              
                              {session.endTime && (
                                <div className="bg-green-100 px-2 py-0.5 rounded-full text-xs text-green-800">
                                  {calculateDuration(session.startTime, session.endTime)}
                                </div>
                              )}
                              
                              <div className="bg-blue-100 px-2 py-0.5 rounded-full text-xs text-blue-800">
                                {session.exercisesCompleted.length} exercises
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;