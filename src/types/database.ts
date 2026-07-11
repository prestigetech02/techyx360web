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
      invoices: {
        Row: {
          id: string
          invoice_number: string
          document_type: string
          status: string
          title: string
          issue_date: string
          due_date: string | null
          client_name: string
          client_address: string | null
          client_email: string | null
          payment_bank_name: string
          payment_account_number: string
          payment_account_name: string
          signature_name: string | null
          signature_title: string | null
          notes: string | null
          subtotal: number
          discount_total: number
          vat_enabled: boolean
          vat_rate: number
          vat_amount: number
          total: number
          currency: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          invoice_number: string
          document_type?: string
          status?: string
          title: string
          issue_date?: string
          due_date?: string | null
          client_name: string
          client_address?: string | null
          client_email?: string | null
          payment_bank_name?: string
          payment_account_number?: string
          payment_account_name?: string
          signature_name?: string | null
          signature_title?: string | null
          notes?: string | null
          subtotal?: number
          discount_total?: number
          vat_enabled?: boolean
          vat_rate?: number
          vat_amount?: number
          total?: number
          currency?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          invoice_number?: string
          document_type?: string
          status?: string
          title?: string
          issue_date?: string
          due_date?: string | null
          client_name?: string
          client_address?: string | null
          client_email?: string | null
          payment_bank_name?: string
          payment_account_number?: string
          payment_account_name?: string
          signature_name?: string | null
          signature_title?: string | null
          notes?: string | null
          subtotal?: number
          discount_total?: number
          vat_enabled?: boolean
          vat_rate?: number
          vat_amount?: number
          total?: number
          currency?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      invoice_line_items: {
        Row: {
          id: string
          invoice_id: string
          description: string
          amount: number
          item_type: string
          sort_order: number
        }
        Insert: {
          id?: string
          invoice_id: string
          description: string
          amount?: number
          item_type?: string
          sort_order?: number
        }
        Update: {
          id?: string
          invoice_id?: string
          description?: string
          amount?: number
          item_type?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_line_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      pif_applications: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string
          phone: string
          education_experience: string
          preferred_track: string
          portfolio_url: string | null
          motivation: string
          goals: string
          program_commitment_agreed: boolean
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          email: string
          phone: string
          education_experience: string
          preferred_track: string
          portfolio_url?: string | null
          motivation: string
          goals: string
          program_commitment_agreed?: boolean
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          email?: string
          phone?: string
          education_experience?: string
          preferred_track?: string
          portfolio_url?: string | null
          motivation?: string
          goals?: string
          program_commitment_agreed?: boolean
          status?: string
          created_at?: string
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
