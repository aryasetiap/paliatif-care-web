import { createClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'
import { withAuthApi } from '@/lib/apiWrapper'

export const GET = withAuthApi(async (_request: NextRequest) => {
  try {
    const supabase = createClient()

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError) {
      return NextResponse.json({ error: 'Authentication error' }, { status: 401 })
    }

    // Get user profile with role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', user?.id)
      .single()

    if (profileError) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Test RLS policies by querying screenings
    const { data: screenings, error: screeningsError } = await supabase
      .from('screenings_with_user_info')
      .select(`
        *,
        profiles:full_name
      `)
      .order('created_at', { ascending: false })

    if (screeningsError) {
      return NextResponse.json({
        error: 'Access denied',
        message: 'You do not have permission to access this resource'
      }, { status: 403 })
    }

    // Test different access patterns based on role
    const testResults = {
      user: {
        id: user?.id,
        email: user?.email,
        profile: profile
      },
      screenings: screenings || [],
      accessTest: {
        canViewAllScreenings: screenings ? screenings.length > 0 : false,
        totalAccessible: screenings?.length || 0
      }
    }

    return NextResponse.json({
      success: true,
      data: testResults,
      message: `RLS test successful for role: ${profile.role}`
    })

  } catch {
    return NextResponse.json({
      error: 'Internal server error',
      message: 'Something went wrong. Please try again later.'
    }, { status: 500 })
  }
})

export const POST = withAuthApi(async (_request: NextRequest) => {
  try {
    const supabase = createClient()

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError) {
      return NextResponse.json({ error: 'Authentication error' }, { status: 401 })
    }

    // Get user profile with role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', user?.id)
      .single()

    if (profileError) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Test INSERT permissions based on role
    const testData = {
      user_id: user?.id,
      esas_data: {
        test: true,
        timestamp: new Date().toISOString(),
        identity: {
          name: 'Test Screening',
          age: 30,
          gender: 'L'
        }
      },
      is_guest: false,
      guest_identifier: null
    }

    const { data: insertedData, error: insertError } = await supabase
      .from('screenings')
      .insert(testData)
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({
        error: 'Access denied',
        message: 'You do not have permission to perform this action'
      }, { status: 403 })
    }

    // Clean up test data
    if (insertedData?.id) {
      await supabase
        .from('screenings')
        .delete()
        .eq('id', insertedData.id)
    }

    return NextResponse.json({
      success: true,
      message: `INSERT permission granted for role: ${profile.role}`,
      testResult: insertedData
    })

  } catch {
    return NextResponse.json({
      error: 'Internal server error',
      message: 'Something went wrong. Please try again later.'
    }, { status: 500 })
  }
})