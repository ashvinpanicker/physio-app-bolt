import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Dumbbell, Activity, History, Settings, ChevronRight } from 'lucide-react';

const Home: React.FC = () => {
  const { state } = useAppContext();
  const navigate = useNavigate();
  
  // Get most recent routine
  const recentRoutine = state.routines.length > 0 
    ? state.routines.reduce((latest, routine) => 
        !latest.lastPerformed || (routine.lastPerformed && routine.lastPerformed > latest.lastPerformed) 
          ? routine 
          : latest, 
        state.routines[0]
      )
    : null;
  
  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="max-w-lg mx-auto p-4">
      <div className="flex flex-col items-center mt-8 mb-10">
        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
          <Dumbbell className="text-blue-600" size={28} />
        </div>
        <h1 className="text-3xl font-bold text-center text-gray-800">PhysioAssist</h1>
        <p className="text-gray-600 text-center mt-2">Your voice-controlled physiotherapy assistant</p>
      </div>
      
      {state.routines.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="text-center">
            <Activity className="mx-auto text-blue-500 mb-3" size={48} />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Welcome to PhysioAssist!</h2>
            <p className="text-gray-600 mb-4">Get started by creating your first exercise routine.</p>
            <button
              onClick={() => navigate('/routines')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Routine
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-md p-6 mb-6 text-white">
            <h2 className="text-xl font-semibold mb-4">Start Workout</h2>
            {recentRoutine && (
              <div
                className="bg-white bg-opacity-20 p-4 rounded-lg hover:bg-opacity-30 transition-all cursor-pointer mb-3"
                onClick={() => {
                  navigate(`/workout/${recentRoutine.id}`);
                }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{recentRoutine.name}</h3>
                    <p className="text-sm text-blue-100">
                      {recentRoutine.exercises.length} {recentRoutine.exercises.length === 1 ? 'exercise' : 'exercises'}
                    </p>
                  </div>
                  <ChevronRight size={20} />
                </div>
              </div>
            )}
            <button
              onClick={() => navigate('/routines')}
              className="w-full py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium flex items-center justify-center"
            >
              View All Routines
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate('/history')}
            >
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                  <History className="text-green-600" size={20} />
                </div>
                <h2 className="text-lg font-semibold text-gray-800">History</h2>
              </div>
              <p className="text-gray-600 text-sm">
                {state.sessions.length} completed {state.sessions.length === 1 ? 'workout' : 'workouts'}
              </p>
            </div>
            
            <div
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate('/settings')}
            >
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                  <Settings className="text-purple-600" size={20} />
                </div>
                <h2 className="text-lg font-semibold text-gray-800">Settings</h2>
              </div>
              <p className="text-gray-600 text-sm">
                Voice commands, preferences & help
              </p>
            </div>
          </div>
        </>
      )}
      
      {state.sessions.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {state.sessions.slice(0, 3).map((session) => {
              const routine = state.routines.find(r => r.id === session.routineId);
              return (
                <div
                  key={session.id}
                  className="p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-gray-800">{routine?.name || 'Unknown Routine'}</h3>
                      <p className="text-sm text-gray-500">
                        {formatDate(session.startTime)}
                      </p>
                    </div>
                    <div className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      Completed
                    </div>
                  </div>
                </div>
              );
            })}
            
            {state.sessions.length > 3 && (
              <div className="p-3 bg-gray-50 text-center">
                <button
                  onClick={() => navigate('/history')}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View All History
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;