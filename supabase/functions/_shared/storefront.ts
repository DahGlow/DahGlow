import { adminDb,check,secret,shopDomain,version } from './config.ts';
import { cached } from './cache.ts';
export { cached } from './cache.ts';
export const META_KEYS=['ingredients','skin_type','how_to_use','materials','specifications','composition','color_hex','size_guide'];
export const META=META_KEYS.map(key=>({namespace:'custom',key}));
export const IMAGE='url altText width height';
export const VARIANT=`id title availableForSale quantityAvailable selectedOptions { name value } price { amount currencyCode } compareAtPrice { amount currencyCode } image { ${IMAGE} } metafields(identifiers:[{namespace:"custom",key:"color_hex"}]) { namespace key value type }`;
export const PRODUCT=`id handle title description descriptionHtml vendor productType tags availableForSale createdAt options { name optionValues { name swatch { color image { previewImage { ${IMAGE} } } } } } priceRange { minVariantPrice { amount currencyCode } } compareAtPriceRange { minVariantPrice { amount currencyCode } } images(first:6) { nodes { ${IMAGE} } } variants(first:20) { nodes { ${VARIANT} } pageInfo { hasNextPage endCursor } } metafields(identifiers:$meta) { namespace key value type reference { ... on MediaImage { image { ${IMAGE} } } } }`;
export const CART=`id checkoutUrl totalQuantity cost { subtotalAmount { amount currencyCode } totalAmount { amount currencyCode } } lines(first:100) { nodes { id quantity cost { totalAmount { amount currencyCode } } merchandise { ... on ProductVariant { id title availableForSale selectedOptions { name value } price { amount currencyCode } image { ${IMAGE} } product { handle title vendor } } } } pageInfo { hasNextPage endCursor } }`;
async function withMetafields(variables:Record<string,unknown>){if(!('meta' in variables))return variables;const configured=await adminDb().from('dg_shopify_cache').select('payload').eq('cache_key','storefront-metafield-identifiers').maybeSingle();check(configured);return Array.isArray(configured.data?.payload)&&configured.data.payload.length?{...variables,meta:configured.data.payload}:variables;}
export async function storefront<T>(query:string,variables:Record<string,unknown>={},buyerIp?:string):Promise<T>{
 variables=await withMetafields(variables);const privateToken=Deno.env.get('SHOPIFY_STOREFRONT_PRIVATE_TOKEN');const token=privateToken||secret('SHOPIFY_STOREFRONT_PUBLIC_TOKEN');
 for(let attempt=0;attempt<3;attempt++){
  const response=await fetch(`https://${shopDomain()}/api/${version()}/graphql.json`,{method:'POST',headers:{'Content-Type':'application/json',...(privateToken?{'Shopify-Storefront-Private-Token':token}:{'X-Shopify-Storefront-Access-Token':token}),...(buyerIp?{'Shopify-Storefront-Buyer-IP':buyerIp}:{})},body:JSON.stringify({query,variables}),signal:AbortSignal.timeout(20000)});
  if(response.status===429||response.status>=500){await new Promise(r=>setTimeout(r,500*(attempt+1)));continue;}
  const body=await response.json();if(!response.ok||body.errors)throw new Error(`Shopify Storefront ${response.status}: ${body.errors?.map((e:{message:string})=>e.message).join('; ')||'authentication failed; verify token, product publication and Storefront scopes'}`);return body.data as T;
 }
 throw new Error('Shopify Storefront temporarily unavailable');
}
export function quote(value:string){return `"${value.replace(/[\\"]/g,'\\$&')}"`;}
export async function vendors(){return cached('vendor-directory',async()=>{
 const names=new Set<string>();let cursor:string|null=null;
 do{const page=await storefront<{products:{nodes:{vendor:string}[];pageInfo:{hasNextPage:boolean;endCursor:string}}}>('query($cursor:String){products(first:250,after:$cursor){nodes{vendor}pageInfo{hasNextPage endCursor}}}',{cursor});page.products.nodes.forEach(p=>{if(p.vendor)names.add(p.vendor);});cursor=page.products.pageInfo.hasNextPage?page.products.pageInfo.endCursor:null;}while(cursor);
 const result=await Promise.all([...names].sort().map(async name=>{const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(name));const suffix=Array.from(new Uint8Array(hash).slice(0,6),b=>b.toString(16).padStart(2,'0')).join('');const base=name.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'store';return {id:`${base}-${suffix}`,name,avatar:''};}));
 for(let start=0;start<result.length;start+=100)check(await adminDb().from('dg_stores').upsert(result.slice(start,start+100).map(({id,name})=>({id,name}))));return result;
 },21600).then(async entries=>{const settings=await adminDb().from('dg_vendor_settings').select('vendor,display_name,description,avatar_url,visible');check(settings);return entries.filter(v=>settings.data.find(s=>s.vendor===v.name)?.visible!==false).map(v=>{const s=settings.data.find(s=>s.vendor===v.name);return {...v,displayName:s?.display_name||v.name,description:s?.description||'',avatar:s?.avatar_url||v.avatar};});});}
