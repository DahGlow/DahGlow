import { useQuery,useMutation,useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/api';

export function useOrderArchive(){const {user}=useAuth();const client=useQueryClient();const key=['order-archive',user?.id];const query=useQuery({queryKey:key,queryFn:async()=>{const {data,error}=await supabase.from('dg_order_preferences').select('order_id').eq('user_id',user!.id).eq('archived',true);if(error)throw error;return data.map(row=>row.order_id as string);},enabled:!!user});const mutation=useMutation({mutationFn:async({id,archived}:{id:string;archived:boolean})=>{const {error}=await supabase.from('dg_order_preferences').upsert({user_id:user!.id,order_id:id,archived});if(error)throw error;},onSuccess:()=>{void client.invalidateQueries({queryKey:key});toast.success('Order list updated');},onError:error=>toast.error(error.message)});return {archived:query.data||[],setArchived:(id:string,archived:boolean)=>mutation.mutate({id,archived}),busy:mutation.isPending,error:query.error};}
