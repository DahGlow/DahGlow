import { CreditCard,Package,Truck,MessageSquare,RotateCcw,Headset,Store,ShieldCheck,Megaphone,Gift, type LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useShop } from '@/hooks/useShop';

interface Item {label:string;icon:LucideIcon;path?:string;}
const ORDERS:Item[]=[{label:'Unpaid',icon:CreditCard},{label:'Processing',icon:Package},{label:'Shipped',icon:Truck},{label:'Review',icon:MessageSquare},{label:'Returns',icon:RotateCcw}];
const SERVICES:Item[]=[{label:'Customer Service',icon:Headset},{label:'Following',icon:Store,path:'/account/stores?tab=following'},{label:'Gift Card',icon:Gift,path:'/wallet/payment?tab=giftcard'},{label:'More Services',icon:Megaphone},{label:'Policy',icon:ShieldCheck}];
export default function AccountServices(){const {t}=useShop();const navigate=useNavigate();return <>{[{title:'My Orders',items:ORDERS},{title:'More Services',items:SERVICES}].map(group=><section className="account-section" key={group.title}><div className="account-section-title"><h2>{t(group.title)}</h2>{group.title==='My Orders'&&<button onClick={()=>navigate('/us/user/orders/list')}>{t('View all')} ›</button>}</div><div className="service-icons">{group.items.map(({label,icon:Icon,path})=><button key={label} onClick={()=>group.title==='My Orders'?navigate(`/us/user/orders/list?tab=${encodeURIComponent(label)}`):path?navigate(path):toast.info(`${label} will be available soon.`)}><Icon strokeWidth={1.6}/><span>{t(label)}</span></button>)}</div></section>)}</>;}
