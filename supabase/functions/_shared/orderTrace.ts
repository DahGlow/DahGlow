import { adminGraph } from './shopifyAdmin.ts';
import { adminDb,check } from './config.ts';
import type { Order } from './orders.ts';
interface Trace{fulfillments:{displayStatus:string;deliveredAt:string|null;estimatedDeliveryAt:string|null;events:{nodes:{status:string;message:string;happenedAt:string;city:string|null}[]}}[];lineItems:{nodes:{vendor:string;variant:{product:{vendor:string;handle:string}}|null}[]};shippingLine:{title:string}|null;}
export async function orderTrace(order:Order,userId:string){
 const receipt=await adminDb().from('dg_order_receipts').select('confirmed_at').eq('user_id',userId).eq('order_id',order.id).maybeSingle();check(receipt);
 const trace=await adminGraph<{order:Trace|null}>('query($id:ID!){order(id:$id){fulfillments(first:5){displayStatus deliveredAt estimatedDeliveryAt events(first:100){nodes{status message happenedAt city}}} lineItems(first:100){nodes{vendor variant{product{vendor handle}}}} shippingLine{title}}}',{id:order.id}).catch(()=>null);
 return {...order,receiptConfirmedAt:receipt.data?.confirmed_at||null,shippingMethod:trace?.order?.shippingLine?.title||null,fulfillments:trace?.order?.fulfillments||[],sellers:[...new Set(trace?.order?.lineItems.nodes.map(l=>l.vendor||l.variant?.product.vendor).filter(Boolean)||[])],logisticsNotice:trace?'':'Detailed Shopify fulfillment events are unavailable. Use the supplied carrier tracking link.'};
}
