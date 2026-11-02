import { Link } from 'react-router-dom';
import { useAdminData,useAdmin } from '@/hooks/useAdmin';
import { formatMoney } from '@/lib/shopify';
import type { AdminCustomer } from '@/types/admin';
import AdminDataState from '@/components/features/AdminDataState';

export default function AdminCustomerDetails({id}:{id:string}){const q=useAdminData<{customer:AdminCustomer|null}>('customer',{id});const {segment,session}=useAdmin();const c=q.data?.customer;return <><AdminDataState loading={q.isLoading} error={q.error}/>{c&&<section className="admin-panel"><h2>{c.displayName||'Customer'}</h2><p>{c.email}</p><p>{c.numberOfOrders} Shopify orders · {formatMoney(c.amountSpent)} spent</p><h2>Order history</h2>{c.orders?.nodes.map(o=><div className="admin-event" key={o.id}><div>{session.permissions.includes('orders')?<Link to={`/private-control/${segment}/orders?id=${encodeURIComponent(o.id)}`}>{o.name}</Link>:o.name}<p>{o.displayFinancialStatus} · {new Date(o.createdAt).toLocaleDateString()}</p></div><strong>{formatMoney(o.currentTotalPriceSet.shopMoney)}</strong></div>)}{c.orders?.pageInfo.hasNextPage&&<p className="admin-muted">Showing the first 50 orders. Use the Orders search for the complete history.</p>}</section>}</>;}
