const API_URL = 'https://api.tidio.com';

export async function tidioRequest<T>(path:string,init:RequestInit={},retry=true):Promise<T>{
 const clientId=Deno.env.get('TIDIO_CLIENT_ID'),clientSecret=Deno.env.get('TIDIO_CLIENT_SECRET');
 if(!clientId||!clientSecret)throw new Error('Tidio OpenAPI is not configured. Add the Tidio client ID and secret to Supabase function secrets.');
 const canRetry=retry&&(init.method||'GET').toUpperCase()==='GET';
 const headers=new Headers(init.headers);
 headers.set('X-Tidio-Openapi-Client-Id',clientId);
 headers.set('X-Tidio-Openapi-Client-Secret',clientSecret);
 headers.set('Accept','application/json; version=1');
 if(init.body)headers.set('Content-Type','application/json; version=1');
 let response:Response;
 try{response=await fetch(`${API_URL}${path}`,{...init,headers,signal:AbortSignal.timeout(12000)});}
 catch{if(canRetry){await new Promise(resolve=>setTimeout(resolve,300));return tidioRequest<T>(path,init,false);}throw new Error('Tidio could not be reached. Please try again shortly.');}
 if(response.status===401||response.status===403)throw new Error('Tidio rejected the credentials or this account plan does not include OpenAPI.');
 if(response.status===429)throw new Error('Tidio rate limit reached. Wait a minute before retrying.');
 if(response.status>=500&&canRetry){await new Promise(resolve=>setTimeout(resolve,300));return tidioRequest<T>(path,init,false);}
 if(!response.ok)throw new Error(`Tidio request failed (${response.status}).`);
 if(response.status===204)return undefined as T;
 try{return await response.json() as T;}catch{throw new Error('Tidio returned an invalid response.');}
}

export function tidioInboxUrl(value:unknown):string|null{
 if(typeof value!=='string')return null;
 try{
  const url=new URL(value);
  return url.protocol==='https:'&&(url.hostname==='tidio.com'||url.hostname==='www.tidio.com')?url.toString():null;
 }catch{return null;}
}
