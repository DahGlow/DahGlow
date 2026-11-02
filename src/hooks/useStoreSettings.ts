import { useQuery } from '@tanstack/react-query';
import { shopify } from '@/lib/shopify';
import type { StoreSettings } from '@/types/admin';

export function useStoreSettings(){return useQuery({queryKey:['public-store-settings'],queryFn:()=>shopify<Partial<StoreSettings>>({op:'settings'}),staleTime:60000,refetchInterval:60000,retry:1});}
