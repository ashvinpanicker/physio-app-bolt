import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { 
  ArrowLeft, Mic, HelpCircle, 
  ChevronRight, Trash, Brain 
} from 'lucide-react';
import SpeechService from '../services/speechService';

const Settings: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const speechService = SpeechService.getInstance();

  const handleVoiceToggle = () => {
    dispatch({
      type: 'SET_VOICE_SETTINGS',
      payload: { enabled: !state.voiceSettings.enabled }
    });
  };

  const handleAISuggestionsToggle = () => {
    dispatch({
      type: 'SET_AI_SUGGESTIONS_ENABLED',
      payload: !state.aiSuggestionsEnabled
    });
  };

  const handleTestVoice = () => {
    speechService.testVoice();
  };

  const handleClearData = () => {
    dispatch({ type: 'SET_ROUTINES', payload: [] });
    dispatch({ type: 'SET_SESSIONS', payload: [] });
    dispatch({ type: 'SET_CURRENT_ROUTINE', payload: null });
    setShowConfirmClear(false);
    navigate('/');
  };

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
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <div className="w-8"></div>
      </div>
      
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Voice Settings</h2>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <Mic className="text-blue-600" size={16} />
                </div>
                <span className="text-gray-700">Voice Feedback</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={state.voiceSettings.enabled}
                  onChange={handleVoiceToggle}
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {state.voiceSettings.enabled && (
              <button
                onClick={handleTestVoice}
                className="w-full px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                Test Voice Settings
              </button>
            )}
          </div>
        </div>

        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Exercise Recommendations</h2>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                  <Brain className="text-purple-600" size={16} />
                </div>
                <span className="text-gray-700">AI Exercise Suggestions</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={state.aiSuggestionsEnabled}
                  onChange={handleAISuggestionsToggle}
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
        
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Help & Support</h2>
          
          <div className="space-y-2">
            <button className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                  <HelpCircle className="text-green-600" size={16} />
                </div>
                <span className="text-gray-700">Voice Command Guide</span>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </button>
          </div>
        </div>
        
        <div className="p-4">
          <button
            onClick={() => setShowConfirmClear(true)}
            className="flex items-center text-red-600 hover:text-red-800"
          >
            <Trash size={18} className="mr-2" />
            Clear All Data
          </button>
        </div>
      </div>
      
      <div className="text-center text-gray-500 text-sm">
        <p>PhysioAssist v1.0.0</p>
        <p className="mt-1">&copy; 2025 PhysioAssist. All rights reserved.</p>
      </div>
      
      {showConfirmClear && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm mx-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Clear All Data</h3>
            <p className="text-gray-600 mb-4">
              This will permanently delete all your routines, exercises, and workout history. This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmClear(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearData}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Clear Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;