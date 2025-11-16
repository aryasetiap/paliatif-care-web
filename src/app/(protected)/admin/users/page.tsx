import HeaderNav from '@/components/ui/header-nav'
import UserManagementContent from '@/components/admin-user-management'
import { Footer } from '@/components/layout/footer'

export default function AdminUsersPage() {
  return (
    <div className="relative min-h-screen">
      <HeaderNav />
      <UserManagementContent />
      <Footer />
    </div>
  )
}