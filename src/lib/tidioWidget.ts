async function getReadyTidioApi(){
 if(!import.meta.env.VITE_TIDIO_PUBLIC_KEY?.trim())throw new Error('Live chat is not configured yet. Please use the contact form below.');
 if(!window.__dahGlowTidioReady){
  await new Promise<void>((resolve,reject)=>{
   const timeout=window.setTimeout(()=>{document.removeEventListener('tidioChat-ready',ready);reject(new Error('Live chat is taking too long to load. Please try again.'));},12000);
   const ready=()=>{window.clearTimeout(timeout);resolve();};
   document.addEventListener('tidioChat-ready',ready,{once:true});
  });
 }
 const api=window.tidioChatApi;
 if(!api)throw new Error('Live chat is unavailable. Please try again shortly.');
 return api;
}

export async function openTidioChat(){
 const api=await getReadyTidioApi();
 const status=api.getStatus();
 api.open();
 return status;
}

export async function requestTidioHumanSupport(message:string){
 const api=await getReadyTidioApi();
 const status=api.getStatus();
 api.open();
 api.messageFromVisitor(message.slice(0,2000));
 return status;
}
