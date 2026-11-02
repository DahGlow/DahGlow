import { NavLink } from 'react-router-dom';
import { LayoutDashboard,PlusSquare,Package,Store,Users,ShoppingBag,ChartNoAxesCombined,ShieldCheck,Settings,Building2,LockKeyhole } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ADMIN_NAVIGATION } from '@/constants/adminNavigation';
import { useAdmin } from '@/hooks/useAdmin';

const ICONS:Record<string,LucideIcon>={overview:LayoutDashboard,'add-product':PlusSquare,products:Package,store:Store,vendors:Building2,orders:ShoppingBag,customers:Users,analytics:ChartNoAxesCombined,admins:ShieldCheck,settings:Settings};
interface Props{open:boolean;onClose:()=>void;}
export default function AdminSidebar({open,onClose}:Props){const {session,segment}=useAdmin();return <aside className={`admin-sidebar ${open?'is-open':''}`}><div className="admin-brand">DAH GLOW<span>PRIVATE CONTROL</span></div><nav aria-label="Administration">{ADMIN_NAVIGATION.filter(n=>session.permissions.includes(n.permission)||n.id==='settings').map(n=>{const Icon=ICONS[n.id];const locked=!session.permissions.includes(n.permission);return <NavLink key={n.id} to={`/private-control/${segment}/${n.id}`} onClick={onClose}><Icon size={20}/>{n.label}{locked&&<LockKeyhole size={14}/>}</NavLink>;})}</nav><div className="admin-sidebar-footer"><ShieldCheck size={18}/><div>Verified session<span>{session.role.replace(/_/g,' ')}</span></div></div></aside>;}
