import { toast } from 'sonner';
import { invoke } from '@/lib/shopify';

export const affiliateApi=<T>(body:Record<string,unknown>)=>invoke<T>('dah-glow-affiliate',body);
export const affiliateReferralUrl=(code:string)=>`${window.location.origin}/r/${encodeURIComponent(code)}`;
export async function copyAffiliateText(value:string){await navigator.clipboard.writeText(value);toast.success('Copied to clipboard');}
export async function shareAffiliateLink(url:string,title='Shop my Dah Glow picks'){if(navigator.share){await navigator.share({title,url}).catch(error=>{if(error instanceof Error&&error.name!=='AbortError')return copyAffiliateText(url);});}else await copyAffiliateText(url);}
export function affiliateVisitorKey(){const saved=localStorage.getItem('dg-affiliate-visitor');if(saved&&/^[0-9a-f-]{36}$/i.test(saved))return saved;const key=crypto.randomUUID();localStorage.setItem('dg-affiliate-visitor',key);return key;}
export function activeAffiliateVisit(){const raw=localStorage.getItem('dg-affiliate-attribution');if(!raw)return null;let record:unknown;try{record=JSON.parse(raw);}catch{return null;}if(!record||typeof record!=='object')return null;const value=record as {visitId?:unknown;expiresAt?:unknown};return typeof value.visitId==='string'&&typeof value.expiresAt==='string'&&Date.parse(value.expiresAt)>Date.now()?value.visitId:null;}
