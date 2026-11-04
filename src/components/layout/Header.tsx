import { useEffect,useState } from 'react';
import { Link,useLocation,useNavigate,useSearchParams } from 'react-router-dom';
import { Menu,Mail,Search,Heart,Camera,ChevronDown } from 'lucide-react';
import { useShop } from '@/hooks/useShop';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { ASSETS } from '@/constants/products';
import SideMenu from '@/components/layout/SideMenu';
import DesktopHeader from '@/components/layout/DesktopHeader';

export default function Header(){
 const {t,cart,language,currency}=useShop();const branding=useStoreSettings();const {pathname}=useLocation();const navigate=useNavigate();const [params]=useSearchParams();const [scroll,setScroll]=useState(0);const [menu,setMenu]=useState(false);const [query,setQuery]=useState('');const home=pathname==='/';
 useEffect(()=>{const update=()=>setScroll(window.scrollY);update();window.addEventListener('scroll',update,{passive:true});return()=>window.removeEventListener('scroll',update);},[pathname]);
 const active=params.get('category')||'All';const search=()=>navigate(`/search?q=${encodeURIComponent(query)}`);
 if(pathname.startsWith('/wallet')||pathname.startsWith('/settings')||pathname.startsWith('/stores/')||pathname.startsWith('/products/')||pathname.startsWith('/product/')||pathname.startsWith('/us/user/')||pathname.includes('callback')||pathname.startsWith('/private-control/')||pathname.startsWith('/account/')||pathname.startsWith('/login')||pathname==='/support'||pathname==='/contact')return null;
 return <><div className="desktop-announcement"><span>{branding.data?.announcement||t('Your style, your way.')} <b>SHOP {branding.data?.name||'DAH GLOW'}</b> · Secure Shopify checkout</span><div><Link to="/trends">{t('Trends')}</Link><Link to="/me">{t('Me')}</Link><Link to="/settings/language">{language.toUpperCase()} / {currency} <ChevronDown size={12}/></Link></div></div>
 <header className={`store-header mobile-store-header ${!home?'solid':scroll>40?'solid':'over-hero'} ${home&&scroll>180?'search-stage':''}`}><div className="header-row"><div className="header-left"><button className="icon-button" aria-label="Open categories" onClick={()=>setMenu(true)}><Menu/></button><Link className="icon-button message-icon" aria-label={t('Messages')} to="/messages"><Mail/><span/></Link></div>
 {home&&scroll>180?<div className="header-search"><input aria-label={t('Search')} placeholder={t('Search your next favorite')} value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&search()}/><Link className="header-camera" to="/scan-product" aria-label="Search with a photo"><Camera size={21}/></Link><button aria-label={t('Search')} onClick={search}><Search size={21}/></button></div>:<Link to="/" className="brand">{branding.data?.logo?<img className="store-brand-logo" src={branding.data.logo} alt={branding.data.name||'Dah Glow'}/>:<>{branding.data?.name||'DAH GLOW'}<span className="brand-dot">.</span></>}</Link>}
 <div className="header-right">{!(home&&scroll>180)&&<Link className="icon-button" to="/search" aria-label={t('Search')}><Search/></Link>}<Link className="icon-button" to="/wishlist" aria-label={t('Wishlist')}><Heart/></Link><Link className="icon-button cart-icon" to="/cart" aria-label={t('Cart')}><img src={ASSETS.cart} alt=""/>{cart.length>0&&<span className="count">{cart.reduce((n,x)=>n+x.quantity,0)}</span>}</Link></div></div>
 <nav className="category-nav" aria-label="Shopping categories">{['All','Women','Men','Kids','Home','Beauty'].map(c=><Link key={c} className={active===c?'active':''} to={c==='All'?'/':`/?category=${c}`}>{t(c)}</Link>)}</nav></header>
 <DesktopHeader onMenu={()=>setMenu(true)}/><SideMenu open={menu} onClose={()=>setMenu(false)}/></>;
}
