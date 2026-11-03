import { corsHeaders,json } from '../_shared/cors.ts';
import { adminDb,check,requireUser,errorResponse } from '../_shared/config.ts';
import { ensureAffiliate,affiliateSummary,saveAffiliateSocial } from '../_shared/affiliateAccounts.ts';
import { convertAffiliateLink,resolveAffiliateReferral,validAffiliateTarget } from '../_shared/affiliateReferrals.ts';
import { affiliateAnalytics } from '../_shared/affiliateAnalytics.ts';
import { AFFILIATE_RULES,AFFILIATE_RULES_VERSION } from '../_shared/affiliateRules.ts';
import { authorize,permit,rate,audit } from '../_shared/adminAccess.ts';

Deno.serve(async req=>{
 if(req.method==='OPTIONS')return new Response(null,{headers:corsHeaders});
 if(req.method!=='POST')return json({error:'POST required'},405);
 try{
  if(Number(req.headers.get('content-length')||0)>10000)return json({error:'Request too large'},413);
  const body=await req.json();
  if(body.op==='rules')return json({rules:AFFILIATE_RULES,version:AFFILIATE_RULES_VERSION});
  if(body.op==='resolve')return json(await resolveAffiliateReferral(req,body));
  if(body.op==='lookup'){const code=String(body.code||'').toUpperCase();if(!/^[A-Z0-9]{8}$/.test(code))return json({found:false});const remote=req.headers.get('x-forwarded-for')?.split(',')[0]||'unknown';await rate(`affiliate-lookup:${remote}`,60,60);const result=await adminDb().from('dg_affiliates').select('display_name').eq('referral_code',code).eq('active',true).maybeSingle();check(result);return json({found:!!result.data,name:result.data?.display_name});}
  if(body.op==='program-settings'){
   const actor=await authorize(req);permit(actor,'store');
   const result=await adminDb().from('dg_affiliate_program').select('enabled,commission_rate,returning_rate').eq('id',true).single();check(result);
   return json({program:result.data});
  }
  const user=await requireUser(req);await rate(`affiliate:${user.id}`,120,60);
  if(body.op==='summary')return json(await affiliateSummary(user));
  await ensureAffiliate(user);
  if(body.op==='analytics')return json(await affiliateAnalytics(user.id,body.days));
  if(body.op==='pick'){
   const handle=String(body.handle||'');await validAffiliateTarget(`/products/${handle}`);const db=adminDb();
   if(body.saved===false)check(await db.from('dg_affiliate_picks').delete().eq('user_id',user.id).eq('product_handle',handle));
   else check(await db.from('dg_affiliate_picks').upsert({user_id:user.id,product_handle:handle},{onConflict:'user_id,product_handle',ignoreDuplicates:true}));
   return json({saved:body.saved!==false});
  }
  if(body.op==='convert'){
   const origin=req.headers.get('Origin');if(!origin||!/^https?:\/\//.test(origin))throw new Error('A browser origin is required');
   return json(await convertAffiliateLink(user.id,String(body.link||''),new URL(origin).origin));
  }
  if(body.op==='social-save')return json(await saveAffiliateSocial(user.id,String(body.provider),String(body.url)));
  if(body.op==='profile-save'){
   const name=String(body.name||'').trim();const categories=Array.isArray(body.categories)?body.categories.filter((c:unknown)=>typeof c==='string'&&['Women','Men','Kids','Home','Beauty','Shoes','Accessories'].includes(c as string)):[];
   if(name.length<2||name.length>100)throw new Error('Use a name between 2 and 100 characters');
   check(await adminDb().from('dg_affiliates').update({display_name:name,categories}).eq('user_id',user.id));return json({saved:true});
  }
  if(body.op==='program-save'){
   const actor=await authorize(req);permit(actor,'store');const commissionRate=Number(body.commissionRate),returningRate=Number(body.returningRate);
   if(!Number.isFinite(commissionRate)||!Number.isFinite(returningRate)||commissionRate<0||commissionRate>1||returningRate<0||returningRate>1)throw new Error('Commission rates must be between 0 and 1');
   check(await adminDb().from('dg_affiliate_program').update({enabled:body.enabled===true,commission_rate:commissionRate,returning_rate:returningRate,updated_at:new Date().toISOString()}).eq('id',true));await audit(actor,'affiliate-program-updated');return json({saved:true});
  }
  if(body.op==='withdraw')return json({error:'Secure payout processing and tax/payment verification must be configured before withdrawals are available.'},409);
  return json({error:'Unsupported affiliate operation'},400);
 }catch(error){return json({error:errorResponse(error)},400);}
});
