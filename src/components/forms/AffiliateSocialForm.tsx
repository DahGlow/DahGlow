import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CircleAlert } from 'lucide-react';
import { toast } from 'sonner';
import { useAffiliate } from '@/hooks/affiliateWorkspace';

const schema=z.object({url:z.string().url('Enter a full public profile URL').refine(value=>value.startsWith('https://'),'Use a secure HTTPS link')});
interface Props {provider:string;url?:string;onSaved:()=>void;}
export default function AffiliateSocialForm({provider,url='',onSaved}:Props){const affiliate=useAffiliate();const {register,handleSubmit,formState:{errors}}=useForm<z.infer<typeof schema>>({resolver:zodResolver(schema),defaultValues:{url}});return <form className="affiliate-form" onSubmit={handleSubmit(values=>void affiliate.save({op:'social-save',provider,url:values.url}).then(()=>{toast.success('Public profile saved for review. This is not OAuth authorization.');onSaved();}).catch(()=>undefined))}><label htmlFor="affiliate-social-url">Public {provider} profile link</label><input id="affiliate-social-url" type="url" placeholder={`https://${provider==='x'?'x':provider}.com/your-profile`} {...register('url')}/>{errors.url&&<p className="affiliate-error" role="alert"><CircleAlert size={17}/>{errors.url.message}</p>}<p>Only the public profile URL is stored. Ownership verification and provider OAuth require separate configuration. Never enter passwords or bank details.</p><button className="affiliate-primary" disabled={affiliate.busy}>{affiliate.busy?'Saving…':'Save profile link'}</button></form>;}
