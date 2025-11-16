import ESASFormRouter from '@/components/esas-form-router'
import HeaderNav from '@/components/ui/header-nav'
import { Footer } from '@/components/layout/footer'

export default function TestESASFormsPage() {
  return (
    <div className="relative min-h-screen">
      <HeaderNav />
      <div className="py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Test ESAS Form Variations</h1>
            <p className="text-gray-600">Halaman untuk testing berbagai variasi form ESAS</p>
          </div>

          <div className="grid gap-8">
            {/* Guest Form Test */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-blue-600">Guest Mode Form</h2>
              <div className="border-2 border-blue-200 rounded-lg p-4">
                <ESASFormRouter isGuestMode={true} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}