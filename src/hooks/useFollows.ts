import { useState,useEffect,useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

export function useFollows() { const {user}=useAuth();const [follows,setFollows]=useState<string[]>([]);const [busy,setBusy]=useState<string|null>(null);
const refresh=useCallback(async()=>{if(!user){setFollows([]);return;}const {data,error}=await supabase.from('dg_follows').select('store_id').eq('user_id',user.id);if(error){toast.error(error.message);return;}setFollows((data||[]).map(x=>x.store_id));},[user]);
useEffect(()=>{void refresh();const timer=setInterval(()=>void refresh(),10000);return ()=>clearInterval(timer);},[refresh]);
const toggle=async(id:string)=>{if(!user){toast.info('Sign in to follow a store.');return;}setBusy(id);const result=follows.includes(id)?await supabase.from('dg_follows').delete().eq('user_id',user.id).eq('store_id',id):await supabase.from('dg_follows').insert({user_id:user.id,store_id:id});if(result.error)toast.error(result.error.message);else await refresh();setBusy(null);};
return {follows,toggle,busy}; }
