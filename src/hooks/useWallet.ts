import { useInfiniteQuery,useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { invoke } from '@/lib/shopify';
import type { WalletData } from '@/types/wallet';
export function useWallet(connected:boolean){const {user}=useAuth();return useQuery({queryKey:['wallet',user?.id],queryFn:()=>invoke<WalletData>('shopify-customer-account',{op:'wallet'}),enabled:!!user&&connected,staleTime:0,gcTime:0,refetchInterval:30000,retry:false});}
export function useWalletHistory(connected:boolean,accountId?:string){const {user}=useAuth();const query=useInfiniteQuery({queryKey:['wallet-history',user?.id,accountId],queryFn:({pageParam})=>invoke<WalletData>('shopify-customer-account',{op:'wallet',history:true,accountId,cursor:pageParam}),initialPageParam:null as string|null,getNextPageParam:page=>page.pageInfo.hasNextPage?page.pageInfo.endCursor:undefined,enabled:!!user&&connected,staleTime:0,gcTime:0,refetchInterval:30000,retry:false});return {...query,transactions:query.data?.pages.flatMap(p=>p.transactions)||[]};}
