import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { affiliateApi } from '@/lib/affiliate';
interface Props {term:string;}
export default function AffiliateCodeResult({term}:Props){const code=term.trim().toUpperCase();const query=useQuery({queryKey:['affiliate-code-lookup',code],queryFn:()=>affiliateApi<{found:boolean;name?:string}>({op:'lookup',code}),enabled:/^[A-Z0-9]{8}$/.test(code),staleTime:60000,retry:false});if(!query.data?.found)return null;return <Link className="affiliate-referral-strip" to={`/r/${code}?source=code`}><div><strong>{query.data.name}’s Picks</strong><p>Open this creator’s Dah Glow collection with referral code {code}.</p></div><ArrowRight size={20}/></Link>;}
