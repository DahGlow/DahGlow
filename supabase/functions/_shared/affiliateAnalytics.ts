import { adminDb,check } from './config.ts';
export async function affiliateAnalytics(userId:string,period:unknown){const days=Number(period)===1?1:Number(period)===30?30:7;const result=await adminDb().rpc('dg_affiliate_stats',{p_user_id:userId,p_days:days});check(result);return result.data;}
