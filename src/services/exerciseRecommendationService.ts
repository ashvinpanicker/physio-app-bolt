import { Exercise } from '../types/types';

interface InjuryArea {
  name: string;
  exercises: Exercise[];
}

const injuryAreas: InjuryArea[] = [
  {
    name: 'Shoulder',
    exercises: [
      {
        id: 'shoulder-pendulum',
        name: 'Pendulum Exercise',
        type: 'timed',
        duration: 30,
        sets: 3,
        restBetweenSets: 30,
        instructions: 'Lean over slightly, letting your affected arm hang down. Swing your arm gently in small circles.'
      },
      {
        id: 'shoulder-external-rotation',
        name: 'External Rotation',
        type: 'reps',
        reps: 10,
        sets: 3,
        restBetweenSets: 45,
        instructions: 'Hold elbow at 90 degrees, rotate forearm outward keeping elbow at side.'
      },
      {
        id: 'shoulder-wall-slides',
        name: 'Wall Slides',
        type: 'reps',
        reps: 12,
        sets: 3,
        restBetweenSets: 45,
        instructions: 'Stand with back against wall, slide arms up and down while maintaining contact.'
      }
    ]
  },
  {
    name: 'Knee',
    exercises: [
      {
        id: 'knee-straight-leg-raise',
        name: 'Straight Leg Raises',
        type: 'reps',
        reps: 10,
        sets: 3,
        restBetweenSets: 45,
        instructions: 'Lie on back, tighten thigh muscle and lift leg straight up about 6 inches.'
      },
      {
        id: 'knee-hamstring-stretch',
        name: 'Hamstring Stretch',
        type: 'timed',
        duration: 30,
        sets: 3,
        restBetweenSets: 30,
        instructions: 'Sit with affected leg extended, reach for toes while keeping back straight.'
      },
      {
        id: 'knee-wall-sits',
        name: 'Wall Sits',
        type: 'timed',
        duration: 30,
        sets: 3,
        restBetweenSets: 60,
        instructions: 'Stand with back against wall, slide down until thighs are parallel to ground.'
      }
    ]
  },
  {
    name: 'Back',
    exercises: [
      {
        id: 'back-bird-dog',
        name: 'Bird Dog Exercise',
        type: 'timed',
        duration: 30,
        sets: 3,
        restBetweenSets: 45,
        instructions: 'On hands and knees, extend opposite arm and leg while maintaining balance.'
      },
      {
        id: 'back-bridge',
        name: 'Bridge Exercise',
        type: 'reps',
        reps: 12,
        sets: 3,
        restBetweenSets: 45,
        instructions: 'Lie on back with knees bent, lift hips up while keeping shoulders on ground.'
      },
      {
        id: 'back-cat-cow',
        name: 'Cat-Cow Stretch',
        type: 'timed',
        duration: 45,
        sets: 3,
        restBetweenSets: 30,
        instructions: 'On hands and knees, alternate between arching and rounding your back.'
      }
    ]
  },
  {
    name: 'Neck',
    exercises: [
      {
        id: 'neck-isometric',
        name: 'Isometric Neck Exercise',
        type: 'timed',
        duration: 10,
        sets: 4,
        restBetweenSets: 30,
        instructions: 'Place hand on side of head, resist gentle pressure while keeping neck straight.'
      },
      {
        id: 'neck-rotation',
        name: 'Neck Rotation',
        type: 'reps',
        reps: 10,
        sets: 3,
        restBetweenSets: 30,
        instructions: 'Slowly turn head from side to side within comfortable range.'
      }
    ]
  },
  {
    name: 'Ankle',
    exercises: [
      {
        id: 'ankle-alphabet',
        name: 'Ankle Alphabet',
        type: 'timed',
        duration: 30,
        sets: 3,
        restBetweenSets: 30,
        instructions: 'Draw the alphabet with your toes, moving only your ankle.'
      },
      {
        id: 'ankle-calf-raises',
        name: 'Calf Raises',
        type: 'reps',
        reps: 15,
        sets: 3,
        restBetweenSets: 45,
        instructions: 'Stand on edge of step, raise up on toes then lower heels below step level.'
      }
    ]
  },
  {
    name: 'Wrist',
    exercises: [
      {
        id: 'wrist-flexion',
        name: 'Wrist Flexion',
        type: 'reps',
        reps: 15,
        sets: 3,
        restBetweenSets: 30,
        instructions: 'Rest forearm on table with wrist hanging off edge, bend wrist upward.'
      },
      {
        id: 'wrist-extension',
        name: 'Wrist Extension',
        type: 'reps',
        reps: 15,
        sets: 3,
        restBetweenSets: 30,
        instructions: 'Rest forearm on table with wrist hanging off edge, bend wrist downward.'
      }
    ]
  },
  {
    name: 'Hip',
    exercises: [
      {
        id: 'hip-bridge',
        name: 'Hip Bridge',
        type: 'reps',
        reps: 12,
        sets: 3,
        restBetweenSets: 45,
        instructions: 'Lie on back with knees bent, lift hips toward ceiling.'
      },
      {
        id: 'hip-flexor-stretch',
        name: 'Hip Flexor Stretch',
        type: 'timed',
        duration: 30,
        sets: 3,
        restBetweenSets: 30,
        instructions: 'Kneel on one knee, tuck pelvis and lean forward slightly.'
      }
    ]
  }
];

class ExerciseRecommendationService {
  private static instance: ExerciseRecommendationService;

  private constructor() {}

  static getInstance(): ExerciseRecommendationService {
    if (!ExerciseRecommendationService.instance) {
      ExerciseRecommendationService.instance = new ExerciseRecommendationService();
    }
    return ExerciseRecommendationService.instance;
  }

  getRecommendations(injuryType: string): Exercise[] {
    const area = injuryAreas.find(a => 
      a.name.toLowerCase() === injuryType.toLowerCase()
    );
    
    if (!area) {
      return [];
    }

    // Shuffle the exercises to provide variety
    const shuffled = [...area.exercises]
      .sort(() => Math.random() - 0.5)
      .map(exercise => ({
        ...exercise,
        id: `${exercise.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }));

    return shuffled;
  }

  getSupportedInjuryTypes(): string[] {
    return injuryAreas.map(area => area.name).sort();
  }

  getAllExercises(): Exercise[] {
    return injuryAreas.flatMap(area => area.exercises);
  }
}

export default ExerciseRecommendationService;