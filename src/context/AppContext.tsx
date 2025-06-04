import React, { createContext, useContext, useReducer, ReactNode, useMemo, useEffect } from 'react';
import { AppState, Routine, Exercise, WorkoutSession, VoiceCommand, VoiceSettings } from '../types/types';
import useLocalStorage from '../hooks/useLocalStorage';
import SpeechService from '../services/speechService';

const initialState: AppState = {
  routines: [],
  currentRoutine: null,
  activeExerciseIndex: 0,
  activeSetIndex: 0,
  isWorkoutActive: false,
  sessions: [],
  isListening: false,
  voiceSettings: {
    enabled: true,
    volume: 1,
    rate: 1,
    pitch: 1,
    voice: null
  },
  aiSuggestionsEnabled: true
};

type Action =
  | { type: 'SET_ROUTINES'; payload: Routine[] }
  | { type: 'ADD_ROUTINE'; payload: Routine }
  | { type: 'UPDATE_ROUTINE'; payload: Routine }
  | { type: 'DELETE_ROUTINE'; payload: string }
  | { type: 'SET_CURRENT_ROUTINE'; payload: Routine | null }
  | { type: 'START_WORKOUT' }
  | { type: 'END_WORKOUT' }
  | { type: 'NEXT_EXERCISE' }
  | { type: 'PREVIOUS_EXERCISE' }
  | { type: 'NEXT_SET' }
  | { type: 'RESET_WORKOUT' }
  | { type: 'ADD_SESSION'; payload: WorkoutSession }
  | { type: 'SET_SESSIONS'; payload: WorkoutSession[] }
  | { type: 'SET_LISTENING'; payload: boolean }
  | { type: 'SET_VOICE_SETTINGS'; payload: Partial<VoiceSettings> }
  | { type: 'SET_AI_SUGGESTIONS_ENABLED'; payload: boolean }
  | { type: 'PROCESS_VOICE_COMMAND'; payload: VoiceCommand };

const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'SET_ROUTINES':
      return { ...state, routines: action.payload };
    case 'ADD_ROUTINE':
      return { ...state, routines: [...state.routines, action.payload] };
    case 'UPDATE_ROUTINE': {
      const updatedRoutines = state.routines.map(routine => 
        routine.id === action.payload.id ? action.payload : routine
      );
      return { 
        ...state, 
        routines: updatedRoutines,
        currentRoutine: state.currentRoutine?.id === action.payload.id 
          ? action.payload 
          : state.currentRoutine 
      };
    }
    case 'DELETE_ROUTINE': {
      const filteredRoutines = state.routines.filter(routine => routine.id !== action.payload);
      return { 
        ...state, 
        routines: filteredRoutines,
        currentRoutine: state.currentRoutine?.id === action.payload 
          ? null 
          : state.currentRoutine
      };
    }
    case 'SET_CURRENT_ROUTINE':
      return { ...state, currentRoutine: action.payload };
    case 'START_WORKOUT':
      return { 
        ...state, 
        isWorkoutActive: true, 
        activeExerciseIndex: 0,
        activeSetIndex: 0
      };
    case 'END_WORKOUT':
      return { 
        ...state, 
        isWorkoutActive: false,
        activeExerciseIndex: 0,
        activeSetIndex: 0
      };
    case 'NEXT_EXERCISE': {
      if (!state.currentRoutine) return state;
      const nextExerciseIndex = state.activeExerciseIndex + 1;
      if (nextExerciseIndex >= state.currentRoutine.exercises.length) {
        return state;
      }
      return { 
        ...state, 
        activeExerciseIndex: nextExerciseIndex,
        activeSetIndex: 0
      };
    }
    case 'PREVIOUS_EXERCISE': {
      if (!state.currentRoutine) return state;
      const prevExerciseIndex = state.activeExerciseIndex - 1;
      if (prevExerciseIndex < 0) {
        return state;
      }
      return { 
        ...state, 
        activeExerciseIndex: prevExerciseIndex,
        activeSetIndex: 0
      };
    }
    case 'NEXT_SET': {
      if (!state.currentRoutine) return state;
      const currentExercise = state.currentRoutine.exercises[state.activeExerciseIndex];
      const nextSetIndex = state.activeSetIndex + 1;
      
      if (nextSetIndex >= currentExercise.sets) {
        const nextExerciseIndex = state.activeExerciseIndex + 1;
        if (nextExerciseIndex >= state.currentRoutine.exercises.length) {
          return { 
            ...state, 
            isWorkoutActive: false
          };
        }
        return { 
          ...state, 
          activeExerciseIndex: nextExerciseIndex,
          activeSetIndex: 0
        };
      }
      
      return { 
        ...state, 
        activeSetIndex: nextSetIndex
      };
    }
    case 'RESET_WORKOUT':
      return { 
        ...state, 
        activeExerciseIndex: 0,
        activeSetIndex: 0
      };
    case 'ADD_SESSION':
      return { 
        ...state, 
        sessions: [...state.sessions, action.payload]
      };
    case 'SET_SESSIONS':
      return { ...state, sessions: action.payload };
    case 'SET_LISTENING':
      return { ...state, isListening: action.payload };
    case 'SET_VOICE_SETTINGS':
      return {
        ...state,
        voiceSettings: {
          ...state.voiceSettings,
          ...action.payload
        }
      };
    case 'SET_AI_SUGGESTIONS_ENABLED':
      return {
        ...state,
        aiSuggestionsEnabled: action.payload
      };
    case 'PROCESS_VOICE_COMMAND': {
      const command = action.payload;
      
      switch (command.type) {
        case 'start':
          return { ...state, isWorkoutActive: true };
        case 'stop':
          return { ...state, isWorkoutActive: false };
        case 'next':
          if (!state.currentRoutine) return state;
          const nextExerciseIndex = state.activeExerciseIndex + 1;
          if (nextExerciseIndex >= state.currentRoutine.exercises.length) {
            return state;
          }
          return { 
            ...state, 
            activeExerciseIndex: nextExerciseIndex,
            activeSetIndex: 0
          };
        case 'previous':
          if (!state.currentRoutine) return state;
          const prevExerciseIndex = state.activeExerciseIndex - 1;
          if (prevExerciseIndex < 0) {
            return state;
          }
          return { 
            ...state, 
            activeExerciseIndex: prevExerciseIndex,
            activeSetIndex: 0
          };
        default:
          return state;
      }
    }
    default:
      return state;
  }
};

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [savedState, setSavedState] = useLocalStorage<{
    routines: Routine[];
    sessions: WorkoutSession[];
    voiceSettings: VoiceSettings;
    aiSuggestionsEnabled: boolean;
  }>('physioApp', {
    routines: [],
    sessions: [],
    voiceSettings: initialState.voiceSettings,
    aiSuggestionsEnabled: true
  });

  const [state, dispatch] = useReducer(appReducer, {
    ...initialState,
    routines: savedState.routines,
    sessions: savedState.sessions,
    voiceSettings: savedState.voiceSettings,
    aiSuggestionsEnabled: savedState.aiSuggestionsEnabled
  });

  useEffect(() => {
    const speechService = SpeechService.getInstance();
    speechService.setVoiceSettings(state.voiceSettings);
  }, [state.voiceSettings]);

  useEffect(() => {
    const speechService = SpeechService.getInstance();
    if (!state.isWorkoutActive) {
      speechService.stop();
    }
  }, [state.isWorkoutActive]);

  useEffect(() => {
    setSavedState({
      routines: state.routines,
      sessions: state.sessions,
      voiceSettings: state.voiceSettings,
      aiSuggestionsEnabled: state.aiSuggestionsEnabled
    });
  }, [state.routines, state.sessions, state.voiceSettings, state.aiSuggestionsEnabled, setSavedState]);

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};