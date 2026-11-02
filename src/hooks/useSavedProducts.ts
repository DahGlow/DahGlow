import { useQueries } from '@tanstack/react-query';
import { shopify,mapProduct } from '@/lib/shopify';
import type { RawProduct,Product } from '@/types/shop';

export function useSavedProducts(handles:string[]){const queries=useQueries({queries:handles.map(handle=>({queryKey:['shopify','product',handle],queryFn:async()=>{const data=await shopify<{product:RawProduct|null}>({op:'product',handle});return data.product?mapProduct(data.product):null;},staleTime:60000,retry:1}))});return {products:queries.map(q=>q.data).filter((p):p is Product=>!!p),loading:queries.some(q=>q.isLoading),error:queries.find(q=>q.error)?.error};}
