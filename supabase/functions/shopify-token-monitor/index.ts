import { corsHeaders,json } from '../_shared/cors.ts';
import { serviceOnly,errorResponse } from '../_shared/config.ts';
import { adminGraph,tokenStatus } from '../_shared/shopifyAdmin.ts';
import { ensureIntegration } from '../_shared/bootstrap.ts';

Deno.serve(async req=>{if(req.method==='OPTIONS')return new Response(null,{headers:corsHeaders});try{await serviceOnly(req);await adminGraph('{ shop { id } }');await ensureIntegration();return json({verified:true,...await tokenStatus()});}catch(error){return json({error:errorResponse(error)},503);}});
