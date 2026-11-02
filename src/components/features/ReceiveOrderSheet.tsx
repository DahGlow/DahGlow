import { useMutation,useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import BottomSheet from '@/components/features/BottomSheet';
import { invoke } from '@/lib/shopify';
import type { Order } from '@/types/shop';

interface Props{order:Order;open:boolean;onClose:()=>void;}
export default function ReceiveOrderSheet({order,open,onClose}:Props){const navigate=useNavigate();const client=useQueryClient();const mutation=useMutation({mutationFn:()=>invoke<{confirmed:boolean}>('shopify-customer-account',{op:'receipt',id:order.id}),onSuccess:()=>{void client.invalidateQueries({queryKey:['live-order']});onClose();navigate(`/us/user/orders/receive-success/${encodeURIComponent(order.id)}`,{state:{confirmed:true}});},onError:(error:Error)=>toast.error(error.message)});return <BottomSheet title="Confirm receipt of order?" open={open} onClose={onClose}><div className="receipt-sheet"><p>Please confirm only after you have received <strong>all the items.</strong> Your confirmation is saved in Dah Glow; Shopify’s carrier-reported delivery status is not changed.</p><div className="receipt-images">{order.items.filter(i=>i.image).map((item,i)=><img key={i} src={item.image!.url} alt={item.title}/>)}</div><button className="primary-button" disabled={mutation.isPending} onClick={()=>mutation.mutate()}>{mutation.isPending?'Saving confirmation…':'YES, I RECEIVED'}</button><button className="order-secondary-button" disabled={mutation.isPending} onClick={onClose}>NOT YET</button></div></BottomSheet>;}
