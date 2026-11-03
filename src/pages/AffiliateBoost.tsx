import AffiliateLayout from '@/components/layout/AffiliateLayout';
import AffiliateCatalog from '@/components/features/AffiliateCatalog';
import boost from '@/assets/affiliate-commission-boost.webp';
import { useAffiliate } from '@/hooks/useAffiliate';

export default function AffiliateBoost(){const affiliate=useAffiliate();return <AffiliateLayout title="Commission Boost"><section className="affiliate-boost-hero" style={{backgroundImage:`url(${boost})`}}><span className="affiliate-eyebrow">THE CREATOR EDIT</span><h1>Commission Boost</h1><p>Extra opportunities for returning customers</p></section><p className="affiliate-program-note">{affiliate.data?.program.enabled&&affiliate.data.program.returning_rate!==null?`Returning-customer commission: ${Number(affiliate.data.program.returning_rate)*100}% on qualifying products. See payment rules for eligibility.`:'Browse and share now. Returning-customer commission rates will appear when configured by Dah Glow.'}</p><AffiliateCatalog/></AffiliateLayout>;}
