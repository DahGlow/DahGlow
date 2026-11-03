import { Link } from 'react-router-dom';
import { Share2 } from 'lucide-react';
import { useAffiliate } from '@/hooks/useAffiliate';
import { affiliateApi,shareAffiliateLink } from '@/lib/affiliate';
import { toast } from 'sonner';
import boost from '@/assets/affiliate-boost.jpg';
import friday from '@/assets/black-friday.jpg';
const CAMPAIGNS=[{name:'Commission Boost',description:'Curated products for your next share. Rates follow the published program settings.',image:boost,path:'/affiliate/boost'},{name:'Dah Glow Super Deals',description:'Discover current store offers. Actual discounts appear on each product.',image:friday,path:'/deals'},{name:'The November Edit',description:'Explore the latest Dah Glow seasonal collection.',image:friday,path:'/black-Friday-2026-November-dah-glow'}];
export default function AffiliateCampaigns(){const affiliate=useAffiliate();const share=(path:string)=>void affiliateApi<{url:string}>({op:'convert',link:path}).then(data=>shareAffiliateLink(data.url)).catch(error=>toast.error(error.message));return <section className="affiliate-campaigns">{CAMPAIGNS.map(campaign=><article key={campaign.name} className="affiliate-campaign"><img src={campaign.image} alt={campaign.name}/><div><h3>{campaign.name}</h3><p>{campaign.description}</p><div className="affiliate-row"><Link to={campaign.path}>Preview</Link><button className="affiliate-primary" disabled={!affiliate.data} onClick={()=>share(campaign.path)}><Share2 size={19}/>Share campaign</button></div></div></article>)}</section>;}
