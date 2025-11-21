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
// Sesuai dengan ESAS Rule Engine di esas-rule-engine.ts
const RECOMMENDED_VIDEOS = {
  pain: [
    {
      id: 'pain-relief-1',
      title: '1. Nyeri - Terapi Akupresur',
      description:
        'Teknik akupresur sesuai intervensi keperawatan untuk nyeri kronis. Lakukan penekanan menggunakan ujung jari dengan tekanan lembut tapi mantap dan gerakan memutar kecil selama 1–2 menit pada titik nyeri. Ulangi 2–3 kali sehari atau setiap kali nyeri muncul.',
      thumbnailUrl: 'https://img.youtube.com/vi/q9oB6nsTz5o/mqdefault.jpg',
      videoUrl: 'https://www.youtube.com/watch?v=q9oB6nsTz5o',
      duration: '12:22',
    },
    {
      id: 'pain-relief-2',
      title: '1. Nyeri - Kompres Hangat',
      description:
        'Kompres hangat membantu meningkatkan aliran darah, mengurangi ketegangan otot, serta meredakan rasa nyeri secara bertahap. Gunakan handuk hangat atau heating pad pada area yang sakit selama 15 hingga 20 menit untuk mendapatkan hasil yang optimal.',
      thumbnailUrl: 'https://img.youtube.com/vi/W5JzONtaOvM/mqdefault.jpg',
      videoUrl: 'https://www.youtube.com/watch?v=W5JzONtaOvM',
      duration: '02:59',
    },
  ],
  fatigue: [
    {
      id: 'fatigue-management-1',
      title: '2. Lelah - Slow Deep Breathing (SDB)',
      description:
        'Teknik Slow Deep Breathing sesuai intervensi untuk intoleransi aktivitas. Ambil posisi duduk tegak, tarik napas perlahan melalui hidung 6 detik, tahan 6 detik, hembuskan perlahan melalui mulut 6 detik. Ulangi selama 15 menit, dua kali sehari (pagi dan sore).',
      thumbnailUrl: 'https://img.youtube.com/vi/JJHPQW_dd3k/mqdefault.jpg',
      videoUrl: 'https://www.youtube.com/watch?v=JJHPQW_dd3k',
      duration: '08:44',
    },
    {
      id: 'fatigue-management-2',
      title: '2. Lelah - Pijat Kaki untuk Sirkulasi',
      description:
        'Teknik pijat kaki sederhana untuk membantu meningkatkan sirkulasi, merilekskan otot, dan mengurangi rasa lelah. Metode ini bermanfaat bagi pasien paliatif untuk meningkatkan kenyamanan dan menambah energi.',
      thumbnailUrl: 'https://img.youtube.com/vi/8OxiCWzU6Lc/mqdefault.jpg',
      videoUrl: 'https://youtu.be/8OxiCWzU6Lc',
      duration: '06:31',
    },
  ],
  nausea: [
    {
      id: 'nausea-relief-1',
      title: '4. Nausea - Aromaterapi (Jahe, Peppermint)',
      description:
        'Aromaterapi sesuai intervensi keperawatan untuk nausea. Teteskan 1-2 tetes minyak esensial jahe atau peppermint ke tisu, dekatkan ke hidung 10-15 cm, hirup pelan-pelan selama 3-5 menit. Alternatif: teteskan ke air hangat dan hirup uapnya.',
      thumbnailUrl: 'https://img.youtube.com/vi/0Cg_B7vtM-I/mqdefault.jpg',
      videoUrl: 'https://www.youtube.com/watch?v=0Cg_B7vtM-I',
      duration: '06:55',
    },
  ],
  anxiety: [
    {
      id: 'anxiety-relief-1',
      title: '8. Cemas - Terapi Murottal',
      description:
        'Terapi Murottal sesuai intervensi keperawatan untuk ansietas. Putar audio murottal dengan volume lembut (40-50 dB) selama 10-20 menit. Amati ekspresi wajah, frekuensi napas, dan tanda relaksasi pasien selama terapi.',
      thumbnailUrl: 'https://img.youtube.com/vi/y5JJt6x6HwU/mqdefault.jpg',
      videoUrl: 'https://www.youtube.com/watch?v=y5JJt6x6HwU',
      duration: '15:30',
    },
  ],
  depression: [
    {
      id: 'depression-support-1',
      title: '7. Terapi HOPE untuk Keputusasaan',
      description: '',
      thumbnailUrl: 'https://img.youtube.com/vi/3el279wtEM0/mqdefault.jpg',
      videoUrl: 'https://youtu.be/3el279wtEM0?si=-8BuNWoD9O6FaXXG',
      duration: '12:45',
    },
  ],
  sleep: [
    {
      id: 'sleep-improvement-1',
      title: '3. Gangguan Tidur - Aromaterapi Lavender',
      description:
        'Aromaterapi Lavender sesuai intervensi keperawatan untuk gangguan pola tidur. Teteskan 2 tetes minyak esensial lavender ke kassa 2x2 cm, tempelkan di kerah pakaian 20 cm dari hidung, 1 jam sebelum tidur. Hirup aroma secara alami tanpa perlu menarik napas dalam.',
      thumbnailUrl: 'https://img.youtube.com/vi/LRhG-5ODq6E/mqdefault.jpg',
      videoUrl: 'https://youtu.be/LRhG-5ODq6E',
      duration: '01:56',
    },
  ],
  appetite: [
    {
      id: 'appetite-stimulation-1',
      title: '5. Defisit Nutrisi',
      description:
        'Intervensi keperawatan untuk risiko defisit nutrisi dengan fokus pada peningkatan asupan makanan. Edukasi pasien mengenai makanan tinggi nutrisi, bantu memilih porsi kecil namun sering, dan ciptakan lingkungan makan yang nyaman. Pantau berat badan, nafsu makan, serta catat asupan harian untuk menilai efektivitas intervensi.',
      thumbnailUrl: 'https://img.youtube.com/vi/MM2JUSKLnqk/mqdefault.jpg',
      videoUrl: 'https://youtu.be/MM2JUSKLnqk?si=L_Ho-9LcXQfQQNGZ',
      duration: '07:15',
    },
  ],
  breathing: [
    {
      id: 'breathing-improvement-1',
      title: '6. Pola Napas (Terapi kipas genggam)',
      description:
        'Intervensi keperawatan untuk mengatasi gangguan pola napas melalui terapi kipas genggam. Terapi ini membantu mengurangi sesak dengan memberikan aliran udara ke wajah untuk merangsang reseptor trigeminal, sehingga meningkatkan rasa lega saat bernapas. Pantau frekuensi napas, kenyamanan pasien, serta respon terhadap intervensi.',
      thumbnailUrl: 'https://img.youtube.com/vi/uQkkimVP6Z0/mqdefault.jpg',
      videoUrl: 'https://youtu.be/uQkkimVP6Z0?si=vCA8eh7JVOsAN968',
      duration: '10:15',
    },
  ],
  wellbeing: [
    {
      id: 'wellbeing-boost-1',
      title: '9. Perasaan - Family Empowerment Session',
      description:
        'Sesi Pemberdayaan Keluarga sesuai intervensi keperawatan untuk peningkatan koping keluarga. Orientasi 5 menit, latihan pernapasan bersama 5 menit, sesi refleksi positif 10 menit, doa/afirmasi bersama 5 menit, evaluasi ringan 5 menit.',
      thumbnailUrl: 'https://img.youtube.com/vi/m6b0ziKW1pE/mqdefault.jpg',
      videoUrl: 'https://www.youtube.com/watch?v=m6b0ziKW1pE',
      duration: '25:00',
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
