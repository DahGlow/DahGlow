import { useForm } from 'react-hook-form';
import { SendHorizontal } from 'lucide-react';

interface Props{busy:boolean;onSend:(text:string)=>void;}
export default function SupportMessageForm({busy,onSend}:Props){const {register,handleSubmit,reset}=useForm<{message:string}>();return <form className="support-composer" onSubmit={handleSubmit(v=>{if(v.message.trim()){onSend(v.message);reset();}})}><label htmlFor="support-message" className="sr-only">Message Dah Glow support</label><input id="support-message" placeholder="Type your message briefly here" maxLength={2000} autoComplete="off" {...register('message',{required:true})}/><button className="primary-button" disabled={busy} type="submit" aria-label="Send message"><SendHorizontal size={22}/></button></form>;}
