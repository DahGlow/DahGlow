import { adminDb,check } from './config.ts';

const inflight=new Map<string,Promise<unknown>>();
export async function cached<T>(key:string,load:()=>Promise<T>,ttl=120):Promise<T>{
 const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(key));const hash=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
 const result=await adminDb().from('dg_shopify_cache').select('payload').eq('cache_key',hash).gt('expires_at',new Date().toISOString()).maybeSingle();check(result);if(result.data)return result.data.payload as T;if(inflight.has(hash))return inflight.get(hash) as Promise<T>;
 const work=load().then(async data=>{const length=new TextEncoder().encode(JSON.stringify(data)).length;/* Larger content stays in Shopify, not the supporting database. */if(length<100000)check(await adminDb().from('dg_shopify_cache').upsert({cache_key:hash,payload:data,expires_at:new Date(Date.now()+ttl*1000).toISOString()}));return data;}).finally(()=>inflight.delete(hash));inflight.set(hash,work);return work;
}
