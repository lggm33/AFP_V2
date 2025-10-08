export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '13.0.5';
  };
  public: {
    Tables: {
      budget_alerts: {
        Row: {
          alert_type: Database['public']['Enums']['alert_type'];
          budget_id: string;
          budget_limit: number;
          created_at: string | null;
          current_spent: number;
          id: string;
          is_read: boolean | null;
          sent_at: string | null;
          threshold_percentage: number;
          user_id: string;
        };
        Insert: {
          alert_type: Database['public']['Enums']['alert_type'];
          budget_id: string;
          budget_limit: number;
          created_at?: string | null;
          current_spent: number;
          id?: string;
          is_read?: boolean | null;
          sent_at?: string | null;
          threshold_percentage: number;
          user_id: string;
        };
        Update: {
          alert_type?: Database['public']['Enums']['alert_type'];
          budget_id?: string;
          budget_limit?: number;
          created_at?: string | null;
          current_spent?: number;
          id?: string;
          is_read?: boolean | null;
          sent_at?: string | null;
          threshold_percentage?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'budget_alerts_budget_id_fkey';
            columns: ['budget_id'];
            isOneToOne: false;
            referencedRelation: 'budgets';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'budget_alerts_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      budgets: {
        Row: {
          alert_threshold: number | null;
          category_id: string;
          created_at: string | null;
          currency: string | null;
          id: string;
          is_active: boolean | null;
          limit_amount: number;
          month: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          alert_threshold?: number | null;
          category_id: string;
          created_at?: string | null;
          currency?: string | null;
          id?: string;
          is_active?: boolean | null;
          limit_amount: number;
          month: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          alert_threshold?: number | null;
          category_id?: string;
          created_at?: string | null;
          currency?: string | null;
          id?: string;
          is_active?: boolean | null;
          limit_amount?: number;
          month?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'budgets_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'transaction_categories';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'budgets_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      email_accounts: {
        Row: {
          created_at: string | null;
          email_address: string;
          encrypted_tokens: string | null;
          id: string;
          is_active: boolean | null;
          last_sync_at: string | null;
          provider: string;
          sync_frequency: unknown | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          email_address: string;
          encrypted_tokens?: string | null;
          id?: string;
          is_active?: boolean | null;
          last_sync_at?: string | null;
          provider?: string;
          sync_frequency?: unknown | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          email_address?: string;
          encrypted_tokens?: string | null;
          id?: string;
          is_active?: boolean | null;
          last_sync_at?: string | null;
          provider?: string;
          sync_frequency?: unknown | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'email_accounts_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      exchange_rates: {
        Row: {
          created_at: string | null;
          date: string;
          from_currency: string;
          id: string;
          rate: number;
          source: string | null;
          to_currency: string;
        };
        Insert: {
          created_at?: string | null;
          date: string;
          from_currency: string;
          id?: string;
          rate: number;
          source?: string | null;
          to_currency: string;
        };
        Update: {
          created_at?: string | null;
          date?: string;
          from_currency?: string;
          id?: string;
          rate?: number;
          source?: string | null;
          to_currency?: string;
        };
        Relationships: [];
      };
      payment_method_balances: {
        Row: {
          available_balance: number | null;
          created_at: string | null;
          currency: string;
          current_balance: number | null;
          id: string;
          last_balance_update: string | null;
          last_transaction_date: string | null;
          payment_method_id: string;
          pending_amount: number | null;
          updated_at: string | null;
        };
        Insert: {
          available_balance?: number | null;
          created_at?: string | null;
          currency: string;
          current_balance?: number | null;
          id?: string;
          last_balance_update?: string | null;
          last_transaction_date?: string | null;
          payment_method_id: string;
          pending_amount?: number | null;
          updated_at?: string | null;
        };
        Update: {
          available_balance?: number | null;
          created_at?: string | null;
          currency?: string;
          current_balance?: number | null;
          id?: string;
          last_balance_update?: string | null;
          last_transaction_date?: string | null;
          payment_method_id?: string;
          pending_amount?: number | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'payment_method_balances_payment_method_id_fkey';
            columns: ['payment_method_id'];
            isOneToOne: false;
            referencedRelation: 'payment_methods';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payment_method_balances_payment_method_id_fkey';
            columns: ['payment_method_id'];
            isOneToOne: false;
            referencedRelation: 'v_credit_card_summary';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payment_method_balances_payment_method_id_fkey';
            columns: ['payment_method_id'];
            isOneToOne: false;
            referencedRelation: 'v_payment_methods_with_all_balances';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payment_method_balances_payment_method_id_fkey';
            columns: ['payment_method_id'];
            isOneToOne: false;
            referencedRelation: 'v_payment_methods_with_primary_balance';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payment_method_balances_payment_method_id_fkey';
            columns: ['payment_method_id'];
            isOneToOne: false;
            referencedRelation: 'v_payment_methods_with_stats';
            referencedColumns: ['id'];
          },
        ];
      };
      payment_method_credit_details: {
        Row: {
          billing_cycle_day: number | null;
          created_at: string | null;
          credit_limit: number;
          credit_limit_currency: string | null;
          grace_period_days: number | null;
          interest_rate: number | null;
          last_statement_balance: number | null;
          last_statement_date: string | null;
          metadata: Json | null;
          minimum_payment_percentage: number | null;
          multi_currency_limits: Json | null;
          next_payment_due_date: string | null;
          payment_due_day: number | null;
          payment_method_id: string;
          updated_at: string | null;
        };
        Insert: {
          billing_cycle_day?: number | null;
          created_at?: string | null;
          credit_limit: number;
          credit_limit_currency?: string | null;
          grace_period_days?: number | null;
          interest_rate?: number | null;
          last_statement_balance?: number | null;
          last_statement_date?: string | null;
          metadata?: Json | null;
          minimum_payment_percentage?: number | null;
          multi_currency_limits?: Json | null;
          next_payment_due_date?: string | null;
          payment_due_day?: number | null;
          payment_method_id: string;
          updated_at?: string | null;
        };
        Update: {
          billing_cycle_day?: number | null;
          created_at?: string | null;
          credit_limit?: number;
          credit_limit_currency?: string | null;
          grace_period_days?: number | null;
          interest_rate?: number | null;
          last_statement_balance?: number | null;
          last_statement_date?: string | null;
          metadata?: Json | null;
          minimum_payment_percentage?: number | null;
          multi_currency_limits?: Json | null;
          next_payment_due_date?: string | null;
          payment_due_day?: number | null;
          payment_method_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'payment_method_credit_details_payment_method_id_fkey';
            columns: ['payment_method_id'];
            isOneToOne: true;
            referencedRelation: 'payment_methods';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payment_method_credit_details_payment_method_id_fkey';
            columns: ['payment_method_id'];
            isOneToOne: true;
            referencedRelation: 'v_credit_card_summary';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payment_method_credit_details_payment_method_id_fkey';
            columns: ['payment_method_id'];
            isOneToOne: true;
            referencedRelation: 'v_payment_methods_with_all_balances';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payment_method_credit_details_payment_method_id_fkey';
            columns: ['payment_method_id'];
            isOneToOne: true;
            referencedRelation: 'v_payment_methods_with_primary_balance';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payment_method_credit_details_payment_method_id_fkey';
            columns: ['payment_method_id'];
            isOneToOne: true;
            referencedRelation: 'v_payment_methods_with_stats';
            referencedColumns: ['id'];
          },
        ];
      };
      payment_methods: {
        Row: {
          account_number_hash: string | null;
          account_type: Database['public']['Enums']['account_type'];
          card_brand: Database['public']['Enums']['card_brand'] | null;
          color: string | null;
          created_at: string | null;
          deleted_at: string | null;
          exclude_from_totals: boolean | null;
          icon: string | null;
          id: string;
          institution_name: string;
          is_primary: boolean | null;
          last_four_digits: string | null;
          metadata: Json | null;
          name: string;
          primary_currency: string | null;
          status: Database['public']['Enums']['payment_method_status'] | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          account_number_hash?: string | null;
          account_type: Database['public']['Enums']['account_type'];
          card_brand?: Database['public']['Enums']['card_brand'] | null;
          color?: string | null;
          created_at?: string | null;
          deleted_at?: string | null;
          exclude_from_totals?: boolean | null;
          icon?: string | null;
          id?: string;
          institution_name: string;
          is_primary?: boolean | null;
          last_four_digits?: string | null;
          metadata?: Json | null;
          name: string;
          primary_currency?: string | null;
          status?: Database['public']['Enums']['payment_method_status'] | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          account_number_hash?: string | null;
          account_type?: Database['public']['Enums']['account_type'];
          card_brand?: Database['public']['Enums']['card_brand'] | null;
          color?: string | null;
          created_at?: string | null;
          deleted_at?: string | null;
          exclude_from_totals?: boolean | null;
          icon?: string | null;
          id?: string;
          institution_name?: string;
          is_primary?: boolean | null;
          last_four_digits?: string | null;
          metadata?: Json | null;
          name?: string;
          primary_currency?: string | null;
          status?: Database['public']['Enums']['payment_method_status'] | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'payment_methods_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      scheduled_transactions: {
        Row: {
          amount: number;
          auto_create: boolean | null;
          category_id: string | null;
          created_at: string | null;
          currency: string | null;
          custom_frequency_days: number | null;
          deleted_at: string | null;
          description: string;
          end_date: string | null;
          frequency: Database['public']['Enums']['scheduled_frequency'];
          id: string;
          is_active: boolean | null;
          last_occurrence_date: string | null;
          max_occurrences: number | null;
          merchant_name: string | null;
          metadata: Json | null;
          next_occurrence_date: string;
          notification_days_before: number | null;
          notification_enabled: boolean | null;
          occurrences_count: number | null;
          payment_method_id: string | null;
          transaction_type: Database['public']['Enums']['transaction_type'];
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          amount: number;
          auto_create?: boolean | null;
          category_id?: string | null;
          created_at?: string | null;
          currency?: string | null;
          custom_frequency_days?: number | null;
          deleted_at?: string | null;
          description: string;
          end_date?: string | null;
          frequency: Database['public']['Enums']['scheduled_frequency'];
          id?: string;
          is_active?: boolean | null;
          last_occurrence_date?: string | null;
          max_occurrences?: number | null;
          merchant_name?: string | null;
          metadata?: Json | null;
          next_occurrence_date: string;
          notification_days_before?: number | null;
          notification_enabled?: boolean | null;
          occurrences_count?: number | null;
          payment_method_id?: string | null;
          transaction_type: Database['public']['Enums']['transaction_type'];
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          amount?: number;
          auto_create?: boolean | null;
          category_id?: string | null;
          created_at?: string | null;
          currency?: string | null;
          custom_frequency_days?: number | null;
          deleted_at?: string | null;
          description?: string;
          end_date?: string | null;
          frequency?: Database['public']['Enums']['scheduled_frequency'];
          id?: string;
          is_active?: boolean | null;
          last_occurrence_date?: string | null;
          max_occurrences?: number | null;
          merchant_name?: string | null;
          metadata?: Json | null;
          next_occurrence_date?: string;
          notification_days_before?: number | null;
          notification_enabled?: boolean | null;
          occurrences_count?: number | null;
          payment_method_id?: string | null;
          transaction_type?: Database['public']['Enums']['transaction_type'];
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'scheduled_transactions_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'transaction_categories';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'scheduled_transactions_payment_method_id_fkey';
            columns: ['payment_method_id'];
            isOneToOne: false;
            referencedRelation: 'payment_methods';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'scheduled_transactions_payment_method_id_fkey';
            columns: ['payment_method_id'];
            isOneToOne: false;
            referencedRelation: 'v_credit_card_summary';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'scheduled_transactions_payment_method_id_fkey';
            columns: ['payment_method_id'];
            isOneToOne: false;
            referencedRelation: 'v_payment_methods_with_all_balances';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'scheduled_transactions_payment_method_id_fkey';
            columns: ['payment_method_id'];
            isOneToOne: false;
            referencedRelation: 'v_payment_methods_with_primary_balance';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'scheduled_transactions_payment_method_id_fkey';
            columns: ['payment_method_id'];
            isOneToOne: false;
            referencedRelation: 'v_payment_methods_with_stats';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'scheduled_transactions_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      sync_logs: {
        Row: {
          completed_at: string | null;
          error_message: string | null;
          id: string;
          records_processed: number | null;
          started_at: string | null;
          status: Database['public']['Enums']['sync_status'] | null;
          sync_type: string;
          user_id: string;
        };
        Insert: {
          completed_at?: string | null;
          error_message?: string | null;
          id?: string;
          records_processed?: number | null;
          started_at?: string | null;
          status?: Database['public']['Enums']['sync_status'] | null;
          sync_type: string;
          user_id: string;
        };
        Update: {
          completed_at?: string | null;
          error_message?: string | null;
          id?: string;
          records_processed?: number | null;
          started_at?: string | null;
          status?: Database['public']['Enums']['sync_status'] | null;
          sync_type?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'sync_logs_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      transaction_amounts: {
        Row: {
          authorized_amount: number | null;
          created_at: string | null;
          exchange_rate: number | null;
          exchange_rate_date: string | null;
          fees: number | null;
          metadata: Json | null;
          original_amount: number | null;
          original_currency: string | null;
          settled_amount: number | null;
          tax: number | null;
          tips: number | null;
          transaction_id: string;
          updated_at: string | null;
        };
        Insert: {
          authorized_amount?: number | null;
          created_at?: string | null;
          exchange_rate?: number | null;
          exchange_rate_date?: string | null;
          fees?: number | null;
          metadata?: Json | null;
          original_amount?: number | null;
          original_currency?: string | null;
          settled_amount?: number | null;
          tax?: number | null;
          tips?: number | null;
          transaction_id: string;
          updated_at?: string | null;
        };
        Update: {
          authorized_amount?: number | null;
          created_at?: string | null;
          exchange_rate?: number | null;
          exchange_rate_date?: string | null;
          fees?: number | null;
          metadata?: Json | null;
          original_amount?: number | null;
          original_currency?: string | null;
          settled_amount?: number | null;
          tax?: number | null;
          tips?: number | null;
          transaction_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'transaction_amounts_transaction_id_fkey';
            columns: ['transaction_id'];
            isOneToOne: true;
            referencedRelation: 'transactions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transaction_amounts_transaction_id_fkey';
            columns: ['transaction_id'];
            isOneToOne: true;
            referencedRelation: 'v_installment_purchases';
            referencedColumns: ['purchase_id'];
          },
          {
            foreignKeyName: 'transaction_amounts_transaction_id_fkey';
            columns: ['transaction_id'];
            isOneToOne: true;
            referencedRelation: 'v_transactions_full';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transaction_amounts_transaction_id_fkey';
            columns: ['transaction_id'];
            isOneToOne: true;
            referencedRelation: 'v_transactions_requiring_review';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transaction_amounts_transaction_id_fkey';
            columns: ['transaction_id'];
            isOneToOne: true;
            referencedRelation: 'v_transactions_with_details';
            referencedColumns: ['id'];
          },
        ];
      };
      transaction_categories: {
        Row: {
          color: string | null;
          created_at: string | null;
          icon: string | null;
          id: string;
          is_active: boolean | null;
          is_system_category: boolean | null;
          name: string;
          parent_category_id: string | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          color?: string | null;
          created_at?: string | null;
          icon?: string | null;
          id?: string;
          is_active?: boolean | null;
          is_system_category?: boolean | null;
          name: string;
          parent_category_id?: string | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          color?: string | null;
          created_at?: string | null;
          icon?: string | null;
          id?: string;
          is_active?: boolean | null;
          is_system_category?: boolean | null;
          name?: string;
          parent_category_id?: string | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'transaction_categories_parent_category_id_fkey';
            columns: ['parent_category_id'];
            isOneToOne: false;
            referencedRelation: 'transaction_categories';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transaction_categories_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      transaction_merchant_details: {
        Row: {
          cleaned_merchant_name: string | null;
          created_at: string | null;
          merchant_address: string | null;
          merchant_category_code: string | null;
          merchant_city: string | null;
          merchant_country: string | null;
          merchant_phone: string | null;
          merchant_website: string | null;
          metadata: Json | null;
          raw_merchant_name: string | null;
          transaction_id: string;
          updated_at: string | null;
        };
        Insert: {
          cleaned_merchant_name?: string | null;
          created_at?: string | null;
          merchant_address?: string | null;
          merchant_category_code?: string | null;
          merchant_city?: string | null;
          merchant_country?: string | null;
          merchant_phone?: string | null;
          merchant_website?: string | null;
          metadata?: Json | null;
          raw_merchant_name?: string | null;
          transaction_id: string;
          updated_at?: string | null;
        };
        Update: {
          cleaned_merchant_name?: string | null;
          created_at?: string | null;
          merchant_address?: string | null;
          merchant_category_code?: string | null;
          merchant_city?: string | null;
          merchant_country?: string | null;
          merchant_phone?: string | null;
          merchant_website?: string | null;
          metadata?: Json | null;
          raw_merchant_name?: string | null;
          transaction_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'transaction_merchant_details_transaction_id_fkey';
            columns: ['transaction_id'];
            isOneToOne: true;
            referencedRelation: 'transactions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transaction_merchant_details_transaction_id_fkey';
            columns: ['transaction_id'];
            isOneToOne: true;
            referencedRelation: 'v_installment_purchases';
            referencedColumns: ['purchase_id'];
          },
          {
            foreignKeyName: 'transaction_merchant_details_transaction_id_fkey';
            columns: ['transaction_id'];
            isOneToOne: true;
            referencedRelation: 'v_transactions_full';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transaction_merchant_details_transaction_id_fkey';
            columns: ['transaction_id'];
            isOneToOne: true;
            referencedRelation: 'v_transactions_requiring_review';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transaction_merchant_details_transaction_id_fkey';
            columns: ['transaction_id'];
            isOneToOne: true;
            referencedRelation: 'v_transactions_with_details';
            referencedColumns: ['id'];
          },
        ];
      };
      transaction_metadata: {
        Row: {
          audit: Json | null;
          classification: Json | null;
          created_at: string | null;
          external_ids: Json | null;
          extra: Json | null;
          ml_features: Json | null;
          notes: string | null;
          reconciliation: Json | null;
          relations: Json | null;
          source: Json | null;
          tags: string[] | null;
          temporal: Json | null;
          transaction_id: string;
          updated_at: string | null;
        };
        Insert: {
          audit?: Json | null;
          classification?: Json | null;
          created_at?: string | null;
          external_ids?: Json | null;
          extra?: Json | null;
          ml_features?: Json | null;
          notes?: string | null;
          reconciliation?: Json | null;
          relations?: Json | null;
          source?: Json | null;
          tags?: string[] | null;
          temporal?: Json | null;
          transaction_id: string;
          updated_at?: string | null;
        };
        Update: {
          audit?: Json | null;
          classification?: Json | null;
          created_at?: string | null;
          external_ids?: Json | null;
          extra?: Json | null;
          ml_features?: Json | null;
          notes?: string | null;
          reconciliation?: Json | null;
          relations?: Json | null;
          source?: Json | null;
          tags?: string[] | null;
          temporal?: Json | null;
          transaction_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'transaction_metadata_transaction_id_fkey';
            columns: ['transaction_id'];
            isOneToOne: true;
            referencedRelation: 'transactions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transaction_metadata_transaction_id_fkey';
            columns: ['transaction_id'];
            isOneToOne: true;
            referencedRelation: 'v_installment_purchases';
            referencedColumns: ['purchase_id'];
          },
          {
            foreignKeyName: 'transaction_metadata_transaction_id_fkey';
            columns: ['transaction_id'];
            isOneToOne: true;
            referencedRelation: 'v_transactions_full';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transaction_metadata_transaction_id_fkey';
            columns: ['transaction_id'];
            isOneToOne: true;
            referencedRelation: 'v_transactions_requiring_review';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transaction_metadata_transaction_id_fkey';
            columns: ['transaction_id'];
            isOneToOne: true;
            referencedRelation: 'v_transactions_with_details';
            referencedColumns: ['id'];
          },
        ];
      };
      transactions: {
        Row: {
          amount: number;
          category_id: string | null;
          confidence_score: number | null;
          created_at: string | null;
          currency: string | null;
          deleted_at: string | null;
          description: string;
          email_account_id: string | null;
          id: string;
          installment_number: number | null;
          installment_total: number | null;
          is_recurring: boolean | null;
          is_verified: boolean | null;
          merchant_location: string | null;
          merchant_name: string | null;
          metadata: Json | null;
          notification_received_at: string | null;
          parent_transaction_id: string | null;
          payment_method_id: string | null;
          requires_review: boolean | null;
          source_email_id: string | null;
          status: Database['public']['Enums']['transaction_status'] | null;
          transaction_date: string;
          transaction_subtype:
            | Database['public']['Enums']['transaction_subtype']
            | null;
          transaction_type: Database['public']['Enums']['transaction_type'];
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          amount: number;
          category_id?: string | null;
          confidence_score?: number | null;
          created_at?: string | null;
          currency?: string | null;
          deleted_at?: string | null;
          description: string;
          email_account_id?: string | null;
          id?: string;
          installment_number?: number | null;
          installment_total?: number | null;
          is_recurring?: boolean | null;
          is_verified?: boolean | null;
          merchant_location?: string | null;
          merchant_name?: string | null;
          metadata?: Json | null;
          notification_received_at?: string | null;
          parent_transaction_id?: string | null;
          payment_method_id?: string | null;
          requires_review?: boolean | null;
          source_email_id?: string | null;
          status?: Database['public']['Enums']['transaction_status'] | null;
          transaction_date: string;
          transaction_subtype?:
            | Database['public']['Enums']['transaction_subtype']
            | null;
          transaction_type: Database['public']['Enums']['transaction_type'];
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          amount?: number;
          category_id?: string | null;
          confidence_score?: number | null;
          created_at?: string | null;
          currency?: string | null;
          deleted_at?: string | null;
          description?: string;
          email_account_id?: string | null;
          id?: string;
          installment_number?: number | null;
          installment_total?: number | null;
          is_recurring?: boolean | null;
          is_verified?: boolean | null;
          merchant_location?: string | null;
          merchant_name?: string | null;
          metadata?: Json | null;
          notification_received_at?: string | null;
          parent_transaction_id?: string | null;
          payment_method_id?: string | null;
          requires_review?: boolean | null;
          source_email_id?: string | null;
          status?: Database['public']['Enums']['transaction_status'] | null;
          transaction_date?: string;
          transaction_subtype?:
            | Database['public']['Enums']['transaction_subtype']
            | null;
          transaction_type?: Database['public']['Enums']['transaction_type'];
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'transactions_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'transaction_categories';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transactions_email_account_id_fkey';
            columns: ['email_account_id'];
            isOneToOne: false;
            referencedRelation: 'email_accounts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transactions_parent_transaction_id_fkey';
            columns: ['parent_transaction_id'];
            isOneToOne: false;
            referencedRelation: 'transactions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transactions_parent_transaction_id_fkey';
            columns: ['parent_transaction_id'];
            isOneToOne: false;
            referencedRelation: 'v_installment_purchases';
            referencedColumns: ['purchase_id'];
          },
          {
            foreignKeyName: 'transactions_parent_transaction_id_fkey';
            columns: ['parent_transaction_id'];
            isOneToOne: false;
            referencedRelation: 'v_transactions_full';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transactions_parent_transaction_id_fkey';
            columns: ['parent_transaction_id'];
            isOneToOne: false;
            referencedRelation: 'v_transactions_requiring_review';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transactions_parent_transaction_id_fkey';
            columns: ['parent_transaction_id'];
            isOneToOne: false;
            referencedRelation: 'v_transactions_with_details';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transactions_payment_method_id_fkey';
            columns: ['payment_method_id'];
            isOneToOne: false;
            referencedRelation: 'payment_methods';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transactions_payment_method_id_fkey';
            columns: ['payment_method_id'];
            isOneToOne: false;
            referencedRelation: 'v_credit_card_summary';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transactions_payment_method_id_fkey';
            columns: ['payment_method_id'];
            isOneToOne: false;
            referencedRelation: 'v_payment_methods_with_all_balances';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transactions_payment_method_id_fkey';
            columns: ['payment_method_id'];
            isOneToOne: false;
            referencedRelation: 'v_payment_methods_with_primary_balance';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transactions_payment_method_id_fkey';
            columns: ['payment_method_id'];
            isOneToOne: false;
            referencedRelation: 'v_payment_methods_with_stats';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transactions_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      users: {
        Row: {
          avatar_url: string | null;
          created_at: string | null;
          default_currency: string | null;
          full_name: string;
          id: string;
          onboarding_completed: boolean | null;
          phone: string | null;
          preferences: Json | null;
          timezone: string | null;
          updated_at: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string | null;
          default_currency?: string | null;
          full_name: string;
          id: string;
          onboarding_completed?: boolean | null;
          phone?: string | null;
          preferences?: Json | null;
          timezone?: string | null;
          updated_at?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string | null;
          default_currency?: string | null;
          full_name?: string;
          id?: string;
          onboarding_completed?: boolean | null;
          phone?: string | null;
          preferences?: Json | null;
          timezone?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      v_credit_card_summary: {
        Row: {
          available_credit: number | null;
          billing_cycle_day: number | null;
          color: string | null;
          credit_limit: number | null;
          credit_limit_currency: string | null;
          current_debt: number | null;
          days_until_due: number | null;
          has_multiple_currencies: boolean | null;
          id: string | null;
          institution_name: string | null;
          last_four_digits: string | null;
          last_statement_balance: number | null;
          last_statement_date: string | null;
          minimum_payment_due: number | null;
          minimum_payment_percentage: number | null;
          multi_currency_limits: Json | null;
          name: string | null;
          next_payment_due_date: string | null;
          payment_due_day: number | null;
          payment_status: string | null;
          pending_charges: number | null;
          user_id: string | null;
          utilization_percentage: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'payment_methods_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      v_installment_purchases: {
        Row: {
          category_id: string | null;
          completion_percentage: number | null;
          description: string | null;
          merchant_name: string | null;
          monthly_payment: number | null;
          next_payment_date: string | null;
          paid_amount: number | null;
          paid_installments: number | null;
          payment_method_id: string | null;
          pending_installments: number | null;
          purchase_date: string | null;
          purchase_id: string | null;
          remaining_amount: number | null;
          total_amount: number | null;
          total_installments: number | null;
          user_id: string | null;
        };
        Insert: {
          category_id?: string | null;
          completion_percentage?: never;
          description?: string | null;
          merchant_name?: string | null;
          monthly_payment?: never;
          next_payment_date?: never;
          paid_amount?: never;
          paid_installments?: never;
          payment_method_id?: string | null;
          pending_installments?: never;
          purchase_date?: string | null;
          purchase_id?: string | null;
          remaining_amount?: never;
          total_amount?: number | null;
          total_installments?: number | null;
          user_id?: string | null;
        };
        Update: {
          category_id?: string | null;
          completion_percentage?: never;
          description?: string | null;
          merchant_name?: string | null;
          monthly_payment?: never;
          next_payment_date?: never;
          paid_amount?: never;
          paid_installments?: never;
          payment_method_id?: string | null;
          pending_installments?: never;
          purchase_date?: string | null;
          purchase_id?: string | null;
          remaining_amount?: never;
          total_amount?: number | null;
          total_installments?: number | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'transactions_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'transaction_categories';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transactions_payment_method_id_fkey';
            columns: ['payment_method_id'];
            isOneToOne: false;
            referencedRelation: 'payment_methods';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transactions_payment_method_id_fkey';
            columns: ['payment_method_id'];
            isOneToOne: false;
            referencedRelation: 'v_credit_card_summary';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transactions_payment_method_id_fkey';
            columns: ['payment_method_id'];
            isOneToOne: false;
            referencedRelation: 'v_payment_methods_with_all_balances';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transactions_payment_method_id_fkey';
            columns: ['payment_method_id'];
            isOneToOne: false;
            referencedRelation: 'v_payment_methods_with_primary_balance';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transactions_payment_method_id_fkey';
            columns: ['payment_method_id'];
            isOneToOne: false;
            referencedRelation: 'v_payment_methods_with_stats';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transactions_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      v_payment_methods_with_all_balances: {
        Row: {
          account_type: Database['public']['Enums']['account_type'] | null;
          card_brand: Database['public']['Enums']['card_brand'] | null;
          color: string | null;
          created_at: string | null;
          currency_balances: Json | null;
          deleted_at: string | null;
          exclude_from_totals: boolean | null;
          icon: string | null;
          id: string | null;
          institution_name: string | null;
          is_primary: boolean | null;
          last_four_digits: string | null;
          name: string | null;
          primary_available_balance: number | null;
          primary_balance: number | null;
          primary_currency: string | null;
          status: Database['public']['Enums']['payment_method_status'] | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'payment_methods_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      v_payment_methods_with_primary_balance: {
        Row: {
          account_number_hash: string | null;
          account_type: Database['public']['Enums']['account_type'] | null;
          available_balance: number | null;
          card_brand: Database['public']['Enums']['card_brand'] | null;
          color: string | null;
          created_at: string | null;
          current_balance: number | null;
          deleted_at: string | null;
          exclude_from_totals: boolean | null;
          icon: string | null;
          id: string | null;
          institution_name: string | null;
          is_primary: boolean | null;
          last_balance_update: string | null;
          last_four_digits: string | null;
          last_transaction_date: string | null;
          metadata: Json | null;
          name: string | null;
          pending_amount: number | null;
          primary_currency: string | null;
          status: Database['public']['Enums']['payment_method_status'] | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'payment_methods_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      v_payment_methods_with_stats: {
        Row: {
          account_number_hash: string | null;
          account_type: Database['public']['Enums']['account_type'] | null;
          available_balance: number | null;
          card_brand: Database['public']['Enums']['card_brand'] | null;
          color: string | null;
          created_at: string | null;
          credit_limit: number | null;
          current_balance: number | null;
          deleted_at: string | null;
          exclude_from_totals: boolean | null;
          has_multiple_currencies: boolean | null;
          icon: string | null;
          id: string | null;
          institution_name: string | null;
          is_primary: boolean | null;
          last_balance_update: string | null;
          last_four_digits: string | null;
          last_statement_balance: number | null;
          last_transaction_date: string | null;
          metadata: Json | null;
          name: string | null;
          next_payment_due_date: string | null;
          pending_amount: number | null;
          primary_currency: string | null;
          status: Database['public']['Enums']['payment_method_status'] | null;
          transaction_count: number | null;
          updated_at: string | null;
          user_id: string | null;
          utilization_percentage: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'payment_methods_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      v_transactions_full: {
        Row: {
          account_type: Database['public']['Enums']['account_type'] | null;
          amount: number | null;
          audit: Json | null;
          authorized_amount: number | null;
          category_color: string | null;
          category_icon: string | null;
          category_id: string | null;
          category_name: string | null;
          classification: Json | null;
          cleaned_merchant_name: string | null;
          confidence_score: number | null;
          created_at: string | null;
          currency: string | null;
          deleted_at: string | null;
          description: string | null;
          email_account_id: string | null;
          exchange_rate: number | null;
          external_ids: Json | null;
          fees: number | null;
          id: string | null;
          installment_number: number | null;
          installment_total: number | null;
          institution_name: string | null;
          is_recurring: boolean | null;
          is_verified: boolean | null;
          last_four_digits: string | null;
          merchant_address: string | null;
          merchant_category_code: string | null;
          merchant_city: string | null;
          merchant_country: string | null;
          merchant_location: string | null;
          merchant_name: string | null;
          metadata: Json | null;
          notes: string | null;
          notification_received_at: string | null;
          original_amount: number | null;
          original_currency: string | null;
          parent_transaction_id: string | null;
          payment_method_id: string | null;
          payment_method_name: string | null;
          raw_merchant_name: string | null;
          reconciliation: Json | null;
          relations: Json | null;
          requires_review: boolean | null;
          settled_amount: number | null;
          source: Json | null;
          source_email_id: string | null;
          status: Database['public']['Enums']['transaction_status'] | null;
          tags: string[] | null;
          tax: number | null;
          temporal: Json | null;
          tips: number | null;
          transaction_date: string | null;
          transaction_subtype:
            | Database['public']['Enums']['transaction_subtype']
            | null;
          transaction_type:
            | Database['public']['Enums']['transaction_type']
            | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'transactions_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'transaction_categories';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transactions_email_account_id_fkey';
            columns: ['email_account_id'];
            isOneToOne: false;
            referencedRelation: 'email_accounts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transactions_parent_transaction_id_fkey';
            columns: ['parent_transaction_id'];
            isOneToOne: false;
            referencedRelation: 'transactions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transactions_parent_transaction_id_fkey';
            columns: ['parent_transaction_id'];
            isOneToOne: false;
            referencedRelation: 'v_installment_purchases';
            referencedColumns: ['purchase_id'];
          },
          {
            foreignKeyName: 'transactions_parent_transaction_id_fkey';
            columns: ['parent_transaction_id'];
            isOneToOne: false;
            referencedRelation: 'v_transactions_full';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transactions_parent_transaction_id_fkey';
            columns: ['parent_transaction_id'];
            isOneToOne: false;
            referencedRelation: 'v_transactions_requiring_review';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transactions_parent_transaction_id_fkey';
            columns: ['parent_transaction_id'];
            isOneToOne: false;
            referencedRelation: 'v_transactions_with_details';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transactions_payment_method_id_fkey';
            columns: ['payment_method_id'];
            isOneToOne: false;
            referencedRelation: 'payment_methods';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transactions_payment_method_id_fkey';
            columns: ['payment_method_id'];
            isOneToOne: false;
            referencedRelation: 'v_credit_card_summary';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transactions_payment_method_id_fkey';
            columns: ['payment_method_id'];
            isOneToOne: false;
            referencedRelation: 'v_payment_methods_with_all_balances';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transactions_payment_method_id_fkey';
            columns: ['payment_method_id'];
            isOneToOne: false;
            referencedRelation: 'v_payment_methods_with_primary_balance';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transactions_payment_method_id_fkey';
            columns: ['payment_method_id'];
            isOneToOne: false;
            referencedRelation: 'v_payment_methods_with_stats';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transactions_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      v_transactions_requiring_review: {
        Row: {
          amount: number | null;
          category_id: string | null;
          category_name: string | null;
          confidence_score: number | null;
          created_at: string | null;
          currency: string | null;
          deleted_at: string | null;
          description: string | null;
          email_account_id: string | null;
          id: string | null;
          installment_number: number | null;
          installment_total: number | null;
          is_recurring: boolean | null;
          is_verified: boolean | null;
          merchant_location: string | null;
          merchant_name: string | null;
          metadata: Json | null;
          notification_received_at: string | null;
          parent_transaction_id: string | null;
          payment_method_id: string | null;
          payment_method_name: string | null;
          requires_review: boolean | null;
          review_reason: string | null;
          source_email_id: string | null;
          status: Database['public']['Enums']['transaction_status'] | null;
          transaction_date: string | null;
          transaction_subtype:
            | Database['public']['Enums']['transaction_subtype']
            | null;
          transaction_type:
            | Database['public']['Enums']['transaction_type']
            | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'transactions_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'transaction_categories';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transactions_email_account_id_fkey';
            columns: ['email_account_id'];
            isOneToOne: false;
            referencedRelation: 'email_accounts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transactions_parent_transaction_id_fkey';
            columns: ['parent_transaction_id'];
            isOneToOne: false;
            referencedRelation: 'transactions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transactions_parent_transaction_id_fkey';
            columns: ['parent_transaction_id'];
            isOneToOne: false;
            referencedRelation: 'v_installment_purchases';
            referencedColumns: ['purchase_id'];
          },
          {
            foreignKeyName: 'transactions_parent_transaction_id_fkey';
            columns: ['parent_transaction_id'];
            isOneToOne: false;
            referencedRelation: 'v_transactions_full';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transactions_parent_transaction_id_fkey';
            columns: ['parent_transaction_id'];
            isOneToOne: false;
            referencedRelation: 'v_transactions_requiring_review';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transactions_parent_transaction_id_fkey';
            columns: ['parent_transaction_id'];
            isOneToOne: false;
            referencedRelation: 'v_transactions_with_details';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transactions_payment_method_id_fkey';
            columns: ['payment_method_id'];
            isOneToOne: false;
            referencedRelation: 'payment_methods';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transactions_payment_method_id_fkey';
            columns: ['payment_method_id'];
            isOneToOne: false;
            referencedRelation: 'v_credit_card_summary';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transactions_payment_method_id_fkey';
            columns: ['payment_method_id'];
            isOneToOne: false;
            referencedRelation: 'v_payment_methods_with_all_balances';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transactions_payment_method_id_fkey';
            columns: ['payment_method_id'];
            isOneToOne: false;
            referencedRelation: 'v_payment_methods_with_primary_balance';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transactions_payment_method_id_fkey';
            columns: ['payment_method_id'];
            isOneToOne: false;
            referencedRelation: 'v_payment_methods_with_stats';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transactions_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      v_transactions_with_details: {
        Row: {
          account_type: Database['public']['Enums']['account_type'] | null;
          amount: number | null;
          category_color: string | null;
          category_icon: string | null;
          category_id: string | null;
          category_name: string | null;
          confidence_score: number | null;
          created_at: string | null;
          currency: string | null;
          deleted_at: string | null;
          description: string | null;
          email_account_id: string | null;
          id: string | null;
          installment_number: number | null;
          installment_total: number | null;
          institution_name: string | null;
          is_recurring: boolean | null;
          is_verified: boolean | null;
          last_four_digits: string | null;
          merchant_location: string | null;
          merchant_name: string | null;
          metadata: Json | null;
          notification_received_at: string | null;
          parent_transaction_id: string | null;
          payment_method_color: string | null;
          payment_method_id: string | null;
          payment_method_name: string | null;
          requires_review: boolean | null;
          source_email_id: string | null;
          status: Database['public']['Enums']['transaction_status'] | null;
          transaction_date: string | null;
          transaction_subtype:
            | Database['public']['Enums']['transaction_subtype']
            | null;
          transaction_type:
            | Database['public']['Enums']['transaction_type']
            | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'transactions_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'transaction_categories';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transactions_email_account_id_fkey';
            columns: ['email_account_id'];
            isOneToOne: false;
            referencedRelation: 'email_accounts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transactions_parent_transaction_id_fkey';
            columns: ['parent_transaction_id'];
            isOneToOne: false;
            referencedRelation: 'transactions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transactions_parent_transaction_id_fkey';
            columns: ['parent_transaction_id'];
            isOneToOne: false;
            referencedRelation: 'v_installment_purchases';
            referencedColumns: ['purchase_id'];
          },
          {
            foreignKeyName: 'transactions_parent_transaction_id_fkey';
            columns: ['parent_transaction_id'];
            isOneToOne: false;
            referencedRelation: 'v_transactions_full';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transactions_parent_transaction_id_fkey';
            columns: ['parent_transaction_id'];
            isOneToOne: false;
            referencedRelation: 'v_transactions_requiring_review';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transactions_parent_transaction_id_fkey';
            columns: ['parent_transaction_id'];
            isOneToOne: false;
            referencedRelation: 'v_transactions_with_details';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transactions_payment_method_id_fkey';
            columns: ['payment_method_id'];
            isOneToOne: false;
            referencedRelation: 'payment_methods';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transactions_payment_method_id_fkey';
            columns: ['payment_method_id'];
            isOneToOne: false;
            referencedRelation: 'v_credit_card_summary';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transactions_payment_method_id_fkey';
            columns: ['payment_method_id'];
            isOneToOne: false;
            referencedRelation: 'v_payment_methods_with_all_balances';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transactions_payment_method_id_fkey';
            columns: ['payment_method_id'];
            isOneToOne: false;
            referencedRelation: 'v_payment_methods_with_primary_balance';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transactions_payment_method_id_fkey';
            columns: ['payment_method_id'];
            isOneToOne: false;
            referencedRelation: 'v_payment_methods_with_stats';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transactions_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      v_upcoming_scheduled_transactions: {
        Row: {
          account_type: Database['public']['Enums']['account_type'] | null;
          amount: number | null;
          auto_create: boolean | null;
          category_color: string | null;
          category_id: string | null;
          category_name: string | null;
          created_at: string | null;
          currency: string | null;
          custom_frequency_days: number | null;
          days_until_next: number | null;
          deleted_at: string | null;
          description: string | null;
          end_date: string | null;
          frequency: Database['public']['Enums']['scheduled_frequency'] | null;
          id: string | null;
          institution_name: string | null;
          is_active: boolean | null;
          last_occurrence_date: string | null;
          max_occurrences: number | null;
          merchant_name: string | null;
          metadata: Json | null;
          next_occurrence_date: string | null;
          notification_days_before: number | null;
          notification_enabled: boolean | null;
          occurrences_count: number | null;
          payment_method_id: string | null;
          payment_method_name: string | null;
          transaction_type:
            | Database['public']['Enums']['transaction_type']
            | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'scheduled_transactions_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'transaction_categories';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'scheduled_transactions_payment_method_id_fkey';
            columns: ['payment_method_id'];
            isOneToOne: false;
            referencedRelation: 'payment_methods';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'scheduled_transactions_payment_method_id_fkey';
            columns: ['payment_method_id'];
            isOneToOne: false;
            referencedRelation: 'v_credit_card_summary';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'scheduled_transactions_payment_method_id_fkey';
            columns: ['payment_method_id'];
            isOneToOne: false;
            referencedRelation: 'v_payment_methods_with_all_balances';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'scheduled_transactions_payment_method_id_fkey';
            columns: ['payment_method_id'];
            isOneToOne: false;
            referencedRelation: 'v_payment_methods_with_primary_balance';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'scheduled_transactions_payment_method_id_fkey';
            columns: ['payment_method_id'];
            isOneToOne: false;
            referencedRelation: 'v_payment_methods_with_stats';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'scheduled_transactions_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Functions: {
      calculate_payment_method_balance: {
        Args: { p_as_of_date?: string; p_payment_method_id: string };
        Returns: {
          available_balance: number;
          current_balance: number;
          last_transaction_date: string;
          pending_amount: number;
        }[];
      };
      check_duplicate_transaction: {
        Args: {
          p_amount: number;
          p_external_id?: string;
          p_merchant_name?: string;
          p_payment_method_id?: string;
          p_transaction_date: string;
          p_user_id: string;
        };
        Returns: {
          id: string;
          similarity_score: number;
        }[];
      };
      create_installment_transactions: {
        Args: {
          p_category_id?: string;
          p_description: string;
          p_merchant_name?: string;
          p_number_of_installments: number;
          p_parent_transaction_id: string;
          p_payment_method_id: string;
          p_start_date: string;
          p_total_amount: number;
          p_user_id: string;
        };
        Returns: undefined;
      };
      create_payment_method_balance: {
        Args: {
          p_currency: string;
          p_initial_balance?: number;
          p_payment_method_id: string;
        };
        Returns: string;
      };
      get_payment_method_total_balance: {
        Args: { p_payment_method_id: string; p_target_currency?: string };
        Returns: number;
      };
      gtrgm_compress: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gtrgm_decompress: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gtrgm_in: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gtrgm_options: {
        Args: { '': unknown };
        Returns: undefined;
      };
      gtrgm_out: {
        Args: { '': unknown };
        Returns: unknown;
      };
      process_due_installments: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
      process_due_scheduled_transactions: {
        Args: Record<PropertyKey, never>;
        Returns: {
          error_message: string;
          scheduled_id: string;
          success: boolean;
          transaction_id: string;
        }[];
      };
      set_limit: {
        Args: { '': number };
        Returns: number;
      };
      show_limit: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
      show_trgm: {
        Args: { '': string };
        Returns: string[];
      };
      update_payment_method_balances: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
    };
    Enums: {
      account_type:
        | 'credit_card'
        | 'debit_card'
        | 'checking_account'
        | 'savings_account'
        | 'cash'
        | 'digital_wallet'
        | 'investment_account'
        | 'other';
      alert_type: 'approaching_limit' | 'exceeded_limit' | 'monthly_summary';
      budget_status:
        | 'under_budget'
        | 'on_track'
        | 'approaching_limit'
        | 'over_budget';
      card_brand: 'visa' | 'mastercard' | 'amex' | 'discover' | 'other';
      feedback_type:
        | 'correct'
        | 'incorrect_amount'
        | 'incorrect_category'
        | 'incorrect_merchant';
      payment_method_status:
        | 'active'
        | 'inactive'
        | 'expired'
        | 'blocked'
        | 'closed';
      scheduled_frequency:
        | 'daily'
        | 'weekly'
        | 'biweekly'
        | 'monthly'
        | 'bimonthly'
        | 'quarterly'
        | 'semiannual'
        | 'annual'
        | 'custom';
      sync_status: 'pending' | 'in_progress' | 'completed' | 'failed';
      transaction_status:
        | 'pending'
        | 'authorized'
        | 'posted'
        | 'completed'
        | 'reversed'
        | 'failed'
        | 'under_review';
      transaction_subtype:
        | 'purchase'
        | 'payment'
        | 'transfer_in'
        | 'transfer_out'
        | 'fee'
        | 'interest_charge'
        | 'interest_earned'
        | 'refund'
        | 'adjustment'
        | 'cash_advance'
        | 'reversal'
        | 'chargeback'
        | 'cashback'
        | 'dividend'
        | 'salary'
        | 'deposit'
        | 'withdrawal'
        | 'bill_payment'
        | 'subscription'
        | 'installment'
        | 'other';
      transaction_type: 'income' | 'expense' | 'transfer';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  'public'
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      account_type: [
        'credit_card',
        'debit_card',
        'checking_account',
        'savings_account',
        'cash',
        'digital_wallet',
        'investment_account',
        'other',
      ],
      alert_type: ['approaching_limit', 'exceeded_limit', 'monthly_summary'],
      budget_status: [
        'under_budget',
        'on_track',
        'approaching_limit',
        'over_budget',
      ],
      card_brand: ['visa', 'mastercard', 'amex', 'discover', 'other'],
      feedback_type: [
        'correct',
        'incorrect_amount',
        'incorrect_category',
        'incorrect_merchant',
      ],
      payment_method_status: [
        'active',
        'inactive',
        'expired',
        'blocked',
        'closed',
      ],
      scheduled_frequency: [
        'daily',
        'weekly',
        'biweekly',
        'monthly',
        'bimonthly',
        'quarterly',
        'semiannual',
        'annual',
        'custom',
      ],
      sync_status: ['pending', 'in_progress', 'completed', 'failed'],
      transaction_status: [
        'pending',
        'authorized',
        'posted',
        'completed',
        'reversed',
        'failed',
        'under_review',
      ],
      transaction_subtype: [
        'purchase',
        'payment',
        'transfer_in',
        'transfer_out',
        'fee',
        'interest_charge',
        'interest_earned',
        'refund',
        'adjustment',
        'cash_advance',
        'reversal',
        'chargeback',
        'cashback',
        'dividend',
        'salary',
        'deposit',
        'withdrawal',
        'bill_payment',
        'subscription',
        'installment',
        'other',
      ],
      transaction_type: ['income', 'expense', 'transfer'],
    },
  },
} as const;
