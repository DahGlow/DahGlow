
import { secret } from './config.ts';
export function webhookUrl(){const url=new URL(secret('SUPABASE_URL'));url.protocol='https:';url.pathname='/functions/v1/shopify-webhook';url.search='';url.hash='';return url.toString();}
