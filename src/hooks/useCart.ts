import { useState } from 'react';
import { useQuery,useMutation,useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { shopify } from '@/lib/shopify';
import type { ShopifyCart } from '@/types/shop';

interface MutationResult{cart:ShopifyCart|null;userErrors:{message:string}[];}
let queue:Promise<unknown>=Promise.resolve();
export function useCart(){const client=useQueryClient();const [id,setId]=useState(()=>localStorage.getItem('dg-shopify-cart')||'');const query=useQuery({queryKey:['shopify','cart',id],queryFn:async()=>{const data=await shopify<{cart:ShopifyCart|null}>({op:'cart',action:'get',id});if(!data.cart){localStorage.removeItem('dg-shopify-cart');setId('');}return data.cart;},enabled:!!id,staleTime:15000,refetchInterval:60000,retry:1});
const mutation=useMutation({mutationFn:(input:Record<string,unknown>)=>{const work=queue.catch(()=>undefined).then(async()=>{const saved=localStorage.getItem('dg-shopify-cart');const action=input.action==='add'&&!saved?'create':input.action;const data=await shopify<Record<string,MutationResult>>({op:'cart',...input,action,id:saved});const result=Object.values(data)[0];if(!result||result.userErrors.length)throw new Error(result?.userErrors.map(e=>e.message).join('; ')||'Shopify cart unavailable');if(!result.cart)throw new Error('Shopify did not return a cart');const fresh=await shopify<{cart:ShopifyCart|null}>({op:'cart',action:'get',id:result.cart.id});if(!fresh.cart)throw new Error('Shopify cart expired; try again');localStorage.setItem('dg-shopify-cart',fresh.cart.id);return fresh.cart;});queue=work;return work;},onSuccess:cart=>{localStorage.setItem('dg-shopify-cart',cart.id);setId(cart.id);client.setQueryData(['shopify','cart',cart.id],cart);},onError:error=>toast.error(error.message)});
const add=async(variantId:string,quantity=1)=>{await mutation.mutateAsync({action:'add',lines:[{merchandiseId:variantId,quantity}]});toast.success('Added to your bag');};
const update=(lineId:string,quantity:number)=>mutation.mutate(quantity>0?{action:'update',lines:[{id:lineId,quantity}]}:{action:'remove',ids:[lineId]});
const checkout=async()=>{if(!id)return;const data=await shopify<{cart:ShopifyCart|null}>({op:'cart',action:'get',id});const cart=data.cart;if(!cart||!cart.totalQuantity)throw new Error('Your bag is empty');if(cart.lines.nodes.some(l=>!l.merchandise.availableForSale||l.quantity<1))throw new Error('Some items are unavailable. Review your bag before checkout.');const url=new URL(cart.checkoutUrl);if(url.protocol!=='https:')throw new Error('Invalid Shopify checkout URL');window.location.assign(url.href);};
return {cart:query.data||null,lines:query.data?.lines.nodes||[],loading:query.isLoading,busy:mutation.isPending,error:query.error,add,update,checkout};}
