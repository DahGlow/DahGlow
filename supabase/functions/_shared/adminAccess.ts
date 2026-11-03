import { adminDb,check,requireUser } from './config.ts';
import type { User } from 'npm:@supabase/supabase-js@2';
export class AccessError extends Error { constructor(public status:number){super(status===404?'Not found':'This section is locked');} }
export interface AdminIdentity { user:User; role:string; permissions:string[]; initial:boolean; }
export async function rate(key:string,limit=90,seconds=60){const r=await adminDb().rpc('dg_rate_check',{p_key:key,p_limit:limit,p_seconds:seconds});check(r);if(!r.data)throw new Error('Too many requests. Please wait and retry.');}
export async function authorize(req:Request):Promise<AdminIdentity>{
 const user=await requireUser(req).catch(()=>{throw new AccessError(404);});if(!user.email_confirmed_at||!user.email)throw new AccessError(404);
 const db=adminDb(),email=user.email.trim().toLowerCase();
 let row=await db.from('dg_admin_allowlist').select('*').eq('email',email).maybeSingle();check(row);
 if(!row.data){const invite=await db.from('dg_admin_invitations').select('*').eq('email',email).is('accepted_at',null).is('revoked_at',null).gt('expires_at',new Date().toISOString()).order('created_at',{ascending:false}).limit(1).maybeSingle();check(invite);
  if(invite.data&&invite.data.role!=='super_admin'){check(await db.from('dg_admin_allowlist').insert({email,role:invite.data.role,permissions:invite.data.permissions}));check(await db.from('dg_admin_invitations').update({accepted_at:new Date().toISOString()}).eq('id',invite.data.id));row=await db.from('dg_admin_allowlist').select('*').eq('email',email).maybeSingle();check(row);}
 }
 if(!row.data?.active)throw new AccessError(404);await rate(`admin:${user.id}`);const role=await db.from('dg_admin_roles').select('permissions').eq('name',row.data.role).single();check(role);
 return {user,role:row.data.role,permissions:[...new Set<string>([...role.data.permissions,...row.data.permissions,...(row.data.role==='super_admin'?['support']:[])])],initial:row.data.initial};
}
export function permit(actor:AdminIdentity,permission:string){if(!actor.permissions.includes(permission))throw new AccessError(403);}
export async function audit(actor:AdminIdentity,action:string,resource?:string,details:Record<string,unknown>={}){check(await adminDb().from('dg_admin_activity').insert({actor_id:actor.user.id,action,resource,details}));}
export async function invalidateCatalog(){check(await adminDb().from('dg_shopify_cache').update({expires_at:new Date(0).toISOString()}).neq('cache_key','integration-status').neq('cache_key','storefront-metafield-identifiers'));}
