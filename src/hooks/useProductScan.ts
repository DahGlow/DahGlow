import { useEffect,useRef,useState } from 'react';
import { FunctionsHttpError } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { supabase } from '@/lib/api';
import { mapProduct } from '@/lib/shopify';
import { prepareScanImage } from '@/lib/scanImage';
import type { Recognition,ScanResponse,ScanResult,ScanStage } from '@/types/scan';
async function request<T>(image:File,phase:string,ticket?:string):Promise<T> {
  const body=new FormData();body.append('image',image);body.append('phase',phase);body.append('limit','24');if(ticket)body.append('ticket',ticket);
  const {data,error}=await supabase.functions.invoke('product-image-scan',{body});
  if(error){if(error instanceof FunctionsHttpError){const text=await error.context.text();let message='Scan failed. Please try again.';try{message=JSON.parse(text).error||message;}catch{message=`Scan request failed (${error.context.status}). Please retry.`;}throw new Error(message);}throw new Error('Could not reach visual search. Check your connection and retry.');}
  if(!data||data.error)throw new Error(data?.error||'Visual search returned no response.');return data as T;
}
export function useProductScan(){
  const [stage,setStage]=useState<ScanStage>('idle'),[image,setImage]=useState(''),[result,setResult]=useState<ScanResult|null>(null),[error,setError]=useState('');
  const sequence=useRef(0),lastFile=useRef<File|null>(null),url=useRef('');
  useEffect(()=>()=>{sequence.current++;if(url.current)URL.revokeObjectURL(url.current);},[]);
  const cancel=()=>{sequence.current++;setStage('idle');setResult(null);setError('');setImage('');if(url.current){URL.revokeObjectURL(url.current);url.current='';}};
  const scan=async(file:File)=>{
    const current=++sequence.current;lastFile.current=file;setError('');setResult(null);setImage('');setStage('preparing');
    try{
      const prepared=await prepareScanImage(file);if(current!==sequence.current)return;
      if(url.current)URL.revokeObjectURL(url.current);url.current=URL.createObjectURL(prepared);setImage(url.current);setStage('recognizing');
      const recognition=await request<{detection:Recognition;ticket:string}>(prepared,'recognize');if(current!==sequence.current)return;
      if(!recognition.detection||!Array.isArray(recognition.detection.objects)||typeof recognition.ticket!=='string')throw new Error('Recognition returned incomplete data. Please retry.');
      setStage('matching');const data=await request<ScanResponse>(prepared,'match',recognition.ticket);if(current!==sequence.current)return;
      if(!Array.isArray(data.matches)||!data.detection)throw new Error('Product comparison returned incomplete data. Please retry.');
      setResult({...data,matches:data.matches.map(m=>({...m,product:mapProduct(m.product)}))});setStage('done');
    }catch(failure){if(current!==sequence.current)return;const message=failure instanceof Error?failure.message:'This image could not be scanned.';setError(message);setStage('error');toast.error(message);}
  };
  return {stage,image,result,error,scan,cancel,retry:()=>lastFile.current&&void scan(lastFile.current)};
}
