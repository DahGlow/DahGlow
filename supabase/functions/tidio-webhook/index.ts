import { z } from 'npm:zod@3';
import { json } from '../_shared/cors.ts';
import { adminDb,check } from '../_shared/config.ts';

const schema=z.object({
 created_at:z.number().int().positive(),
 project_public_key:z.string().min(1).max(100),
 topic:z.string().min(1).max(100),
 version:z.number().int().positive(),
 webhook_id:z.string().uuid(),
 content:z.record(z.unknown())
});
const supportedTopics=new Set([
 'contact.created','contact.updated','conversation.operator_replied',
 'conversation.solved_by_operator','conversation.solved_by_lyro',
 'conversation.solved_automatically','ticket.created','ticket.status_updated',
 'ticket.operator_assigned'
]);

function equalHex(a:string,b:string){
 if(!/^[a-f0-9]{64}$/i.test(a)||!/^[a-f0-9]{64}$/i.test(b))return false;
 let mismatch=0;
 for(let i=0;i<a.length;i++)mismatch|=a.charCodeAt(i)^b.charCodeAt(i);
 return mismatch===0;
}

async function signatureMatches(body:string,header:string,secret:string){
 const parts=header.split(',').map(part=>part.trim().split('=',2));
 const timestamp=parts.find(([key])=>key==='t')?.[1];
 const signatures=parts.filter(([key])=>key==='s').map(([,value])=>value).filter(Boolean);
 if(!timestamp||!/^\d+$/.test(timestamp)||!signatures.length)return false;
 if(Math.abs(Date.now()/1000-Number(timestamp))>6*60*60)return false;
 const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 const digest=await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(`${body}_${timestamp}`));
 const calculated=Array.from(new Uint8Array(digest),byte=>byte.toString(16).padStart(2,'0')).join('');
 return signatures.some(signature=>equalHex(calculated,signature));
}

Deno.serve(async req=>{
 if(req.method==='OPTIONS')return new Response(null,{status:204});
 if(req.method!=='POST')return json({error:'POST required'},405);
 const secret=Deno.env.get('TIDIO_WEBHOOK_SECRET');
 const publicKey=Deno.env.get('TIDIO_PUBLIC_KEY');
 if(!secret||!publicKey)return json({error:'Tidio webhook is not configured.'},503);
 const body=await req.text();
 if(body.length>256_000)return json({error:'Request too large'},413);
 const signature=req.headers.get('x-tidio-signature')||'';
 if(!await signatureMatches(body,signature,secret))return json({error:'Invalid webhook signature'},401);
 let event:z.infer<typeof schema>;
 try{event=schema.parse(JSON.parse(body));}catch{return json({error:'Invalid Tidio webhook event'},400);}
 if(event.project_public_key!==publicKey)return json({error:'Unexpected Tidio project'},401);
 if(!supportedTopics.has(event.topic))return json({error:'Unsupported Tidio webhook topic'},400);
 const content=event.content;
 const contactId=typeof content.contact_id==='string'?content.contact_id:typeof content.id==='string'?content.id:null;
 const ticketId=typeof content.id==='number'&&event.topic.startsWith('ticket.')?content.id:null;
 const message=typeof content.message==='object'&&content.message!==null?content.message as Record<string,unknown>:null;
 const solvedAt=typeof content.solved_at==='string'?content.solved_at:null;
 const reason=typeof content.reason==='string'?content.reason:null;
 const status=typeof content.status==='string'?content.status.slice(0,40):null;
 const assignedOperatorId=typeof content.assigned_operator_id==='string'&&z.string().uuid().safeParse(content.assigned_operator_id).success?content.assigned_operator_id:null;
 const assignedDepartmentId=typeof content.assigned_department_id==='string'&&z.string().uuid().safeParse(content.assigned_department_id).success?content.assigned_department_id:null;
 try{
  const db=adminDb();
  const result=await db.from('dg_tidio_webhook_events').insert({
   webhook_id:event.webhook_id,
   topic:event.topic,
   contact_id:contactId,
   ticket_id:ticketId,
   status,
   assigned_operator_id:assignedOperatorId,
   assigned_department_id:assignedDepartmentId,
   occurred_at:solvedAt||(typeof message?.created_at==='string'?message.created_at:new Date(event.created_at*1000).toISOString()),
   reason
  },{onConflict:'webhook_id',ignoreDuplicates:true});
  check(result);
 }catch(error){
  console.error('Tidio webhook event could not be stored:',error instanceof Error?error.message:'Unknown database error');
  return json({error:'Tidio webhook event could not be stored'},503);
 }
 return json({received:true});
});
