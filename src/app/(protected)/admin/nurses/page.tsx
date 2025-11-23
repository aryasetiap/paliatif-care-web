import HeaderNav from '@/components/ui/header-nav'
import NurseManagementContent from '@/components/admin-nurse-management-simple'
import { Footer } from '@/components/layout/footer'

export default function AdminNursesPage() {
  return (
    <div className="relative min-h-screen">
      <HeaderNav />
      <NurseManagementContent />
      <Footer />
    </div>
  )
}