import { corsHeaders,json } from '../_shared/cors.ts';
import { createGiftCardCheckout,lookupGiftCardBalance } from '../_shared/giftCardWorkflow.ts';

Deno.serve(async req=>{
  if(req.method==='OPTIONS')return new Response(null,{headers:corsHeaders});
  if(req.method!=='POST')return json({error:'POST required'},405);
  const length=Number(req.headers.get('content-length')||0);
  if(length>16000)return json({error:'Request is too large.'},413);
  try{
    const raw=await req.text();
    if(new TextEncoder().encode(raw).length>16000)return json({error:'Request is too large.'},413);
    const parsed:unknown=JSON.parse(raw);
    if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))return json({error:'Invalid request.'},400);
    const input=parsed as Record<string,unknown>;
    if(input.op==='create-checkout')return json(await createGiftCardCheckout(req,input));
    if(input.op==='balance')return json(await lookupGiftCardBalance(req,input));
    return json({error:'Unknown gift card operation.'},400);
  }catch(error){
    if(error instanceof SyntaxError)return json({error:'Invalid request.'},400);
    const message=error instanceof Error?error.message:'';
    const validation=[
      'Please enter','Please check','Refresh the page','Enter an amount','Enter a valid gift card code.','Scheduled delivery',
      'Choose a valid','Choose an available','This checkout request',
      'This gift card purchase','Your checkout is being prepared',
    ];
    if(validation.some(prefix=>message.startsWith(prefix)))return json({error:message},400);
    if(message.startsWith('Shopify Gift Cards are not enabled'))return json({error:message,code:'GIFT_CARDS_NOT_CONFIGURED'},503);
    if(message.startsWith('Too many requests'))return json({error:'Too many requests. Please try again later.'},429);
    console.error('Gift card operation failed',{name:error instanceof Error?error.name:'UnknownError'});
    return json({error:'Gift card service is temporarily unavailable. Please try again later.'},503);
  }
});
