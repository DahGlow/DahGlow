import { useAdminData } from '@/hooks/useAdmin';
import { formatMoney } from '@/lib/shopify';
import AdminDataState from '@/components/features/AdminDataState';
import type { Money } from '@/types/shop';

interface Data{events:{event_id:string;topic:string;order_name:string|null;customer_name:string|null;total:Money|null;financial_status:string|null;created_at:string}[];audit:{id:string;action:string;resource:string;created_at:string}[];}
export default function AdminActivity(){const query=useAdminData<Data>('activity',{},true);return <section className="admin-panel"><div className="admin-panel-heading"><h2>Order & payment activity</h2><span>Webhook feed · polls every 30s</span></div><AdminDataState loading={query.isLoading} error={query.error}/>{query.data&&!query.data.events.length&&<p className="admin-muted">No recorded Shopify webhook events yet.</p>}{query.data?.events.map(e=><article className="admin-event" key={e.event_id}><span className="admin-event-dot"/><div><strong>{e.topic.replace('/',' · ')}</strong><p>{e.order_name||'Order update'}{e.customer_name?` · ${e.customer_name}`:''}</p><small>{e.financial_status||'Payment status not supplied'} · {new Date(e.created_at).toLocaleString()}</small></div>{e.total&&<b>{formatMoney(e.total)}</b>}</article>)}</section>;}
