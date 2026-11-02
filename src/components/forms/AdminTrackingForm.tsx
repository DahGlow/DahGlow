import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAdminMutation } from '@/hooks/useAdmin';

const schema=z.object({company:z.enum(['GOFO','USPS','UPS']),number:z.string().min(1).max(100),url:z.string().url()});
type Fields=z.infer<typeof schema>;
export default function AdminTrackingForm({fulfillmentId}:{fulfillmentId:string}){const {register,handleSubmit,formState:{errors}}=useForm<Fields>({resolver:zodResolver(schema),defaultValues:{company:'USPS'}});const mutation=useAdminMutation();return <details><summary className="admin-text-button">Update real tracking information</summary><form onSubmit={handleSubmit(tracking=>mutation.mutate({op:'order-tracking-update',fulfillmentId,tracking}))}><div className="admin-form-row"><label>Carrier<select {...register('company')}><option>GOFO</option><option>USPS</option><option>UPS</option></select></label><label>Tracking number<input {...register('number')}/></label><label>Tracking URL<input {...register('url')}/></label></div>{Object.keys(errors).length>0&&<p className="admin-error">Enter a tracking number and valid carrier URL.</p>}<p className="admin-muted">This updates Shopify and sends the customer a tracking notification.</p><button className="admin-button secondary" disabled={mutation.isPending}>Save tracking to Shopify</button></form></details>;}
