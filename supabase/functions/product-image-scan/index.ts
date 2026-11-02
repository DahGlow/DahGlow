import { corsHeaders,json } from '../_shared/cors.ts';
import { adminDb,check } from '../_shared/config.ts';
import { seal,open } from '../_shared/crypto.ts';
import { scanImage,ScanError,recognitionSchema,type Recognition } from '../_shared/scanValidation.ts';
import { recognizeImage } from '../_shared/scanAi.ts';
import { matchCatalog } from '../_shared/scanCatalog.ts';

interface ScanTicket { hash:string; detection:Recognition; expires:number; }
async function rateLimit(req:Request,phase:string) {
  const address=req.headers.get('cf-connecting-ip')||req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||'unknown';
  const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(address))),n=>n.toString(16).padStart(2,'0')).join('');
  const result=await adminDb().rpc('dg_rate_check',{p_key:`image-scan:${phase}:${hash}`,p_limit:phase==='recognize'?5:10,p_seconds:900});
  check(result);if(!result.data)throw new ScanError('Too many scans. Please wait 15 minutes before trying again.',429);
}
Deno.serve(async req=>{
  if(req.method==='OPTIONS')return new Response(null,{headers:corsHeaders});
  if(req.method!=='POST')return json({error:'POST an image to scan.'},405);
  try {
    const {form,image,hash}=await scanImage(req);const phase=String(form.get('phase')||'recognize');
    if(!['recognize','match'].includes(phase))throw new ScanError('Invalid scan action.');
    await rateLimit(req,phase);
    if(phase==='recognize') {
      const detection=await recognizeImage(image);
      const ticket=await seal({hash,detection,expires:Date.now()+600000});
      console.log('Product image recognition completed',{objects:detection.objects.length});
      return json({detection,ticket,service:'OnSpace AI · Gemini 3 Flash',source:'Shopify Storefront'});
    }
    const proof=String(form.get('ticket')||'');if(!proof||proof.length>20000)throw new ScanError('Scan expired. Please scan the image again.');
    let ticket:ScanTicket;try{ticket=await open<ScanTicket>(proof);}catch{throw new ScanError('Scan expired. Please scan the image again.');}
    if(ticket.hash!==hash||ticket.expires<Date.now())throw new ScanError('Scan expired or the image changed. Please scan again.');
    const detection=recognitionSchema.parse(ticket.detection);
    const limit=Math.max(1,Math.min(36,Number(form.get('limit'))||24));
    const result=await matchCatalog(image,detection,limit);
    console.log('Product visual search completed',{evaluated:result.evaluated,matches:result.matches.length});
    return json({...result,detection,service:'OnSpace AI · Gemini 3 Flash',source:'Shopify Storefront'});
  } catch(error) {
    const timeout=error instanceof Error&&(error.name==='TimeoutError'||error.name==='AbortError');
    const status=error instanceof ScanError?error.status:timeout?504:502;
    console.error('Product scan failed',{status,type:error instanceof Error?error.name:'unknown'});
    return json({error:error instanceof ScanError?error.message:timeout?'Image analysis timed out. Try a smaller, clearer photo.':'Product scanning is temporarily unavailable. Please retry.'},status);
  }
});
