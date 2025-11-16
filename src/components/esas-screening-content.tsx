'use client'

import ESASFormRouter from './esas-form-router'

interface ESASScreeningContentProps {
  isGuestMode?: boolean
}

export default function ESASScreeningContent({ isGuestMode = false }: ESASScreeningContentProps) {
  return <ESASFormRouter isGuestMode={isGuestMode} />
}