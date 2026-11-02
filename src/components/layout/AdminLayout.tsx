import { useState,type ReactNode } from 'react';
import { Menu,ArrowUpRight,LockKeyhole } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAdmin } from '@/hooks/useAdmin';
import AdminSidebar from '@/components/layout/AdminSidebar';

interface Props{children:ReactNode;title:string;}
export default function AdminLayout({children,title}:Props){const [open,setOpen]=useState(false);const {session}=useAdmin();return <div className="admin-shell"><AdminSidebar open={open} onClose={()=>setOpen(false)}/>{open&&<button className="admin-sidebar-scrim" onClick={()=>setOpen(false)} aria-label="Close navigation"/>}<div className="admin-workspace"><header className="admin-topbar"><button className="icon-button admin-menu" onClick={()=>setOpen(!open)} aria-label="Toggle navigation"><Menu/></button><span><LockKeyhole size={14}/> PRIVATE WORKSPACE</span><Link to="/" className="admin-store-link">Open storefront <ArrowUpRight size={16}/></Link><div className="admin-avatar" title={session.email}>{session.email.slice(0,1).toUpperCase()}</div></header><main className="admin-main"><div className="admin-page-heading"><span>DAH GLOW / OPERATIONS</span><h1>{title}</h1></div>{children}</main></div></div>;}
