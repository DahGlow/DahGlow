import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { invoke } from '@/lib/shopify';

const exchanges=new Map<string,Promise<{connected:boolean}>>();
export function completeCustomerLogin(code:string,state:string){if(!exchanges.has(code))exchanges.set(code,invoke<{connected:boolean}>('shopify-customer-account',{op:'complete',code,state}));return exchanges.get(code)!;}
export function useCustomerBridge(){const client=useQueryClient();useEffect(()=>{const receive=(event:MessageEvent)=>{const data=event.data;if(data?.type==='DG_CUSTOMER_CODE'&&typeof data.code==='string'&&typeof data.state==='string')void completeCustomerLogin(data.code,data.state).then(()=>{void client.invalidateQueries({queryKey:['customer-account']});void client.invalidateQueries({queryKey:['customer-orders']});toast.success('Shopify customer account connected');}).catch(error=>toast.error(error.message));if(data?.type==='DG_CUSTOMER_ERROR'&&typeof data.message==='string')toast.error(data.message);};window.addEventListener('message',receive);return()=>window.removeEventListener('message',receive);},[client]);}
