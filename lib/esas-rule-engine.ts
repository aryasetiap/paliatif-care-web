// ESAS Rule Engine - Implements RULES_SKRINING.md logic

export type ESASQuestions = {
  "1": number // Nyeri
  "2": number // Lelah/Kekurangan Tenaga
  "3": number // Kantuk/Gangguan Tidur
  "4": number // Mual/Nausea
  "5": number // Nafsu Makan
  "6": number // Sesak/Pola Napas
  "7": number // Sedih/Keputusasaan
  "8": number // Cemas/Ansietas
  "9": number // Perasaan Keseluruhan
}

export type ESASQuestionsData = {
  "1": {
    score: number
    text: "Nyeri"
    description?: "ringan" | "sedang" | "berat"
  }
  "2": {
    score: number
    text: "Lelah/Kekurangan Tenaga"
    description?: "ringan" | "sedang" | "berat"
  }
  "3": {
    score: number
    text: "Kantuk/Gangguan Tidur"
    description?: "ringan" | "sedang" | "berat"
  }
  "4": {
    score: number
    text: "Mual/Nausea"
    description?: "ringan" | "sedang" | "berat"
  }
  "5": {
    score: number
    text: "Nafsu Makan"
    description?: "ringan" | "sedang" | "berat"
  }
  "6": {
    score: number
    text: "Sesak/Pola Napas"
    description?: "ringan" | "sedang" | "berat"
  }
  "7": {
    score: number
    text: "Sedih/Keputusasaan"
    description?: "ringan" | "sedang" | "berat"
  }
  "8": {
    score: number
    text: "Cemas/Ansietas"
    description?: "ringan" | "sedang" | "berat"
  }
  "9": {
    score: number
    text: "Perasaan Keseluruhan"
    description?: "ringan" | "sedang" | "berat"
  }
}

export type ESASResult = {
  highestScore: number
  primaryQuestion: number
  allScores: ESASQuestions
  riskLevel: 'low' | 'medium' | 'high'
  actionRequired: string
  diagnosis: string
  therapyType: string
  interventionSteps: string[]
  references: string[]
  priorityLevel: number
}

// ESAS Question to Diagnosis Mapping (sesuai RULES_SKRINING.md)
const ESAS_DIAGNOSIS_MAPPING: Record<string, string> = {
  "1": "1. Diagnosa: Nyeri Kronis",
  "2": "6. Diagnosa: Intoleransi Aktivitas",
  "3": "2. Diagnosa: Gangguan Pola Tidur",
  "4": "5. Diagnosa: Nausea",
  "5": "7. Diagnosa: Resiko Defisit Nutrisi",
  "6": "3. Diagnosa: Pola Napas Tidak Efektif",
  "7": "8. Diagnosa: Keputusasaan",
  "8": "4. Diagnosa: Ansietas",
  "9": "9. Diagnosa: Peningkatan Koping Keluarga"
}

// Priority System (sesuai RULES_SKRINING.md)
const ESAS_PRIORITY_ORDER: string[] = [
  "6", // Prioritas 1: Pertanyaan 6 (Sesak/Pola Napas)
  "1", // Prioritas 2: Pertanyaan 1 (Nyeri)
  "4", // Prioritas 3: Pertanyaan 4 (Mual/Nausea)
  "5", // Prioritas 4: Pertanyaan 5 (Nafsu Makan)
  "3", // Prioritas 5: Pertanyaan 3 (Kantuk/Gangguan Tidur)
  "2", // Prioritas 6: Pertanyaan 2 (Lelah/Kekurangan Tenaga)
  "8", // Prioritas 7: Pertanyaan 8 (Cemas/Ansietas)
  "7", // Prioritas 8: Pertanyaan 7 (Sedih/Keputusasaan)
  "9"  // Prioritas 9: Pertanyaan 9 (Perasaan Keseluruhan)
]

// Intervensi Therapy Mapping (sesuai INTERVENSI.md)
const ESAS_INTERVENTION_MAPPING: Record<string, {
  therapyType: string
  interventionSteps: string[]
  references: string[]
}> = {
  "1": {
    therapyType: "Akupresur",
    interventionSteps: [
      "Cuci tangan sebelum melakukan tindakan.",
      "Pastikan area kulit yang akan ditekan bersih dan nyaman.",
      "Identifikasi titik akupresur sesuai keluhan nyeri.",
      "Lakukan teknik penekanan menggunakan ujung jari telunjuk atau ibu jari dengan tekanan lembut tapi mantap dan gerakan memutar kecil selama 1–2 menit.",
      "Ulangi penekanan sebanyak 2–3 kali sehari atau setiap kali nyeri muncul.",
      "Evaluasi respon pasien dengan mengamati ekspresi dan kenyamanan, serta hentikan bila pasien tampak tidak nyaman, pusing, atau mual."
    ],
    references: [
      "Yang, J., et al. (2021). Acupuncture for palliative cancer pain management: Systematic review. BMJ Supportive & Palliative Care, 11(3), 264–270."
    ]
  },
  "2": {
    therapyType: "Slow Deep Breathing (SDB)",
    interventionSteps: [
      "Ambil posisi duduk tegak atau berbaring telentang dengan nyaman.",
      "Letakkan kedua tangan di atas perut untuk merasakan gerakan napas.",
      "Tarik napas perlahan dan dalam melalui hidung selama 6 detik (rasakan perut mengembang).",
      "Tahan napas selama 6 detik.",
      "Hembuskan napas perlahan melalui mulut dengan mengerutkan bibir selama 6 detik (rasakan perut mengempis).",
      "Ulangi langkah-langkah ini secara berkesinambungan selama 15 menit, idealnya dua kali sehari (pagi dan sore)."
    ],
    references: [
      "Lumopa, C. C., & Basri, S. (2025). Implementasi Relaksasi Slow Deep Breathing Terhadap Kelelahan Pada Pasien Cronic Kidney Disease (CKD) Stage 5 On HD. Jurnal Kolaboratif Sains, 8(3), 6111-6119."
    ]
  },
  "3": {
    therapyType: "Aromaterapi Lavender",
    interventionSteps: [
      "Tentukan waktu yang tepat, idealnya 1 jam sebelum tidur.",
      "Siapkan ruangan tidur dalam kondisi gelap, suhu sedang, sirkulasi udara baik.",
      "Siapkan selembar kassa bersih ukuran 2 × 2 cm.",
      "Teteskan 2 tetes minyak esensial lavender ke tengah kassa.",
      "Tempelkan kassa di kerah pakaian sekitar 20 cm dari hidung.",
      "Hirup aroma lavender secara alami tanpa perlu menarik napas dalam.",
      "Setelah bangun pagi, lepaskan kassa dan simpan minyak dengan rapat."
    ],
    references: [
      "Jodie, F., et al. (2025). Effectiveness of music therapy, aromatherapy, and massage therapy in palliative care. Journal of Pain and Symptom Management, 69(5)."
    ]
  },
  "4": {
    therapyType: "Aromaterapi (Mawar, Jahe, Peppermint)",
    interventionSteps: [
      "Teteskan 1–2 tetes minyak esensial ke tisu, kapas, atau diffuser.",
      "Dekatkan ke hidung dengan jarak sekitar 10–15 cm.",
      "Hirup pelan-pelan selama 3–5 menit sambil duduk santai dengan napas biasa.",
      "Simpan minyak esensial di tempat tertutup dan aman setelah selesai.",
      "Alternatif: teteskan minyak ke air hangat dan hirup uapnya dari jarak ± 20 cm."
    ],
    references: [
      "Takasi P, et al. (2023). Effect of aromatherapy with rose essential oil on the nausea and vomiting in chemotherapy patients: a randomized controlled trial. Ann Med Surg (Lond), 86(1), 225-231."
    ]
  },
  "5": {
    therapyType: "Pijat Ringan/Sentuhan Terapeutik",
    interventionSteps: [
      "Lakukan pemijatan pada seluruh tubuh menggunakan 5 ml minyak nabati.",
      "Gunakan teknik usapan dan gosokan yang lembut selama 30 menit.",
      "Lakukan terapi ini tiga kali seminggu selama dua minggu (total enam kali)."
    ],
    references: [
      "Khamis, E. A. R., et al. (2023). Effectiveness of aromatherapy in early palliative care for oncology patients: Blind controlled study. Asian Pacific Journal of Cancer Prevention, 24(8), 2729–2739."
    ]
  },
  "6": {
    therapyType: "Latihan Napas Dalam dan Pijatan Lembut",
    interventionSteps: [
      "Pastikan ruangan bersih, tenang, dan bebas asap/debu.",
      "Duduk setengah tegak dengan dua bantal di belakang punggung.",
      "Pejamkan mata sejenak, rilekskan bahu, dan rasakan posisi nyaman.",
      "Mulai latihan napas dalam: tarik napas perlahan lewat hidung (4 detik), tahan (7 detik), hembuskan pelan lewat mulut (8 detik). Ulangi 3–5 kali.",
      "Lanjutkan dengan pijatan lembut menggunakan ujung jari pada bahu dan punggung atas selama 2 detik, ulangi 5 kali di tiap sisi dengan tekanan ringan.",
      "Perhatikan reaksi tubuh; hentikan jika pusing, batuk, atau sesak.",
      "Setelah selesai, duduk santai selama satu menit dan minum air putih hangat. Lakukan dua kali sehari atau saat sesak."
    ],
    references: [
      "Kushariyadi, et al. (2023). Combination Therapy Slow Deep Breathing and Acupressure to Overcome Ineffective Breathing Pattern Nursing Problems: A Case Study. Nursing and Health Sciences Journal, 3(3), 229–236."
    ]
  },
  "7": {
    therapyType: "Terapi HOPE",
    interventionSteps: [
      "Pastikan pasien berada di posisi yang nyaman dan tenang.",
      "Tanyakan perasaan yang sedang dirasakan (misalnya sedih, takut, marah).",
      "Tanyakan hal-hal yang membuat pasien merasa bahagia.",
      "Tanyakan tujuan sederhana yang ingin dan bisa dilakukan oleh pasien.",
      "Ajak berdoa bersama agar merasa lebih tenang.",
      "Minta pasien menutup mata dan mengucapkan kalimat penguat 'Saya kuat dan saya berarti' sambil tersenyum."
    ],
    references: [
      "Tidak ada referensi spesifik yang dicantumkan untuk bagian ini dalam teks asli"
    ]
  },
  "8": {
    therapyType: "Terapi Murottal",
    interventionSteps: [
      "Siapkan audio murottal dengan volume lembut (40–50 dB).",
      "Putar murottal dengan durasi 10–20 menit.",
      "Amati ekspresi wajah, frekuensi napas, tanda relaksasi, dan respon spiritual pasien.",
      "Berikan dukungan dan dampingi selama terapi.",
      "Setelah selesai, matikan audio dan beri waktu untuk tenang.",
      "Evaluasi menggunakan Skala nyeri NRS dan tingkat kecemasan, lalu dokumentasikan hasilnya."
    ],
    references: [
      "Muri Ambarwati, et al. (2025). Pengaruh Terapi Murrotal terhadap Tingkat Nyeri dan Kecemasan pada Pasien Pasca Tindakan Radiofrequency. Jurnal Ilmu Keperawatan dan Kebidanan (Protein), 3(4), 324-335."
    ]
  },
  "9": {
    therapyType: "Family Empowerment Session",
    interventionSteps: [
      "Orientasi dan Pengenalan (5 menit): Jelaskan tujuan kegiatan untuk saling memahami dan memperkuat dukungan.",
      "Latihan Pernapasan Bersama (5 menit): Pandu keluarga melakukan napas dalam (tarik 4 detik, tahan 2 detik, hembus 6 detik) sebanyak 5 kali.",
      "Sesi Refleksi Positif (10 menit): Ajak keluarga menjawab pertanyaan panduan secara bergantian.",
      "Doa atau Afirmasi Bersama (5 menit): Bacakan doa atau ucapkan afirmasi positif bersama-sama.",
      "Penutup dan Evaluasi Ringan (5 menit): Tanyakan perasaan setiap anggota dan catat perubahan emosi."
    ],
    references: [
      "Kementerian Kesehatan Republik Indonesia. (2018). Standar Intervensi Keperawatan Indonesia (SIKI).",
      "Astuti, R. W., & Wulandari, D. (2021). Efektivitas Terapi Relaksasi Pernapasan terhadap Penurunan Stres Keluarga Pasien Kronis. Jurnal Keperawatan Indonesia, 24(3), 180–189.",
      "Pratiwi, E., & Lestari, D. (2024). Family Empowerment in Nursing: A Systematic Review. Journal of Family Nursing Practice, 18(2), 145–159."
    ]
  }
}

export class ESASRuleEngine {
  /**
   * Process ESAS screening according to RULES_SKRINING.md
   */
  static processESASScreening(questions: ESASQuestions): ESASResult {
    // Validate input
    const validationResult = this.validateESASQuestions(questions)
    if (!validationResult.isValid) {
      throw new Error(`Data ESAS tidak valid: ${validationResult.errors.join(', ')}`)
    }

    // Find highest score
    const highestScore = Math.max(...Object.values(questions))

    // Find all questions with highest score (for tie handling)
    const questionsWithHighestScore = Object.entries(questions)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .filter(([_, score]) => score === highestScore)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .map(([question, _]) => question)

    // Determine primary question using priority system
    const primaryQuestion = this.determinePrimaryQuestion(questionsWithHighestScore, questions)

    // Determine risk level and action required
    const { riskLevel, actionRequired } = this.determineRiskLevelAndAction(highestScore)

    // Get intervention details
    const intervention = ESAS_INTERVENTION_MAPPING[primaryQuestion]
    const diagnosis = ESAS_DIAGNOSIS_MAPPING[primaryQuestion]

    // Determine priority level (inverse of priority order - lower number = higher priority)
    const priorityLevel = ESAS_PRIORITY_ORDER.indexOf(primaryQuestion) + 1

    return {
      highestScore,
      primaryQuestion: parseInt(primaryQuestion),
      riskLevel,
      actionRequired,
      diagnosis,
      therapyType: intervention.therapyType,
      interventionSteps: intervention.interventionSteps,
      references: intervention.references,
      priorityLevel
    }
  }

  /**
   * Validate ESAS questions structure and values
   */
  static validateESASQuestions(questions: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // Check if all 9 questions are present
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (let i = 1; i <= 9; i++) {
      const questionKey = i.toString()
      if (!(questionKey in questions)) {
        errors.push(`Pertanyaan ${i} tidak ada`)
        continue
      }

      const score = questions[questionKey]
      if (typeof score !== 'number' || isNaN(score)) {
        errors.push(`Pertanyaan ${i} harus berupa angka`)
      } else if (score < 0 || score > 10) {
        errors.push(`Pertanyaan ${i} harus antara 0-10`)
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Determine primary question using priority system for ties
   * Priority: Q6 > Q1 > Q4 > Q5 > Q3 > Q2 > Q8 > Q7 > Q9
   */
  static determinePrimaryQuestion(tiedQuestions: string[], allScores: ESASQuestions): string { // eslint-disable-line @typescript-eslint/no-unused-vars
    if (tiedQuestions.length === 1) {
      return tiedQuestions[0]
    }

    // Sort tied questions by priority order
    const sortedByPriority = tiedQuestions.sort((a, b) => {
      const priorityA = ESAS_PRIORITY_ORDER.indexOf(a)
      const priorityB = ESAS_PRIORITY_ORDER.indexOf(b)
      return priorityA - priorityB
    })

    return sortedByPriority[0]
  }

  /**
   * Determine risk level and action required based on highest score
   * According to RULES_SKRINING.md:
   * - Score 1-3: Show intervention mapping
   * - Score 4-6: "Hubungi/Temukan fasilitas kesehatan terdekat untuk evaluasi lebih lanjut"
   * - Score 7-10: "Segera rujuk ke Fasilitas Kesehatan atau Profesional untuk Penanganan Segera"
   */
  static determineRiskLevelAndAction(highestScore: number): {
    riskLevel: 'low' | 'medium' | 'high'
    actionRequired: string
  } {
    if (highestScore >= 1 && highestScore <= 3) {
      return {
        riskLevel: 'low',
        actionRequired: 'Intervensi terapi komplementer sesuai diagnosa keperawatan'
      }
    } else if (highestScore >= 4 && highestScore <= 6) {
      return {
        riskLevel: 'medium',
        actionRequired: 'Hubungi/Temukan fasilitas kesehatan terdekat untuk evaluasi lebih lanjut'
      }
    } else if (highestScore >= 7 && highestScore <= 10) {
      return {
        riskLevel: 'high',
        actionRequired: 'Segera rujuk ke Fasilitas Kesehatan atau Profesional untuk Penanganan Segera'
      }
    } else {
      // Default case for score 0
      return {
        riskLevel: 'low',
        actionRequired: 'Lanjutkan monitoring rutin'
      }
    }
  }

  /**
   * Get all ESAS questions with descriptions
   */
  static getESASQuestionsWithDescriptions(): Array<{
    number: string
    text: string
    description: string
  }> {
    return [
      { number: "1", text: "Nyeri", description: "Keluhan nyeri yang dialami saat ini" },
      { number: "2", text: "Lelah/Kekurangan Tenaga", description: "Keluhan lelah atau kekurangan tenaga" },
      { number: "3", text: "Kantuk/Gangguan Tidur", description: "Rasa kantuk atau sulit menahan kantuk" },
      { number: "4", text: "Mual/Nausea", description: "Keluhan mual atau rasa ingin muntah" },
      { number: "5", text: "Nafsu Makan", description: "Penurunan nafsu makan" },
      { number: "6", text: "Sesak/Pola Napas", description: "Keluhan sesak saat bernapas" },
      { number: "7", text: "Sedih/Keputusasaan", description: "Perasaan sedih, murung, atau kehilangan semangat" },
      { number: "8", text: "Cemas/Ansietas", description: "Perasaan cemas atau khawatir" },
      { number: "9", text: "Perasaan Keseluruhan", description: "Perasaan keseluruhan saat ini" }
    ]
  }

  /**
   * Get score level descriptions
   */
  static getScoreLevelDescription(score: number): { level: string; description: string } {
    if (score === 0) {
      return { level: "Tidak ada keluhan", description: "Pasien tidak mengalami keluhan pada gejala ini" }
    } else if (score >= 1 && score <= 3) {
      return { level: "Ringan", description: "Keluhan ringan yang tidak mengganggu aktivitas sehari-hari" }
    } else if (score >= 4 && score <= 6) {
      return { level: "Sedang", description: "Keluhan sedang yang mulai mengganggu aktivitas" }
    } else if (score >= 7 && score <= 10) {
      return { level: "Berat", description: "Keluhan berat yang memerlukan perhatian segera" }
    } else {
      return { level: "Tidak valid", description: "Skor tidak valid" }
    }
  }

  /**
   * Format screening result for database storage
   */
  static formatScreeningForDB(result: ESASResult, patientData: any, screeningType: string = 'initial'): {
    esas_data: any
    highest_score: number
    primary_question: number
    risk_level: string
    recommendation: any
    screening_type: string
    status: string
  } {
    return {
      esas_data: {
        identity: {
          name: patientData.name || patientData.patient_name,
          age: patientData.age || patientData.patient_age,
          gender: patientData.gender || patientData.patient_gender,
          facility_name: patientData.facility_name
        },
        questions: Object.entries(result.allScores).reduce((acc, [key, score]) => {
          acc[key] = {
            score,
            text: this.getESASQuestionsWithDescriptions().find(q => q.number === key)?.text,
            description: this.getScoreLevelDescription(score).level.toLowerCase()
          }
          return acc
        }, {} as any)
      },
      highest_score: result.highestScore,
      primary_question: result.primaryQuestion,
      risk_level: result.riskLevel,
      recommendation: {
        diagnosis: result.diagnosis,
        intervention_steps: result.interventionSteps,
        references: result.references,
        action_required: result.actionRequired,
        priority: result.priorityLevel,
        therapy_type: result.therapyType,
        frequency: this.getRecommendedFrequency(result.therapyType, result.riskLevel)
      },
      screening_type: screeningType,
      status: 'completed'
    }
  }

  /**
   * Get recommended frequency based on therapy type and risk level
   */
  static getRecommendedFrequency(therapyType: string, riskLevel: string): string {
    const frequencyMap: Record<string, Record<string, string>> = {
      "Akupresur": {
        low: "2-3 kali sehari saat nyeri muncul",
        medium: "3-4 kali sehari rutin",
        high: "4-5 kali sehari rutin"
      },
      "Aromaterapi Lavender": {
        low: "1 jam sebelum tidur",
        medium: "1 jam sebelum tidur + siang hari jika perlu",
        high: "Setiap 4-6 jam"
      },
      "Latihan Napas Dalam": {
        low: "Sehari sekali",
        medium: "Dua kali sehari",
        high: "Dua kali sehari + saat sesak"
      },
      default: {
        low: "Sesuai kebutuhan",
        medium: "2-3 kali seminggu",
        high: "Harian atau sesuai kebutuhan"
      }
    }

    return frequencyMap[therapyType]?.[riskLevel] || frequencyMap.default[riskLevel]
  }
}

// Helper function to get object values
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ObjectValues<T>(obj: Record<string, T>): T[] {
  return Object.keys(obj).map(key => obj[key])
}

export default ESASRuleEngine