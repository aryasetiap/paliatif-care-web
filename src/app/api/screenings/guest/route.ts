import { createClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'
import { withGuestApi } from '@/lib/apiWrapper'

export const GET = withGuestApi(async (request: NextRequest) => {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const guestId = searchParams.get('guest_id')

    // Test 1: General guest access test (no guest_id required)
    if (!guestId) {
      // Test if we can access any guest screenings
      const { data: allGuestScreenings, error: guestAccessError } = await supabase
        .from('screenings')
        .select('id, guest_identifier, created_at')
        .eq('is_guest', true)
        .limit(5)

      if (guestAccessError) {
        return NextResponse.json({
          error: 'Access denied',
          message: 'You do not have permission to access this resource'
        }, { status: 403 })
      }

      return NextResponse.json({
        success: true,
        message: 'Guest access test successful - can access guest screenings',
        totalGuestScreenings: allGuestScreenings?.length || 0,
        sampleScreenings: allGuestScreenings || []
      })
    }

    // Test 2: Specific guest access
    const { data: screenings, error: screeningsError } = await supabase
      .from('screenings')
      .select('*')
      .eq('guest_identifier', guestId)
      .eq('is_guest', true)

    if (screeningsError) {
      return NextResponse.json({
        error: 'Access denied',
        message: 'You do not have permission to access this resource'
      }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      guestId,
      screenings: screenings || [],
      count: screenings?.length || 0,
      message: 'Guest access test successful'
    })

  } catch {
    return NextResponse.json({
      error: 'Internal server error',
      message: 'Something went wrong. Please try again later.'
    }, { status: 500 })
  }
})

export const POST = withGuestApi(async (request: NextRequest) => {
  try {
    const supabase = createClient()
    const body = await request.json()

    // Test guest insertion without authentication
    const guestData = {
      esas_data: {
        test: true,
        timestamp: new Date().toISOString(),
        identity: {
          name: body.name || 'Guest Test',
          age: body.age || 30,
          gender: body.gender || 'L',
          contact_info: body.contact_info || 'test@example.com'
        }
      },
      recommendation: {
        level: 'low',
        message: 'Test recommendation for guest user',
        next_steps: []
      },
      screening_type: 'initial',
      status: 'completed',
      highest_score: 0,
      primary_question: 1,
      risk_level: 'low',
      is_guest: true,
      guest_identifier: crypto.randomUUID(),
      user_id: null,
      patient_id: null
    }

    const { data: insertedData, error: insertError } = await supabase
      .from('screenings')
      .insert(guestData)
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({
        error: 'Access denied',
        message: 'You do not have permission to perform this action'
      }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      message: 'Guest insert test successful',
      guestIdentifier: guestData.guest_identifier,
      testData: insertedData
    })

  } catch {
    return NextResponse.json({
      error: 'Internal server error',
      message: 'Something went wrong. Please try again later.'
    }, { status: 500 })
  }
})