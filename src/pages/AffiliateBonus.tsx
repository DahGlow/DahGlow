import { Link } from 'react-router-dom';
import { Gift,ChevronRight } from 'lucide-react';
import AffiliateLayout from '@/components/layout/AffiliateLayout';
import boost from '@/assets/affiliate-commission-boost.webp';

export default function AffiliateBonus(){return <AffiliateLayout title="Bonus & Opportunities"><section className="affiliate-boost-hero" style={{backgroundImage:`url(${boost})`}}><span className="affiliate-eyebrow">GROW YOUR CREATOR SPACE</span><h1>Make every share count.</h1><p>Build your picks and discover your next campaign.</p></section><section className="affiliate-bonus-panel"><Gift size={48}/><h2>Bonus opportunities</h2><p>No cash bonus is currently published. When Dah Glow launches an eligible reward, its amount, dates and qualifying conditions will appear here.</p><Link className="affiliate-secondary" to="/affiliate/boost">Explore Commission Boost <ChevronRight size={19}/></Link><Link className="affiliate-text-button" to="/affiliate?tab=campaign">See current campaigns</Link></section></AffiliateLayout>;}
