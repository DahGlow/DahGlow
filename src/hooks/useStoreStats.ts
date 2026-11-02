import { useQuery } from '@tanstack/react-query';
import { shopify } from '@/lib/shopify';

export interface StoreStats {followers:number;items:number;rating:number|null;ratingCount:number;}
export function useStoreStats(id?:string){return useQuery({queryKey:['store-stats',id],queryFn:()=>shopify<StoreStats>({op:'store-stats',id}),enabled:!!id,staleTime:0,refetchInterval:30000,retry:1});}
