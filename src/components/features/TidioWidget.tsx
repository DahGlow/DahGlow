import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const publicKey=import.meta.env.VITE_TIDIO_PUBLIC_KEY?.trim();

export default function TidioWidget(){
 const {pathname}=useLocation();
 const adminPage=pathname.startsWith('/private-control/');

 useEffect(()=>{
  const updateVisibility=()=>{
   const api=window.tidioChatApi;
   if(!api)return;
   if(adminPage)api.hide();else api.show();
  };
  updateVisibility();
  if(adminPage||!publicKey)return;
  if(!document.getElementById('tidio-chat-script')){
   const script=document.createElement('script');
   script.id='tidio-chat-script';
   script.async=true;
   script.src=`https://code.tidio.co/${encodeURIComponent(publicKey)}.js`;
   document.body.appendChild(script);
  }
 },[adminPage]);

 useEffect(()=>{
  const onReady=()=>{
   window.__dahGlowTidioReady=true;
   const api=window.tidioChatApi;
   if(api){if(adminPage)api.hide();else api.show();}
  };
  document.addEventListener('tidioChat-ready',onReady);
  return ()=>document.removeEventListener('tidioChat-ready',onReady);
 },[adminPage]);

 return null;
}
