import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Ticket } from 'lucide-react';
import { toast } from 'sonner';
import PageHeader from '@/components/layout/PageHeader';
import { useRewards } from '@/hooks/useRewards';
import { useAuth } from '@/hooks/useAuth';

export default function Coupons(){const [tab,setTab]=useState('Unused');const {user}=useAuth();const rewards=useRewards();const coupons=rewards.data?.coupons.filter(c=>tab==='Used'?!!c.used_at:tab==='Expired'?!c.used_at&&!!c.expires_at&&Date.parse(c.expires_at)<Date.now():!c.used_at&&(!c.expires_at||Date.parse(c.expires_at)>=Date.now()))||[];return <main className="standard-page coupons-page"><PageHeader title="My Coupons"/><div className="segmented-tabs">{['Unused','Used','Expired'].map(t=><button className={tab===t?'active':''} key={t} onClick={()=>setTab(t)}>{t}</button>)}</div>{!user&&<Link className="order-secondary-button" to="/login">Sign in to see your coupons</Link>}{rewards.error&&<p role="alert">{rewards.error.message}</p>}{!coupons.length?<div className="reward-empty"><Ticket size={72} strokeWidth={1}/><h2>{rewards.isLoading?'Loading coupons…':`No ${tab.toLowerCase()} coupons`}</h2></div>:coupons.map(c=><article className="coupon-card" key={c.id}><Ticket size={32}/><div><h2>{c.code}</h2><p>{c.description}</p>{c.expires_at&&<small>Expires {new Date(c.expires_at).toLocaleDateString()}</small>}</div><button className="order-secondary-button" disabled={tab!=='Unused'} onClick={()=>void navigator.clipboard.writeText(c.code).then(()=>toast.success('Coupon copied. Apply it at Shopify checkout.')).catch(()=>toast.error('Unable to copy code'))}>Copy code</button></article>)}</main>;}
