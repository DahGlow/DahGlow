import { adminDb,check } from './config.ts';
import { adminGraph,tokenStatus } from './shopifyAdmin.ts';
import { cached } from './storefront.ts';
import { syncMetafieldRegistry } from './metafieldRegistry.ts';
import { webhookUrl } from './webhookUrl.ts';

export const TOPICS=['ORDERS_CREATE','ORDERS_UPDATED','ORDERS_PAID','ORDERS_CANCELLED','FULFILLMENTS_CREATE','FULFILLMENTS_UPDATE','REFUNDS_CREATE','PRODUCTS_CREATE','PRODUCTS_UPDATE','PRODUCTS_DELETE','INVENTORY_LEVELS_UPDATE'];
interface Subscription {id:string;topic:string;endpoint:{callbackUrl?:string};}
interface SubscriptionMutation {webhookSubscription:{id:string}|null;userErrors:{message:string}[];}
export async function registerWebhooks(){
 const callbackUrl=webhookUrl();
 const existing=await adminGraph<{webhookSubscriptions:{nodes:Subscription[]}}>('query{webhookSubscriptions(first:250){nodes{id topic endpoint{... on WebhookHttpEndpoint{callbackUrl}}}}}');
 const results:{topic:string;status:string;errors?:string[]}[]=[];
 for(const topic of TOPICS){
  const current=existing.webhookSubscriptions.nodes.find(s=>s.topic===topic&&s.endpoint.callbackUrl===callbackUrl);
  if(current){results.push({topic,status:'registered'});continue;}
  const insecure=existing.webhookSubscriptions.nodes.find(s=>s.topic===topic&&s.endpoint.callbackUrl?.replace(/^http:/,'https:')===callbackUrl);
  let result:SubscriptionMutation;
  if(insecure){
   const data=await adminGraph<{webhookSubscriptionUpdate:SubscriptionMutation}>('mutation($id:ID!,$subscription:WebhookSubscriptionInput!){webhookSubscriptionUpdate(id:$id,webhookSubscription:$subscription){webhookSubscription{id}userErrors{message}}}',{id:insecure.id,subscription:{callbackUrl,format:'JSON'}});
   result=data.webhookSubscriptionUpdate;
  }else{
   const data=await adminGraph<{webhookSubscriptionCreate:SubscriptionMutation}>('mutation($topic:WebhookSubscriptionTopic!,$subscription:WebhookSubscriptionInput!){webhookSubscriptionCreate(topic:$topic,webhookSubscription:$subscription){webhookSubscription{id}userErrors{message}}}',{topic,subscription:{callbackUrl,format:'JSON'}});
   result=data.webhookSubscriptionCreate;
  }
  results.push({topic,status:result.userErrors.length?'configuration_required':insecure?'upgraded_to_https':'registered',errors:result.userErrors.map(e=>e.message)});
 }
 return results;
}
export async function ensureIntegration(){return cached('integration-setup-v2',async()=>{let status:Record<string,unknown>;try{await adminGraph('{shop{id}}');const webhooks=await registerWebhooks();let metafields:unknown;try{metafields=await syncMetafieldRegistry();}catch(error){metafields={status:'configuration_required',message:error instanceof Error?error.message:'Metafield registry unavailable'};}status={metafields,admin:await tokenStatus(),webhooks,checkedAt:new Date().toISOString(),scheduler:'External scheduler required',webhookDelivery:'Requires a real Shopify delivery to verify gateway access and HMAC',checkout:'Not tested'};}catch(error){status={admin:'configuration_required',message:error instanceof Error?error.message:'Shopify setup failed',checkedAt:new Date().toISOString(),checkout:'Not tested',webhookDelivery:'Not tested'};}check(await adminDb().from('dg_shopify_cache').upsert({cache_key:'integration-status',payload:status,expires_at:new Date(Date.now()+3600000).toISOString()}));return status;},3600);}
