import { useQuery } from '@tanstack/react-query';
import { Shirt } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useOrderArchive } from '@/hooks/useOrderArchive';
import { supabase } from '@/lib/api';
import PageHeader from '@/components/layout/PageHeader';
import OrderCard from '@/components/features/OrderCard';
import type { Order } from '@/types/shop';
export default function OrderRecycleBin(){const {user}=useAuth();const archive=useOrderArchive();const query=useQuery({queryKey:['archived-orders',user?.id,archive.archived],queryFn:async()=>{const {data,error}=await supabase.from('dg_orders').select('payload').eq('user_id',user!.id).in('id',archive.archived);if(error)throw error;return data.map(row=>row.payload as Order);},enabled:!!user&&archive.archived.length>0});return <main className="standard-page recycle-bin-page"><PageHeader title="Order Recycle Bin"/>{query.error&&<p role="alert">{query.error.message}</p>}{!archive.archived.length&&<div className="recycle-empty"><Shirt size={72} strokeWidth={1}/><p>No archived orders here yet</p></div>}{query.data?.map(order=><div key={order.id}><OrderCard order={order}/><button className="order-secondary-button" disabled={archive.busy} onClick={()=>archive.setArchived(order.id,false)}>Restore order</button></div>)}</main>;}
