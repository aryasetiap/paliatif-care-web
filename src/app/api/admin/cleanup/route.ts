import { createClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'
import { withAuthApi } from '@/lib/apiWrapper'

export const POST = withAuthApi(async (_request: NextRequest) => {
  try {
    const supabase = createClient()

    // Get current user and verify admin role
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError) {
      return NextResponse.json({
        error: 'Authentication required',
        message: 'You must be logged in to perform this action'
      }, { status: 401 })
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user?.id)
      .single()

    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json({
        error: 'Access denied',
        message: 'Admin access required for this operation'
      }, { status: 403 })
    }

    // Execute cleanup function
    const { error: cleanupError } = await supabase
      .rpc('cleanup_old_guest_screenings')

    if (cleanupError) {
      return NextResponse.json({
        error: 'Cleanup failed',
        message: 'Failed to clean up old guest data'
      }, { status: 500 })
    }

    // Get metrics after cleanup
    const { data: metrics } = await supabase
      .from('guest_screening_metrics')
      .select('*')
      .single()

    return NextResponse.json({
      success: true,
      message: 'Guest data cleanup completed successfully',
      metrics: metrics || null,
      timestamp: new Date().toISOString()
    })

  } catch {
    return NextResponse.json({
      error: 'Internal server error',
      message: 'Something went wrong. Please try again later.'
    }, { status: 500 })
  }
})

export const GET = withAuthApi(async (_request: NextRequest) => {
  try {
    const supabase = createClient()

    // Get current user and verify admin role
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError) {
      return NextResponse.json({
        error: 'Authentication required',
        message: 'You must be logged in to perform this action'
      }, { status: 401 })
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user?.id)
      .single()

    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json({
        error: 'Access denied',
        message: 'Admin access required for this operation'
      }, { status: 403 })
    }

    // Get current guest data metrics
    const { data: metrics, error: metricsError } = await supabase
      .from('guest_screening_metrics')
      .select('*')
      .single()

    if (metricsError) {
      return NextResponse.json({
        error: 'Failed to retrieve metrics',
        message: 'Could not fetch guest data metrics'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      metrics,
      policy: {
        retention_days: 30,
        auto_cleanup: false, // Manual cleanup only
        description: 'Guest screening data is automatically restricted after 30 days and can be manually cleaned up by admins'
      },
      timestamp: new Date().toISOString()
    })

  } catch {
    return NextResponse.json({
      error: 'Internal server error',
      message: 'Something went wrong. Please try again later.'
    }, { status: 500 })
  }
})