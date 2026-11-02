import { ArrowUpRight,Wallet } from 'lucide-react';
import { formatMoney } from '@/lib/shopify';
import type { Analytics } from '@/types/admin';

interface Props{data:Analytics;}
const METRICS=[['todayRevenue','Today’s net payments',true],['totalOrders','Orders in range',false],['todayOrders','Today’s orders',false],['totalCustomers','Total customers',false],['newCustomers','New customers in range',false],['totalProducts','Total products',false],['activeProducts','Active products',false],['pendingOrders','Pending payments',false],['paidOrders','Paid orders',false],['fulfilledOrders','Fulfilled orders',false],['cancelledOrders','Cancelled orders',false]] as const;
export default function AdminMetrics({data}:Props){return <section className="admin-metrics"><article className="admin-metric featured"><div><Wallet size={22}/><span>NET ORDER PAYMENTS · SELECTED RANGE</span><ArrowUpRight size={20}/></div><strong>{formatMoney(data.metrics.net,data.currency)}</strong><p>Received {formatMoney(data.metrics.payments,data.currency)} · Refunded {formatMoney(data.metrics.refunds,data.currency)}</p></article>{METRICS.map(([key,label,money])=><article className="admin-metric" key={key}><span>{label}</span><strong>{money?formatMoney(data.metrics[key],data.currency):data.metrics[key].toLocaleString()}</strong></article>)}</section>;}
