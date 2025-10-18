export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      mindmaps: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          viewport: {
            x: number
            y: number
            zoom: number
          } | null
          settings: Record<string, any> | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          viewport?: {
            x: number
            y: number
            zoom: number
          } | null
          settings?: Record<string, any> | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          viewport?: {
            x: number
            y: number
            zoom: number
          } | null
          settings?: Record<string, any> | null
          created_at?: string
          updated_at?: string
        }
      }
      nodes: {
        Row: {
          id: string
          mindmap_id: string
          react_flow_id: string
          type: string
          title: string
          content: string | null
          progress: number
          position: {
            x: number
            y: number
          }
          style: Record<string, any> | null
          data: Record<string, any> | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          mindmap_id: string
          react_flow_id: string
          type?: string
          title: string
          content?: string | null
          progress?: number
          position: {
            x: number
            y: number
          }
          style?: Record<string, any> | null
          data?: Record<string, any> | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          mindmap_id?: string
          react_flow_id?: string
          type?: string
          title?: string
          content?: string | null
          progress?: number
          position?: {
            x: number
            y: number
          }
          style?: Record<string, any> | null
          data?: Record<string, any> | null
          created_at?: string
          updated_at?: string
        }
      }
      edges: {
        Row: {
          id: string
          mindmap_id: string
          react_flow_id: string
          source_node_id: string
          target_node_id: string
          type: string
          style: Record<string, any> | null
          data: Record<string, any> | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          mindmap_id: string
          react_flow_id: string
          source_node_id: string
          target_node_id: string
          type?: string
          style?: Record<string, any> | null
          data?: Record<string, any> | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          mindmap_id?: string
          react_flow_id?: string
          source_node_id?: string
          target_node_id?: string
          type?: string
          style?: Record<string, any> | null
          data?: Record<string, any> | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}