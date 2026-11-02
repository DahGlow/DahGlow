import { corsHeaders,json } from '../_shared/cors.ts';
import { serviceOnly,errorResponse } from '../_shared/config.ts';
import { getAdminToken,tokenStatus } from '../_shared/shopifyAdmin.ts';
Deno.serve(async req=>{if(req.method==='OPTIONS')return new Response(null,{headers:corsHeaders});try{await serviceOnly(req);await getAdminToken();return json(await tokenStatus());}catch(error){return json({error:errorResponse(error)},403);}});
