import HeaderNav from '@/components/ui/header-nav'
import DataExportContent from '@/components/admin-data-export'
import { Footer } from '@/components/layout/footer'

export default function AdminExportPage() {
  return (
    <div className="relative min-h-screen">
      <HeaderNav />
      <DataExportContent />
      <Footer />
    </div>
  )
}