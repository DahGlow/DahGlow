import { Link } from 'react-router-dom';
import { useAdmin } from '@/hooks/useAdmin';
import { formatMoney } from '@/lib/shopify';
import type { Analytics } from '@/types/admin';
export default function AdminTopCustomers({data}:{data:Analytics}){const {segment,session}=useAdmin();return <section className="admin-panel"><div className="admin-panel-heading"><h2>Top customers</h2><span>By net paid order value</span></div>{!data.topCustomers.length?<p className="admin-muted">No qualifying customer purchases.</p>:data.topCustomers.map((c,i)=><div className="admin-customer-rank" key={c.id}><span className="admin-rank">0{i+1}</span><div><strong>{session.permissions.includes('customers')?<Link to={`/private-control/${segment}/customers?id=${encodeURIComponent(c.id)}`}>{c.name||'Customer'}</Link>:c.name||'Customer'}</strong><p>{c.email}</p><small>{c.orders} orders · Latest {c.lastOrder}</small></div><b>{formatMoney(c.paid,data.currency)}</b></div>)}</section>;}
