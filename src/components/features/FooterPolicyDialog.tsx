
import { useQuery } from '@tanstack/react-query';
import DOMPurify from 'dompurify';
import InfoModal from '@/components/features/InfoModal';
import { shopify } from '@/lib/shopify';
interface Policy {title:string;body:string;}
interface Policies {shop:Record<string,Policy|null>;}
interface Props {policy:string|null;onClose:()=>void;}
export default function FooterPolicyDialog({policy,onClose}:Props){const q=useQuery({queryKey:['shopify','footer-policies'],queryFn:()=>shopify<Policies>({op:'policies'}),enabled:!!policy,staleTime:3600000});const p=policy?q.data?.shop[policy]:null;return <InfoModal open={!!policy} onClose={onClose} title={p?.title||'Store policy'}>{q.isLoading?<p>Loading policy…</p>:q.error?<><p>The store policy could not load.</p><button onClick={()=>void q.refetch()}>Retry</button></>:p?.body?<div className="rich-description" dangerouslySetInnerHTML={{__html:DOMPurify.sanitize(p.body)}}/>:<p>This policy has not been published by the store. Contact support for assistance.</p>}</InfoModal>;}
