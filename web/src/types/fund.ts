export interface Fund {
  id?: number; // Supabase generated ID
  company_name: string;
  fund_name: string;
  management_fees: number;
  sales_fees: number;
  custody_fees: number;
  office_admin_fees: number;
  other_expenses: number;
  ter: number; // Total Expense Ratio
  front_end_commission: number;
  back_end_commission: number;
  trading_fee_ratio: number;
  category?: string; // "S&P500" | "Nasdaq100"
  created_at?: string;
}
