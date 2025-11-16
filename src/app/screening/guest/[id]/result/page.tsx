import { notFound } from 'next/navigation'
import ESASScreeningResultContent from '@/components/guest-screening-result-content'

interface PageProps {
  params: { id: string }
  searchParams: { guest_id?: string }
}

export default async function GuestESASResultPage({ params, searchParams }: PageProps) {
  const { id } = params
  const { guest_id } = searchParams

  // Validate that guest_id is provided
  if (!guest_id) {
    notFound()
  }

  return (
    <div className="relative min-h-screen">
      <ESASScreeningResultContent screeningId={id} guestId={guest_id} />
    </div>
  )
}