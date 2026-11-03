
import { z } from 'npm:zod@3';
import { storefront, PRODUCT, META, quote } from './storefront.ts';
import { visibleProducts } from './publicStore.ts';
import { scanAi } from './scanAi.ts';
import { ScanError, type Recognition } from './scanValidation.ts';

interface CatalogProduct { id:string; handle:string; title:string; vendor:string; productType:string; description:string; tags:string[]; images:{nodes:{url:string}[]}; }
interface CatalogPage { products:{nodes:CatalogProduct[];pageInfo:{hasNextPage:boolean;endCursor:string|null}}; }
const rankSchema=z.object({matches:z.array(z.object({id:z.string(),objectIndex:z.number().int().min(0).max(4),score:z.number().min(0).max(1),reason:z.string().max(240)})).max(80)});
function relevance(p:CatalogProduct,d:Recognition) {
  const text=`${p.title} ${p.vendor} ${p.productType} ${p.tags.join(' ')} ${p.description.slice(0,500)}`.toLowerCase();
  const terms=d.objects.flatMap(o=>[o.category,...o.searchTerms,...o.details]).join(' ').toLowerCase().match(/[\p{L}\p{N}]{3,}/gu)||[];
  return [...new Set(terms)].reduce((score,t)=>score+(text.includes(t)?1:0),0);
}
export async function matchCatalog(image:string,detection:Recognition,limit:number) {
  if (!detection.objects.length) return {matches:[],evaluated:0,candidates:0,limited:false,providers:[]};
  const terms=[...new Set(detection.objects.flatMap(o=>o.searchTerms))].slice(0,15);
  const query=terms.map(t=>`(title:${quote(t)} OR product_type:${quote(t)} OR tag:${quote(t)})`).join(' OR ');
  const fetchPage=(query:string)=>storefront<CatalogPage>(`query($query:String,$meta:[HasMetafieldsIdentifier!]!){products(first:200,query:$query){nodes{${PRODUCT}}pageInfo{hasNextPage endCursor}}}`,{query,meta:META});
  const page=await fetchPage(query); const fallback=page.products.nodes.length<12?await fetchPage(''):null;
  const candidates=await visibleProducts([...new Map([...page.products.nodes,...(fallback?.products.nodes||[])].map(p=>[p.id,p])).values()]);
  const shortlist=candidates.filter(p=>p.images.nodes[0]?.url).sort((a,b)=>relevance(b,detection)-relevance(a,detection)).slice(0,48);
  const chunks=Array.from({length:Math.ceil(shortlist.length/16)},(_,i)=>shortlist.slice(i*16,i*16+16));
  const results=await Promise.all(chunks.map(async batch=>{
    const info=batch.map(p=>({id:p.id,title:p.title,category:p.productType,vendor:p.vendor,description:p.description.slice(0,200),tags:p.tags}));
    const images=batch.map(p=>{const u=new URL(p.images.nodes[0].url);if(u.hostname==='cdn.shopify.com')u.searchParams.set('width','320');return u.toString();});
    const prompt=`Compare the first image (uploaded photo) against the following catalog images, in exactly the same order as catalog entries. Detected objects: ${JSON.stringify(detection.objects)}. Catalog: ${JSON.stringify(info)}. Return {"matches":[{"id":"catalog id","objectIndex":0,"score":0.0,"reason":"visible similarity evidence"}]}. Compare images AND attributes, not keywords alone. Score visual similarity 0..1. Include only relevant visually similar products scoring at least 0.55. Do not assume any exact match or brand identity. Omit unrelated items; an empty list is valid.`;
    const result=await scanAi(prompt,[image,...images],data=>rankSchema.safeParse(data).success);
    const parsed=rankSchema.safeParse(result.data);if(!parsed.success)throw new ScanError('Visual comparison returned an invalid result. Please retry.',502);
    return {matches:parsed.data.matches.filter(m=>batch.some(p=>p.id===m.id)&&m.score>=0.55&&m.objectIndex<detection.objects.length),provider:result.provider};
  }));
  const unique=new Map<string,typeof results[number]['matches'][number]>();
  results.flatMap(result=>result.matches).forEach(m=>{if(!unique.has(m.id)||unique.get(m.id)!.score<m.score)unique.set(m.id,m);});
  const matches=[...unique.values()].sort((a,b)=>b.score-a.score).slice(0,limit).map(m=>({...m,matchType:'similar',product:shortlist.find(p=>p.id===m.id)!}));
  return {matches,evaluated:shortlist.length,candidates:candidates.length,limited:candidates.length>48||page.products.pageInfo.hasNextPage||!!fallback?.products.pageInfo.hasNextPage,providers:[...new Set(results.map(result=>result.provider))]};
}
