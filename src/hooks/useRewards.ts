import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/api';
export interface Coupon{id:string;code:string;description:string;expires_at:string|null;used_at:string|null;}
export interface PointEntry{id:string;amount:number;description:string;kind:'earned'|'used'|'expired';created_at:string;}
export function useRewards(){const {user}=useAuth();return useQuery({queryKey:['rewards',user?.id],queryFn:async()=>{const coupons=await supabase.from('dg_coupons').select('id,code,description,expires_at,used_at').eq('user_id',user!.id);if(coupons.error)throw coupons.error;const points=await supabase.from('dg_points').select('id,amount,description,kind,created_at').eq('user_id',user!.id).order('created_at',{ascending:false});if(points.error)throw points.error;return {coupons:coupons.data as Coupon[],points:points.data as PointEntry[],balance:points.data.reduce((sum,entry)=>sum+entry.amount,0)};},enabled:!!user,staleTime:30000,refetchInterval:60000});}
