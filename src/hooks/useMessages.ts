
import { useQuery,useMutation,useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
export interface CustomerMessage {id:string;category:'order'|'benefit'|'promo'|'notice';title:string;body:string;href:string|null;read_at:string|null;created_at:string;}
export function useMessages(){const {user}=useAuth();const client=useQueryClient();const key=['customer-messages',user?.id];const query=useQuery({queryKey:key,enabled:!!user,queryFn:async()=>{const {data,error}=await supabase.from('dg_messages').select('id,category,title,body,href,read_at,created_at').eq('user_id',user!.id).order('created_at',{ascending:false}).limit(100);if(error)throw error;return data as CustomerMessage[];},staleTime:0,refetchInterval:30000,retry:1});const mutation=useMutation({mutationFn:async(ids:string[])=>{if(!user)throw new Error('Sign in to manage messages.');const {error}=await supabase.from('dg_messages').update({read_at:new Date().toISOString()}).eq('user_id',user.id).in('id',ids);if(error)throw error;},onSuccess:()=>void client.invalidateQueries({queryKey:key}),onError:(error:Error)=>toast.error(error.message)});return {...query,user,markRead:mutation.mutate,saving:mutation.isPending,unread:query.data?.filter(m=>!m.read_at).length||0};}
