import { Link,useNavigate } from 'react-router-dom';
import { House,Heart,Headset,UserRound,ChevronRight } from 'lucide-react';
import { Dialog,DialogContent,DialogTitle,DialogDescription } from '@/components/features/GlowDialog';
import { useShop } from '@/hooks/useShop';
import { CATEGORIES } from '@/constants/products';
import { CATEGORY_VISUALS } from '@/constants/categoryVisuals';

interface Props {open:boolean;onClose:()=>void;}
export default function SideMenu({open,onClose}:Props){const {t}=useShop();const navigate=useNavigate();const choose=(c:string)=>{onClose();navigate(c==='Sale'?'/deals':`/?category=${c==='New In'?'All':c}`);};return <Dialog open={open} onOpenChange={value=>!value&&onClose()}><DialogContent className="side-menu"><DialogTitle className="sr-only">Shopping categories</DialogTitle><DialogDescription className="sr-only">Explore Dah Glow categories.</DialogDescription><div className="drawer-top">{['All','Women','Men','Kids','Home'].map(c=><button key={c} onClick={()=>choose(c)}>{t(c)}</button>)}</div><div className="drawer-list">{['New In','Sale',...CATEGORIES,'Jewelry & Accessories'].map((c,i)=><button key={c} onClick={()=>choose(c==='Jewelry & Accessories'?'Women':c)}><img src={(CATEGORY_VISUALS.find(p=>p.name===c)||CATEGORY_VISUALS[i%CATEGORY_VISUALS.length]).image} alt=""/><span>{t(c)}</span><ChevronRight size={18}/></button>)}</div><div className="drawer-bottom"><Link aria-label={t('Shop')} to="/" onClick={onClose}><House/></Link><Link aria-label={t('Wishlist')} to="/wishlist" onClick={onClose}><Heart/></Link><Link to="/support" aria-label={t('Customer Service')} onClick={onClose}><Headset/></Link><Link aria-label={t('Me')} to="/me" onClick={onClose}><UserRound/></Link></div></DialogContent></Dialog>;}
