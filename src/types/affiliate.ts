export interface AffiliateProfile {
  user_id: string;
  affiliate_id: string;
  referral_code: string;
  display_name: string;
  categories: string[];
  active: boolean;
  created_at: string;
}

export interface AffiliateProgram {
  enabled: boolean;
  commission_rate: number | string | null;
  returning_rate: number | string | null;
  payout_enabled: boolean;
  updated_at: string;
}

export interface AffiliateSocialProfile {
  provider: string;
  profile_url: string;
  verified: boolean;
}

export interface AffiliateEarning {
  id: string;
  order_name: string;
  commission: number | string;
  status: 'pending' | 'available' | 'disqualified';
  created_at: string;
  available_at: string | null;
  reason: string | null;
}

export interface AffiliateSummary {
  profile: AffiliateProfile;
  program: AffiliateProgram;
  picks: string[];
  social: AffiliateSocialProfile[];
  earnings: AffiliateEarning[];
  balance: number;
  pending: number;
  income: number;
  withdrawals: number;
}

export interface AffiliateRule {
  title: string;
  body: string[];
}

export interface AffiliateStats {
  daily: { date: string; visits: number }[];
  visits: number;
  orders: number;
  revenue: number;
  commission: number;
}
