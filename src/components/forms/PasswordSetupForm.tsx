import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

const schema=z.object({password:z.string().min(6,'Use at least 6 characters'),confirm:z.string()}).refine(v=>v.password===v.confirm,{path:['confirm'],message:'Passwords must match'});
type Fields=z.infer<typeof schema>;
interface Props{onSuccess:()=>void;}
export default function PasswordSetupForm({onSuccess}:Props){const {setPassword}=useAuth();const [busy,setBusy]=useState(false);const {register,handleSubmit,formState:{errors}}=useForm<Fields>({resolver:zodResolver(schema)});const save=async(v:Fields)=>{setBusy(true);if(await setPassword(v.password))onSuccess();else setBusy(false);};return <form className="account-form" onSubmit={handleSubmit(save)}><label htmlFor="new-password">New password<input id="new-password" type="password" autoComplete="new-password" {...register('password')}/></label><label htmlFor="confirm-password">Confirm password<input id="confirm-password" type="password" autoComplete="new-password" {...register('confirm')}/></label>{(errors.password||errors.confirm)&&<p className="field-error" role="alert">{errors.password?.message||errors.confirm?.message}</p>}<button className="primary-button" disabled={busy}>{busy?'Saving password…':'Save password & continue'}</button></form>;}
