import { adminDb,check } from './config.ts';
import { rate } from './adminAccess.ts';
import { adminGraph,tokenStatus } from './shopifyAdmin.ts';

const DESIGNS=['Classic Glow','Elegant Beauty','Birthday Glow','Minimal Luxury'];
const PURCHASE_SCOPES=['read_orders','read_draft_orders','write_draft_orders','read_gift_cards','write_gift_cards','write_customers'];
const GIFT_REQUEST_ATTRIBUTE='_dg_gift_card_request';
const GIFT_REQUEST_TAG='dah-glow-digital-gift-card';
const EMAIL_PATTERN=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_PATTERN=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

interface GiftPurchaseInput {
  requestId:string;
  amount:number;
  buyerEmail:string;
  recipientEmail:string;
  recipientName:string;
  senderName:string;
  message:string;
  design:string;
  sendAt:string|null;
  timezone:string|null;
}

interface PurchaseRow {
  id:string;
  client_request_id:string;
  request_hash:string;
  status:string;
  checkout_url:string|null;
  draft_order_id:string|null;
  order_id:string|null;
  gift_card_id:string|null;
  issue_attempted_at:string|null;
  created_at:string;
  updated_at:string;
  buyer_email:string;
  recipient_email:string;
  recipient_name:string;
  sender_name:string;
  message:string;
  design:string;
  amount:number|string;
  send_at:string|null;
  timezone:string|null;
}

function safeText(value:unknown,max:number,field:string,required=false){
  if(typeof value!=='string')throw new Error(`Please enter a valid ${field}.`);
  const result=value.trim();
  const hasControlCharacters=[...result].some(character=>{const code=character.charCodeAt(0);return code===127||(code<32&&![9,10,13].includes(code));});
  if((required&&!result)||result.length>max||hasControlCharacters)throw new Error(`Please check the ${field}.`);
  return result;
}

function validEmail(value:unknown,field:string){
  if(typeof value!=='string'||value.length>254||!EMAIL_PATTERN.test(value.trim()))throw new Error(`Please enter a valid ${field}.`);
  return value.trim().toLowerCase();
}

function normalizePurchase(input:Record<string,unknown>):GiftPurchaseInput{
  const requestId=typeof input.requestId==='string'?input.requestId:'';
  if(!UUID_PATTERN.test(requestId))throw new Error('Refresh the page and try again.');
  const amount=typeof input.amount==='number'?input.amount:Number(input.amount);
  if(!Number.isFinite(amount)||amount<1||amount>2000||Math.round(amount*100)!==amount*100)throw new Error('Enter an amount from $1 to $2,000 USD.');
  const buyerEmail=validEmail(input.buyerEmail,'buyer email address');
  const recipientEmail=validEmail(input.recipientEmail,'recipient email address');
  const recipientName=safeText(input.recipientName,80,'recipient name',true);
  const senderName=safeText(input.senderName,80,'sender name',true);
  const message=safeText(input.message,160,'gift message');
  const design=safeText(input.design,40,'gift card design',true);
  if(!DESIGNS.includes(design))throw new Error('Choose an available gift card design.');
  let sendAt:string|null=null,timezone:string|null=null;
  if(input.sendAt!==null&&input.sendAt!==undefined&&input.sendAt!==''){
    if(typeof input.sendAt!=='string'||typeof input.timezone!=='string'||input.timezone.length>100)throw new Error('Choose a valid delivery date and time.');
    const date=new Date(input.sendAt);
    if(!Number.isFinite(date.getTime())||date.getTime()<Date.now()+60*60*1000)throw new Error('Scheduled delivery must be at least one hour from now.');
    try{new Intl.DateTimeFormat('en-US',{timeZone:input.timezone}).format(date);}catch{throw new Error('Choose a valid time zone.');}
    sendAt=date.toISOString();timezone=input.timezone;
  }
  return {requestId,amount,buyerEmail,recipientEmail,recipientName,senderName,message,design,sendAt,timezone};
}

async function digest(value:string){
  const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes),byte=>byte.toString(16).padStart(2,'0')).join('');
}

async function requireScopes(required:string[]){
  const status=await tokenStatus();
  const granted=new Set((status.scopes||'').split(/[,\s]+/).filter(Boolean));
  const missing=required.filter(scope=>!granted.has(scope));
  if(missing.length)throw new Error('Shopify Gift Cards are not enabled for this store yet. The Shopify app needs the required gift card, customer, draft order, and order permissions.');
}

async function applyRateLimits(req:Request,email?:string){
  const forwarded=req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const network=req.headers.get('cf-connecting-ip')||forwarded||'unknown-network';
  await rate(`gift-card-network:${await digest(network)}`,8,3600);
  if(email)await rate(`gift-card-email:${await digest(email.toLowerCase())}`,5,3600);
}

function sameRequest(row:PurchaseRow,input:GiftPurchaseInput){
  return row.buyer_email===input.buyerEmail&&row.recipient_email===input.recipientEmail
    &&row.recipient_name===input.recipientName&&row.sender_name===input.senderName
    &&row.message===input.message&&row.design===input.design&&Number(row.amount)===input.amount
    &&row.send_at===input.sendAt&&row.timezone===input.timezone;
}

async function findDraftOrder(requestId:string){
  const search=`tag:${GIFT_REQUEST_TAG}-${requestId}`;
  const result=await adminGraph<{draftOrders:{nodes:{id:string;note:string|null;invoiceUrl:string|null;tags:string[]}[]}}>(
    'query($query:String!){draftOrders(first:50,query:$query){nodes{id note invoiceUrl tags}}}',
    {query:search},
  );
  const marker=`dg-gift-request:${requestId}`;
  return result.draftOrders.nodes.find(draft=>draft.note===marker&&draft.tags.includes(`${GIFT_REQUEST_TAG}-${requestId}`))||null;
}

async function createDraftOrder(purchase:PurchaseRow){
  const existing=await findDraftOrder(purchase.id);
  if(existing?.invoiceUrl)return existing;
  const tag=`${GIFT_REQUEST_TAG}-${purchase.id}`;
  const result=await adminGraph<{draftOrderCreate:{draftOrder:{id:string;invoiceUrl:string|null}|null;userErrors:{message:string}[]}}>(
    'mutation($input:DraftOrderInput!){draftOrderCreate(input:$input){draftOrder{id invoiceUrl}userErrors{message}}}',
    {input:{
      email:purchase.buyer_email,
      note:`dg-gift-request:${purchase.id}`,
      tags:[GIFT_REQUEST_TAG,tag],
      taxExempt:true,
      acceptAutomaticDiscounts:false,
      allowDiscountCodesInCheckout:false,
      presentmentCurrencyCode:'USD',
      lineItems:[{
        title:'Dah Glow Digital Gift Card',
        quantity:1,
        taxable:false,
        requiresShipping:false,
        originalUnitPriceWithCurrency:{amount:Number(purchase.amount).toFixed(2),currencyCode:'USD'},
        customAttributes:[{key:GIFT_REQUEST_ATTRIBUTE,value:purchase.id}],
      }],
    }},
  );
  if(result.draftOrderCreate.userErrors.length)throw new Error('Shopify could not prepare the gift card checkout.');
  const draft=result.draftOrderCreate.draftOrder;
  if(!draft?.id||!draft.invoiceUrl||!draft.invoiceUrl.startsWith('https://'))throw new Error('Shopify did not return a valid gift card checkout.');
  return draft;
}

export async function createGiftCardCheckout(req:Request,input:Record<string,unknown>){
  const purchase=normalizePurchase(input);
  await applyRateLimits(req,purchase.buyerEmail);
  await requireScopes(['read_draft_orders','write_draft_orders']);
  const requestHash=await digest(JSON.stringify(purchase));
  const db=adminDb();
  const inserted=await db.from('dg_gift_card_purchases').insert({
    client_request_id:purchase.requestId,
    request_hash:requestHash,
    buyer_email:purchase.buyerEmail,
    recipient_email:purchase.recipientEmail,
    recipient_name:purchase.recipientName,
    sender_name:purchase.senderName,
    message:purchase.message,
    design:purchase.design,
    amount:purchase.amount,
    currency:'USD',
    send_at:purchase.sendAt,
    timezone:purchase.timezone,
    status:'requested',
  }).select('id,request_hash,status,checkout_url,draft_order_id,issue_attempted_at,created_at,buyer_email,recipient_email,recipient_name,sender_name,message,design,amount,send_at,timezone').maybeSingle();
  let row=inserted.data as PurchaseRow|null;
  if(inserted.error){
    if(inserted.error.code!=='23505')check(inserted);
    const existing=await db.from('dg_gift_card_purchases').select('id,request_hash,status,checkout_url,draft_order_id,issue_attempted_at,created_at,buyer_email,recipient_email,recipient_name,sender_name,message,design,amount,send_at,timezone').eq('client_request_id',purchase.requestId).maybeSingle();
    check(existing);
    row=existing.data as PurchaseRow|null;
  }
  if(!row||row.request_hash!==requestHash||!sameRequest(row,purchase))throw new Error('This checkout request cannot be reused. Refresh the page and try again.');
  if(row.checkout_url&&['checkout_created','paid_verified','issuing','issued'].includes(row.status))return {checkoutUrl:row.checkout_url};
  if(['paid_verified','issuing','issued','needs_review','refunded'].includes(row.status))throw new Error('This gift card purchase is already being processed.');
  const owner=crypto.randomUUID();
  const claim=await db.rpc('dg_claim_gift_card_checkout',{p_id:row.id,p_owner:owner});
  check(claim);
  if(!claim.data){
    const current=await db.from('dg_gift_card_purchases').select('status,checkout_url').eq('id',row.id).single();
    check(current);
    if(current.data.checkout_url&&['checkout_created','paid_verified','issuing','issued'].includes(current.data.status))return {checkoutUrl:current.data.checkout_url};
    throw new Error('Your checkout is being prepared. Please try again in a moment.');
  }
  try{
    const draft=await createDraftOrder(row);
    check(await db.from('dg_gift_card_purchases').update({
      status:'checkout_created',
      draft_order_id:draft.id,
      checkout_url:draft.invoiceUrl,
      lease_owner:null,
      lease_until:null,
      error_code:null,
      updated_at:new Date().toISOString(),
    }).eq('id',row.id).eq('lease_owner',owner));
    return {checkoutUrl:draft.invoiceUrl};
  }catch{
    check(await db.from('dg_gift_card_purchases').update({
      status:'checkout_failed',
      lease_owner:null,
      lease_until:null,
      error_code:'CHECKOUT_CREATION_FAILED',
      updated_at:new Date().toISOString(),
    }).eq('id',row.id).eq('lease_owner',owner));
    throw new Error('We could not prepare a secure Shopify checkout. Please try again.');
  }
}

export async function lookupGiftCardBalance(req:Request,input:Record<string,unknown>){
  await requireScopes(['read_gift_cards']);
  const raw=typeof input.code==='string'?input.code:'';
  const code=raw.replace(/[\s-]/g,'').toUpperCase();
  if(!/^[A-Z0-9]{8,20}$/.test(code))throw new Error('Enter a valid gift card code.');
  await applyRateLimits(req);
  const result=await adminGraph<{giftCards:{nodes:{id:string;lastCharacters:string;enabled:boolean;expiresOn:string|null;balance:{amount:string;currencyCode:string}}[]}}>(
    'query($query:String!){giftCards(first:5,query:$query){nodes{id lastCharacters enabled expiresOn balance{amount currencyCode}}}}',
    {query:code},
  );
  const matches=result.giftCards.nodes.filter(card=>card.lastCharacters.toUpperCase()===code.slice(-4));
  if(matches.length!==1)return {found:false};
  const card=matches[0];
  return {found:true,balance:card.balance,status:card.enabled?'active':'inactive',expiresOn:card.expiresOn};
}

interface PaidOrder {
  id:string;
  email:string|null;
  currencyCode:string;
  displayFinancialStatus:string;
  cancelledAt:string|null;
  currentTotalPriceSet:{shopMoney:{amount:string;currencyCode:string}};
  lineItems:{nodes:{quantity:number;originalUnitPriceSet:{shopMoney:{amount:string;currencyCode:string}};customAttributes:{key:string;value:string}[]}[]};
}

async function findRecipientCustomer(email:string,name:string){
  const escaped=email.replace(/\\/g,'\\\\').replace(/"/g,'\\"');
  const found=await adminGraph<{customers:{nodes:{id:string;email:string|null}[]}}>(
    'query($query:String!){customers(first:10,query:$query){nodes{id email}}}',
    {query:`email:"${escaped}"`},
  );
  const customer=found.customers.nodes.find(item=>item.email?.toLowerCase()===email.toLowerCase());
  if(customer)return customer;
  const [firstName,...lastParts]=name.trim().split(/\s+/);
  const created=await adminGraph<{customerCreate:{customer:{id:string;email:string|null}|null;userErrors:{message:string}[]}}>(
    'mutation($input:CustomerInput!){customerCreate(input:$input){customer{id email}userErrors{message}}}',
    {input:{email,firstName,lastName:lastParts.join(' ')||undefined}},
  );
  const result=created.customerCreate.customer;
  if(created.customerCreate.userErrors.length||!result?.id||result.email?.toLowerCase()!==email.toLowerCase())throw new Error('Shopify recipient setup failed.');
  return result;
}

async function findPreviouslyIssuedGiftCard(purchase:PurchaseRow){
  const after=new Date(Date.parse(purchase.issue_attempted_at||purchase.updated_at||purchase.created_at)-60_000).toISOString();
  let cursor:string|null=null;
  for(let page=0;page<10;page++){
    const result=await adminGraph<{giftCards:{nodes:{id:string;note:string|null;initialValue:{amount:string;currencyCode:string}}[];pageInfo:{hasNextPage:boolean;endCursor:string|null}}}>(
      'query($query:String!,$cursor:String){giftCards(first:50,query:$query,after:$cursor){nodes{id note initialValue{amount currencyCode}}pageInfo{hasNextPage endCursor}}}',
      {query:`source:api_client created_at:>=${after}`,cursor},
    );
    const existing=result.giftCards.nodes.find(card=>card.note===`dg-gift-request:${purchase.id}`);
    if(existing)return existing;
    if(!result.giftCards.pageInfo.hasNextPage)break;
    cursor=result.giftCards.pageInfo.endCursor;
  }
  return null;
}

async function issueGiftCard(purchase:PurchaseRow,orderId:string){
  const db=adminDb(),owner=crypto.randomUUID();
  const claim=await db.rpc('dg_claim_gift_card_issue',{p_id:purchase.id,p_owner:owner});
  check(claim);
  if(!claim.data){
    const current=await db.from('dg_gift_card_purchases').select('status').eq('id',purchase.id).single();
    check(current);
    if(current.data.status==='issued')return;
    throw new Error('Gift card issuance is already in progress.');
  }
  try{
    let giftCard:{id:string;initialValue:{amount:string;currencyCode:string}}|null=null;
    if(purchase.issue_attempted_at){
      giftCard=await findPreviouslyIssuedGiftCard(purchase);
      if(!giftCard){
        check(await db.from('dg_gift_card_purchases').update({
          status:'needs_review',error_code:'ISSUE_RESULT_UNKNOWN',lease_owner:null,lease_until:null,updated_at:new Date().toISOString(),
        }).eq('id',purchase.id).eq('lease_owner',owner));
        throw new Error('Gift card issuance needs reconciliation.');
      }
    }else{
      const customer=await findRecipientCustomer(purchase.recipient_email,purchase.recipient_name);
      check(await db.from('dg_gift_card_purchases').update({issue_attempted_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq('id',purchase.id).eq('lease_owner',owner));
      const message=[purchase.sender_name?`From ${purchase.sender_name}:`:null,purchase.message||null].filter(Boolean).join('\n');
      const recipientAttributes:Record<string,string>={id:customer.id,preferredName:purchase.recipient_name};
      if(message)recipientAttributes.message=message;
      if(purchase.send_at)recipientAttributes.sendNotificationAt=purchase.send_at;
      const result=await adminGraph<{giftCardCreate:{giftCard:{id:string;initialValue:{amount:string;currencyCode:string}}|null;giftCardCode:string|null;userErrors:{message:string}[]}}>(
        'mutation($input:GiftCardCreateInput!){giftCardCreate(input:$input){giftCard{id initialValue{amount currencyCode}}giftCardCode userErrors{message}}}',
        {input:{
          initialAmount:{amount:Number(purchase.amount).toFixed(2),currencyCode:'USD'},
          recipientAttributes,
          note:`dg-gift-request:${purchase.id}`,
        }},
      );
      if(result.giftCardCreate.userErrors.length||!result.giftCardCreate.giftCard?.id)throw new Error('Shopify rejected gift card issuance.');
      giftCard=result.giftCardCreate.giftCard;
    }
    if(giftCard.initialValue.currencyCode!=='USD'||Number(giftCard.initialValue.amount)!==Number(purchase.amount)){
      check(await db.from('dg_gift_card_purchases').update({status:'needs_review',error_code:'ISSUED_VALUE_MISMATCH',lease_owner:null,lease_until:null,updated_at:new Date().toISOString()}).eq('id',purchase.id).eq('lease_owner',owner));
      throw new Error('Gift card value verification failed.');
    }
    check(await db.from('dg_gift_card_purchases').update({
      status:'issued',
      order_id:orderId,
      gift_card_id:giftCard.id,
      issued_at:new Date().toISOString(),
      lease_owner:null,
      lease_until:null,
      error_code:null,
      updated_at:new Date().toISOString(),
    }).eq('id',purchase.id).eq('lease_owner',owner));
  }catch(error){
    const current=await db.from('dg_gift_card_purchases').select('status,issue_attempted_at').eq('id',purchase.id).maybeSingle();
    check(current);
    if(current.data?.status==='issuing'){
      const definitiveRejection=error instanceof Error&&error.message==='Shopify rejected gift card issuance.';
      check(await db.from('dg_gift_card_purchases').update({
        status:definitiveRejection?'paid_verified':'needs_review',
        issue_attempted_at:definitiveRejection?null:current.data.issue_attempted_at,
        lease_owner:null,lease_until:null,
        error_code:definitiveRejection?'SHOPIFY_ISSUE_REJECTED':'ISSUE_RESULT_UNKNOWN',
        updated_at:new Date().toISOString(),
      }).eq('id',purchase.id).eq('lease_owner',owner));
    }
    throw new Error('The paid gift card requires safe reconciliation before delivery.');
  }
}

export async function processPaidGiftCardOrder(orderGid:string){
  try{
    const orderResult=await adminGraph<{order:PaidOrder|null}>(
      'query($id:ID!){order(id:$id){id email currencyCode displayFinancialStatus cancelledAt currentTotalPriceSet{shopMoney{amount currencyCode}} lineItems(first:50){nodes{quantity originalUnitPriceSet{shopMoney{amount currencyCode}} customAttributes{key value}}}}}',
      {id:orderGid},
    );
    const order=orderResult.order;
    if(!order||order.displayFinancialStatus!=='PAID'||order.cancelledAt)return;
    const giftLines=order.lineItems.nodes.filter(line=>line.customAttributes.some(attribute=>attribute.key===GIFT_REQUEST_ATTRIBUTE));
    if(order.lineItems.nodes.length!==1||giftLines.length!==1)return;
    for(const line of giftLines){
      const requestId=line.customAttributes.find(attribute=>attribute.key===GIFT_REQUEST_ATTRIBUTE)?.value;
      if(!requestId||!UUID_PATTERN.test(requestId))continue;
      const db=adminDb();
      const saved=await db.from('dg_gift_card_purchases').select('*').eq('id',requestId).maybeSingle();
      check(saved);
      const purchase=saved.data as PurchaseRow|null;
      if(!purchase||purchase.status==='issued'||purchase.status==='refunded')continue;
      if(!purchase.draft_order_id||!purchase.buyer_email||order.email?.toLowerCase()!==purchase.buyer_email.toLowerCase()
        ||order.currencyCode!=='USD'||order.currentTotalPriceSet.shopMoney.currencyCode!=='USD'
        ||Number(order.currentTotalPriceSet.shopMoney.amount)!==Number(purchase.amount)
        ||line.quantity!==1||line.originalUnitPriceSet.shopMoney.currencyCode!=='USD'
        ||Number(line.originalUnitPriceSet.shopMoney.amount)!==Number(purchase.amount))continue;
      await requireScopes(PURCHASE_SCOPES);
      const draft=await adminGraph<{draftOrder:{id:string;order:{id:string}|null}|null}>(
        'query($id:ID!){draftOrder(id:$id){id order{id}}}',
        {id:purchase.draft_order_id},
      );
      if(draft.draftOrder?.id!==purchase.draft_order_id||draft.draftOrder.order?.id!==order.id)continue;
      if(purchase.status==='checkout_created'||purchase.status==='checkout_failed'){
        check(await db.from('dg_gift_card_purchases').update({status:'paid_verified',order_id:order.id,updated_at:new Date().toISOString()}).eq('id',purchase.id));
        purchase.status='paid_verified';
        purchase.order_id=order.id;
      }
      await issueGiftCard(purchase,order.id);
    }
  }catch(error){
    console.error('Paid gift card order processing failed',{orderId:orderGid,errorName:error instanceof Error?error.name:'UnknownError'});
    throw new Error('Gift card order verification or issuance failed.');
  }
}
