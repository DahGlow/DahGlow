
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useContactPreferences } from '@/hooks/useCustomerSpaces';
const schema=z.object({email:z.string().trim().email('Enter a valid email address.')});
export default function FooterNewsletterForm(){const preferences=useContactPreferences();const navigate=useNavigate();const {register,handleSubmit,formState:{errors}}=useForm<z.infer<typeof schema>>({resolver:zodResolver(schema),defaultValues:{email:preferences.user?.email||''}});return <form className="footer-newsletter" onSubmit={handleSubmit(v=>{if(!preferences.user){toast.info('Sign in to confirm your email and save your subscription preference.');navigate('/login');return;}if(v.email.toLowerCase()!==preferences.user.email.toLowerCase()){toast.error('Use the email address of your signed-in account.');return;}preferences.save({email_marketing:true});})}><label htmlFor="footer-email">SIGN UP FOR DAH GLOW STYLE NEWS</label><div><input id="footer-email" placeholder="Your email address" autoComplete="email" type="email" {...register('email')}/><button type="submit" disabled={preferences.saving}>{preferences.saving?'Saving…':'Subscribe'}</button></div>{errors.email&&<p className="field-error" role="alert">{errors.email.message}</p>}<p>Save your email marketing preference securely. Marketing is optional; message delivery depends on the store’s configured email service.</p></form>;}
