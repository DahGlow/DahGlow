import { adminDb,check } from './config.ts';
import { adminGraph } from './shopifyAdmin.ts';
import { isUuid } from './affiliateReferrals.ts';
interface AffiliateOrderLine {product:{handle:string}|null;priceAfterAllDiscountsBeforeTaxesSet:{shopMoney:{amount:string;currencyCode:string}};}
interface AffiliateOrder {id:string;name:string;createdAt:string;email:string|null;cancelledAt:string|null;displayFinancialStatus:string;displayFulfillmentStatus:string;customAttributes:{key:string;value:string}[];customer:{id:string;email:string|null;numberOfOrders:string}|null;returns:{nodes:{status:string}[]};refunds:{id:string}[];fulfillments:{status:string;deliveredAt:string|null}[];lineItems:{nodes:AffiliateOrderLine[];pageInfo:{hasNextPage:boolean;endCursor:string|null}};}
const LINE='product{handle} priceAfterAllDiscountsBeforeTaxesSet{shopMoney{amount currencyCode}}';
export async function syncAffiliateOrder(id:string){
 const result=await adminGraph<{order:AffiliateOrder|null}>(`query($id:ID!){order(id:$id){id name createdAt email cancelledAt displayFinancialStatus displayFulfillmentStatus customAttributes{key value} customer{id email numberOfOrders} returns(first:10){nodes{status}} refunds{id} fulfillments(first:100){status deliveredAt} lineItems(first:100){nodes{${LINE}}pageInfo{hasNextPage endCursor}}}}`,{id});
 const order=result.order;if(!order)return;
 const visitId=order.customAttributes.find(a=>a.key==='dg_affiliate_visit')?.value;if(!isUuid(visitId))return;
 const db=adminDb();const visit=await db.from('dg_affiliate_visits').select('user_id,visitor_user_id,product_handles').eq('id',visitId).maybeSingle();check(visit);if(!visit.data)return;
 const [profile,program,customer,owner]=await Promise.all([db.from('dg_affiliates').select('active,created_at').eq('user_id',visit.data.user_id).single(),db.from('dg_affiliate_program').select('*').eq('id',true).single(),db.from('dg_customer_accounts').select('customer_id').eq('user_id',visit.data.user_id).maybeSingle(),db.auth.admin.getUserById(visit.data.user_id)]);[profile,program,customer].forEach(check);if(owner.error)throw owner.error;
 const self=visit.data.visitor_user_id===visit.data.user_id||(order.customer&&customer.data?.customer_id===order.customer.id)||((order.email||order.customer?.email)&&owner.data.user?.email&&(order.email||order.customer?.email)!.toLowerCase()===owner.data.user.email.toLowerCase());
 const disqualified=!!(self||!profile.data.active||Date.parse(order.createdAt)<Date.parse(profile.data.created_at)||order.cancelledAt||order.refunds.length||order.returns.nodes.some(r=>r.status!=='DECLINED'&&r.status!=='CANCELED'));
 if(!disqualified&&!['PAID','PARTIALLY_REFUNDED','REFUNDED'].includes(order.displayFinancialStatus))return;
 while(order.lineItems.pageInfo.hasNextPage){const next=await adminGraph<{order:{lineItems:AffiliateOrder['lineItems']}}>(`query($id:ID!,$cursor:String){order(id:$id){lineItems(first:100,after:$cursor){nodes{${LINE}}pageInfo{hasNextPage endCursor}}}}`,{id,cursor:order.lineItems.pageInfo.endCursor});order.lineItems.nodes.push(...next.order.lineItems.nodes);order.lineItems.pageInfo=next.order.lineItems.pageInfo;}
 const lines=order.lineItems.nodes.filter(l=>l.product&&visit.data.product_handles.includes(l.product.handle));if(lines.some(l=>l.priceAfterAllDiscountsBeforeTaxesSet.shopMoney.currencyCode!=='USD')){console.info('affiliate_non_usd_order_not_accrued',{orderId:id});return;}
 const revenue=lines.reduce((sum,line)=>sum+Number(line.priceAfterAllDiscountsBeforeTaxesSet.shopMoney.amount),0);
 const shipments=order.fulfillments.filter(f=>f.status==='SUCCESS');const delivered=order.displayFulfillmentStatus==='FULFILLED'&&shipments.length&&shipments.every(f=>!!f.deliveredAt)?shipments.map(f=>f.deliveredAt!).sort().at(-1):null;
 const rate=program.data.enabled?(Number(order.customer?.numberOfOrders||0)>1?program.data.returning_rate:program.data.commission_rate):null;
 check(await db.rpc('dg_record_affiliate_order',{p_visit_id:visitId,p_order_id:id,p_order_name:order.name,p_customer_id:order.customer?.id||null,p_created_at:order.createdAt,p_revenue:revenue,p_rate:rate,p_delivered_at:delivered||null,p_disqualified:disqualified}));
 console.info('affiliate_order_verified',{orderId:id,disqualified});
}
