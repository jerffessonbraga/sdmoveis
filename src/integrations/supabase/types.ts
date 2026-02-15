export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      advance_requests: {
        Row: {
          admin_note: string | null
          amount: number
          created_at: string
          employee_id: string
          id: string
          reason: string | null
          resolved_at: string | null
          status: string
        }
        Insert: {
          admin_note?: string | null
          amount?: number
          created_at?: string
          employee_id: string
          id?: string
          reason?: string | null
          resolved_at?: string | null
          status?: string
        }
        Update: {
          admin_note?: string | null
          amount?: number
          created_at?: string
          employee_id?: string
          id?: string
          reason?: string | null
          resolved_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "advance_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      arquivos_projeto: {
        Row: {
          created_at: string
          description: string | null
          file_name: string
          file_type: string
          file_url: string
          id: string
          project_id: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_name: string
          file_type?: string
          file_url: string
          id?: string
          project_id: string
          uploaded_by?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          file_name?: string
          file_type?: string
          file_url?: string
          id?: string
          project_id?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "arquivos_projeto_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "client_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      client_projects: {
        Row: {
          client_id: string
          created_at: string
          estimated_delivery: string | null
          id: string
          material: string | null
          name: string
          payment_status: string | null
          project_type: string | null
          signed_at: string | null
          status: string
          total_value: number
          updated_at: string
          warranty: string | null
        }
        Insert: {
          client_id: string
          created_at?: string
          estimated_delivery?: string | null
          id?: string
          material?: string | null
          name: string
          payment_status?: string | null
          project_type?: string | null
          signed_at?: string | null
          status?: string
          total_value?: number
          updated_at?: string
          warranty?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string
          estimated_delivery?: string | null
          id?: string
          material?: string | null
          name?: string
          payment_status?: string | null
          project_type?: string | null
          signed_at?: string | null
          status?: string
          total_value?: number
          updated_at?: string
          warranty?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          access_code: string
          created_at: string
          document: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          access_code: string
          created_at?: string
          document?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          access_code?: string
          created_at?: string
          document?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      delivery_signatures: {
        Row: {
          client_name: string
          id: string
          signature_url: string
          signed_at: string
          trip_id: string
        }
        Insert: {
          client_name: string
          id?: string
          signature_url: string
          signed_at?: string
          trip_id: string
        }
        Update: {
          client_name?: string
          id?: string
          signature_url?: string
          signed_at?: string
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_signatures_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_adjustments: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          employee_id: string
          hours: number | null
          id: string
          reference_date: string
          type: string
        }
        Insert: {
          amount?: number
          created_at?: string
          description?: string | null
          employee_id: string
          hours?: number | null
          id?: string
          reference_date?: string
          type: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          employee_id?: string
          hours?: number | null
          id?: string
          reference_date?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_adjustments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          active: boolean
          created_at: string
          hourly_rate: number
          id: string
          name: string
          phone: string | null
          role: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          hourly_rate?: number
          id?: string
          name: string
          phone?: string | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          hourly_rate?: number
          id?: string
          name?: string
          phone?: string | null
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      maintenance_requests: {
        Row: {
          admin_note: string | null
          client_id: string
          created_at: string
          description: string
          id: string
          preferred_date: string | null
          project_id: string
          resolved_at: string | null
          status: string
          type: string
        }
        Insert: {
          admin_note?: string | null
          client_id: string
          created_at?: string
          description: string
          id?: string
          preferred_date?: string | null
          project_id: string
          resolved_at?: string | null
          status?: string
          type?: string
        }
        Update: {
          admin_note?: string | null
          client_id?: string
          created_at?: string
          description?: string
          id?: string
          preferred_date?: string | null
          project_id?: string
          resolved_at?: string | null
          status?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_requests_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_requests_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "client_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_costs: {
        Row: {
          amount: number
          category: string
          created_at: string
          description: string
          id: string
          project_id: string
          quantity: number
          unit: string | null
        }
        Insert: {
          amount?: number
          category?: string
          created_at?: string
          description: string
          id?: string
          project_id: string
          quantity?: number
          unit?: string | null
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          description?: string
          id?: string
          project_id?: string
          quantity?: number
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_costs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "client_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_gallery: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string
          project_id: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url: string
          project_id: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string
          project_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_gallery_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "client_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_installments: {
        Row: {
          amount: number
          created_at: string
          due_date: string
          id: string
          installment_number: number
          paid_at: string | null
          project_id: string
          status: string
          total_installments: number
        }
        Insert: {
          amount: number
          created_at?: string
          due_date: string
          id?: string
          installment_number: number
          paid_at?: string | null
          project_id: string
          status?: string
          total_installments: number
        }
        Update: {
          amount?: number
          created_at?: string
          due_date?: string
          id?: string
          installment_number?: number
          paid_at?: string | null
          project_id?: string
          status?: string
          total_installments?: number
        }
        Relationships: [
          {
            foreignKeyName: "project_installments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "client_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_production_steps: {
        Row: {
          created_at: string
          id: string
          label: string
          progress: number
          project_id: string
          sort_order: number
          status: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          progress?: number
          project_id: string
          sort_order?: number
          status?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          progress?: number
          project_id?: string
          sort_order?: number
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_production_steps_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "client_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_timeline: {
        Row: {
          created_at: string
          done: boolean
          icon: string | null
          id: string
          label: string
          project_id: string
          sort_order: number
          step_date: string | null
        }
        Insert: {
          created_at?: string
          done?: boolean
          icon?: string | null
          id?: string
          label: string
          project_id: string
          sort_order?: number
          step_date?: string | null
        }
        Update: {
          created_at?: string
          done?: boolean
          icon?: string | null
          id?: string
          label?: string
          project_id?: string
          sort_order?: number
          step_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_timeline_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "client_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      quality_check_items: {
        Row: {
          checked: boolean
          checklist_id: string
          id: string
          label: string
          note: string | null
          sort_order: number
        }
        Insert: {
          checked?: boolean
          checklist_id: string
          id?: string
          label: string
          note?: string | null
          sort_order?: number
        }
        Update: {
          checked?: boolean
          checklist_id?: string
          id?: string
          label?: string
          note?: string | null
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "quality_check_items_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "quality_checklists"
            referencedColumns: ["id"]
          },
        ]
      }
      quality_checklists: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          inspector_name: string | null
          notes: string | null
          project_id: string
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          inspector_name?: string | null
          notes?: string | null
          project_id: string
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          inspector_name?: string | null
          notes?: string | null
          project_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "quality_checklists_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "client_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      time_entries: {
        Row: {
          clock_in: string
          clock_out: string | null
          created_at: string
          employee_id: string
          id: string
          notes: string | null
        }
        Insert: {
          clock_in?: string
          clock_out?: string | null
          created_at?: string
          employee_id: string
          id?: string
          notes?: string | null
        }
        Update: {
          clock_in?: string
          clock_out?: string | null
          created_at?: string
          employee_id?: string
          id?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_inventory: {
        Row: {
          assigned_at: string
          condition: string
          employee_id: string
          id: string
          notes: string | null
          serial_number: string | null
          tool_name: string
        }
        Insert: {
          assigned_at?: string
          condition?: string
          employee_id: string
          id?: string
          notes?: string | null
          serial_number?: string | null
          tool_name: string
        }
        Update: {
          assigned_at?: string
          condition?: string
          employee_id?: string
          id?: string
          notes?: string | null
          serial_number?: string | null
          tool_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "tool_inventory_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_reports: {
        Row: {
          created_at: string
          description: string
          employee_id: string
          id: string
          issue_type: string
          resolved_at: string | null
          status: string
          tool_id: string
        }
        Insert: {
          created_at?: string
          description: string
          employee_id: string
          id?: string
          issue_type?: string
          resolved_at?: string | null
          status?: string
          tool_id: string
        }
        Update: {
          created_at?: string
          description?: string
          employee_id?: string
          id?: string
          issue_type?: string
          resolved_at?: string | null
          status?: string
          tool_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tool_reports_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tool_reports_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tool_inventory"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_checklists: {
        Row: {
          checked: boolean
          created_at: string
          id: string
          label: string
          sort_order: number
          trip_id: string
        }
        Insert: {
          checked?: boolean
          created_at?: string
          id?: string
          label: string
          sort_order?: number
          trip_id: string
        }
        Update: {
          checked?: boolean
          created_at?: string
          id?: string
          label?: string
          sort_order?: number
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_checklists_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_incidents: {
        Row: {
          admin_note: string | null
          created_at: string
          description: string
          employee_id: string
          id: string
          photo_url: string | null
          resolved_at: string | null
          status: string
          trip_id: string
          type: string
        }
        Insert: {
          admin_note?: string | null
          created_at?: string
          description: string
          employee_id: string
          id?: string
          photo_url?: string | null
          resolved_at?: string | null
          status?: string
          trip_id: string
          type?: string
        }
        Update: {
          admin_note?: string | null
          created_at?: string
          description?: string
          employee_id?: string
          id?: string
          photo_url?: string | null
          resolved_at?: string | null
          status?: string
          trip_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_incidents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_incidents_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_locations: {
        Row: {
          accuracy: number | null
          id: string
          latitude: number
          longitude: number
          recorded_at: string
          speed: number | null
          trip_id: string
        }
        Insert: {
          accuracy?: number | null
          id?: string
          latitude: number
          longitude: number
          recorded_at?: string
          speed?: number | null
          trip_id: string
        }
        Update: {
          accuracy?: number | null
          id?: string
          latitude?: number
          longitude?: number
          recorded_at?: string
          speed?: number | null
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_locations_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_photos: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string
          trip_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url: string
          trip_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_photos_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          created_at: string
          description: string | null
          employee_id: string
          ended_at: string | null
          id: string
          started_at: string
          status: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          employee_id: string
          ended_at?: string | null
          id?: string
          started_at?: string
          status?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          employee_id?: string
          ended_at?: string | null
          id?: string
          started_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "trips_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_conversations: {
        Row: {
          contact_name: string | null
          created_at: string
          id: string
          last_message_at: string | null
          lead_status: string | null
          phone_number: string
          status: string | null
          updated_at: string
        }
        Insert: {
          contact_name?: string | null
          created_at?: string
          id?: string
          last_message_at?: string | null
          lead_status?: string | null
          phone_number: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          contact_name?: string | null
          created_at?: string
          id?: string
          last_message_at?: string | null
          lead_status?: string | null
          phone_number?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      whatsapp_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          direction: string
          id: string
          message_type: string | null
          status: string | null
          whatsapp_message_id: string | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          direction: string
          id?: string
          message_type?: string | null
          status?: string | null
          whatsapp_message_id?: string | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          direction?: string
          id?: string
          message_type?: string | null
          status?: string | null
          whatsapp_message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_conversations"
            referencedColumns: ["id"]
          },
        ]
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
