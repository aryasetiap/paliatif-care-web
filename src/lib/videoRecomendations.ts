// Video data interface
export interface VideoData {
  id: string
  title: string
  description: string
  thumbnailUrl: string
  videoUrl: string
  duration: string
}

const RECOMMENDED_VIDEOS = {
  pain: [
    {
      id: 'pain-relief-1',
      title: '1. Nyeri - Terapi Akupresur',
      description: '',
      thumbnailUrl: 'https://img.youtube.com/vi/q9oB6nsTz5o/mqdefault.jpg',
      videoUrl: 'https://www.youtube.com/watch?v=q9oB6nsTz5o',
      duration: '12:21',
    },
    {
      id: 'pain-relief-2',
      title: '1. Nyeri - Kompres Hangat',
      description: '',
      thumbnailUrl: 'https://img.youtube.com/vi/W5JzONtaOvM/mqdefault.jpg',
      videoUrl: 'https://www.youtube.com/watch?v=W5JzONtaOvM',
      duration: '02:58',
    },
  ],
  fatigue: [
    {
      id: 'fatigue-management-1',
      title: '2. Lelah - Slow Deep Breathing (SDB)',
      description: '',
      thumbnailUrl: 'https://img.youtube.com/vi/JJHPQW_dd3k/mqdefault.jpg',
      videoUrl: 'https://www.youtube.com/watch?v=JJHPQW_dd3k',
      duration: '08:43',
    },
    {
      id: 'fatigue-management-2',
      title: '2. Lelah - Pijat Kaki untuk Sirkulasi',
      description: '',
      thumbnailUrl: 'https://img.youtube.com/vi/8OxiCWzU6Lc/mqdefault.jpg',
      videoUrl: 'https://youtu.be/8OxiCWzU6Lc',
      duration: '06:30',
    },
  ],
  nausea: [
    {
      id: 'nausea-relief-1',
      title: '4. Nausea - Aromaterapi (Jahe, Peppermint)',
      description: '',
      thumbnailUrl: 'https://img.youtube.com/vi/0Cg_B7vtM-I/mqdefault.jpg',
      videoUrl: 'https://www.youtube.com/watch?v=0Cg_B7vtM-I',
      duration: '06:55',
    },
  ],
  anxiety: [
    {
      id: 'anxiety-relief-1',
      title: '8. Terapi Musik',
      description: '',
      thumbnailUrl: 'https://img.youtube.com/vi/gl5dJA85nBc/mqdefault.jpg',
      videoUrl: 'https://youtu.be/gl5dJA85nBc',
      duration: '01:44',
    },
  ],
  depression: [
    {
      id: 'depression-support-1',
      title: '7. Terapi HOPE untuk Keputusasaan',
      description: '',
      thumbnailUrl: 'https://img.youtube.com/vi/3el279wtEM0/mqdefault.jpg',
      videoUrl: 'https://youtu.be/3el279wtEM0?si=-8BuNWoD9O6FaXXG',
      duration: '01:35',
    },
  ],
  sleep: [
    {
      id: 'sleep-improvement-1',
      title: '3. Gangguan Tidur - Aromaterapi Lavender',
      description: '',
      thumbnailUrl: 'https://img.youtube.com/vi/LRhG-5ODq6E/mqdefault.jpg',
      videoUrl: 'https://youtu.be/LRhG-5ODq6E',
      duration: '01:56',
    },
  ],
  appetite: [
    {
      id: 'appetite-stimulation-1',
      title: '5. Defisit Nutrisi',
      description: '',
      thumbnailUrl: 'https://img.youtube.com/vi/MM2JUSKLnqk/mqdefault.jpg',
      videoUrl: 'https://youtu.be/MM2JUSKLnqk?si=L_Ho-9LcXQfQQNGZ',
      duration: '07:15',
    },
  ],
  breathing: [
    {
      id: 'breathing-improvement-1',
      title: '6. Pola Napas (Terapi kipas genggam)',
      description: '',
      thumbnailUrl: 'https://img.youtube.com/vi/uQkkimVP6Z0/mqdefault.jpg',
      videoUrl: 'https://youtu.be/uQkkimVP6Z0?si=vCA8eh7JVOsAN968',
      duration: '03:56',
    },
  ],
  wellbeing: [
    {
      id: 'wellbeing-boost-1',
      title: '9. Dukungan koping keluarga',
      description: '',
      thumbnailUrl: 'https://img.youtube.com/vi/mfG65YoIWcw/mqdefault.jpg',
      videoUrl: 'https://youtu.be/mfG65YoIWcw?si=GS4QpuXqqHpJ5NNY',
      duration: '04:08',
    },
  ],
}

interface ESASQuestionScore {
  questionId: number
  questionText: string
  score: number
}

// Function to get recommended videos based on answered questions
export function getRecommendedVideos(
  esasScores: ESASQuestionScore[],
  highestScore: number
): VideoData[] {
  // Show videos for any answered questions with scores 1-10
  if (highestScore === 0) {
    return []
  }

  const recommendedVideos: VideoData[] = []

  // Get questions with any score (1-10 range)
  const answeredQuestions = esasScores
    .filter((score) => score.score > 0)
    .sort((a, b) => b.score - a.score)

  // Map question IDs to symptom categories
  const symptomMapping: { [key: number]: keyof typeof RECOMMENDED_VIDEOS } = {
    1: 'pain', // Pain
    2: 'fatigue', // Fatigue
    3: 'sleep', // Drowsiness/Sleep
    4: 'nausea', // Nausea
    5: 'appetite', // Appetite
    6: 'breathing', // Shortness of Breath
    7: 'depression', // Depression
    8: 'anxiety', // Anxiety
    9: 'wellbeing', // Wellbeing
  }

  // Add all videos for answered symptoms (no limit, but avoid duplicates)
  const seenVideoIds = new Set<string>()

  for (const question of answeredQuestions) {
    const symptomCategory = symptomMapping[question.questionId]

    if (symptomCategory && RECOMMENDED_VIDEOS[symptomCategory]) {
      const categoryVideos = RECOMMENDED_VIDEOS[symptomCategory]

      // Add all videos from this category (avoiding duplicates)
      for (const video of categoryVideos) {
        if (!seenVideoIds.has(video.id)) {
          recommendedVideos.push(video)
          seenVideoIds.add(video.id)
        }
      }
    }
  }

  return recommendedVideos
}

// Function to check if videos should be shown
export function shouldShowVideos(highestScore: number): boolean {
  return highestScore > 0
}

// Function to format ESAS scores for video recommendations
export function formatESASScores(esasData: any): ESASQuestionScore[] {
  const scores: ESASQuestionScore[] = []

  // Handle both old and new ESAS data formats
  const questions = esasData.questions || {}

  // Map of question IDs to text
  const questionTexts: { [key: number]: string } = {
    1: 'Nyeri',
    2: 'Lelah/Kekurangan Tenaga',
    3: 'Kantuk/Gangguan Tidur',
    4: 'Mual/Nausea',
    5: 'Nafsu Makan',
    6: 'Sesak/Pola Napas',
    7: 'Sedih/Keputusasaan',
    8: 'Cemas/Ansietas',
    9: 'Perasaan Keseluruhan',
  }

  // Extract scores from questions
  Object.entries(questions).forEach(([key, value]: [string, any]) => {
    const questionId = parseInt(key)

    if (questionId >= 1 && questionId <= 9 && value !== null && value !== undefined) {
      let scoreValue = 0

      // Handle both old format {1: 2} and new format {1: {score: 2}}
      if (typeof value === 'object' && value.score !== undefined) {
        scoreValue = value.score
      } else if (typeof value === 'number') {
        scoreValue = value
      }

      scores.push({
        questionId,
        questionText: questionTexts[questionId] || `Question ${questionId}`,
        score: scoreValue,
      })
    }
  })

  // Handle old format (direct properties)
  if (scores.length === 0) {
    if (esasData.pain !== undefined) {
      scores.push({ questionId: 1, questionText: 'Nyeri', score: esasData.pain })
    }
    if (esasData.nausea !== undefined) {
      scores.push({ questionId: 4, questionText: 'Mual/Nausea', score: esasData.nausea })
    }
  }

  return scores
}
