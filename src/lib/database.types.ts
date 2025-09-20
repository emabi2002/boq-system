export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string
          name: string
          code: string
          default_currency: string
          decimal_precision: number
          default_tax_percent: number
          numbering_style: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          default_currency?: string
          decimal_precision?: number
          default_tax_percent?: number
          numbering_style?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          default_currency?: string
          decimal_precision?: number
          default_tax_percent?: number
          numbering_style?: string
          created_at?: string
          updated_at?: string
        }
      }
      project_types: {
        Row: {
          id: string
          tenant_id: string
          code: string
          name: string
          color: string | null
          icon: string | null
          created_at: string
          created_by: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          code: string
          name: string
          color?: string | null
          icon?: string | null
          created_at?: string
          created_by?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          code?: string
          name?: string
          color?: string | null
          icon?: string | null
          created_at?: string
          created_by?: string | null
          updated_at?: string
          updated_by?: string | null
        }
      }
      units_of_measure: {
        Row: {
          id: string
          tenant_id: string
          code: string
          name: string
          category: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          code: string
          name: string
          category?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          code?: string
          name?: string
          category?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      materials: {
        Row: {
          id: string
          tenant_id: string
          code: string
          name: string
          description: string | null
          default_uom_id: string | null
          typical_rate: number | null
          spec_ref: string | null
          category: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          code: string
          name: string
          description?: string | null
          default_uom_id?: string | null
          typical_rate?: number | null
          spec_ref?: string | null
          category?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          code?: string
          name?: string
          description?: string | null
          default_uom_id?: string | null
          typical_rate?: number | null
          spec_ref?: string | null
          category?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      equipment: {
        Row: {
          id: string
          tenant_id: string
          code: string
          name: string
          description: string | null
          default_uom_id: string | null
          typical_rate: number | null
          spec_ref: string | null
          category: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          code: string
          name: string
          description?: string | null
          default_uom_id?: string | null
          typical_rate?: number | null
          spec_ref?: string | null
          category?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          code?: string
          name?: string
          description?: string | null
          default_uom_id?: string | null
          typical_rate?: number | null
          spec_ref?: string | null
          category?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      labor_roles: {
        Row: {
          id: string
          tenant_id: string
          code: string
          name: string
          description: string | null
          default_uom_id: string | null
          typical_rate: number | null
          category: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          code: string
          name: string
          description?: string | null
          default_uom_id?: string | null
          typical_rate?: number | null
          category?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          code?: string
          name?: string
          description?: string | null
          default_uom_id?: string | null
          typical_rate?: number | null
          category?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      templates: {
        Row: {
          id: string
          tenant_id: string
          name: string
          project_type_id: string | null
          version: string
          status: string
          notes: string | null
          group_code_style: string
          item_code_style: string
          created_at: string
          created_by: string | null
          updated_at: string
          updated_by: string | null
          published_at: string | null
          published_by: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          name: string
          project_type_id?: string | null
          version: string
          status?: string
          notes?: string | null
          group_code_style?: string
          item_code_style?: string
          created_at?: string
          created_by?: string | null
          updated_at?: string
          updated_by?: string | null
          published_at?: string | null
          published_by?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          name?: string
          project_type_id?: string | null
          version?: string
          status?: string
          notes?: string | null
          group_code_style?: string
          item_code_style?: string
          created_at?: string
          created_by?: string | null
          updated_at?: string
          updated_by?: string | null
          published_at?: string | null
          published_by?: string | null
        }
      }
      template_groups: {
        Row: {
          id: string
          template_id: string
          code: string
          title: string
          order_no: number
        }
        Insert: {
          id?: string
          template_id: string
          code: string
          title: string
          order_no: number
        }
        Update: {
          id?: string
          template_id?: string
          code?: string
          title?: string
          order_no?: number
        }
      }
      template_items: {
        Row: {
          id: string
          template_id: string
          group_id: string
          code: string
          description: string
          uom_id: string
          default_qty: number | null
          default_rate: number | null
          spec_ref: string | null
          remarks: string | null
          order_no: number
        }
        Insert: {
          id?: string
          template_id: string
          group_id: string
          code: string
          description: string
          uom_id: string
          default_qty?: number | null
          default_rate?: number | null
          spec_ref?: string | null
          remarks?: string | null
          order_no: number
        }
        Update: {
          id?: string
          template_id?: string
          group_id?: string
          code?: string
          description?: string
          uom_id?: string
          default_qty?: number | null
          default_rate?: number | null
          spec_ref?: string | null
          remarks?: string | null
          order_no?: number
        }
      }
      projects: {
        Row: {
          id: string
          tenant_id: string
          name: string
          code: string
          client: string | null
          location: string | null
          start_date: string | null
          end_date: string | null
          currency: string
          status: string
          created_at: string
          created_by: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          name: string
          code: string
          client?: string | null
          location?: string | null
          start_date?: string | null
          end_date?: string | null
          currency?: string
          status?: string
          created_at?: string
          created_by?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          name?: string
          code?: string
          client?: string | null
          location?: string | null
          start_date?: string | null
          end_date?: string | null
          currency?: string
          status?: string
          created_at?: string
          created_by?: string | null
          updated_at?: string
          updated_by?: string | null
        }
      }
      project_boqs: {
        Row: {
          id: string
          tenant_id: string
          project_id: string
          template_id: string | null
          name: string
          version: string
          revision: number
          status: string
          currency: string
          tax_percent: number
          contingency_percent: number
          overhead_percent: number
          profit_percent: number
          rate_set_id: string | null
          created_at: string
          created_by: string | null
          updated_at: string
          updated_by: string | null
          approved_at: string | null
          approved_by: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          project_id: string
          template_id?: string | null
          name: string
          version: string
          revision?: number
          status?: string
          currency: string
          tax_percent: number
          contingency_percent: number
          overhead_percent: number
          profit_percent: number
          rate_set_id?: string | null
          created_at?: string
          created_by?: string | null
          updated_at?: string
          updated_by?: string | null
          approved_at?: string | null
          approved_by?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          project_id?: string
          template_id?: string | null
          name?: string
          version?: string
          revision?: number
          status?: string
          currency?: string
          tax_percent?: number
          contingency_percent?: number
          overhead_percent?: number
          profit_percent?: number
          rate_set_id?: string | null
          created_at?: string
          created_by?: string | null
          updated_at?: string
          updated_by?: string | null
          approved_at?: string | null
          approved_by?: string | null
        }
      }
      boq_sections: {
        Row: {
          id: string
          boq_id: string
          code: string
          title: string
          order_no: number
        }
        Insert: {
          id?: string
          boq_id: string
          code: string
          title: string
          order_no: number
        }
        Update: {
          id?: string
          boq_id?: string
          code?: string
          title?: string
          order_no?: number
        }
      }
      boq_lines: {
        Row: {
          id: string
          boq_id: string
          section_id: string
          code: string
          description: string
          uom_id: string
          qty: number
          rate: number
          amount: number
          spec_ref: string | null
          remarks: string | null
          is_locked: boolean
          is_provisional: boolean
          order_no: number
        }
        Insert: {
          id?: string
          boq_id: string
          section_id: string
          code: string
          description: string
          uom_id: string
          qty: number
          rate: number
          amount: number
          spec_ref?: string | null
          remarks?: string | null
          is_locked?: boolean
          is_provisional?: boolean
          order_no: number
        }
        Update: {
          id?: string
          boq_id?: string
          section_id?: string
          code?: string
          description?: string
          uom_id?: string
          qty?: number
          rate?: number
          amount?: number
          spec_ref?: string | null
          remarks?: string | null
          is_locked?: boolean
          is_provisional?: boolean
          order_no?: number
        }
      }
      rate_sets: {
        Row: {
          id: string
          tenant_id: string
          name: string
          effective_date: string
          notes: string | null
          is_active: boolean
          created_at: string
          created_by: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          name: string
          effective_date: string
          notes?: string | null
          is_active?: boolean
          created_at?: string
          created_by?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          name?: string
          effective_date?: string
          notes?: string | null
          is_active?: boolean
          created_at?: string
          created_by?: string | null
          updated_at?: string
          updated_by?: string | null
        }
      }
      users: {
        Row: {
          id: string
          tenant_id: string
          email: string
          name: string
          role: string
          permissions: string[]
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          email: string
          name: string
          role?: string
          permissions?: string[]
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          email?: string
          name?: string
          role?: string
          permissions?: string[]
          is_active?: boolean
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
