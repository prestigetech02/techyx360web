/**
 * Replace this file with generated Supabase types when your schema grows:
 * npx supabase gen types typescript --project-id <project-id> > src/types/database.ts
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      contact_submissions: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string
          phone: string
          message: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          email: string
          phone: string
          message: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          email?: string
          phone?: string
          message?: string
          status?: string
          created_at?: string
        }
        Relationships: []
      }
      course_registrations: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string
          phone: string
          school_id: string
          school_name: string
          course_slug: string
          course_title: string
          course_key: string
          message: string | null
          registration_type: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          email: string
          phone: string
          school_id: string
          school_name: string
          course_slug: string
          course_title: string
          course_key: string
          message?: string | null
          registration_type?: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          email?: string
          phone?: string
          school_id?: string
          school_name?: string
          course_slug?: string
          course_title?: string
          course_key?: string
          message?: string | null
          registration_type?: string
          status?: string
          created_at?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          id: string
          slug: string
          title: string
          excerpt: string
          content: string
          author: string
          tags: string[]
          featured_image: string
          featured_image_alt: string
          read_time_mins: number
          status: string
          published_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          excerpt: string
          content: string
          author?: string
          tags?: string[]
          featured_image: string
          featured_image_alt: string
          read_time_mins?: number
          status?: string
          published_at: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          excerpt?: string
          content?: string
          author?: string
          tags?: string[]
          featured_image?: string
          featured_image_alt?: string
          read_time_mins?: number
          status?: string
          published_at?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
