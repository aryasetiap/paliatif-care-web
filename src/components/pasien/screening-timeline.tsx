'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Activity,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  FileText,
  Download,
  AlertTriangle,
  CheckCircle,
  Timer,
  Heart,
  Brain,
  Lung,
  Stomach,
  Eye,
  Frown,
  Meh,
  Smile
} from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { type PatientWithScreenings } from '@/lib/patient-management-index'

interface ScreeningTimelineProps {
  patient: PatientWithScreenings
  compact?: boolean
}

interface TimelineEntry {
  id: string
  date: string
  type: 'screening' | 'follow-up' | 'milestone'
  title: string
  description: string
  data: any
  status: 'completed' | 'in-progress' | 'scheduled'
}

export function ScreeningTimeline({ patient, compact = false }: ScreeningTimelineProps) {
  const [selectedView, setSelectedView] = useState<'timeline' | 'progression'>('timeline')

  // Process screenings into timeline entries
  const timelineEntries: TimelineEntry[] = patient.screenings
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .map((screening) => ({
      id: screening.id,
      date: screening.created_at,
      type: screening.screening_type === 'initial' ? 'screening' : 'follow-up' as const,
      title: screening.screening_type === 'initial' ? 'Screening Awal' : 'Follow-up Screening',
      description: `Skor tertinggi: ${screening.highest_score}/10 • Risiko: ${screening.risk_level}`,
      data: screening,
      status: 'completed' as const,
    }))

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getRiskLevelText = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical':
        return 'Kritis'
      case 'high':
        return 'Tinggi'
      case 'medium':
        return 'Sedang'
      case 'low':
        return 'Rendah'
      default:
        return 'Tidak Diketahui'
    }
  }

  const getESASIcon = (questionNumber: number) => {
    const icons = {
      1: <Heart className="h-4 w-4" />, // Nyeri
      2: <Activity className="h-4 w-4" />, // Lelah
      3: <Brain className="h-4 w-4" />, // Tidur
      4: <Stomach className="h-4 w-4" />, // Mual
      5: <Stomach className="h-4 w-4" />, // Nafsu Makan
      6: <Lung className="h-4 w-4" />, // Sesak
      7: <Frown className="h-4 w-4" />, // Sedih
      8: <Meh className="h-4 w-4" />, // Cemas
      9: <Smile className="h-4 w-4" />, // Perasaan
    }
    return icons[questionNumber as keyof typeof icons] || <Activity className="h-4 w-4" />
  }

  const getScoreColor = (score: number) => {
    if (score <= 3) return 'text-green-600 bg-green-50'
    if (score <= 6) return 'text-yellow-600 bg-yellow-50'
    if (score <= 8) return 'text-orange-600 bg-orange-50'
    return 'text-red-600 bg-red-50'
  }

  const getScoreEmoji = (score: number) => {
    if (score <= 3) return '😊'
    if (score <= 6) return '😐'
    if (score <= 8) return '😟'
    return '😢'
  }

  const calculateTrend = (currentScore: number, previousScore?: number) => {
    if (!previousScore) return 'stable'
    if (currentScore < previousScore) return 'improving'
    if (currentScore > previousScore) return 'declining'
    return 'stable'
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-3 w-3 text-green-500" />
      case 'declining':
        return <TrendingDown className="h-3 w-3 text-red-500" />
      default:
        return <Minus className="h-3 w-3 text-gray-400" />
    }
  }

  const getESASQuestionText = (questionNumber: number) => {
    const questions = {
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
    return questions[questionNumber as keyof typeof questions] || 'Pertanyaan'
  }

  if (compact) {
    return (
      <Card className="bg-white/80 backdrop-blur-md border-sky-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg text-sky-900">
            <Clock className="h-5 w-5" />
            Riwayat Screening Terkini
          </CardTitle>
        </CardHeader>
        <CardContent>
          {timelineEntries.length === 0 ? (
            <div className="text-center py-6">
              <Activity className="h-12 w-12 mx-auto mb-3 text-sky-400" />
              <h3 className="text-lg font-semibold text-sky-900 mb-2">Belum Ada Screening</h3>
              <p className="text-sky-600 text-sm mb-4">
                Mulai dengan melakukan screening ESAS untuk pasien ini
              </p>
              <Button asChild className="w-full">
                <Link href={`/screening/new?patient=${patient.id}`}>
                  <Activity className="mr-2 h-4 w-4" />
                  Screening Pertama
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {timelineEntries.slice(0, 3).map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${
                    entry.type === 'screening' ? 'bg-blue-500' : 'bg-purple-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-sky-900 text-sm">{entry.title}</h4>
                      <Badge className={`text-xs ${getRiskLevelColor(entry.data.risk_level)}`}>
                        {getRiskLevelText(entry.data.risk_level)}
                      </Badge>
                    </div>
                    <p className="text-xs text-sky-600 mb-1">
                      {new Date(entry.date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    <p className="text-xs text-sky-700">{entry.description}</p>
                  </div>
                </motion.div>
              ))}

              {timelineEntries.length > 3 && (
                <div className="text-center pt-2">
                  <Button variant="outline" size="sm" asChild className="border-sky-300 text-sky-700 hover:bg-sky-50">
                    <Link href={`/pasien/${patient.id}`}>
                      Lihat Semua ({timelineEntries.length} screening)
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white/80 backdrop-blur-md border-sky-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl text-sky-900">
          <Clock className="h-6 w-6" />
          Timeline Riwayat Screening
        </CardTitle>
      </CardHeader>
      <CardContent>
        {timelineEntries.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-16 w-16 mx-auto mb-4 text-sky-400" />
            <h3 className="text-xl font-semibold text-sky-900 mb-2">Belum Ada Screening</h3>
            <p className="text-sky-600 mb-6">
              Mulai dengan melakukan screening ESAS untuk pasien ini
            </p>
            <Button asChild>
              <Link href={`/screening/new?patient=${patient.id}`}>
                <Activity className="mr-2 h-4 w-4" />
                Screening Pertama
              </Link>
            </Button>
          </div>
        ) : (
          <Tabs value={selectedView} onValueChange={(value) => setSelectedView(value as any)}>
            <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-md border border-sky-200">
              <TabsTrigger value="timeline" className="data-[state=active]:bg-sky-100">
                <Clock className="mr-2 h-4 w-4" />
                Timeline
              </TabsTrigger>
              <TabsTrigger value="progression" className="data-[state=active]:bg-sky-100">
                <TrendingUp className="mr-2 h-4 w-4" />
                Progress Gejala
              </TabsTrigger>
            </TabsList>

            <TabsContent value="timeline" className="mt-6">
              <div className="space-y-6">
                {timelineEntries.map((entry, index) => {
                  const previousEntry = index < timelineEntries.length - 1 ? timelineEntries[index + 1] : null
                  const trend = previousEntry ? calculateTrend(entry.data.highest_score, previousEntry.data.highest_score) : 'stable'

                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative"
                    >
                      {/* Timeline Line */}
                      {index < timelineEntries.length - 1 && (
                        <div className="absolute left-6 top-12 w-0.5 h-full bg-sky-200" />
                      )}

                      <div className="flex gap-4">
                        {/* Timeline Dot */}
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                          entry.type === 'screening'
                            ? 'bg-blue-500 text-white'
                            : 'bg-purple-500 text-white'
                        }`}>
                          {entry.type === 'screening' ? (
                            <Activity className="h-6 w-6" />
                          ) : (
                            <Timer className="h-6 w-6" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 pb-8">
                          <Card className="bg-white/60 backdrop-blur-sm border-sky-200">
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-semibold text-sky-900">{entry.title}</h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Calendar className="h-4 w-4 text-sky-500" />
                                    <span className="text-sm text-sky-600">
                                      {new Date(entry.date).toLocaleString('id-ID')}
                                    </span>
                                    {index === 0 && (
                                      <Badge variant="outline" className="text-xs border-green-200 text-green-700">
                                        Terbaru
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {getTrendIcon(trend)}
                                  <Badge className={getRiskLevelColor(entry.data.risk_level)}>
                                    {getRiskLevelText(entry.data.risk_level)}
                                  </Badge>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                {/* Overall Score */}
                                <div className="flex items-center justify-between p-3 bg-sky-50/50 rounded-lg">
                                  <div className="flex items-center gap-3">
                                    <span className="text-2xl font-bold text-sky-900">
                                      {entry.data.highest_score}/10
                                    </span>
                                    <span className="text-sm text-sky-600">
                                      Skor Tertinggi • Pertanyaan {entry.data.primary_question}
                                    </span>
                                  </div>
                                  <span className="text-lg">
                                    {getScoreEmoji(entry.data.highest_score)}
                                  </span>
                                </div>

                                {/* ESAS Scores Grid */}
                                {entry.data.esas_data?.questions && (
                                  <div className="grid grid-cols-3 md:grid-cols-9 gap-2">
                                    {Object.entries(entry.data.esas_data.questions).map(([qNum, qData]: [string, any]) => (
                                      <div
                                        key={qNum}
                                        className={`p-2 rounded-lg border text-center ${getScoreColor(qData.score)}`}
                                      >
                                        <div className="flex items-center justify-center mb-1">
                                          {getESASIcon(parseInt(qNum))}
                                        </div>
                                        <div className="font-semibold text-sm">{qData.score}</div>
                                        <div className="text-xs opacity-75">Q{qNum}</div>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-2 pt-2">
                                  <Button variant="outline" size="sm" asChild className="border-sky-300 text-sky-700 hover:bg-sky-50">
                                    <Link href={`/screening/${entry.id}/result`}>
                                      <FileText className="mr-1 h-3 w-3" />
                                      Lihat Detail
                                    </Link>
                                  </Button>
                                  <Button variant="outline" size="sm" asChild className="border-sky-300 text-sky-700 hover:bg-sky-50">
                                    <Link href={`/screening/new?patient=${patient.id}&followup=${entry.id}`}>
                                      <Activity className="mr-1 h-3 w-3" />
                                      Follow-up
                                    </Link>
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </TabsContent>

            <TabsContent value="progression" className="mt-6">
              <div className="space-y-4">
                {timelineEntries.length > 1 ? (
                  // Show symptom progression over time
                  [1, 2, 3, 4, 5, 6, 7, 8, 9].map((questionNum) => {
                    const questionData = timelineEntries.map(entry => ({
                      date: entry.date,
                      score: entry.data.esas_data?.questions?.[questionNum]?.score || 0,
                    })).reverse()

                    const firstScore = questionData[0]?.score
                    const lastScore = questionData[questionData.length - 1]?.score
                    const trend = calculateTrend(lastScore, firstScore)

                    return (
                      <Card key={questionNum} className="bg-white/60 backdrop-blur-sm border-sky-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              {getESASIcon(questionNum)}
                              <h4 className="font-medium text-sky-900">
                                {getESASQuestionText(questionNum)}
                              </h4>
                            </div>
                            <div className="flex items-center gap-2">
                              {getTrendIcon(trend)}
                              <span className="text-sm font-medium text-sky-900">
                                {firstScore} → {lastScore}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {questionData.map((data, index) => (
                              <div key={index} className="flex-1 text-center">
                                <div className={`h-8 rounded ${getScoreColor(data.score)} flex items-center justify-center font-semibold text-sm`}>
                                  {data.score}
                                </div>
                                <div className="text-xs text-sky-600 mt-1">
                                  {new Date(data.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })
                ) : (
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 mx-auto mb-3 text-sky-400" />
                    <h3 className="text-lg font-semibold text-sky-900 mb-2">Belum Cukup Data</h3>
                    <p className="text-sky-600 text-sm">
                      Diperlukan minimal 2 screening untuk melihat progress gejala
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}