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
      academy_students: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string
          phone: string
          course_slug: string
          course_title: string
          course_key: string
          registration_type: string
          school_name: string
          location: string
          course_registration_id: string | null
          pif_application_id: string | null
          status: string
          enrolled_at: string
          notes: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          email: string
          phone?: string
          course_slug?: string
          course_title?: string
          course_key?: string
          registration_type?: string
          school_name?: string
          location?: string
          course_registration_id?: string | null
          pif_application_id?: string | null
          status?: string
          enrolled_at?: string
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          email?: string
          phone?: string
          course_slug?: string
          course_title?: string
          course_key?: string
          registration_type?: string
          school_name?: string
          location?: string
          course_registration_id?: string | null
          pif_application_id?: string | null
          status?: string
          enrolled_at?: string
          notes?: string
          created_at?: string
          updated_at?: string
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
          og_image: string | null
          read_time_mins: number
          view_count: number
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
          og_image?: string | null
          read_time_mins?: number
          view_count?: number
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
          og_image?: string | null
          read_time_mins?: number
          view_count?: number
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
          client_id: string | null
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
          client_id?: string | null
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
          client_id?: string | null
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
          payment_receipt_path: string | null
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
          payment_receipt_path?: string | null
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
          payment_receipt_path?: string | null
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
      talent_requests: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string
          phone: string
          company: string
          role_needed: string
          engagement_type: string
          headcount: number
          duration: string
          details: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          email: string
          phone: string
          company: string
          role_needed: string
          engagement_type: string
          headcount?: number
          duration: string
          details: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          email?: string
          phone?: string
          company?: string
          role_needed?: string
          engagement_type?: string
          headcount?: number
          duration?: string
          details?: string
          status?: string
          created_at?: string
        }
        Relationships: []
      }
      crm_hosting_accounts: {
        Row: {
          id: string
          client_name: string
          email: string
          phone: string
          domain: string
          provider: string
          plan: string
          amount: number
          billing_cycle: string
          registered_at: string
          expires_at: string
          notes: string
          accent: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_name: string
          email: string
          phone?: string
          domain: string
          provider: string
          plan: string
          amount: number
          billing_cycle?: string
          registered_at: string
          expires_at: string
          notes?: string
          accent?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_name?: string
          email?: string
          phone?: string
          domain?: string
          provider?: string
          plan?: string
          amount?: number
          billing_cycle?: string
          registered_at?: string
          expires_at?: string
          notes?: string
          accent?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      crm_domain_accounts: {
        Row: {
          id: string
          client_name: string
          email: string
          phone: string
          domain: string
          registrar: string
          amount: number
          billing_cycle: string
          registered_at: string
          expires_at: string
          ssl_enabled: boolean
          ssl_provider: string
          ssl_amount: number
          ssl_registered_at: string | null
          ssl_expires_at: string | null
          notes: string
          accent: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_name: string
          email: string
          phone?: string
          domain: string
          registrar: string
          amount: number
          billing_cycle?: string
          registered_at: string
          expires_at: string
          ssl_enabled?: boolean
          ssl_provider?: string
          ssl_amount?: number
          ssl_registered_at?: string | null
          ssl_expires_at?: string | null
          notes?: string
          accent?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_name?: string
          email?: string
          phone?: string
          domain?: string
          registrar?: string
          amount?: number
          billing_cycle?: string
          registered_at?: string
          expires_at?: string
          ssl_enabled?: boolean
          ssl_provider?: string
          ssl_amount?: number
          ssl_registered_at?: string | null
          ssl_expires_at?: string | null
          notes?: string
          accent?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      crm_deals: {
        Row: {
          id: string
          client_id: string
          title: string
          value: number
          currency: string
          stage: string
          probability: number | null
          expected_close_date: string | null
          notes: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          title: string
          value?: number
          currency?: string
          stage?: string
          probability?: number | null
          expected_close_date?: string | null
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          title?: string
          value?: number
          currency?: string
          stage?: string
          probability?: number | null
          expected_close_date?: string | null
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      crm_payments: {
        Row: {
          id: string
          client_id: string | null
          invoice_id: string | null
          deal_id: string | null
          course_registration_id: string | null
          pif_application_id: string | null
          amount: number
          currency: string
          direction: string
          method: string
          status: string
          purpose: string
          paid_at: string
          reference: string
          description: string
          notes: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id?: string | null
          invoice_id?: string | null
          deal_id?: string | null
          course_registration_id?: string | null
          pif_application_id?: string | null
          amount: number
          currency?: string
          direction?: string
          method?: string
          status?: string
          purpose?: string
          paid_at?: string
          reference?: string
          description?: string
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string | null
          invoice_id?: string | null
          deal_id?: string | null
          course_registration_id?: string | null
          pif_application_id?: string | null
          amount?: number
          currency?: string
          direction?: string
          method?: string
          status?: string
          purpose?: string
          paid_at?: string
          reference?: string
          description?: string
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      crm_expenses: {
        Row: {
          id: string
          client_id: string | null
          project_id: string | null
          amount: number
          currency: string
          category: string
          vendor: string
          method: string
          status: string
          spent_at: string
          reference: string
          description: string
          notes: string
          receipt_url: string
          payroll_run_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id?: string | null
          project_id?: string | null
          amount: number
          currency?: string
          category?: string
          vendor?: string
          method?: string
          status?: string
          spent_at?: string
          reference?: string
          description?: string
          notes?: string
          receipt_url?: string
          payroll_run_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string | null
          project_id?: string | null
          amount?: number
          currency?: string
          category?: string
          vendor?: string
          method?: string
          status?: string
          spent_at?: string
          reference?: string
          description?: string
          notes?: string
          receipt_url?: string
          payroll_run_id?: string | null
          created_at?: string
          updated_at?: string
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
          address: string
          source: string
          status: string
          assigned_to: string | null
          score: number
          followers: number | null
          niche_hashtag: string
          gap_found: string
          profile_link: string | null
          contact_date: string | null
          opened: boolean | null
          replied: boolean | null
          follow_up_date: string | null
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
          address?: string
          source?: string
          status?: string
          assigned_to?: string | null
          score?: number
          followers?: number | null
          niche_hashtag?: string
          gap_found?: string
          profile_link?: string | null
          contact_date?: string | null
          opened?: boolean | null
          replied?: boolean | null
          follow_up_date?: string | null
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
          address?: string
          source?: string
          status?: string
          assigned_to?: string | null
          score?: number
          followers?: number | null
          niche_hashtag?: string
          gap_found?: string
          profile_link?: string | null
          contact_date?: string | null
          opened?: boolean | null
          replied?: boolean | null
          follow_up_date?: string | null
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
      team_members: {
        Row: {
          id: string
          full_name: string
          email: string
          phone: string
          role: string
          department: string
          status: string
          joined_at: string
          gender: string | null
          address: string
          date_of_birth: string | null
          base_salary: number | null
          salary_currency: string
          payment_frequency: string | null
          bank_name: string
          account_name: string
          account_number: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          full_name: string
          email: string
          phone?: string
          role?: string
          department: string
          status?: string
          joined_at?: string
          gender?: string | null
          address?: string
          date_of_birth?: string | null
          base_salary?: number | null
          salary_currency?: string
          payment_frequency?: string | null
          bank_name?: string
          account_name?: string
          account_number?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          phone?: string
          role?: string
          department?: string
          status?: string
          joined_at?: string
          gender?: string | null
          address?: string
          date_of_birth?: string | null
          base_salary?: number | null
          salary_currency?: string
          payment_frequency?: string | null
          bank_name?: string
          account_name?: string
          account_number?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      team_member_documents: {
        Row: {
          id: string
          member_id: string
          title: string
          doc_type: string
          notes: string
          created_at: string
        }
        Insert: {
          id?: string
          member_id: string
          title: string
          doc_type?: string
          notes?: string
          created_at?: string
        }
        Update: {
          id?: string
          member_id?: string
          title?: string
          doc_type?: string
          notes?: string
          created_at?: string
        }
        Relationships: []
      }
      payroll_runs: {
        Row: {
          id: string
          period_year: number
          period_month: number
          label: string
          status: string
          currency: string
          gross_total: number
          bonus_total: number
          deductions_total: number
          net_total: number
          employee_count: number
          paid_at: string | null
          payment_reference: string
          notes: string
          expense_id: string | null
          created_by: string
          approved_by: string | null
          approved_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          period_year: number
          period_month: number
          label: string
          status?: string
          currency?: string
          gross_total?: number
          bonus_total?: number
          deductions_total?: number
          net_total?: number
          employee_count?: number
          paid_at?: string | null
          payment_reference?: string
          notes?: string
          expense_id?: string | null
          created_by?: string
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          period_year?: number
          period_month?: number
          label?: string
          status?: string
          currency?: string
          gross_total?: number
          bonus_total?: number
          deductions_total?: number
          net_total?: number
          employee_count?: number
          paid_at?: string | null
          payment_reference?: string
          notes?: string
          expense_id?: string | null
          created_by?: string
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      payroll_items: {
        Row: {
          id: string
          run_id: string
          team_member_id: string | null
          employee_name: string
          employee_email: string
          role: string
          department: string
          bank_name: string
          account_name: string
          account_number: string
          gross_amount: number
          bonus_amount: number
          deduction_amount: number
          deduction_note: string
          net_amount: number
          currency: string
          payslip_number: string
          notes: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          run_id: string
          team_member_id?: string | null
          employee_name: string
          employee_email?: string
          role?: string
          department?: string
          bank_name?: string
          account_name?: string
          account_number?: string
          gross_amount?: number
          bonus_amount?: number
          deduction_amount?: number
          deduction_note?: string
          net_amount?: number
          currency?: string
          payslip_number: string
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          run_id?: string
          team_member_id?: string | null
          employee_name?: string
          employee_email?: string
          role?: string
          department?: string
          bank_name?: string
          account_name?: string
          account_number?: string
          gross_amount?: number
          bonus_amount?: number
          deduction_amount?: number
          deduction_note?: string
          net_amount?: number
          currency?: string
          payslip_number?: string
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      finance_reconciliations: {
        Row: {
          id: string
          period_year: number
          period_month: number
          opening_balance: number
          closing_balance: number
          income_total: number
          expense_total: number
          expected_closing: number
          difference: number
          status: string
          notes: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          period_year: number
          period_month: number
          opening_balance?: number
          closing_balance?: number
          income_total?: number
          expense_total?: number
          expected_closing?: number
          difference?: number
          status?: string
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          period_year?: number
          period_month?: number
          opening_balance?: number
          closing_balance?: number
          income_total?: number
          expense_total?: number
          expected_closing?: number
          difference?: number
          status?: string
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      increment_blog_post_views: {
        Args: { post_slug: string }
        Returns: number
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
