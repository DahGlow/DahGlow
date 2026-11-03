const TTL=21600000;

interface Entry<T>{expires:number;value:T;}
const pending=new Map<string,Promise<unknown>>();
const PRODUCT_OPS=new Set(['catalog','product','vendors','recommendations','suggestions']);
export async function cachedProductRequest<T>(body:Record<string,unknown>,load:()=>Promise<T>):Promise<T>{if(!PRODUCT_OPS.has(String(body.op)))return load();const key='dg-products-v3:'+JSON.stringify(body);try{const raw=localStorage.getItem(key);if(raw){const entry=JSON.parse(raw) as Entry<T>;if(entry.expires>Date.now())return entry.value;localStorage.removeItem(key);}}catch{/* Storage can be blocked or full; the backend cache remains available. */}if(pending.has(key))return pending.get(key) as Promise<T>;const work=load().then(value=>{const text=JSON.stringify({expires:Date.now()+TTL,value});if(text.length<300000){try{localStorage.setItem(key,text);}catch{clearProductCache();}}return value;}).finally(()=>pending.delete(key));pending.set(key,work);return work;}
export function clearProductCache(){try{for(const key of Object.keys(localStorage))if(key.startsWith('dg-products-v2:')||key.startsWith('dg-products-v3:'))localStorage.removeItem(key);}catch{/* Browser storage is optional. */}}
