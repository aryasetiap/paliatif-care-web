// Video data interface
export interface VideoData {
  id: string
  title: string
  description: string
  thumbnailUrl: string
  videoUrl: string
  duration: string
}

// Sample YouTube video URLs - these can be replaced with actual therapeutic/palliative care videos
const RECOMMENDED_VIDEOS = {
  pain: [
    {
      id: 'pain-relief-1',
      title: '1. Nyeri - Kompres Hangat',
      description:
        'Kompres hangat membantu meningkatkan aliran darah, mengurangi ketegangan otot, serta meredakan rasa nyeri secara bertahap. Gunakan handuk hangat atau heating pad pada area yang sakit selama 15 hingga 20 menit untuk mendapatkan hasil yang optimal.',
      thumbnailUrl: 'https://img.youtube.com/vi/q9oB6nsTz5o/mqdefault.jpg',
      videoUrl: 'https://www.youtube.com/watch?v=q9oB6nsTz5o',
      duration: '12:22',
    },
    {
      id: 'pain-relief-2',
      title: '1. Nyeri - Terapi Kognitif Distraksi Nyeri',
      description:
        'Teknik distraksi kognitif untuk membantu mengalihkan fokus dari rasa nyeri melalui panduan visual dan suara. Metode ini efektif untuk meredakan ketegangan, menenangkan pikiran, dan membantu tubuh beradaptasi terhadap sensasi nyeri.',
      thumbnailUrl: 'https://img.youtube.com/vi/W5JzONtaOvM/mqdefault.jpg',
      videoUrl: 'https://www.youtube.com/watch?v=W5JzONtaOvM',
      duration: '02:59',
    },
  ],
  fatigue: [
    {
      id: 'fatigue-management-1',
      title: '2. Keletihan - Pijat Kaki',
      description:
        'Teknik pijat kaki sederhana untuk membantu meningkatkan sirkulasi, merilekskan otot, dan mengurangi rasa lelah. Metode ini bermanfaat bagi pasien paliatif untuk meningkatkan kenyamanan dan menambah energi.',
      thumbnailUrl: 'https://img.youtube.com/vi/JJHPQW_dd3k/mqdefault.jpg',
      videoUrl: 'https://www.youtube.com/watch?v=JJHPQW_dd3k',
      duration: '08:44',
    },
    {
      id: 'fatigue-management-2',
      title: '2. Keletihan - Intoleransi aktifitas terapi jalan',
      description:
        'Panduan terapi berjalan untuk membantu meningkatkan toleransi aktivitas pada pasien yang mudah lelah. Latihan ini bertujuan melatih kekuatan tubuh, memperbaiki pernapasan, serta meningkatkan stamina secara bertahap dengan gerakan yang aman dan terkontrol.',
      thumbnailUrl: 'https://img.youtube.com/vi/8OxiCWzU6Lc/mqdefault.jpg',
      videoUrl: 'https://youtu.be/8OxiCWzU6Lc',
      duration: '06:31',
    },
  ],
  nausea: [
    {
      id: 'nausea-relief-1',
      title: 'Acupressure for Nausea Relief',
      description:
        'Teknik akupresur P6 (Neiguan) point untuk mengurangi mual dan muntah secara alami.',
      thumbnailUrl: 'https://img.youtube.com/vi/y5JJt6x6HwU/mqdefault.jpg',
      videoUrl: 'https://www.youtube.com/watch?v=y5JJt6x6HwU',
      duration: '6:30',
    },
  ],
  anxiety: [
    {
      id: 'anxiety-relief-1',
      title: '5-Minute Mindfulness Meditation for Anxiety',
      description:
        'Meditasi mindfulness singkat untuk mengurangi kecemasan dan meningkatkan ketenangan pikiran.',
      thumbnailUrl: 'https://img.youtube.com/vi/y5JJt6x6HwU/mqdefault.jpg',
      videoUrl: 'https://www.youtube.com/watch?v=y5JJt6x6HwU',
      duration: '5:42',
    },
    {
      id: 'anxiety-relief-2',
      title: 'Box Breathing Technique for Anxiety',
      description:
        'Teknik pernapasan kotak (box breathing) yang efektif mengurangi kecemasan secara instan.',
      thumbnailUrl: 'https://img.youtube.com/vi/y5JJt6x6HwU/mqdefault.jpg',
      videoUrl: 'https://www.youtube.com/watch?v=y5JJt6x6HwU',
      duration: '8:15',
    },
  ],
  depression: [
    {
      id: 'depression-support-1',
      title: 'Guided Imagery for Emotional Wellbeing',
      description:
        'Visualisasi terbimbing untuk meningkatkan mood dan mengurangi gejala depresi ringan.',
      thumbnailUrl: 'https://img.youtube.com/vi/y5JJt6x6HwU/mqdefault.jpg',
      videoUrl: 'https://www.youtube.com/watch?v=y5JJt6x6HwU',
      duration: '18:00',
    },
  ],
  sleep: [
    {
      id: 'sleep-improvement-1',
      title: '3. Gangguan Pola Tidur - Terapi aromaterapi',
      description:
        'Terapi aromaterapi menggunakan wewangian relaksasi untuk membantu menenangkan pikiran, merilekskan tubuh, dan memperbaiki kualitas tidur. Cocok bagi pasien dengan gangguan pola tidur untuk menciptakan suasana yang lebih nyaman sebelum beristirahat.',
      thumbnailUrl: 'https://img.youtube.com/vi/LRhG-5ODq6E/mqdefault.jpg',
      videoUrl: 'https://youtu.be/LRhG-5ODq6E',
      duration: '01:56',
    },
  ],
  appetite: [
    {
      id: 'appetite-stimulation-1',
      title: 'Nutrition Tips for Appetite Loss',
      description:
        'Strategi nutrisi dan tips praktis untuk meningkatkan nafsu makan pada pasien dengan gejala ringan.',
      thumbnailUrl: 'https://img.youtube.com/vi/y5JJt6x6HwU/mqdefault.jpg',
      videoUrl: 'https://www.youtube.com/watch?v=y5JJt6x6HwU',
      duration: '9:15',
    },
  ],
  breathing: [
    {
      id: 'breathing-improvement-1',
      title: 'Diaphragmatic Breathing for Shortness of Breath',
      description:
        'Teknik pernapasan diafragma untuk mengurangi sesak dan meningkatkan oksigenasi pada pasien paliatif.',
      thumbnailUrl: 'https://img.youtube.com/vi/y5JJt6x6HwU/mqdefault.jpg',
      videoUrl: 'https://www.youtube.com/watch?v=y5JJt6x6HwU',
      duration: '7:30',
    },
  ],
  wellbeing: [
    {
      id: 'wellbeing-boost-1',
      title: 'Self-Acceptance Meditation',
      description:
        'Praktik meditasi untuk meningkatkan kesejahteraan emosional dan penerimaan diri pada pasien paliatif.',
      thumbnailUrl: 'https://img.youtube.com/vi/y5JJt6x6HwU/mqdefault.jpg',
      videoUrl: 'https://www.youtube.com/watch?v=y5JJt6x6HwU',
      duration: '12:00',
    },
  ],
}

interface ESASQuestionScore {
  questionId: number
  questionText: string
  score: number
}

// Function to get recommended videos based on highest ESAS scores
export function getRecommendedVideos(
  esasScores: ESASQuestionScore[],
  highestScore: number
): VideoData[] {
  // Only show videos for scores 1-3 (mild symptoms)
  if (highestScore > 3 || highestScore === 0) {
    return []
  }

  const recommendedVideos: VideoData[] = []

  // Get questions with highest scores (1-3 range)
  const highScoreQuestions = esasScores
    .filter((score) => score.score > 0 && score.score <= 3)
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

  // Add videos for high-scoring symptoms (max 2 videos per category, max 4 total)
  let videoCount = 0
  for (const question of highScoreQuestions) {
    if (videoCount >= 4) break

    const symptomCategory = symptomMapping[question.questionId]
    if (symptomCategory && RECOMMENDED_VIDEOS[symptomCategory]) {
      const categoryVideos = RECOMMENDED_VIDEOS[symptomCategory]

      // Add up to 2 videos from this category
      const videosToAdd = categoryVideos.slice(0, Math.min(2, 4 - videoCount))
      recommendedVideos.push(...videosToAdd)
      videoCount += videosToAdd.length
    }
  }

  // If no specific symptom videos found, add general wellness videos
  if (recommendedVideos.length === 0 && highestScore > 0 && highestScore <= 3) {
    recommendedVideos.push(
      ...RECOMMENDED_VIDEOS.anxiety.slice(0, 1),
      ...RECOMMENDED_VIDEOS.breathing.slice(0, 1)
    )
  }

  return recommendedVideos
}

// Function to check if videos should be shown
export function shouldShowVideos(highestScore: number): boolean {
  return highestScore > 0 && highestScore <= 3
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
    if (questionId >= 1 && questionId <= 9 && value) {
      scores.push({
        questionId,
        questionText: questionTexts[questionId] || `Question ${questionId}`,
        score: value.score || 0,
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
