// WebSocket connection manager for Supabase
class WebSocketManager {
  private static instance: WebSocketManager
  private connections: Set<string> = new Set()
  private supabase: any = null

  static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager()
    }
    return WebSocketManager.instance
  }

  getConnection(clientId: string) {
    if (!this.connections.has(clientId)) {
      this.connections.add(clientId)
    }
    return this.connections
  }

  removeConnection(clientId: string) {
    this.connections.delete(clientId)
  }

  async cleanupAllConnections() {
    if (typeof window !== 'undefined' && this.supabase) {
      try {
        await this.supabase.removeAllChannels()
      } catch (error) {
        console.error('Error cleaning up WebSocket connections:', error)
      }
    }
    this.connections.clear()
  }

  setSupabaseClient(supabase: any) {
    this.supabase = supabase
  }

  getConnectionCount(): number {
    return this.connections.size
  }
}

export const wsManager = WebSocketManager.getInstance()

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    wsManager.cleanupAllConnections()
  })
}