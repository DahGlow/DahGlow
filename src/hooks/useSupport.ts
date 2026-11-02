import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { invoke } from '@/lib/shopify';
export interface ChatMessage{role:'user'|'assistant';content:string;}
export function useSupport(productHandle?:string,orderId?:string){const [messages,setMessages]=useState<ChatMessage[]>([]);const mutation=useMutation({mutationFn:(next:ChatMessage[])=>invoke<{reply:string}>('dah-glow-support',{messages:next.slice(-12),productHandle,orderId}),onSuccess:data=>setMessages(previous=>[...previous,{role:'assistant',content:data.reply}]),onError:(error:Error)=>toast.error(error.message)});const send=(text:string)=>{const content=text.trim();if(!content||mutation.isPending)return;const next:ChatMessage[]=[...messages,{role:'user',content}];setMessages(next);mutation.mutate(next);};return {messages,send,busy:mutation.isPending,error:mutation.error};}
