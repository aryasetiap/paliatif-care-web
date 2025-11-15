'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EducationData, Disease } from '@/types/edukasi'
import educationData from '@/data/edukasi-penyakit-terminal.json'

interface SearchResult {
  disease: Disease
  matchedFields: string[]
  score: number
}

interface EducationSearchProps {
  onResultSelect?: (disease: Disease) => void
  className?: string
}

export default function EducationSearch({ onResultSelect, className = '' }: EducationSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const data = educationData as EducationData

  const searchDiseases = useCallback(
    (searchQuery: string): SearchResult[] => {
      if (!searchQuery.trim()) return []

      const queryLower = searchQuery.toLowerCase()
      const searchResults: SearchResult[] = []

      data.edukasi_penyakit_terminal.diseases.forEach((disease) => {
        const matchedFields: string[] = []
        let score = 0

        // Search in disease name
        if (disease.name.toLowerCase().includes(queryLower)) {
          matchedFields.push('Nama')
          score += 10
        }

        // Search in category
        if (disease.category.toLowerCase().includes(queryLower)) {
          matchedFields.push('Kategori')
          score += 5
        }

        // Search in definition
        if (typeof disease.definition === 'string') {
          if (disease.definition.toLowerCase().includes(queryLower)) {
            matchedFields.push('Definisi')
            score += 8
          }
        } else if (disease.definition && typeof disease.definition === 'object') {
          // For HIV/AIDS with object definition
          Object.values(disease.definition).forEach((def) => {
            if (typeof def === 'string' && def.toLowerCase().includes(queryLower)) {
              matchedFields.push('Definisi')
              score += 8
            }
          })
        }

        // Search in symptoms - PERBAIKAN UTAMA
        const searchInSymptoms = (symptoms: any) => {
          if (Array.isArray(symptoms)) {
            symptoms.forEach((symptom) => {
              // Pastikan symptom adalah string
              if (typeof symptom === 'string' && symptom.toLowerCase().includes(queryLower)) {
                matchedFields.push('Gejala')
                score += 6
              }
            })
          } else if (typeof symptoms === 'object' && symptoms !== null) {
            // Handle symptoms dengan format tahapan
            if ('tahapan' in symptoms && Array.isArray(symptoms.tahapan)) {
              symptoms.tahapan.forEach((tahapItem: any) => {
                if (
                  tahapItem &&
                  typeof tahapItem.gejala === 'string' &&
                  tahapItem.gejala.toLowerCase().includes(queryLower)
                ) {
                  matchedFields.push('Gejala')
                  score += 6
                }
                if (
                  tahapItem &&
                  typeof tahapItem.tahap === 'string' &&
                  tahapItem.tahap.toLowerCase().includes(queryLower)
                ) {
                  matchedFields.push('Gejala')
                  score += 6
                }
              })
            } else {
              // Handle symptoms dengan format utama/sisi_kiri/sisi_kanan
              Object.values(symptoms).forEach((symptomList: any) => {
                if (Array.isArray(symptomList)) {
                  symptomList.forEach((symptom: any) => {
                    if (typeof symptom === 'string' && symptom.toLowerCase().includes(queryLower)) {
                      matchedFields.push('Gejala')
                      score += 6
                    }
                  })
                }
              })
            }
          }
        }

        searchInSymptoms(disease.symptoms)

        // Search in causes
        if (Array.isArray(disease.causes)) {
          disease.causes.forEach((cause) => {
            if (typeof cause === 'string' && cause.toLowerCase().includes(queryLower)) {
              matchedFields.push('Penyebab')
              score += 7
            }
          })
        }

        // Search in risk factors
        const searchInRiskFactors = (riskFactors: any) => {
          if (Array.isArray(riskFactors)) {
            riskFactors.forEach((factor) => {
              if (typeof factor === 'string') {
                if (factor.toLowerCase().includes(queryLower)) {
                  matchedFields.push('Faktor Risiko')
                  score += 5
                }
              } else if (typeof factor === 'object' && factor !== null && 'faktor' in factor) {
                if (
                  typeof factor.faktor === 'string' &&
                  factor.faktor.toLowerCase().includes(queryLower)
                ) {
                  matchedFields.push('Faktor Risiko')
                  score += 5
                }
              }
            })
          } else if (typeof riskFactors === 'object' && riskFactors !== null) {
            Object.values(riskFactors).forEach((factorList: any) => {
              if (Array.isArray(factorList)) {
                factorList.forEach((factor: any) => {
                  if (typeof factor === 'string' && factor.toLowerCase().includes(queryLower)) {
                    matchedFields.push('Faktor Risiko')
                    score += 5
                  }
                })
              }
            })
          }
        }

        if (disease.risk_factors) {
          searchInRiskFactors(disease.risk_factors)
        }

        // Search in references
        if (Array.isArray(disease.references)) {
          disease.references.forEach((reference) => {
            if (typeof reference === 'string' && reference.toLowerCase().includes(queryLower)) {
              matchedFields.push('Referensi')
              score += 3
            }
          })
        }

        // Add to results if there are matches
        if (matchedFields.length > 0) {
          searchResults.push({
            disease,
            matchedFields: [...new Set(matchedFields)], // Remove duplicates
            score,
          })
        }
      })

      // Sort by score (descending)
      return searchResults.sort((a, b) => b.score - a.score)
    },
    [data]
  )

  useEffect(() => {
    if (query.trim()) {
      setIsSearching(true)
      const searchResults = searchDiseases(query)
      setResults(searchResults)
      setShowResults(searchResults.length > 0)
      setIsSearching(false)
    } else {
      setResults([])
      setShowResults(false)
    }
  }, [query, searchDiseases])

  const handleResultClick = (result: SearchResult) => {
    onResultSelect?.(result.disease)
    setShowResults(false)
    setQuery('')
  }

  const clearSearch = () => {
    setQuery('')
    setResults([])
    setShowResults(false)
  }

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-sky-500" />
        <Input
          type="text"
          placeholder="Cari penyakit, gejala, atau informasi kesehatan..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-10 bg-white/90 backdrop-blur-md border-sky-300 focus:border-blue-500 focus:ring-blue-500/20"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-sky-100"
          >
            <X className="h-4 w-4 text-sky-500" />
          </Button>
        )}
      </div>

      {/* Loading State */}
      {isSearching && (
        <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-white/95 backdrop-blur-md border border-sky-200 rounded-lg shadow-lg">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-sky-700">Mencari...</span>
          </div>
        </div>
      )}

      {/* Search Results */}
      {showResults && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-md border border-sky-200 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
          <div className="p-2">
            <div className="text-xs text-sky-600 font-medium px-3 py-2">
              {results.length} hasil ditemukan
            </div>
            {results.map((result, index) => (
              <Card
                key={`${result.disease.id}-${index}`}
                className="mb-2 cursor-pointer hover:bg-sky-50 transition-colors duration-200 border-sky-200"
                onClick={() => handleResultClick(result)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-sky-900 text-sm">{result.disease.name}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {result.disease.category}
                    </Badge>
                  </div>

                  {/* Matched Fields */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {result.matchedFields.map((field, fieldIndex) => (
                      <Badge
                        key={fieldIndex}
                        variant="outline"
                        className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                      >
                        {field}
                      </Badge>
                    ))}
                  </div>

                  {/* Preview */}
                  <p className="text-xs text-sky-600 line-clamp-2">
                    {typeof result.disease.definition === 'string'
                      ? result.disease.definition
                      : result.disease.definition.hiv}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {showResults && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-md border border-sky-200 rounded-lg shadow-lg p-4">
          <div className="text-center text-sky-600">
            <Search className="h-8 w-8 mx-auto mb-2 text-sky-400" />
            <p className="text-sm">Tidak ada hasil untuk &ldquo;{query}&rdquo;</p>
            <p className="text-xs mt-1">Coba kata kunci lain seperti: nyeri, diabetes, jantung</p>
          </div>
        </div>
      )}
    </div>
  )
}
