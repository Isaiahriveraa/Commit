/**
 * Database Type Definitions
 *
 * These types mirror the Supabase database schema and provide
 * full TypeScript type safety for all database operations.
 *
 * NOTE: If you modify the database schema in Supabase, update these types accordingly.
 * You can also use `supabase gen types typescript` to auto-generate these types.
 */

export interface Database {
  public: {
    Tables: {
      team_members: {
        Row: {
          id: string;
          name: string;
          email: string;
          avatar_url: string | null;
          role: 'lead' | 'member';
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          avatar_url?: string | null;
          role?: 'lead' | 'member';
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          avatar_url?: string | null;
          role?: 'lead' | 'member';
          created_at?: string;
        };
      };
      agreements: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          status: 'pending' | 'active' | 'archived';
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          status?: 'pending' | 'active' | 'archived';
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          status?: 'pending' | 'active' | 'archived';
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      agreement_signatures: {
        Row: {
          id: string;
          agreement_id: string;
          member_id: string;
          signed_at: string;
        };
        Insert: {
          id?: string;
          agreement_id: string;
          member_id: string;
          signed_at?: string;
        };
        Update: {
          id?: string;
          agreement_id?: string;
          member_id?: string;
          signed_at?: string;
        };
      };
      deliverables: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          owner_id: string | null;
          deadline: string | null;
          progress: number;
          status: 'upcoming' | 'in-progress' | 'at-risk' | 'completed';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          owner_id?: string | null;
          deadline?: string | null;
          progress?: number;
          status?: 'upcoming' | 'in-progress' | 'at-risk' | 'completed';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          owner_id?: string | null;
          deadline?: string | null;
          progress?: number;
          status?: 'upcoming' | 'in-progress' | 'at-risk' | 'completed';
          created_at?: string;
          updated_at?: string;
        };
      };
      updates: {
        Row: {
          id: string;
          content: string;
          author_id: string | null;
          deliverable_id: string | null;
          is_help_request: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          content: string;
          author_id?: string | null;
          deliverable_id?: string | null;
          is_help_request?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          content?: string;
          author_id?: string | null;
          deliverable_id?: string | null;
          is_help_request?: boolean;
          created_at?: string;
        };
      };
      update_reactions: {
        Row: {
          id: string;
          update_id: string;
          member_id: string;
          reaction_type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          update_id: string;
          member_id: string;
          reaction_type: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          update_id?: string;
          member_id?: string;
          reaction_type?: string;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      agreement_status: 'pending' | 'active' | 'archived';
      deliverable_status: 'upcoming' | 'in-progress' | 'at-risk' | 'completed';
      member_role: 'lead' | 'member';
    };
  };
}

// Convenience type aliases for cleaner imports
export type TeamMember = Database['public']['Tables']['team_members']['Row'];
export type TeamMemberInsert = Database['public']['Tables']['team_members']['Insert'];
export type TeamMemberUpdate = Database['public']['Tables']['team_members']['Update'];

export type Agreement = Database['public']['Tables']['agreements']['Row'];
export type AgreementInsert = Database['public']['Tables']['agreements']['Insert'];
export type AgreementUpdate = Database['public']['Tables']['agreements']['Update'];

export type AgreementSignature = Database['public']['Tables']['agreement_signatures']['Row'];
export type AgreementSignatureInsert = Database['public']['Tables']['agreement_signatures']['Insert'];

export type Deliverable = Database['public']['Tables']['deliverables']['Row'];
export type DeliverableInsert = Database['public']['Tables']['deliverables']['Insert'];
export type DeliverableUpdate = Database['public']['Tables']['deliverables']['Update'];

export type Update = Database['public']['Tables']['updates']['Row'];
export type UpdateInsert = Database['public']['Tables']['updates']['Insert'];
export type UpdateUpdate = Database['public']['Tables']['updates']['Update'];

export type UpdateReaction = Database['public']['Tables']['update_reactions']['Row'];
export type UpdateReactionInsert = Database['public']['Tables']['update_reactions']['Insert'];
