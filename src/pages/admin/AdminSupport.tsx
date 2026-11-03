import { useEffect,useMemo,useRef,useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AlertCircle,ArrowUpRight,Bot,ExternalLink,Headset,Mail,MessageCircle,RefreshCw,Search,UserRound } from 'lucide-react';
import { invoke } from '@/lib/shopify';
import { useAdminData,useAdminMutation } from '@/hooks/useAdmin';
import type { TidioContact,TidioEvent,TidioMessage,TidioOperator,TidioPage } from '@/types/tidio';
import '@/admin-contact-requests.css';

interface ContactRequest{ id:string;name:string;email:string;order_number:string|null;subject:string;message:string;status:'new'|'in_progress'|'resolved';tidio_contact_id:string|null;tidio_conversation_url:string|null;created_at:string;updated_at:string; }

function formatDate(value:string|null|undefined){
 if(!value)return 'Not provided';
 const date=new Date(value);
 return Number.isNaN(date.getTime())?'Not provided':date.toLocaleString();
}

function contactName(contact:TidioContact){
 return [contact.first_name,contact.last_name].filter(Boolean).join(' ')||contact.email||'Guest contact';
}

function eventLabel(event:TidioEvent){
 if(event.topic==='conversation.solved_by_lyro'&&event.reason==='handoff')return 'Lyro handed this conversation to an operator';
 if(event.topic==='conversation.solved_by_lyro'&&event.reason==='taken_over_by_operator')return 'An operator took over this conversation';
 if(event.topic==='conversation.solved_by_lyro')return 'Lyro resolved this conversation';
 if(event.topic==='conversation.solved_by_operator')return 'An operator resolved this conversation';
 if(event.topic==='conversation.solved_automatically')return 'This conversation was automatically resolved';
 if(event.topic==='conversation.operator_replied')return 'An operator replied';
 return event.topic.replace(/\./g,' ');
}

export default function AdminSupport(){
 const [search,setSearch]=useState('');
 const [selectedId,setSelectedId]=useState('');
 const [contactCursor,setContactCursor]=useState<string|undefined>();
 const [contacts,setContacts]=useState<TidioContact[]>([]);
 const [messageCursor,setMessageCursor]=useState<string|undefined>();
 const [messages,setMessages]=useState<TidioMessage[]>([]);
 const seenActivity=useRef<Set<string>|null>(null);
 const seenRequests=useRef<Set<string>|null>(null);

 const contactQuery=useAdminData<TidioPage<TidioContact>>('tidio-contacts',contactCursor?{cursor:contactCursor}:{},!contactCursor);
 const activityQuery=useAdminData<{events:TidioEvent[]}>('tidio-events',{activity:true},true);
 const requestsQuery=useAdminData<{requests:ContactRequest[]}>('contact-requests',{},true);
 const requestMutation=useAdminMutation();
 const selectedContact=contacts.find(contact=>contact.id===selectedId)||null;
 const messageQuery=useQuery({
  queryKey:['tidio-contact-messages',selectedId,messageCursor],
  queryFn:()=>invoke<TidioPage<TidioMessage>>('dah-glow-admin',{op:'tidio-contact-messages',contactId:selectedId,...(messageCursor?{cursor:messageCursor}:{})}),
  enabled:!!selectedId,
  retry:false,
  refetchInterval:messageCursor?false:15000,
  staleTime:0
 });
 const eventQuery=useQuery({
  queryKey:['tidio-contact-events',selectedId],
  queryFn:()=>invoke<{events:TidioEvent[]}>('dah-glow-admin',{op:'tidio-events',contactId:selectedId}),
  enabled:!!selectedId,
  retry:false,
  refetchInterval:30000,
  staleTime:0
 });
 const operatorQuery=useQuery({
  queryKey:['tidio-operators'],
  queryFn:()=>invoke<{operators:TidioOperator[]}>('dah-glow-admin',{op:'tidio-operators'}),
  retry:false,
  staleTime:300000
 });

 useEffect(()=>{
  const page=contactQuery.data;
  if(!page?.contacts)return;
  setContacts(previous=>{
   const next=contactCursor?[...previous,...page.contacts!]:page.contacts!;
   return [...new Map(next.map(contact=>[contact.id,contact])).values()];
  });
 },[contactQuery.data,contactCursor]);
 useEffect(()=>{
  if(!selectedId&&contacts[0])setSelectedId(contacts[0].id);
 },[contacts,selectedId]);
 useEffect(()=>{
  setMessages([]);
  setMessageCursor(undefined);
 },[selectedId]);
 useEffect(()=>{
  const page=messageQuery.data;
  if(!page?.messages)return;
  setMessages(previous=>{
   const next=messageCursor?[...page.messages!,...previous]:page.messages!;
   return [...new Map(next.map(message=>[message.id,message])).values()].sort((a,b)=>Date.parse(a.created_at)-Date.parse(b.created_at));
  });
 },[messageQuery.data,messageCursor]);
 useEffect(()=>{
  const events=activityQuery.data?.events;
  if(!events)return;
  const seen=seenActivity.current;
  if(!seen){seenActivity.current=new Set(events.map(event=>event.webhook_id));return;}
  const fresh=events.filter(event=>!seen.has(event.webhook_id));
  for(const event of fresh){
   if(event.topic==='conversation.operator_replied')toast.info('A Tidio operator replied to a customer.');
   if(event.topic==='conversation.solved_by_lyro'&&event.reason==='handoff')toast.info('Lyro handed a customer conversation to an operator.');
  }
  for(const event of events)seen.add(event.webhook_id);
 },[activityQuery.data]);
 useEffect(()=>{
  const requests=requestsQuery.data?.requests;
  if(!requests)return;
  if(!seenRequests.current){seenRequests.current=new Set(requests.map(request=>request.id));return;}
  for(const request of requests){
   if(request.status==='new'&&!seenRequests.current.has(request.id))toast.info(`New contact request: ${request.subject}`);
   seenRequests.current.add(request.id);
  }
 },[requestsQuery.data]);

 const filteredContacts=useMemo(()=>{
  const term=search.trim().toLowerCase();
  return term?contacts.filter(contact=>`${contactName(contact)} ${contact.email||''} ${contact.id}`.toLowerCase().includes(term)):contacts;
 },[contacts,search]);
 const latestMessage=messages.at(-1);
 const latestEvent=eventQuery.data?.events?.find(event=>event.topic.startsWith('conversation.'));
 const inboxUrl=messageQuery.data?.conversation_url;

 const retry=()=>{
  void contactQuery.refetch();
  if(selectedId){void messageQuery.refetch();void eventQuery.refetch();}
  void operatorQuery.refetch();
 };
 const selectContact=(contactId:string)=>{
  setSelectedId(contactId);
  setMessageCursor(undefined);
 };
 const loadOlder=()=>{
  const cursor=messageQuery.data?.meta.cursor;
  if(cursor)setMessageCursor(cursor);
 };
 const changeRequestStatus=(id:string,status:ContactRequest['status'])=>requestMutation.mutate({op:'contact-request-status',id,status});

 return <section className="tidio-support">
  <div className="tidio-toolbar">
   <div><p>SUPPORT INBOX</p><h2>Customer Support / Live Chat</h2><span>Messages and contact data are read directly from Tidio.</span></div>
   <div className="tidio-toolbar-actions"><a className="admin-button secondary" href="https://www.tidio.com/panel" target="_blank" rel="noopener noreferrer"><ExternalLink size={16}/>Open in Tidio Inbox</a><button className="admin-button secondary" type="button" onClick={retry}><RefreshCw size={16}/>Refresh</button></div>
  </div>
  <div className="tidio-disclaimer" role="note">
   <AlertCircle size={18}/><p>Tidio does not expose live-chat replies, assignment, unread counts, or handoff controls through this API. Use <strong>Open in Tidio Inbox</strong> to reply or manage live conversations. The dashboard does not infer unavailable statuses.</p>
  </div>
  <section className="contact-requests-panel">
   <div className="contact-requests-heading"><div><h3>Contact form requests</h3><p>Private requests submitted through the Dah Glow contact form.</p></div><span>{requestsQuery.data?.requests.filter(request=>request.status==='new').length||0} new</span></div>
   {requestsQuery.isLoading&&!requestsQuery.data?<p className="tidio-empty">Loading contact requests…</p>:requestsQuery.error?<div className="tidio-inline-error" role="alert"><AlertCircle size={18}/><span>{requestsQuery.error.message}</span><button className="admin-text-button" type="button" onClick={()=>void requestsQuery.refetch()}>Try again</button></div>:!requestsQuery.data?.requests.length?<p className="tidio-empty">No contact form requests yet.</p>:<div className="contact-request-list">{requestsQuery.data.requests.map(request=><article className="contact-request" key={request.id}>
    <div className="contact-request-top"><div><h4>{request.subject}</h4><p>{request.name} · <a href={`mailto:${encodeURIComponent(request.email)}`}>{request.email}</a></p></div><time>{formatDate(request.created_at)}</time></div>
    <p className="contact-request-message">{request.message}</p>
    {request.order_number&&<p className="contact-request-order">Order number: <strong>{request.order_number}</strong></p>}
    <div className="contact-request-footer"><label>Status<select aria-label={`Status for ${request.subject}`} value={request.status} disabled={requestMutation.isPending} onChange={event=>{const status=event.target.value;if(status==='new'||status==='in_progress'||status==='resolved')changeRequestStatus(request.id,status);}}><option value="new">New</option><option value="in_progress">In progress</option><option value="resolved">Resolved</option></select></label>
     {request.tidio_contact_id&&<span>Tidio contact: <code>{request.tidio_contact_id}</code></span>}
     {request.tidio_conversation_url&&/^https:\/\/(www\.)?tidio\.com\//i.test(request.tidio_conversation_url)&&<a href={request.tidio_conversation_url} target="_blank" rel="noopener noreferrer" className="admin-button secondary"><ExternalLink size={14}/>Open linked conversation</a>}
    </div>
   </article>)}</div>}
   <p className="contact-request-note">Form submissions are stored in Dah Glow. They are not automatically copied to Tidio or linked to a Tidio conversation.</p>
  </section>
  {(contactQuery.error||operatorQuery.error||activityQuery.error)&&<div className="tidio-error" role="alert"><AlertCircle size={20}/><div><strong>Tidio data could not be loaded</strong><p>{(contactQuery.error||operatorQuery.error||activityQuery.error)?.message}</p><span>OpenAPI access requires a Tidio Plus or Premium plan and valid server-side API credentials.</span></div></div>}
  <div className="tidio-panels">
   <aside className="tidio-panel tidio-contact-list">
    <div className="tidio-panel-heading"><h3>Contacts</h3><span>{contacts.length}</span></div>
    <label className="tidio-search"><Search size={16}/><input aria-label="Search Tidio contacts" placeholder="Search contacts" value={search} onChange={event=>setSearch(event.target.value)}/></label>
    {contactQuery.isLoading&&!contacts.length?<p className="tidio-empty">Loading contacts…</p>:!filteredContacts.length?<p className="tidio-empty">{contactQuery.error?'Contacts are unavailable.':'No matching contacts.'}</p>:<div className="tidio-contact-items">{filteredContacts.map(contact=><button type="button" key={contact.id} className={`tidio-contact-item ${selectedId===contact.id?'selected':''}`} onClick={()=>selectContact(contact.id)}><span className="tidio-avatar"><UserRound size={18}/></span><span className="tidio-contact-copy"><strong>{contactName(contact)}</strong><small>{contact.email||'No email provided'}</small><small>Contact since {formatDate(contact.created_at)}</small></span></button>)}</div>}
    {contactQuery.data?.meta.cursor&&<button type="button" className="admin-button secondary tidio-load-more" onClick={()=>setContactCursor(contactQuery.data?.meta.cursor||undefined)} disabled={contactQuery.isFetching}>Load more contacts</button>}
   </aside>
   <section className="tidio-panel tidio-conversation">
    {!selectedContact?<div className="tidio-empty-state"><MessageCircle size={38}/><h3>Select a contact</h3><p>Choose a Tidio contact to read the conversation.</p></div>:<>
     <header className="tidio-conversation-heading"><div><h3>{contactName(selectedContact)}</h3><span>{selectedContact.email||'No email provided'}</span></div><a href={inboxUrl||'https://www.tidio.com/panel'} target="_blank" rel="noopener noreferrer" className="admin-button secondary"><ExternalLink size={16}/>Open in Tidio Inbox</a></header>
     {messageQuery.error&&<div className="tidio-inline-error" role="alert"><AlertCircle size={18}/><span>{messageQuery.error.message}</span></div>}
     <div className="tidio-messages" aria-live="polite">
      {messageQuery.isLoading&&!messages.length?<p className="tidio-empty">Loading conversation…</p>:!messages.length?<p className="tidio-empty">No messages were returned for this contact.</p>:messages.map(message=><article key={message.id} className={`tidio-message tidio-message-${message.author_type}`}><div className="tidio-message-meta"><strong>{message.author_type==='contact'?'Customer':message.author_type==='operator'?'Tidio operator':'Tidio AI'}</strong><time>{formatDate(message.created_at)}</time></div><p>{message.message}</p></article>)}
      {messageQuery.data?.meta.cursor&&<button type="button" className="admin-text-button" onClick={loadOlder} disabled={messageQuery.isFetching}>Load older messages</button>}
      {messageQuery.isFetching&&messages.length>0&&<p className="tidio-loading" role="status">Refreshing conversation…</p>}
     </div>
     <div className="tidio-readonly-notice"><Bot size={16}/><span>This view is read-only for live chats. Use Tidio Inbox to send a verified operator reply.</span></div>
    </>}
   </section>
   <aside className="tidio-panel tidio-contact-details">
    <h3>Contact details</h3>
    {selectedContact?<dl><dt>Name</dt><dd>{contactName(selectedContact)}</dd><dt>Email</dt><dd>{selectedContact.email||'Not provided'}</dd><dt>Phone</dt><dd>{selectedContact.phone||'Not provided'}</dd><dt>Contact ID</dt><dd className="tidio-mono">{selectedContact.id}</dd><dt>Created</dt><dd>{formatDate(selectedContact.created_at)}</dd><dt>Location</dt><dd>{[selectedContact.city,selectedContact.country].filter(Boolean).join(', ')||'Not provided'}</dd><dt>Latest message</dt><dd>{latestMessage?`From ${latestMessage.author_type==='contact'?'customer':latestMessage.author_type==='operator'?'operator':'Tidio AI'}`:'Not loaded'}</dd><dt>Latest conversation event</dt><dd>{latestEvent?eventLabel(latestEvent):'No supported event received'}</dd><dt>Assigned operator</dt><dd>Not provided by the live-chat API</dd></dl>:<p className="tidio-empty">Select a contact to view available details.</p>}
    <div className="tidio-operator-list"><h4><Headset size={16}/>Tidio operators</h4>{operatorQuery.data?.operators?.length?operatorQuery.data.operators.map(operator=><div key={operator.id}><span className={operator.active?'active':'inactive'}/><span><strong>{operator.name||operator.email||'Tidio operator'}</strong><small>{operator.role||'Operator'} · {operator.active?'Account active':'Account inactive'}</small></span></div>):<p>{operatorQuery.error?operatorQuery.error.message:'No operator details available.'}</p>}</div>
    {latestEvent&&<div className="tidio-event-summary"><h4>Latest verified event</h4><p>{eventLabel(latestEvent)}</p><time>{formatDate(latestEvent.occurred_at)}</time></div>}
    <p className="tidio-privacy-note">Order details are not matched by email alone. Secure order information remains in the customer account and existing support assistant.</p>
   </aside>
  </div>
  <div className="tidio-footer-note"><Mail size={15}/><span>Webhook events are verified and deduplicated. Contact-form requests are stored securely in Dah Glow and are not linked to Tidio unless a verified reference is present.</span><a href="https://www.tidio.com/panel" target="_blank" rel="noopener noreferrer">Tidio panel<ArrowUpRight size={14}/></a></div>
 </section>;
}
