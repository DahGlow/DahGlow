import { useEffect,useState } from 'react';
import { Link,useLocation,useNavigate,useSearchParams } from 'react-router-dom';
import { Menu,Mail,Search,Heart,Camera,ChevronDown } from 'lucide-react';
import { useShop } from '@/hooks/useShop';
import { ASSETS } from '@/constants/products';
import SideMenu from '@/components/layout/SideMenu';
import InfoModal from '@/components/features/InfoModal';

export default function Header(){
 const {t,cart,language,currency}=useShop();const {pathname}=useLocation();const navigate=useNavigate();const [params]=useSearchParams();const [scroll,setScroll]=useState(0);const [menu,setMenu]=useState(false);const [messages,setMessages]=useState(false);const [query,setQuery]=useState('');const home=pathname==='/';
 useEffect(()=>{const update=()=>setScroll(window.scrollY);update();window.addEventListener('scroll',update,{passive:true});return()=>window.removeEventListener('scroll',update);},[pathname]);
 const active=params.get('category')||'All';const search=()=>navigate(`/search?q=${encodeURIComponent(query)}`);
 if(pathname.startsWith('/products/')||pathname.startsWith('/product/')||pathname.startsWith('/us/user/')||pathname.includes('callback'))return null;
 return <><div className="desktop-announcement"><span>{t('Your style, your way.')} <b>SHOP DAH GLOW</b> · Secure Shopify checkout</span><div><Link to="/trends">{t('Trends')}</Link><Link to="/me">{t('Me')}</Link><Link to="/settings/language">{language.toUpperCase()} / {currency} <ChevronDown size={12}/></Link></div></div>
 <header className={`store-header ${!home?'desktop-only solid':scroll>40?'solid':'over-hero'} ${home&&scroll>180?'search-stage':''}`}><div className="header-row"><div className="header-left"><button className="icon-button" aria-label="Open categories" onClick={()=>setMenu(true)}><Menu/></button><button className="icon-button message-icon" aria-label={t('Messages')} onClick={()=>setMessages(true)}><Mail/><span/></button></div>
 {home&&scroll>180?<div className="header-search"><input aria-label={t('Search')} placeholder={t('Search your next favorite')} value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&search()}/><Camera size={21} aria-hidden="true"/><button aria-label={t('Search')} onClick={search}><Search size={21}/></button></div>:<Link to="/" className="brand">DAH GLOW<span className="brand-dot">.</span></Link>}
 <div className="header-right">{!(home&&scroll>180)&&<Link className="icon-button" to="/search" aria-label={t('Search')}><Search/></Link>}<Link className="icon-button" to="/wishlist" aria-label={t('Wishlist')}><Heart/></Link><Link className="icon-button cart-icon" to="/cart" aria-label={t('Cart')}><img src={ASSETS.cart} alt=""/>{cart.length>0&&<span className="count">{cart.reduce((n,x)=>n+x.quantity,0)}</span>}</Link></div></div>
 <nav className="category-nav" aria-label="Shopping categories">{['All','Women','Men','Kids','Home','Beauty'].map(c=><Link key={c} className={active===c?'active':''} to={c==='All'?'/':`/?category=${c}`}>{t(c)}</Link>)}</nav></header>
 <SideMenu open={menu} onClose={()=>setMenu(false)}/><InfoModal open={messages} onClose={()=>setMessages(false)} title={t('Messages')}><p>{t('No messages yet')}</p><p>{t('Sign in to save your favorites and follow stores.')}</p></InfoModal></>;
}
