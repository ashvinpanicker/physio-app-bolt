export interface Exercise {
  id: string;
  name: string;
  type: 'timed' | 'reps';
  duration?: number; // in seconds, for timed exercises
  reps?: number; // for rep-based exercises
  sets: number;
  restBetweenSets: number; // in seconds
  instructions?: string;
}

export interface Routine {
  id: string;
  name: string;
  exercises: Exercise[];
  createdAt: number;
  lastPerformed?: number;
}

export interface WorkoutSession {
  id: string;
  routineId: string;
  startTime: number;
  endTime?: number;
  exercisesCompleted: {
    exerciseId: string;
    sets: number;
    reps?: number;
    duration?: number;
  }[];
}

export interface AppState {
  routines: Routine[];
  currentRoutine: Routine | null;
  activeExerciseIndex: number;
  activeSetIndex: number;
  isWorkoutActive: boolean;
  sessions: WorkoutSession[];
  isListening: boolean;
  voiceSettings: VoiceSettings;
}

export interface VoiceCommand {
  type: 'start' | 'stop' | 'next' | 'previous' | 'timer' | 'rep' | 'set' | 'rest' | 'routine';
  value?: number | string;
}

export interface VoiceSettings {
  enabled: boolean;
  volume: number;
  rate: number;
  pitch: number;
  voice: SpeechSynthesisVoice | null;
}