import { notFound } from 'next/navigation'
import ESASScreeningResultContent from '@/components/guest-screening-result-content'

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ guest_id?: string }>
}

export default async function GuestESASResultPage({ params, searchParams }: PageProps) {
  const { id } = await params
  const { guest_id } = await searchParams

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