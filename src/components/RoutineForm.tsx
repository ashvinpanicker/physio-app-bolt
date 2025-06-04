// Update the handleShuffleRecommendations function
const handleShuffleRecommendations = async () => {
  if (!selectedInjuryType) return;
  
  try {
    if (state.aiSuggestionsEnabled) {
      const aiService = AIRecommendationService.getInstance();
      const newRecommendations = await aiService.generateExercises(selectedInjuryType);
      
      if (newRecommendations.length > 0) {
        setRecommendedExercises(newRecommendations);
      }
    } else {
      // Use local recommendations when AI is disabled
      const recommendationService = ExerciseRecommendationService.getInstance();
      const newRecommendations = recommendationService.getRecommendations(selectedInjuryType);
      setRecommendedExercises(newRecommendations);
    }
  } catch (error) {
    console.error('Error getting recommendations:', error);
  }
};

export default handleShuffleRecommendations