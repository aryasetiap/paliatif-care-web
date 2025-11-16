import { createClient } from '@/lib/supabase'

export async function cleanupOldGuestScreenings(): Promise<{ success: boolean; message: string; deletedCount?: number }> {
  try {
    const supabase = createClient()

    // Get count of guest screenings that will be deleted
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - 30) // 30 days ago

    const { data: screeningsToDelete, error: countError } = await supabase
      .from('screenings')
      .select('id', { count: 'exact' })
      .eq('is_guest', true)
      .lt('created_at', cutoffDate.toISOString())

    if (countError) {
      // Error counting guest screenings for cleanup
      return {
        success: false,
        message: 'Failed to count guest screenings for cleanup'
      }
    }

    // Execute cleanup using RPC function
    const { error: cleanupError } = await supabase.rpc('cleanup_old_guest_screenings')

    if (cleanupError) {
      // Guest data cleanup error
      return {
        success: false,
        message: 'Failed to clean up old guest data'
      }
    }

    return {
      success: true,
      message: 'Guest data cleanup completed successfully',
      deletedCount: screeningsToDelete?.length || 0
    }
  } catch {
    // Guest cleanup service error
    return {
      success: false,
      message: 'Unexpected error during guest data cleanup'
    }
  }
}

export async function getGuestDataMetrics() {
  try {
    const supabase = createClient()

    const { data: metrics, error } = await supabase
      .from('guest_screening_metrics')
      .select('*')
      .single()

    if (error) {
      // Error fetching guest data metrics
      return null
    }

    return metrics
  } catch {
    // Guest metrics service error
    return null
  }
}

// Function to check if cleanup is needed
export async function checkCleanupNeeded(): Promise<boolean> {
  try {
    const metrics = await getGuestDataMetrics()

    if (!metrics) return false

    // Check if there are guest screenings older than 25 days
    const twentyFiveDaysAgo = new Date()
    twentyFiveDaysAgo.setDate(twentyFiveDaysAgo.getDate() - 25)

    const supabase = createClient()
    const { data: oldScreenings, error } = await supabase
      .from('screenings')
      .select('id', { count: 'exact' })
      .eq('is_guest', true)
      .lt('created_at', twentyFiveDaysAgo.toISOString())

    if (error) return false

    return (oldScreenings?.length || 0) > 0
  } catch {
    // Error checking cleanup needed
    return false
  }
}

// Auto-cleanup scheduler (for development/monitoring)
export async function scheduleAutoCleanup() {
  const isNeeded = await checkCleanupNeeded()

  if (isNeeded) {
    // Starting automatic guest data cleanup
    const result = await cleanupOldGuestScreenings()

    if (result.success) {
      // Guest data cleanup completed
    } else {
      // Guest data cleanup failed
    }

    return result
  } else {
    // No guest data cleanup needed at this time
    return { success: true, message: 'No cleanup needed' }
  }
}