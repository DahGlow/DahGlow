import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Settings,ChevronRight,BookOpen,Gift } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useShop } from '@/hooks/useShop';
import { PRODUCTS,ASSETS } from '@/constants/products';
import MemberCards from '@/components/features/MemberCards';
import AccountServices from '@/components/features/AccountServices';
import ProductGrid from '@/components/features/ProductGrid';
import EmptyState from '@/components/features/EmptyState';
import { toast } from 'sonner';
export default function Me(){const {user,loading}=useAuth();const {t,wishlist,recent}=useShop();const [tab,setTab]=useState('Wishlist');const products=(tab==='Wishlist'?wishlist:recent).map(id=>PRODUCTS.find(p=>p.id===id)).filter((p):p is typeof PRODUCTS[number]=>!!p);return <main className="me-page"><div className="account-heading"><div>{user?<><h1>{user.username}</h1><img src={ASSETS.vip} alt="S0 membership"/></>:<Link to="/login"><h1>{loading?'DAH GLOW':t('Sign in')}<ChevronRight size={20}/></h1><p>{t('Welcome to your glow')}</p></Link>}</div><Link to="/settings" className="icon-button" aria-label={t('Settings')}><Settings/></Link></div><MemberCards/><button className="glow-101" onClick={()=>toast.info(t('Your style, your way.')+' · Dah Glow is a demo fashion storefront.')}><BookOpen size={21}/><span>DahGlow 101</span><b>{t('View all')} ›</b></button><div className="account-balances">{['Coupons','Points','Wallet','Gift Card'].map((x,i)=><button key={x} onClick={()=>toast.info(t('Nothing here yet'))}>{i===3?<Gift/>:<strong>0</strong>}<span>{t(x)}</span></button>)}</div><AccountServices/><section className="account-collections"><div className="segmented-tabs">{['Wishlist','Recently Viewed'].map(x=><button key={x} className={tab===x?'active':''} onClick={()=>setTab(x)}>{t(x)}</button>)}</div>{products.length?<ProductGrid products={products}/>:<EmptyState heart={tab==='Wishlist'} title={tab==='Wishlist'?'Your wishlist is waiting':'Nothing here yet'} description={tab==='Wishlist'?'Save the things you love with a heart.':'Browse a product for 5 seconds to see it here.'}/>}</section></main>;}
