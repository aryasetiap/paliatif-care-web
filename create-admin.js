const { createClient } = require('@supabase/supabase-js')

// Ganti dengan credentials Anda
const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseServiceKey = 'YOUR_SUPABASE_SERVICE_KEY'

console.log('🔑 Please update your Supabase credentials in this script')
console.log('📝 Edit supabaseUrl and supabaseServiceKey variables above')
console.log('')

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createAdmin() {
  try {
    // Create user in auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@paliatifcare.com',
      password: 'Admin123!@#',
      email_confirm: true,
      user_metadata: {
        full_name: 'System Administrator'
      }
    })

    if (authError) {
      console.error('Error creating auth user:', authError)
      return
    }

    console.log('Auth user created:', authData.user.id)

    // Create profile entry
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: authData.user.id,
          full_name: 'System Administrator',
          role: 'admin'
        }
      ])

    if (profileError) {
      console.error('Error creating profile:', profileError)
      return
    }

    console.log('✅ Admin account created successfully!')
    console.log('📧 Email: admin@paliatifcare.com')
    console.log('🔑 Password: Admin123!@#')
    console.log('🌐 Login URL: http://localhost:3001/login')

  } catch (error) {
    console.error('Error:', error)
  }
}

createAdmin()