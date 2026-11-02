import { useEffect,useRef } from 'react';
import { useShop } from '@/hooks/useShop';

export function useRecentlyViewed(handle:string){const {viewProduct}=useShop();const save=useRef(viewProduct);save.current=viewProduct;useEffect(()=>{if(!handle)return;let remaining=5000;let start=0;let done=false;let timer:ReturnType<typeof setTimeout>;const resume=()=>{if(done)return;start=Date.now();timer=setTimeout(()=>{done=true;save.current(handle);},remaining);};const visibility=()=>{clearTimeout(timer);if(document.hidden)remaining=Math.max(0,remaining-(Date.now()-start));else resume();};if(!document.hidden)resume();document.addEventListener('visibilitychange',visibility);return()=>{clearTimeout(timer);document.removeEventListener('visibilitychange',visibility);};},[handle]);}
