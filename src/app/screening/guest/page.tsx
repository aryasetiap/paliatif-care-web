import HeaderNav from '@/components/ui/header-nav'
import ESASScreeningContent from '@/components/esas-screening-content'
import { SearchParamsWrapper } from '@/components/search-params-wrapper'

export default function GuestESASScreeningPage() {
  return (
    <div className="relative min-h-screen">
      <HeaderNav />
      <SearchParamsWrapper>
        <ESASScreeningContent isGuestMode={true} />
      </SearchParamsWrapper>
    </div>
  )
}