import { createClient } from 'npm:@supabase/supabase-js@2';
export function secret(name:string) { const value=Deno.env.get(name);if(!value)throw new Error(`Missing backend configuration: ${name}`);return value; }
export function shopDomain(){const value=secret('SHOPIFY_STORE_DOMAIN').replace(/^https?:\/\//,'').replace(/\/$/,'').toLowerCase();if(!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(value))throw new Error('SHOPIFY_STORE_DOMAIN must be the canonical *.myshopify.com domain');return value;}
export const version=()=>Deno.env.get('SHOPIFY_API_VERSION')||'2026-10';
export const adminDb=()=>createClient(secret('SUPABASE_URL'),secret('SUPABASE_SERVICE_ROLE_KEY'),{auth:{persistSession:false,autoRefreshToken:false}});
export function check(result:{error:{message:string}|null}){if(result.error)throw new Error(`Database: ${result.error.message}`);}
export async function serviceOnly(req:Request){const token=req.headers.get('Authorization')?.replace(/^Bearer /,'');if(!token||token!==secret('SUPABASE_SERVICE_ROLE_KEY'))throw new Error('Service authorization required');}
export async function requireUser(req:Request){const token=req.headers.get('Authorization')?.replace(/^Bearer /,'');if(!token)throw new Error('Sign in required');const {data,error}=await adminDb().auth.getUser(token);if(error||!data.user)throw new Error('Sign in required');return data.user;}
export function errorResponse(error:unknown){const message=error instanceof Error?error.message:'Unexpected server error';console.error('Dah Glow backend failure:',message);return message;}
