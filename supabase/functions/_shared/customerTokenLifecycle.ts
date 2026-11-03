export interface CustomerTokens {
 access_token:string;
 refresh_token:string;
 id_token?:string;
 expires_in:number;
}

export interface CustomerTokenSession {
 customerId:string;
 tokens:CustomerTokens;
 origin:string;
 expiresAt:string;
 tokenUpdatedAt:string;
 status:'connected'|'reauth_required';
}

export class CustomerOAuthError extends Error {
 readonly status:number;
 readonly code:string;
 constructor(status:number,code:string){
  super(`Shopify Customer OAuth ${status}${code?`: ${code}`:''}`);
  this.name='CustomerOAuthError';
  this.status=status;
  this.code=code;
 }
}

export class CustomerReauthRequiredError extends Error {
 constructor(){
  super('Your Shopify customer session expired. Reconnect your Shopify account to continue.');
  this.name='CustomerReauthRequiredError';
 }
}

export function validateCustomerTokens(value:unknown):CustomerTokens{
 if(!value||typeof value!=='object')throw new Error('Shopify returned an invalid customer token response.');
 const tokens=value as Partial<CustomerTokens>;
 if(typeof tokens.access_token!=='string'||!tokens.access_token||typeof tokens.refresh_token!=='string'||!tokens.refresh_token||typeof tokens.expires_in!=='number'||!Number.isFinite(tokens.expires_in)||tokens.expires_in<=0)throw new Error('Shopify did not return valid customer access and refresh tokens. Confirm this is a Headless customer account client configured on the shop.');
 if(tokens.id_token!==undefined&&typeof tokens.id_token!=='string')throw new Error('Shopify returned an invalid customer ID token.');
 return tokens as CustomerTokens;
}

export function customerTokenExpiry(tokens:CustomerTokens,now=Date.now()){
 return new Date(now+tokens.expires_in*1000).toISOString();
}

export function customerRefreshRequest(clientId:string,refreshToken:string){
 return new URLSearchParams({grant_type:'refresh_token',client_id:clientId,refresh_token:refreshToken});
}

interface RefreshDependencies {
 load:()=>Promise<CustomerTokenSession|null>;
 acquire:(owner:string)=>Promise<number|null>;
 save:(owner:string,tokens:CustomerTokens,expiresAt:string,origin:string)=>Promise<boolean>;
 requireReauth:(owner:string)=>Promise<boolean>;
 release:(owner:string)=>Promise<void>;
 refresh:(refreshToken:string,origin:string)=>Promise<CustomerTokens>;
 newOwner:()=>string;
 now:()=>number;
 sleep:(milliseconds:number)=>Promise<void>;
 log:(event:string,details:Record<string,string|number>)=>void;
}

const ACCESS_TOKEN_EXPIRY_BUFFER=60000;
const REFRESH_WAIT_TIMEOUT=30000;
const REFRESH_POLL_INTERVAL=250;

function isUsable(session:CustomerTokenSession,now:number){
 return session.status==='connected'&&Date.parse(session.expiresAt)>now+ACCESS_TOKEN_EXPIRY_BUFFER;
}

function requireConnected(session:CustomerTokenSession|null):CustomerTokenSession{
 if(!session)throw new Error('Connect your Shopify customer account to access orders.');
 if(session.status==='reauth_required')throw new CustomerReauthRequiredError();
 return session;
}

export async function getCustomerAccessToken(userId:string,dependencies:RefreshDependencies):Promise<string>{
 let session=requireConnected(await dependencies.load());
 if(isUsable(session,dependencies.now()))return session.tokens.access_token;

 const owner=dependencies.newOwner();
 const deadline=dependencies.now()+REFRESH_WAIT_TIMEOUT;
 while(dependencies.now()<deadline){
  session=requireConnected(await dependencies.load());
  if(isUsable(session,dependencies.now()))return session.tokens.access_token;
  const attempt=await dependencies.acquire(owner);
  if(attempt!==null){
   try{
    session=requireConnected(await dependencies.load());
    if(isUsable(session,dependencies.now()))return session.tokens.access_token;
    const updatedAt=Date.parse(session.tokenUpdatedAt);
    const tokenAgeSeconds=Number.isFinite(updatedAt)?Math.max(0,Math.floor((dependencies.now()-updatedAt)/1000)):0;
    dependencies.log('customer_token_refresh_started',{customerId:userId,attempt,tokenAgeSeconds});
    try{
     const tokens=validateCustomerTokens(await dependencies.refresh(session.tokens.refresh_token,session.origin));
     const expiresAt=customerTokenExpiry(tokens,dependencies.now());
     if(!await dependencies.save(owner,tokens,expiresAt,session.origin)){
      const current=requireConnected(await dependencies.load());
      if(isUsable(current,dependencies.now()))return current.tokens.access_token;
      throw new Error('Customer token refresh lost its database lease before the rotated token could be saved.');
     }
     dependencies.log('customer_token_refresh_succeeded',{customerId:userId,attempt,httpStatus:200});
     return tokens.access_token;
    }catch(error){
     const invalidGrant=error instanceof CustomerOAuthError&&error.code==='invalid_grant';
     const status=error instanceof CustomerOAuthError?error.status:0;
     const errorCode=error instanceof CustomerOAuthError?error.code:'refresh_failed';
     dependencies.log('customer_token_refresh_failed',{customerId:userId,attempt,tokenAgeSeconds,httpStatus:status,errorCode});
     if(invalidGrant){
      if(!await dependencies.requireReauth(owner))throw new Error('Customer token refresh failed and its database lease expired. Please retry.');
      throw new CustomerReauthRequiredError();
     }
     throw error;
    }
   }finally{
    await dependencies.release(owner);
   }
  }

  session=requireConnected(await dependencies.load());
  if(isUsable(session,dependencies.now()))return session.tokens.access_token;
  await dependencies.sleep(REFRESH_POLL_INTERVAL);
 }
 throw new Error('Shopify customer session refresh is still in progress. Please retry shortly.');
}
