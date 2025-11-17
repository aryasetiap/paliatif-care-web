import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function POST() {
  try {
    const supabase = createClient()

    // Force sign out all sessions
    await supabase.auth.signOut({ scope: 'global' })

    return NextResponse.json({
      success: true,
      message: 'Session cleared successfully'
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to clear session',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET method for quick clearing via browser
export async function GET() {
  return POST()
}