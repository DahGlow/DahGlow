import { useQuery } from '@tanstack/react-query';
import BottomSheet from '@/components/features/BottomSheet';
import { affiliateApi } from '@/lib/affiliate';
import type { AffiliateRule } from '@/types/affiliate';
interface Props {open:boolean;onClose:()=>void;}
export default function AffiliateRules({open,onClose}:Props){const query=useQuery({queryKey:['affiliate-rules'],queryFn:()=>affiliateApi<{rules:AffiliateRule[];version:string}>({op:'rules'}),enabled:open,staleTime:3600000});return <BottomSheet open={open} onClose={onClose} title="Payment Rules"><div className="affiliate-rules"><p>Dah Glow Affiliate Program · USD · Pacific Time</p>{query.isLoading&&<p>Loading payment rules…</p>}{query.error&&<p role="alert">{query.error.message}</p>}{query.data?.rules.map(rule=><section key={rule.title}><h3>{rule.title}</h3>{rule.body.map((body,i)=><p key={i}>{body}</p>)}</section>)}<p>Version {query.data?.version}</p></div></BottomSheet>;}
