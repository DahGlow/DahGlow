import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { invoke } from '@/lib/shopify';
import type { Order } from '@/types/shop';

export function useOrder(id:string){const {user}=useAuth();const query=useQuery({queryKey:['live-order',user?.id,id],queryFn:async()=>{const result=await invoke<{order:Order}>('shopify-customer-account',{op:'order',id});return result.order;},enabled:!!user&&!!id,staleTime:0,gcTime:0,refetchInterval:30000,retry:1});return {...query,user};}
