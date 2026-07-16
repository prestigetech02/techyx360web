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
          location: string | null
          has_working_computer: boolean | null
          can_devote_6_hours_weekly: boolean | null
          payment_receipt_path: string | null
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
          location?: string | null
          has_working_computer?: boolean | null
          can_devote_6_hours_weekly?: boolean | null
          payment_receipt_path?: string | null
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
          location?: string | null
          has_working_computer?: boolean | null
          can_devote_6_hours_weekly?: boolean | null
          payment_receipt_path?: string | null
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
          meta_description: string | null
          meta_keywords: string[]
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
          meta_description?: string | null
          meta_keywords?: string[]
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
          meta_description?: string | null
          meta_keywords?: string[]
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
      career_applications: {
        Row: {
          id: string
          position_id: string
          position_title: string
          full_name: string
          email: string
          phone: string
          location: string
          linkedin_url: string | null
          github_url: string | null
          portfolio_url: string
          cv_path: string
          years_of_experience: string
          expected_salary: string
          cover_letter: string | null
          availability: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          position_id: string
          position_title: string
          full_name: string
          email: string
          phone: string
          location: string
          linkedin_url?: string | null
          github_url?: string | null
          portfolio_url: string
          cv_path: string
          years_of_experience: string
          expected_salary: string
          cover_letter?: string | null
          availability: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          position_id?: string
          position_title?: string
          full_name?: string
          email?: string
          phone?: string
          location?: string
          linkedin_url?: string | null
          github_url?: string | null
          portfolio_url?: string
          cv_path?: string
          years_of_experience?: string
          expected_salary?: string
          cover_letter?: string | null
          availability?: string
          status?: string
          created_at?: string
        }
        Relationships: []
      }
      job_openings: {
        Row: {
          id: string
          slug: string
          title: string
          department: string
          location: string
          employment_type: string
          description: string
          overview: string
          responsibilities: string[]
          requirements: string[]
          nice_to_have: string[]
          benefits: string[]
          status: string
          icon: string
          sort_order: number
          salary_min: number | null
          salary_max: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          department: string
          location: string
          employment_type: string
          description: string
          overview: string
          responsibilities?: string[]
          requirements?: string[]
          nice_to_have?: string[]
          benefits?: string[]
          status?: string
          icon?: string
          sort_order?: number
          salary_min?: number | null
          salary_max?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          department?: string
          location?: string
          employment_type?: string
          description?: string
          overview?: string
          responsibilities?: string[]
          requirements?: string[]
          nice_to_have?: string[]
          benefits?: string[]
          status?: string
          icon?: string
          sort_order?: number
          salary_min?: number | null
          salary_max?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      talent_pool_submissions: {
        Row: {
          id: string
          full_name: string
          email: string
          phone: string
          location: string
          linkedin_url: string | null
          github_url: string | null
          portfolio_url: string | null
          cv_path: string
          interest_areas: string
          years_of_experience: string
          expected_salary: string | null
          message: string | null
          availability: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          full_name: string
          email: string
          phone: string
          location: string
          linkedin_url?: string | null
          github_url?: string | null
          portfolio_url?: string | null
          cv_path: string
          interest_areas: string
          years_of_experience: string
          expected_salary?: string | null
          message?: string | null
          availability: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          phone?: string
          location?: string
          linkedin_url?: string | null
          github_url?: string | null
          portfolio_url?: string | null
          cv_path?: string
          interest_areas?: string
          years_of_experience?: string
          expected_salary?: string | null
          message?: string | null
          availability?: string
          status?: string
          created_at?: string
        }
        Relationships: []
      }
      crm_clients: {
        Row: {
          id: string
          company: string
          contact_name: string
          email: string
          phone: string
          industry: string
          product: string
          role: string
          website: string | null
          location: string
          company_size: string
          status: string
          last_activity_at: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company: string
          contact_name: string
          email: string
          phone: string
          industry?: string
          product?: string
          role?: string
          website?: string | null
          location?: string
          company_size?: string
          status?: string
          last_activity_at?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company?: string
          contact_name?: string
          email?: string
          phone?: string
          industry?: string
          product?: string
          role?: string
          website?: string | null
          location?: string
          company_size?: string
          status?: string
          last_activity_at?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      crm_client_notes: {
        Row: {
          id: string
          client_id: string
          content: string
          author_name: string
          created_at: string
        }
        Insert: {
          id?: string
          client_id: string
          content: string
          author_name?: string
          created_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          content?: string
          author_name?: string
          created_at?: string
        }
        Relationships: []
      }
      crm_leads: {
        Row: {
          id: string
          full_name: string
          email: string
          phone: string
          company: string
          source: string
          status: string
          assigned_to: string | null
          score: number
          client_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          full_name: string
          email: string
          phone: string
          company: string
          source?: string
          status?: string
          assigned_to?: string | null
          score?: number
          client_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          phone?: string
          company?: string
          source?: string
          status?: string
          assigned_to?: string | null
          score?: number
          client_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      crm_lead_notes: {
        Row: {
          id: string
          lead_id: string
          content: string
          author_name: string
          created_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          content: string
          author_name?: string
          created_at?: string
        }
        Update: {
          id?: string
          lead_id?: string
          content?: string
          author_name?: string
          created_at?: string
        }
        Relationships: []
      }
      crm_lead_activities: {
        Row: {
          id: string
          lead_id: string
          type: string
          title: string
          author_name: string
          created_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          type: string
          title: string
          author_name?: string
          created_at?: string
        }
        Update: {
          id?: string
          lead_id?: string
          type?: string
          title?: string
          author_name?: string
          created_at?: string
        }
        Relationships: []
      }
      crm_projects: {
        Row: {
          id: string
          client_id: string | null
          name: string
          category: string
          description: string
          status: string
          priority: string
          progress: number
          start_date: string | null
          due_date: string | null
          team_initials: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id?: string | null
          name: string
          category?: string
          description?: string
          status?: string
          priority?: string
          progress?: number
          start_date?: string | null
          due_date?: string | null
          team_initials?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string | null
          name?: string
          category?: string
          description?: string
          status?: string
          priority?: string
          progress?: number
          start_date?: string | null
          due_date?: string | null
          team_initials?: string[]
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      crm_project_milestones: {
        Row: {
          id: string
          project_id: string
          title: string
          due_date: string | null
          done: boolean
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          title: string
          due_date?: string | null
          done?: boolean
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          title?: string
          due_date?: string | null
          done?: boolean
          sort_order?: number
          created_at?: string
        }
        Relationships: []
      }
      crm_project_tasks: {
        Row: {
          id: string
          project_id: string
          title: string
          assignee: string
          done: boolean
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          title: string
          assignee?: string
          done?: boolean
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          title?: string
          assignee?: string
          done?: boolean
          sort_order?: number
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
