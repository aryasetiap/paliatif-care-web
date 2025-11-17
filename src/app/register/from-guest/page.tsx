import HeaderNav from '@/components/ui/header-nav'
import GuestRegistrationFlow from '@/components/guest-registration-flow'
import { Footer } from '@/components/layout/footer'
import { createClient } from '@/lib/supabase'
import { notFound } from 'next/navigation'

interface PageProps {
  searchParams: Promise<{
    guest_id?: string
    screening_id?: string
  }>
}

export default async function GuestRegistrationPage({ searchParams }: PageProps) {
  const { guest_id, screening_id } = await searchParams

  // Validate guest identifier
  if (!guest_id) {
    notFound()
  }

  // Optional: Fetch screening data to pre-fill registration form
  let screeningData = null
  if (screening_id) {
    try {
      const supabase = createClient()
      const { data: screening } = await supabase
        .from('screenings')
        .select('esas_data')
        .eq('id', screening_id)
        .eq('guest_identifier', guest_id)
        .single()

      if (screening) {
        screeningData = screening.esas_data
      }
    } catch {
      // Continue without screening data
    }
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <HeaderNav />
      <div className="py-8 min-h-screen flex items-center">
        <GuestRegistrationFlow
          guestIdentifier={guest_id}
          screeningData={screeningData}
        />
      </div>
      <Footer />
    </div>
  )
}