import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Truck,PackageCheck,ChevronRight } from 'lucide-react';
import DOMPurify from 'dompurify';
import InfoModal from '@/components/features/InfoModal';
import { shopify } from '@/lib/shopify';
interface Policy{title:string;body:string;}
interface Policies{shop:{shippingPolicy:Policy|null;refundPolicy:Policy|null};}
export default function ShippingBenefits(){const [policy,setPolicy]=useState<'shippingPolicy'|'refundPolicy'|null>(null);const policies=useQuery({queryKey:['shopify','policies'],queryFn:()=>shopify<Policies>({op:'policies'}),staleTime:3600000,retry:1});const selected=policy?policies.data?.shop[policy]:null;return <><div className="shipping-benefits"><button onClick={()=>setPolicy('shippingPolicy')}><Truck/><div><strong>Shipping information</strong><span>Rates at Shopify checkout</span></div><ChevronRight size={15}/></button><button onClick={()=>setPolicy('refundPolicy')}><PackageCheck/><div><strong>Returns & refunds</strong><span>See the store’s policy</span></div><ChevronRight size={15}/></button></div><InfoModal open={!!policy} onClose={()=>setPolicy(null)} title={selected?.title||(policy==='shippingPolicy'?'Shipping information':'Returns & refunds')}>{policies.isLoading?<p>Loading store policy…</p>:policies.error?<p role="alert">{policies.error.message}</p>:selected?.body?<div className="rich-description" dangerouslySetInnerHTML={{__html:DOMPurify.sanitize(selected.body)}}/>:<p>The store has not published this policy yet. Availability and final charges are shown at Shopify checkout.</p>}</InfoModal></>;}
