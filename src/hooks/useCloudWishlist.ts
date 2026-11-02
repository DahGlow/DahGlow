import { useState,useEffect } from 'react';
import { useQuery,useMutation,useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

function guestSaved():string[]{try{return JSON.parse(localStorage.getItem('dg-guest-wishlist')||localStorage.getItem('dg-wishlist')||'[]').filter((id:unknown)=>typeof id==='string'&&!id.startsWith('dg-'));}catch{return [];}}
const merges=new Map<string,Promise<void>>();
export function useCloudWishlist(){const {user}=useAuth();const client=useQueryClient();const [guest,setGuest]=useState<string[]>(guestSaved);const key=['wishlist',user?.id];
const query=useQuery({queryKey:key,queryFn:async()=>{const {data,error}=await supabase.from('dg_wishlists').select('product_handle').eq('user_id',user!.id).order('created_at',{ascending:false});if(error)throw error;return data.map(p=>p.product_handle as string);},enabled:!!user,staleTime:30000,refetchInterval:30000});
useEffect(()=>{localStorage.setItem('dg-guest-wishlist',JSON.stringify(guest));},[guest]);
useEffect(()=>{if(!user||!guest.length)return;let active=true;const id=user.id;let work=merges.get(id);if(!work){work=(async()=>{const {error}=await supabase.from('dg_wishlists').upsert(guest.map(product_handle=>({user_id:id,product_handle})),{onConflict:'user_id,product_handle',ignoreDuplicates:true});if(error)throw error;localStorage.setItem('dg-guest-wishlist','[]');localStorage.removeItem('dg-wishlist');})();merges.set(id,work);void work.finally(()=>merges.delete(id)).catch(()=>undefined);}void work.then(()=>{if(active){setGuest([]);void client.invalidateQueries({queryKey:['wishlist',id]});}}).catch(error=>toast.error(`Favorites could not sync: ${error.message}`));return()=>{active=false;};},[user?.id,guest,client]);
const wishlist=user?[...new Set([...(query.data||[]),...guest])]:guest;
const mutation=useMutation({mutationFn:async({handle,saved}:{handle:string;saved:boolean})=>{const result=saved?await supabase.from('dg_wishlists').delete().eq('user_id',user!.id).eq('product_handle',handle):await supabase.from('dg_wishlists').upsert({user_id:user!.id,product_handle:handle});if(result.error)throw result.error;},onSuccess:()=>void client.invalidateQueries({queryKey:key}),onError:error=>toast.error(error.message)});
const toggleWish=(handle:string)=>{if(!user){setGuest(old=>old.includes(handle)?old.filter(x=>x!==handle):[handle,...old]);return;}mutation.mutate({handle,saved:wishlist.includes(handle)});};
return {wishlist,toggleWish,wishBusy:mutation.isPending,wishError:query.error};}
