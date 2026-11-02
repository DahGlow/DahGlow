import { secret,shopDomain } from './config.ts';
const enc=new TextEncoder();
export const b64=(bytes:Uint8Array)=>btoa(String.fromCharCode(...bytes));
export const unb64=(text:string)=>Uint8Array.from(atob(text),c=>c.charCodeAt(0));
export const url64=(bytes:Uint8Array)=>b64(bytes).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
async function key(){const source=await crypto.subtle.importKey('raw',enc.encode(secret('SHOPIFY_CLIENT_SECRET')),'HKDF',false,['deriveKey']);return crypto.subtle.deriveKey({name:'HKDF',hash:'SHA-256',salt:enc.encode(shopDomain()),info:enc.encode('dah-glow-private-storage-v1')},source,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);}
export async function seal(value:unknown){const iv=crypto.getRandomValues(new Uint8Array(12));const ciphertext=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:enc.encode(shopDomain())},await key(),enc.encode(JSON.stringify(value)));return `${b64(iv)}.${b64(new Uint8Array(ciphertext))}`;}
export async function open<T>(value:string):Promise<T>{const [iv,data]=value.split('.');const bytes=await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64(iv),additionalData:enc.encode(shopDomain())},await key(),unb64(data));return JSON.parse(new TextDecoder().decode(bytes));}
// API/app subscriptions use the app client secret. Manually created subscriptions
// use the separately configured Notifications signing secret. Both stay server-side.
export async function validHmac(body:Uint8Array,signature:string){if(!/^[A-Za-z0-9+/]{43}=$/.test(signature))return false;const secrets=[...new Set([Deno.env.get('SHOPIFY_CLIENT_SECRET'),Deno.env.get('SHOPIFY_WEBHOOK_SECRET')].filter((s):s is string=>!!s))];if(!secrets.length)throw new Error('Shopify webhook signing is not configured');const checks=await Promise.all(secrets.map(async value=>{const key=await crypto.subtle.importKey('raw',enc.encode(value),{name:'HMAC',hash:'SHA-256'},false,['verify']);return crypto.subtle.verify('HMAC',key,unb64(signature),body);}));return checks.some(Boolean);}
