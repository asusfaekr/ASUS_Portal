export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      roles: {
        Row: {
          id: number
          name: string
          description: string | null
          created_at: string | null
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          created_at?: string | null
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          created_at?: string | null
        }
      }
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          company: string | null
          position: string | null
          role_id: number | null
          is_verified: boolean | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          email: string
          full_name?: string | null
          company?: string | null
          position?: string | null
          role_id?: number | null
          is_verified?: boolean | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          company?: string | null
          position?: string | null
          role_id?: number | null
          is_verified?: boolean | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      boards: {
        Row: {
          id: number
          name: string
          slug: string
          description: string | null
          role_id: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          name: string
          slug: string
          description?: string | null
          role_id?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          name?: string
          slug?: string
          description?: string | null
          role_id?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      posts: {
        Row: {
          id: number
          title: string
          content: string | null
          board_id: number | null
          user_id: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          title: string
          content?: string | null
          board_id?: number | null
          user_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          title?: string
          content?: string | null
          board_id?: number | null
          user_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      comments: {
        Row: {
          id: number
          content: string
          post_id: number | null
          user_id: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          content: string
          post_id?: number | null
          user_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          content?: string
          post_id?: number | null
          user_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      verification_tokens: {
        Row: {
          id: number
          user_id: string | null
          token: string
          expires_at: string
          created_at: string | null
        }
        Insert: {
          id?: number
          user_id?: string | null
          token: string
          expires_at: string
          created_at?: string | null
        }
        Update: {
          id?: number
          user_id?: string | null
          token?: string
          expires_at?: string
          created_at?: string | null
        }
      }
      comment_likes: {
        Row: {
          id: string
          created_at: string | null
          user_id: string
          comment_id: number
        }
        Insert: {
          id?: string
          created_at?: string | null
          user_id: string
          comment_id: number
        }
        Update: {
          id?: string
          created_at?: string | null
          user_id?: string
          comment_id?: number
        }
      }
      likes: {
        Row: {
          id: string
          created_at: string | null
          user_id: string
          post_id: number
        }
        Insert: {
          id?: string
          created_at?: string | null
          user_id: string
          post_id: number
        }
        Update: {
          id?: string
          created_at?: string | null
          user_id?: string
          post_id?: number
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

export type Role = Database["public"]["Tables"]["roles"]["Row"]
export type User = Database["public"]["Tables"]["users"]["Row"]
export type Board = Database["public"]["Tables"]["boards"]["Row"]
export type Post = Database["public"]["Tables"]["posts"]["Row"]
export type Comment = Database["public"]["Tables"]["comments"]["Row"]
export type CommentLike = Database["public"]["Tables"]["comment_likes"]["Row"]
export type Like = Database["public"]["Tables"]["likes"]["Row"]
