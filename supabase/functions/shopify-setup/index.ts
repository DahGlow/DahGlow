import { corsHeaders,json } from '../_shared/cors.ts';
import { serviceOnly,errorResponse } from '../_shared/config.ts';
import { adminGraph,tokenStatus } from '../_shared/shopifyAdmin.ts';
import { storefront,vendors } from '../_shared/storefront.ts';
import { registerWebhooks } from '../_shared/bootstrap.ts';

Deno.serve(async req=>{if(req.method==='OPTIONS')return new Response(null,{headers:corsHeaders});try{
 await serviceOnly(req);const body=await req.json();
 if(body.op==='register-webhooks')return json({results:await registerWebhooks(),note:'API-created webhooks verify against SHOPIFY_CLIENT_SECRET. Manually created webhooks also accept the configured SHOPIFY_WEBHOOK_SECRET. Callback URLs use HTTPS. Gateway JWT verification must remain disabled for this public HMAC-authenticated receiver.'});
 const shop=await storefront('{shop{name}products(first:2){nodes{handle variants(first:1){nodes{id availableForSale}}}pageInfo{hasNextPage endCursor}}}');await adminGraph('{shop{id}}');
 return json({storefront:shop,admin:await tokenStatus(),vendors:await vendors(),checkout:'Not exercised; no payment was simulated',scheduler:'External secure scheduler required; pg_net/http is unavailable'});
}catch(error){return json({error:errorResponse(error)},502);}});
