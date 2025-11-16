import HeaderNav from '@/components/ui/header-nav'
import ScreeningManagementContent from '@/components/admin-screening-management'
import { Footer } from '@/components/layout/footer'

export default function AdminScreeningsPage() {
  return (
    <div className="relative min-h-screen">
      <HeaderNav />
      <ScreeningManagementContent />
      <Footer />
    </div>
  )
}