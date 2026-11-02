import { Link } from 'react-router-dom';
import { ChevronRight,Package } from 'lucide-react';
import { formatMoney } from '@/lib/shopify';
import type { Order } from '@/types/shop';

interface Props{order:Order;}
export default function OrderCard({order}:Props){return <article className="order-card"><Link to={`/us/user/orders/detail/${encodeURIComponent(order.id)}`}><h2><span className="status-dot"/>{order.cancelledAt?'Cancelled':order.fulfillmentStatus.replace(/_/g,' ').toLowerCase()}</h2><p>Order {order.name} <ChevronRight size={16}/></p><div className="order-card-content">{order.items[0]?.image?<img src={order.items[0].image.url} alt={order.items[0].title}/>:<Package size={36}/>}<div><strong>{formatMoney(order.total)}</strong><span>{order.items.reduce((n,item)=>n+item.quantity,0)} items</span></div></div></Link><div className="order-payment-status">Payment: {order.financialStatus.replace(/_/g,' ').toLowerCase()}</div><Link className="order-secondary-button" to={`/us/user/orders/detail/${encodeURIComponent(order.id)}`}>View details & tracking</Link></article>;}
