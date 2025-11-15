// Intervention System - Structured data from INTERVENSI.md
// Provides comprehensive intervention recommendations with scientific references

export interface InterventionStep {
  id: string
  description: string
  duration?: string
  notes?: string
}

export interface InterventionReference {
  authors: string
  title: string
  journal: string
  year: number
  volume?: string
  pages?: string
  doi?: string
  url?: string
}

export interface Intervention {
  id: string
  diagnosisNumber: number
  diagnosisName: string
  therapyType: string
  description: string
  steps: InterventionStep[]
  frequency: string
  duration: string
  evaluationCriteria: string[]
  precautions: string[]
  references: InterventionReference[]
  esasQuestionNumber: number
  esasQuestionText: string
}

// Complete structured intervention data from INTERVENSI.md
export const INTERVENTIONS_DATA: Intervention[] = [
  {
    id: "intervention_1",
    diagnosisNumber: 1,
    diagnosisName: "Nyeri Kronis",
    therapyType: "Akupresur",
    description: "Terapi penekanan pada titik-titik akupresur untuk mengurangi keluhan nyeri",
    steps: [
      {
        id: "step_1_1",
        description: "Cuci tangan sebelum melakukan tindakan",
        notes: "Hygiene penting untuk mencegah infeksi"
      },
      {
        id: "step_1_2",
        description: "Pastikan area kulit yang akan ditekan bersih dan nyaman",
        notes: "Area harus bebas dari luka atau iritasi"
      },
      {
        id: "step_1_3",
        description: "Identifikasi titik akupresur sesuai keluhan nyeri",
        notes: "Titik akupresur berbeda untuk setiap jenis nyeri"
      },
      {
        id: "step_1_4",
        description: "Lakukan teknik penekanan menggunakan ujung jari telunjuk atau ibu jari dengan tekanan lembut tapi mantap dan gerakan memutar kecil selama 1–2 menit",
        duration: "1-2 menit per titik"
      },
      {
        id: "step_1_5",
        description: "Ulangi penekanan sebanyak 2–3 kali sehari atau setiap kali nyeri muncul",
        notes: "Frekuensi: 2-3 kali sehari"
      },
      {
        id: "step_1_6",
        description: "Evaluasi respon pasien dengan mengamati ekspresi dan kenyamanan, serta hentikan bila pasien tampak tidak nyaman, pusing, atau mual",
        notes: "Monitor respon pasien setiap sesi"
      }
    ],
    frequency: "2-3 kali sehari saat nyeri muncul",
    duration: "Sesuai kebutuhan",
    evaluationCriteria: [
      "Penurunan skala nyeri",
      "Ekspresi wajah lebih rileks",
      "Pasien melaporkan nyeri berkurang"
    ],
    precautions: [
      "Hentikan jika pasien merasa pusing atau mual",
      "Hindari area kulit dengan luka atau iritasi",
      "Tekanan harus lembut tapi mantap"
    ],
    references: [
      {
        authors: "Yang, J., Wahner-Roedler, D. L., Zhou, X., Johnson, L. A., Do, A., Pachman, D. R., Chon, T. Y., Salinas, M., Millstine, D., & Bauer, B. A.",
        title: "Acupuncture for palliative cancer pain management: Systematic review",
        journal: "BMJ Supportive & Palliative Care",
        year: 2021,
        volume: "11(3)",
        pages: "264-270",
        doi: "10.1136/bmjspcare-2020-002638",
        url: "https://doi.org/10.1136/bmjspcare-2020-002638"
      }
    ],
    esasQuestionNumber: 1,
    esasQuestionText: "Nyeri"
  },
  {
    id: "intervention_2",
    diagnosisNumber: 6,
    diagnosisName: "Intoleransi Aktivitas",
    therapyType: "Slow Deep Breathing (SDB)",
    description: "Teknik relaksasi pernapasan dalam untuk mengurangi kelelahan dan meningkatkan toleransi aktivitas",
    steps: [
      {
        id: "step_2_1",
        description: "Ambil posisi duduk tegak atau berbaring telentang dengan nyaman",
        notes: "Pastikan punggung lurus dan bahu rileks"
      },
      {
        id: "step_2_2",
        description: "Letakkan kedua tangan di atas perut untuk merasakan gerakan napas",
        notes: "Satu tangan di dada, satu tangan di perut"
      },
      {
        id: "step_2_3",
        description: "Tarik napas perlahan dan dalam melalui hidung selama 6 detik (rasakan perut mengembang)",
        duration: "6 detik inhalasi"
      },
      {
        id: "step_2_4",
        description: "Tahan napas selama 6 detik",
        duration: "6 detik menahan"
      },
      {
        id: "step_2_5",
        description: "Hembuskan napas perlahan melalui mulut dengan mengerutkan bibir selama 6 detik (rasakan perut mengempis)",
        duration: "6 detik ekskalsi"
      },
      {
        id: "step_2_6",
        description: "Ulangi langkah-langkah ini secara berkesinambungan selama 15 menit, idealnya dua kali sehari (pagi dan sore)",
        duration: "15 menit per sesi",
        notes: "Frekuensi: Dua kali sehari (pagi dan sore)"
      }
    ],
    frequency: "Dua kali sehari (pagi dan sore)",
    duration: "15 menit per sesi",
    evaluationCriteria: [
      "Pasien merasa lebih rileks",
      "Frekuensi napas menurun (16-20 napas/menit)",
      "Pasien melaporkan energi meningkat"
    ],
    precautions: [
      "Hentikan jika pusing atau sesak",
      "Lakukan di ruangan yang tenang dan nyaman",
      "Hindari melakukan langsung setelah makan besar"
    ],
    references: [
      {
        authors: "Lumopa, C. C., & Basri, S.",
        title: "Implementasi Relaksasi Slow Deep Breathing Terhadap Kelelahan Pada Pasien Cronic Kidney Disease (CKD) Stage 5 On HD Dengan Masalah Keperawatan Intoleransi Aktivitas di RSUD Undata Provinsi Sulawesi Tengah",
        journal: "Jurnal Kolaboratif Sains",
        year: 2025,
        volume: "8(3)",
        pages: "6111-6119"
      }
    ],
    esasQuestionNumber: 2,
    esasQuestionText: "Lelah/Kekurangan Tenaga"
  },
  {
    id: "intervention_3",
    diagnosisNumber: 2,
    diagnosisName: "Gangguan Pola Tidur",
    therapyType: "Aromaterapi Lavender",
    description: "Terapi aroma menggunakan minyak esensial lavender untuk meningkatkan kualitas tidur",
    steps: [
      {
        id: "step_3_1",
        description: "Tentukan waktu yang tepat, idealnya 1 jam sebelum tidur (misalnya pukul 21:30 jika tidur pukul 22:30)",
        notes: "Konsistensi waktu sangat penting"
      },
      {
        id: "step_3_2",
        description: "Siapkan ruangan tidur dalam kondisi gelap, suhu sedang, sirkulasi udara baik, dan jauhkan dari sumber wewangian lain",
        notes: "Lingkungan yang kondusif untuk tidur"
      },
      {
        id: "step_3_3",
        description: "Siapkan selembar kassa bersih ukuran 2 × 2 cm",
        notes: "Gunakan kassa steril atau bersih"
      },
      {
        id: "step_3_4",
        description: "Teteskan 2 tetes minyak esensial lavender ke tengah kassa (jangan langsung ke kulit)",
        notes: "Hindari kontak langsung dengan kulit"
      },
      {
        id: "step_3_5",
        description: "Tempelkan kassa di kerah pakaian (sekitar 20 cm dari hidung) menggunakan perekat atau klip kecil, pastikan nyaman dan tidak sesak",
        notes: "Jarak ideal untuk inhalasi yang efektif"
      },
      {
        id: "step_3_6",
        description: "Hirup aroma lavender secara alami tanpa perlu menarik napas dalam sambil bersiap tidur",
        notes: "Pernapasan normal saja"
      },
      {
        id: "step_3_7",
        description: "Setelah bangun pagi, lepaskan kassa dan buang ke tempat sampah tertutup",
        notes: "Kebersihan dan penggunaan sekali pakai"
      },
      {
        id: "step_3_8",
        description: "Simpan botol minyak dengan rapat di tempat sejuk, terlindung dari cahaya, dan jauh dari jangkauan anak-anak atau api",
        notes: "Penyimpanan yang aman"
      }
    ],
    frequency: "Setiap malam 1 jam sebelum tidur",
    duration: "Selama periode tidur",
    evaluationCriteria: [
      "Pasien lebih mudah tertidur",
      "Kualitas tidur meningkat",
      "Pasien merasa segar saat bangun"
    ],
    precautions: [
      "Hindari kontak langsung minyak dengan kulit",
      "Pastikan tidak ada alergi terhadap lavender",
      "Gunakan sesuai petunjuk, jangan berlebihan"
    ],
    references: [
      {
        authors: "Jodie, F., et al.",
        title: "Effectiveness of music therapy, aromatherapy, and massage therapy in palliative care in patients near end-of-life",
        journal: "Journal of Pain and Symptom Management",
        year: 2025,
        volume: "69(5)",
        url: "https://doi.org/10.1016/j.jpainsymman.2024.00903-5"
      }
    ],
    esasQuestionNumber: 3,
    esasQuestionText: "Kantuk/Gangguan Tidur"
  },
  {
    id: "intervention_4",
    diagnosisNumber: 5,
    diagnosisName: "Nausea",
    therapyType: "Aromaterapi (Mawar, Jahe, Peppermint)",
    description: "Terapi aroma menggunakan minyak esensial untuk mengurangi mual dan muntah",
    steps: [
      {
        id: "step_4_1",
        description: "Teteskan 1–2 tetes minyak esensial ke tisu, kapas, atau diffuser",
        notes: "Pilih salah satu jenis: mawar, jahe, atau peppermint"
      },
      {
        id: "step_4_2",
        description: "Dekatkan ke hidung dengan jarak sekitar 10–15 cm",
        notes: "Jarak aman untuk inhalasi"
      },
      {
        id: "step_4_3",
        description: "Hirup pelan-pelan selama 3–5 menit sambil duduk santai dengan napas biasa",
        duration: "3-5 menit"
      },
      {
        id: "step_4_4",
        description: "Simpan minyak esensial di tempat tertutup dan aman setelah selesai",
        notes: "Penyimpanan yang baik"
      },
      {
        id: "step_4_5",
        description: "Alternatif: teteskan minyak ke air hangat dan hirup uapnya dari jarak ± 20 cm, atau tempelkan tisu beraroma di bantal bagian samping",
        notes: "Berbagai metode aplikasi"
      }
    ],
    frequency: "Sesuai kebutuhan saat mual muncul",
    duration: "3-5 menit per sesi",
    evaluationCriteria: [
      "Skala mual berkurang",
      "Pasien tidak muntah",
      "Nafsu makan meningkat"
    ],
    precautions: [
      "Gunakan jumlah yang tepat, jangan berlebihan",
      "Hentikan jika iritasi terjadi",
      "Pastikan ventilasi ruangan baik"
    ],
    references: [
      {
        authors: "Takasi P, et al.",
        title: "Effect of aromatherapy with rose essential oil on the nausea and vomiting in chemotherapy patients: a randomized controlled trial",
        journal: "Ann Med Surg (Lond)",
        year: 2023,
        volume: "86(1)",
        pages: "225-231",
        doi: "10.1097/MS9.0000000000001395",
        url: "https://doi.org/10.1097/MS9.0000000000001395"
      }
    ],
    esasQuestionNumber: 4,
    esasQuestionText: "Mual/Nausea"
  },
  {
    id: "intervention_5",
    diagnosisNumber: 7,
    diagnosisName: "Resiko Defisit Nutrisi",
    therapyType: "Pijat Ringan/Sentuhan Terapeutik",
    description: "Terapi pijat lembut untuk meningkatkan nafsu makan dan relaksasi",
    steps: [
      {
        id: "step_5_1",
        description: "Lakukan pemijatan pada seluruh tubuh menggunakan 5 ml minyak nabati (seperti almond manis dengan tambahan minyak lavender)",
        notes: "Minyak almond manis + 2 tetes lavender"
      },
      {
        id: "step_5_2",
        description: "Gunakan teknik usapan dan gosokan yang lembut selama 30 menit",
        duration: "30 menit"
      },
      {
        id: "step_5_3",
        description: "Lakukan terapi ini tiga kali seminggu selama dua minggu (total enam kali)",
        duration: "30 menit per sesi",
        notes: "Frekuensi: 3 kali seminggu, total 6 sesi dalam 2 minggu"
      }
    ],
    frequency: "3 kali seminggu",
    duration: "30 menit per sesi, total 6 sesi dalam 2 minggu",
    evaluationCriteria: [
      "Nafsu makan meningkat",
      "Berat badan stabil atau meningkat",
      "Pasien merasa lebih rileks"
    ],
    precautions: [
      "Gunakan tekanan yang sangat lembut",
      "Hindari area dengan luka atau iritasi",
      "Pastikan pasien nyaman dengan sentuhan"
    ],
    references: [
      {
        authors: "Khamis, E. A. R., et al.",
        title: "Effectiveness of aromatherapy in early palliative care for oncology patients: Blind controlled study",
        journal: "Asian Pacific Journal of Cancer Prevention: APJCP",
        year: 2023,
        volume: "24(8)",
        pages: "2729-2739",
        doi: "10.31557/APJCP.2023.24.8.2729",
        url: "https://doi.org/10.31557/APJCP.2023.24.8.2729"
      }
    ],
    esasQuestionNumber: 5,
    esasQuestionText: "Nafsu Makan"
  },
  {
    id: "intervention_6",
    diagnosisNumber: 3,
    diagnosisName: "Pola Napas Tidak Efektif",
    therapyType: "Latihan Napas Dalam dan Pijatan Lembut",
    description: "Kombinasi terapi pernapasan dan pijatan untuk meningkatkan efektivitas pola napas",
    steps: [
      {
        id: "step_6_1",
        description: "Pastikan ruangan bersih, tenang, dan bebas asap/debu",
        notes: "Lingkungan yang bersih dan tenang"
      },
      {
        id: "step_6_2",
        description: "Duduk setengah tegak dengan dua bantal di belakang punggung",
        notes: "Posisi yang nyaman untuk pernapasan"
      },
      {
        id: "step_6_3",
        description: "Pejamkan mata sejenak, rilekskan bahu, dan rasakan posisi nyaman",
        notes: "Relaksasi awal"
      },
      {
        id: "step_6_4",
        description: "Mulai latihan napas dalam: tarik napas perlahan lewat hidung (4 detik), tahan (7 detik), hembuskan pelan lewat mulut (8 detik). Ulangi 3–5 kali",
        duration: "4 detik : 7 detik : 8 detik",
        notes: "Rasio 4:7:8 untuk relaksasi maksimal"
      },
      {
        id: "step_6_5",
        description: "Lanjutkan dengan pijatan lembut menggunakan ujung jari pada bahu dan punggung atas selama 2 detik, ulangi 5 kali di tiap sisi dengan tekanan ringan",
        duration: "2 detik per titik",
        notes: "Pijatan lembut pada area bahu dan punggung"
      },
      {
        id: "step_6_6",
        description: "Perhatikan reaksi tubuh; hentikan jika pusing, batuk, atau sesak",
        notes: "Monitor respon pasien"
      },
      {
        id: "step_6_7",
        description: "Setelah selesai, duduk santai selama satu menit dan minum air putih hangat bila diizinkan. Lakukan dua kali sehari atau saat sesak",
        duration: "1 menit istirahat",
        notes: "Frekuensi: Dua kali sehari atau saat sesak"
      }
    ],
    frequency: "Dua kali sehari atau saat sesak",
    duration: "10-15 menit per sesi",
    evaluationCriteria: [
      "Frekuensi napas normal (16-20 per menit)",
      "Pasien tidak melaporkan sesak",
      "Saturasi oksigen membaik"
    ],
    precautions: [
      "Hentikan jika muncul gejala pusing atau sesak",
      "Lakukan dengan tekanan sangat ringan",
      "Pastikan posisi duduk nyaman"
    ],
    references: [
      {
        authors: "Kushariyadi, Ufaidah, F. S., Rondhianto, & Candra, E. Y. S.",
        title: "Combination Therapy Slow Deep Breathing and Acupressure to Overcome Ineffective Breathing Pattern Nursing Problems: A Case Study",
        journal: "Nursing and Health Sciences Journal",
        year: 2023,
        volume: "3(3)",
        pages: "229-236",
        doi: "10.53713/nhsj.v3i3.289",
        url: "https://doi.org/10.53713/nhsj.v3i3.289"
      }
    ],
    esasQuestionNumber: 6,
    esasQuestionText: "Sesak/Pola Napas"
  },
  {
    id: "intervention_7",
    diagnosisNumber: 8,
    diagnosisName: "Keputusasaan",
    therapyType: "Terapi HOPE",
    description: "Terapi spiritual dan psikologis untuk meningkatkan harapan dan koping",
    steps: [
      {
        id: "step_7_1",
        description: "Pastikan pasien berada di posisi yang nyaman dan tenang",
        notes: "Lingkungan yang mendukung"
      },
      {
        id: "step_7_2",
        description: "Tanyakan perasaan yang sedang dirasakan (misalnya sedih, takut, marah)",
        notes: "Eksplorasi emosi"
      },
      {
        id: "step_7_3",
        description: "Tanyakan hal-hal yang membuat pasien merasa bahagia",
        notes: "Fokus pada hal positif"
      },
      {
        id: "step_7_4",
        description: "Tanyakan tujuan sederhana yang ingin dan bisa dilakukan oleh pasien",
        notes: "Tujuan yang realistis"
      },
      {
        id: "step_7_5",
        description: "Ajak berdoa bersama agar merasa lebih tenang",
        notes: "Dukungan spiritual"
      },
      {
        id: "step_7_6",
        description: "Minta pasien menutup mata dan mengucapkan kalimat penguat 'Saya kuat dan saya berarti' sambil tersenyum",
        notes: "Afirmasi positif"
      }
    ],
    frequency: "Sesuai kebutuhan psikologis",
    duration: "15-30 menit per sesi",
    evaluationCriteria: [
      "Pasien mengekspresikan perasaan",
      "Pasien menunjukkan minat pada aktivitas",
      "Pasien melaporkan perasaan lebih positif"
    ],
    precautions: [
      "Jangan memaksa pasien untuk berbicara",
      "Hormati keyakinan spiritual pasien",
      "Lakukan dengan pendekatan empati"
    ],
    references: [
      {
        authors: "Tidak ada referensi spesifik",
        title: "Berdasarkan praktik keperawatan spiritual",
        journal: "-",
        year: 2024
      }
    ],
    esasQuestionNumber: 7,
    esasQuestionText: "Sedih/Keputusasaan"
  },
  {
    id: "intervention_8",
    diagnosisNumber: 4,
    diagnosisName: "Ansietas",
    therapyType: "Terapi Murottal",
    description: "Terapi spiritual dengan audio Al-Qur'an untuk mengurangi kecemasan",
    steps: [
      {
        id: "step_8_1",
        description: "Siapkan audio murottal dengan volume lembut (40–50 dB)",
        notes: "Volume yang nyaman, tidak terlalu keras"
      },
      {
        id: "step_8_2",
        description: "Putar murottal dengan durasi 10–20 menit",
        duration: "10-20 menit"
      },
      {
        id: "step_8_3",
        description: "Amati ekspresi wajah, frekuensi napas, tanda relaksasi, dan respon spiritual pasien",
        notes: "Monitor respon fisik dan spiritual"
      },
      {
        id: "step_8_4",
        description: "Berikan dukungan dan dampingi selama terapi",
        notes: "Kehadiran pendamping penting"
      },
      {
        id: "step_8_5",
        description: "Setelah selesai, matikan audio dan beri waktu untuk tenang",
        notes: "Periode integrasi"
      },
      {
        id: "step_8_6",
        description: "Evaluasi menggunakan Skala nyeri NRS dan tingkat kecemasan, lalu dokumentasikan hasilnya",
        notes: "Evaluasi objektif"
      }
    ],
    frequency: "Sesuai kebutuhan saat cemas berlebihan",
    duration: "10-20 menit per sesi",
    evaluationCriteria: [
      "Skala kecemasan menurun",
      "Frekuensi napas normal",
      "Pasien terlihat lebih tenang"
    ],
    precautions: [
      "Pastikan pasien nyaman dengan konten spiritual",
      "Hormati preferensi religius pasien",
      "Monitor respon pasien selama terapi"
    ],
    references: [
      {
        authors: "Muri Ambarwati, Indah Sri Wahyuningsih, Mohammad Arifin Noor",
        title: "Pengaruh Terapi Murrotal terhadap Tingkat Nyeri dan Kecemasan pada Pasien Pasca Tindakan Radiofrequency",
        journal: "Jurnal Ilmu Keperawatan dan Kebidanan (Protein)",
        year: 2025,
        volume: "3(4)",
        pages: "324-335",
        doi: "10.61132/protein.v3i4.1752",
        url: "https://doi.org/10.61132/protein.v3i4.1752"
      }
    ],
    esasQuestionNumber: 8,
    esasQuestionText: "Cemas/Ansietas"
  },
  {
    id: "intervention_9",
    diagnosisNumber: 9,
    diagnosisName: "Peningkatan Koping Keluarga",
    therapyType: "Family Empowerment Session",
    description: "Sesi empowering keluarga untuk meningkatkan koping kolektif",
    steps: [
      {
        id: "step_9_1",
        description: "Orientasi dan Pengenalan (5 menit): Jelaskan tujuan kegiatan untuk saling memahami dan memperkuat dukungan",
        duration: "5 menit"
      },
      {
        id: "step_9_2",
        description: "Latihan Pernapasan Bersama (5 menit): Pandu keluarga melakukan napas dalam (tarik 4 detik, tahan 2 detik, hembus 6 detik) sebanyak 5 kali sambil memejamkan mata",
        duration: "5 menit",
        notes: "Rasio 4:2:6 untuk relaksasi keluarga"
      },
      {
        id: "step_9_3",
        description: "Sesi Refleksi Positif (10 menit): Ajak keluarga menjawab pertanyaan panduan secara bergantian mengenai hal terbaik hari ini, rasa syukur terhadap keluarga, dan keinginan untuk saling mendukung",
        duration: "10 menit",
        notes: "Diskusi terstruktur dengan panduan"
      },
      {
        id: "step_9_4",
        description: "Doa atau Afirmasi Bersama (5 menit): Bacakan doa atau ucapkan afirmasi positif bersama-sama",
        duration: "5 menit",
        notes: "Dukungan spiritual bersama"
      },
      {
        id: "step_9_5",
        description: "Penutup dan Evaluasi Ringan (5 menit): Tanyakan perasaan setiap anggota dan catat perubahan emosi serta dinamika keluarga",
        duration: "5 menit",
        notes: "Evaluasi proses dan hasil"
      }
    ],
    frequency: "Sesuai kebutuhan keluarga",
    duration: "30 menit per sesi",
    evaluationCriteria: [
      "Keluarga dapat mengekspresikan perasaan",
      "Komunikasi keluarga meningkat",
      "Keluarga menunjukkan koping yang lebih baik"
    ],
    precautions: [
      "Ciptakan lingkungan yang aman dan terbuka",
      "Hormati semua pendapat anggota keluarga",
      "Fasilitator harus netral dan supportif"
    ],
    references: [
      {
        authors: "Kementerian Kesehatan Republik Indonesia",
        title: "Standar Intervensi Keperawatan Indonesia (SIKI)",
        journal: "Kementerian Kesehatan RI",
        year: 2018
      },
      {
        authors: "Astuti, R. W., & Wulandari, D.",
        title: "Efektivitas Terapi Relaksasi Pernapasan terhadap Penurunan Stres Keluarga Pasien Kronis",
        journal: "Jurnal Keperawatan Indonesia",
        year: 2021,
        volume: "24(3)",
        pages: "180-189"
      },
      {
        authors: "Pratiwi, E., & Lestari, D.",
        title: "Family Empowerment in Nursing: A Systematic Review on Coping and Adaptation Improvement",
        journal: "Journal of Family Nursing Practice",
        year: 2024,
        volume: "18(2)",
        pages: "145-159",
        doi: "10.1016/j.jfnp.2024.05.007",
        url: "https://doi.org/10.1016/j.jfnp.2024.05.007"
      }
    ],
    esasQuestionNumber: 9,
    esasQuestionText: "Perasaan Keseluruhan"
  }
]

// Intervention Engine - Provides recommendation based on ESAS results
export class InterventionEngine {
  /**
   * Get intervention by ESAS question number
   */
  static getInterventionByESASQuestion(questionNumber: number): Intervention | null {
    return INTERVENTIONS_DATA.find(
      intervention => intervention.esasQuestionNumber === questionNumber
    ) || null
  }

  /**
   * Get intervention by therapy type
   */
  static getInterventionByTherapyType(therapyType: string): Intervention | null {
    return INTERVENTIONS_DATA.find(
      intervention => intervention.therapyType === therapyType
    ) || null
  }

  /**
   * Get all interventions
   */
  static getAllInterventions(): Intervention[] {
    return INTERVENTIONS_DATA
  }

  /**
   * Get intervention recommendations based on ESAS results
   */
  static getRecommendationsFromESASResult(esasResult: {
    primaryQuestion: number
    highestScore: number
    riskLevel: 'low' | 'medium' | 'high'
  }): {
    primaryIntervention: Intervention | null
    frequencyRecommendation: string
    additionalNotes: string[]
    urgencyLevel: 'low' | 'medium' | 'high'
  } {
    const primaryIntervention = this.getInterventionByESASQuestion(esasResult.primaryQuestion)

    let frequencyRecommendation = ""
    let additionalNotes: string[] = []
    let urgencyLevel: 'low' | 'medium' | 'high' = 'low'

    // Determine frequency and urgency based on risk level
    switch (esasResult.riskLevel) {
      case 'high':
        frequencyRecommendation = "Implementasi segera, evaluasi harian"
        urgencyLevel = 'high'
        additionalNotes = [
          "Monitor ketat respon pasien",
          "Koordinasi dengan tim kesehatan",
          "Evaluasi dalam 24 jam",
          "Pertimbangkan konsultasi medis jika tidak ada perbaikan"
        ]
        break
      case 'medium':
        frequencyRecommendation = "Implementasi rutin, evaluasi mingguan"
        urgencyLevel = 'medium'
        additionalNotes = [
          "Jadwalkan evaluasi dalam 1 minggu",
          "Monitor perkembangan gejala",
          "Edukasi pasien dan keluarga"
        ]
        break
      case 'low':
        frequencyRecommendation = "Implementasi sesuai kebutuhan, evaluasi bulanan"
        urgencyLevel = 'low'
        additionalNotes = [
          "Implementasi sebagai terapi suportif",
          "Monitor kebutuhan pasien",
          "Edukasi untuk deteksi dini perubahan gejala"
        ]
        break
    }

    // Add score-specific recommendations
    if (esasResult.highestScore >= 7) {
      additionalNotes.push("Segera rujuk ke fasilitas kesehatan untuk evaluasi medis")
    } else if (esasResult.highestScore >= 4) {
      additionalNotes.push("Hubungi fasilitas kesehatan untuk evaluasi lebih lanjut")
    }

    return {
      primaryIntervention,
      frequencyRecommendation,
      additionalNotes,
      urgencyLevel
    }
  }

  /**
   * Format intervention for display
   */
  static formatInterventionForDisplay(intervention: Intervention): {
    title: string
    description: string
    stepsSummary: string[]
    keyPoints: string[]
    references: string[]
  } {
    return {
      title: `${intervention.diagnosisNumber}. ${intervention.diagnosisName} - ${intervention.therapyType}`,
      description: intervention.description,
      stepsSummary: intervention.steps.map(step => step.description),
      keyPoints: [
        `Frekuensi: ${intervention.frequency}`,
        `Durasi: ${intervention.duration}`,
        `Evaluasi: ${intervention.evaluationCriteria.join(', ')}`
      ],
      references: intervention.references.map(ref =>
        `${ref.authors} (${ref.year}). ${ref.title}. ${ref.journal}${ref.volume ? ', ' + ref.volume : ''}${ref.pages ? ', ' + ref.pages : ''}.`
      )
    }
  }

  /**
   * Get interventions grouped by therapy type
   */
  static getInterventionsByTherapyType(): Record<string, Intervention[]> {
    const grouped: Record<string, Intervention[]> = {}

    INTERVENTIONS_DATA.forEach(intervention => {
      if (!grouped[intervention.therapyType]) {
        grouped[intervention.therapyType] = []
      }
      grouped[intervention.therapyType].push(intervention)
    })

    return grouped
  }

  /**
   * Search interventions by keyword
   */
  static searchInterventions(keyword: string): Intervention[] {
    const lowerKeyword = keyword.toLowerCase()
    return INTERVENTIONS_DATA.filter(intervention =>
      intervention.diagnosisName.toLowerCase().includes(lowerKeyword) ||
      intervention.therapyType.toLowerCase().includes(lowerKeyword) ||
      intervention.description.toLowerCase().includes(lowerKeyword) ||
      intervention.esasQuestionText.toLowerCase().includes(lowerKeyword)
    )
  }
}

export default InterventionEngine