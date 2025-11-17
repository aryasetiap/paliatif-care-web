import { createClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { reason } = await request.json().catch(() => ({ reason: 'unknown' }))

    // Get current session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ message: 'No active session found' }, { status: 200 })
    }

    // Verify user exists before proceeding with logout
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(session.access_token)

    if (userError || !user) {
      // User doesn't exist but session is still active, clear it
      await supabase.auth.signOut({ scope: 'global' })
      return NextResponse.json(
        {
          message: 'Invalid session cleared',
          reason: reason || 'user_not_found',
          cleared: true,
        },
        { status: 200 }
      )
    }

    // Check if profile exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      // Profile doesn't exist, clear session
      await supabase.auth.signOut({ scope: 'global' })
      return NextResponse.json(
        {
          message: 'Invalid session cleared - no profile found',
          reason: reason || 'profile_not_found',
          cleared: true,
        },
        { status: 200 }
      )
    }

    // If we get here, session is valid, but we'll still honor the force logout request
    if (reason === 'manual_logout' || reason === 'user_request') {
      await supabase.auth.signOut({ scope: 'global' })
      return NextResponse.json(
        {
          message: 'User logged out successfully',
          reason: reason,
          cleared: true,
        },
        { status: 200 }
      )
    }

    return NextResponse.json(
      {
        message: 'Session is valid',
        reason: reason,
        cleared: false,
        user: {
          id: user.id,
          email: user.email,
          role: profile?.role,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        message: 'Error during force logout',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
