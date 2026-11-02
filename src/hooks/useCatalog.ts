import { useInfiniteQuery,useQuery } from '@tanstack/react-query';
import { mapProduct,shopify } from '@/lib/shopify';
import type { RawProduct,PageInfo,Vendor } from '@/types/shop';
export interface CatalogFilter {query?:string;category?:string;vendor?:string;tag?:string;sort?:string;reverse?:boolean;first?:number;}
interface CatalogPage {products:{nodes:RawProduct[];pageInfo:PageInfo};}
export function useCatalog(filter:CatalogFilter={}){const query=useInfiniteQuery({queryKey:['shopify','catalog',filter],queryFn:({pageParam})=>shopify<CatalogPage>({op:'catalog',...filter,cursor:pageParam}),initialPageParam:null as string|null,getNextPageParam:page=>page.products.pageInfo.hasNextPage?page.products.pageInfo.endCursor:undefined,staleTime:60000,refetchInterval:120000,retry:1});return {...query,products:query.data?.pages.flatMap(p=>p.products.nodes.map(mapProduct))||[]};}
export function useProduct(handle:string){return useQuery({queryKey:['shopify','product',handle],queryFn:async()=>{const data=await shopify<{product:RawProduct|null}>({op:'product',handle});return data.product?mapProduct(data.product):null;},enabled:!!handle,staleTime:30000,refetchInterval:60000,retry:1});}
export function useVendors(){return useQuery({queryKey:['shopify','vendors'],queryFn:()=>shopify<Vendor[]>({op:'vendors'}),staleTime:300000,refetchInterval:600000,retry:1});}
export function useRecommendations(id:string){return useQuery({queryKey:['shopify','recommendations',id],queryFn:async()=>{const data=await shopify<{productRecommendations:RawProduct[]}>({op:'recommendations',id});return (data.productRecommendations||[]).map(mapProduct);},enabled:!!id,staleTime:120000,retry:1});}
