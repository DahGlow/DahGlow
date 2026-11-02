import { useParams,Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/api';
import { useCatalog } from '@/hooks/useCatalog';
import PageHeader from '@/components/layout/PageHeader';
import CatalogResults from '@/components/features/CatalogResults';
export default function ReceiveSuccess(){const {id}=useParams();const {user}=useAuth();const catalog=useCatalog({first:12});const receipt=useQuery({queryKey:['receipt',user?.id,id],queryFn:async()=>{const {data,error}=await supabase.from('dg_order_receipts').select('confirmed_at').eq('user_id',user!.id).eq('order_id',id!).maybeSingle();if(error)throw error;return data;},enabled:!!user&&!!id,staleTime:0});return <main className="standard-page"><PageHeader title="Confirm Delivery"/><section className="receipt-success">{receipt.data?<><CheckCircle2 size={88} strokeWidth={1.5}/><h1>Receipt confirmed</h1><p>Saved on {new Date(receipt.data.confirmed_at).toLocaleString()}</p></>:<p>{receipt.error?.message||(receipt.isLoading?'Checking your confirmation…':'No receipt confirmation is recorded.')}</p>}<Link className="primary-button" to={`/us/user/orders/detail/${encodeURIComponent(id||'')}`}>VIEW ORDER DETAILS</Link></section><section className="recommendations"><div className="section-title"><h2>You may also like</h2></div><CatalogResults products={catalog.products} loading={catalog.isLoading} error={catalog.error}/></section></main>;}
