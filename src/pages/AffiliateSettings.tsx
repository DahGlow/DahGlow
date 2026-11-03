import AffiliateLayout from '@/components/layout/AffiliateLayout';
import AffiliateProfileForm from '@/components/forms/AffiliateProfileForm';
import { useAffiliate } from '@/hooks/useAffiliate';

export default function AffiliateSettings(){const affiliate=useAffiliate();return <AffiliateLayout title="Account Settings"><div className="affiliate-section-heading"><h1>Account Settings</h1></div>{affiliate.data?<AffiliateProfileForm profile={affiliate.data.profile}/>:<p className="affiliate-loading">Loading your affiliate settings…</p>}</AffiliateLayout>;}
