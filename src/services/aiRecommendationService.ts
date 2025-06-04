import OpenAI from 'openai';
import { Exercise } from '../types/types';

class AIRecommendationService {
  private static instance: AIRecommendationService;
  private openai: OpenAI;

  private constructor() {
    this.openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    });
  }

  static getInstance(): AIRecommendationService {
    if (!AIRecommendationService.instance) {
      AIRecommendationService.instance = new AIRecommendationService();
    }
    return AIRecommendationService.instance;
  }

  async generateExercises(injuryType: string): Promise<Exercise[]> {
    try {
      const prompt = `Generate 3 physiotherapy exercises for ${injuryType} injury. Each exercise should include:
      - A descriptive name
      - Whether it's timed or rep-based
      - Duration (in seconds) for timed exercises or number of reps
      - Number of sets (between 2-4)
      - Rest between sets (in seconds)
      - Clear instructions
      
      Format as JSON array. Example:
      [
        {
          "name": "Wall Slides",
          "type": "reps",
          "reps": 12,
          "sets": 3,
          "restBetweenSets": 45,
          "instructions": "Stand with back against wall..."
        }
      ]`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a physiotherapy expert. Provide safe, effective exercises suitable for rehabilitation."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      if (!Array.isArray(result.exercises)) {
        throw new Error("Invalid response format");
      }

      return result.exercises.map((exercise: any) => ({
        ...exercise,
        id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }));
    } catch (error) {
      console.error('Error generating exercises:', error);
      return [];
    }
  }
}

export default AIRecommendationService;