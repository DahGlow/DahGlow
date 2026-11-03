import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
 CustomerOAuthError,
 CustomerReauthRequiredError,
 customerAccountSessionRecord,
 customerRefreshRequest,
 getCustomerAccessToken,
 validateCustomerTokens,
 type CustomerTokenSession,
 type CustomerTokens
} from './customerTokenLifecycle.ts';

const now=Date.now();
const initialResponse={access_token:'initial-access',refresh_token:'initial-refresh',id_token:'buyer-id',expires_in:3600};

function fixture(overrides:Partial<CustomerTokenSession>={}){
 let session:CustomerTokenSession={customerId:'buyer-1',tokens:validateCustomerTokens(initialResponse),origin:'https://shop.example',expiresAt:new Date(now-1000).toISOString(),tokenUpdatedAt:new Date(now-3600000).toISOString(),status:'connected',...overrides};
 let owner:string|null=null;
 let attempt=0;
 const logs:{event:string;details:Record<string,string|number>}[]=[];
 const deps={
  load:async()=>session,
  acquire:async(nextOwner:string)=>{if(owner)return null;owner=nextOwner;attempt++;return attempt;},
  save:async(nextOwner:string,tokens:CustomerTokens,expiresAt:string)=>{if(owner!==nextOwner)return false;session={...session,tokens,expiresAt,tokenUpdatedAt:new Date(now).toISOString()};owner=null;return true;},
  requireReauth:async(nextOwner:string)=>{if(owner!==nextOwner)return false;session={...session,status:'reauth_required'};owner=null;return true;},
  release:async(nextOwner:string)=>{if(owner===nextOwner)owner=null;},
  refresh:async(_refreshToken:string,_origin:string)=>validateCustomerTokens({access_token:'rotated-access',refresh_token:'rotated-refresh',expires_in:3600}),
  newOwner:()=>`owner-${Math.random()}`,
  now:()=>now,
  sleep:(milliseconds:number)=>new Promise(resolve=>setTimeout(resolve,milliseconds)),
  log:(event:string,details:Record<string,string|number>)=>logs.push({event,details})
 };
 return {deps,getSession:()=>session,setSession:(next:CustomerTokenSession)=>{session=next;},getAttempts:()=>attempt,logs};
}

test('initial authorization response stores both tokens and a valid session is reused',async()=>{
 const tokens=validateCustomerTokens(initialResponse);
 const record=customerAccountSessionRecord('buyer-1','sealed-token-pair',tokens,now);
 assert.equal(record.ciphertext,'sealed-token-pair');
 assert.equal(record.expires_at,new Date(now+3600000).toISOString());
 assert.equal(record.session_status,'connected');
 assert.equal(record.refresh_lease_owner,null);
 const state=fixture({tokens,expiresAt:record.expires_at,tokenUpdatedAt:record.token_updated_at});
 assert.equal(await getCustomerAccessToken('buyer-1',state.deps),'initial-access');
 assert.equal(state.getAttempts(),0);
 assert.equal(state.getSession().tokens.refresh_token,'initial-refresh');
});

test('refresh uses the replacement refresh token for the next request',async()=>{
 const state=fixture();
 assert.equal(await getCustomerAccessToken('buyer-1',state.deps),'rotated-access');
 assert.equal(state.getSession().tokens.refresh_token,'rotated-refresh');
 state.getSession().expiresAt=new Date(now-1000).toISOString();
 let requestedRefreshToken='';
 state.deps.refresh=async(refreshToken)=>{requestedRefreshToken=refreshToken;return validateCustomerTokens({access_token:'second-access',refresh_token:'second-refresh',expires_in:3600});};
 assert.equal(await getCustomerAccessToken('buyer-1',state.deps),'second-access');
 assert.equal(requestedRefreshToken,'rotated-refresh');
 assert.equal(state.getSession().tokens.refresh_token,'second-refresh');
});

test('simultaneous refresh callers share the database lease and both receive the rotated token',async()=>{
 const state=fixture();
 let requestCount=0;
 state.deps.refresh=async()=>{requestCount++;await new Promise(resolve=>setTimeout(resolve,30));return validateCustomerTokens({access_token:'single-rotated-access',refresh_token:'single-rotated-refresh',expires_in:3600});};
 const tokens=await Promise.all([
  getCustomerAccessToken('buyer-1',state.deps),
  getCustomerAccessToken('buyer-1',state.deps)
 ]);
 assert.deepEqual(tokens,['single-rotated-access','single-rotated-access']);
 assert.equal(requestCount,1);
 assert.equal(state.getSession().tokens.refresh_token,'single-rotated-refresh');
 assert.equal(state.getAttempts(),1);
});

test('a refresh lease that was replaced cannot overwrite the newer token pair',async()=>{
 const state=fixture();
 state.deps.refresh=async()=>validateCustomerTokens({access_token:'late-access',refresh_token:'late-refresh',expires_in:3600});
 state.deps.save=async()=>{state.setSession({...state.getSession(),tokens:validateCustomerTokens({access_token:'newer-access',refresh_token:'newer-refresh',expires_in:3600}),expiresAt:new Date(now+3600000).toISOString(),tokenUpdatedAt:new Date(now).toISOString()});return false;};
 assert.equal(await getCustomerAccessToken('buyer-1',state.deps),'newer-access');
 assert.equal(state.getSession().tokens.access_token,'newer-access');
 assert.equal(state.getSession().tokens.refresh_token,'newer-refresh');
});

test('invalid_grant marks the session for reauthentication without retrying',async()=>{
 const state=fixture();
 let requestCount=0;
 state.deps.refresh=async()=>{requestCount++;throw new CustomerOAuthError(400,'invalid_grant');};
 await assert.rejects(getCustomerAccessToken('buyer-1',state.deps),CustomerReauthRequiredError);
 assert.equal(state.getSession().status,'reauth_required');
 await assert.rejects(getCustomerAccessToken('buyer-1',state.deps),CustomerReauthRequiredError);
 assert.equal(requestCount,1);
 assert.equal(state.logs.at(-1)?.details.errorCode,'invalid_grant');
 assert.equal(state.logs.at(-1)?.details.httpStatus,400);
 assert.equal(typeof state.logs.at(-1)?.details.tokenAgeSeconds,'number');
 assert.equal(JSON.stringify(state.logs).includes('initial-refresh'),false);
});

test('refresh request contains only the required grant, same public client ID, and current token',()=>{
 const body=customerRefreshRequest('public-client-id','current-refresh');
 assert.equal(body.get('grant_type'),'refresh_token');
 assert.equal(body.get('client_id'),'public-client-id');
 assert.equal(body.get('refresh_token'),'current-refresh');
 assert.equal([...body.keys()].length,3);
 assert.throws(()=>validateCustomerTokens({access_token:'no-refresh',expires_in:3600}),/Headless customer account client/);
 assert.equal(new CustomerOAuthError(400,'invalid_grant').message.includes('current-refresh'),false);
});
