import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { invoke } from '@/lib/shopify';

const schema=z.object({email:z.string().email(),number:z.string().optional(),code:z.string().optional()});
type Fields=z.infer<typeof schema>;
export default function AccountRecoveryForm({method,onClose}:{method:'email'|'order';onClose:()=>void}){const [sent,setSent]=useState(false),[busy,setBusy]=useState(false);const {sendExistingOtp,verifyCode}=useAuth();const navigate=useNavigate();const {register,handleSubmit,formState:{errors}}=useForm<Fields>({resolver:zodResolver(schema)});const submit=async(v:Fields)=>{setBusy(true);if(sent){if(await verifyCode(v.email,v.code||'')){onClose();navigate('/me',{replace:true});}}else if(method==='email'){if(await sendExistingOtp(v.email))setSent(true);}else{try{const data=await invoke<{message:string}>('dah-glow-recovery',{email:v.email,number:v.number||''});toast.info(data.message);setSent(true);}catch(error){toast.error(error instanceof Error?error.message:'Unable to request recovery');}}setBusy(false);};return <form className="account-form" onSubmit={handleSubmit(submit)}><p>Verify the account email. We never reveal another customer’s email or grant access from a tracking number alone.</p>{method==='order'&&<label>Order / Tracking Number<input readOnly={sent} {...register('number')}/></label>}<label>Account email address<input type="email" readOnly={sent} {...register('email')}/></label>{sent&&<label>Verification code<input inputMode="numeric" maxLength={4} autoComplete="one-time-code" {...register('code')}/></label>}{errors.email&&<p className="field-error">{errors.email.message}</p>}<button className="primary-button" disabled={busy}>{busy?'Please wait…':sent?'Verify & sign in':'Send verification code'}</button><button className="order-secondary-button" type="button" onClick={onClose}>Cancel</button></form>;}
