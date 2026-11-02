import type { User } from '@supabase/supabase-js';
import type { AuthUser } from '@/types/shop';

export function mapUser(user: User): AuthUser { const code = String([...user.id].reduce((sum,c)=>sum+c.charCodeAt(0),0)%1000).padStart(3,'0'); return {id:user.id,email:user.email || '',username:user.user_metadata?.username || `DGW-user${code}`,avatar:user.user_metadata?.avatar_url||user.user_metadata?.picture}; }
const exchanged = new Map<string, Promise<string | null>>();
export async function exchangeCodeOnce(code: string) { if (!exchanged.has(code)) { const { supabase } = await import('@/lib/api'); exchanged.set(code,supabase.auth.exchangeCodeForSession(code).then(({error})=>error?.message || null)); } return exchanged.get(code)!; }
