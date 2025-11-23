import HeaderNav from '@/components/ui/header-nav'
import PatientManagementContent from '@/components/admin-patient-management-simple'
import { Footer } from '@/components/layout/footer'

export default function AdminPatientsPage() {
  return (
    <div className="relative min-h-screen">
      <HeaderNav />
      <PatientManagementContent />
      <Footer />
    </div>
  )
}