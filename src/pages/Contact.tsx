import { useMemo,useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowDown,ArrowRight,CheckCircle2,ChevronDown,Clock3,Headset,Mail,MessageCircle,PackageSearch,Phone,Send,ShieldCheck,Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import PageHeader from '@/components/layout/PageHeader';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { shopify,invoke } from '@/lib/shopify';
import { openTidioChat } from '@/lib/tidioWidget';
import '@/contact-us.css';

const formSchema=z.object({
 name:z.string().trim().min(2,'Please enter your name.').max(120,'Name must be 120 characters or fewer.'),
 email:z.string().trim().email('Enter a valid email address.').max(254,'Email address is too long.'),
 orderNumber:z.string().trim().max(100,'Order number must be 100 characters or fewer.'),
 subject:z.string().trim().min(3,'Please enter a subject.').max(180,'Subject must be 180 characters or fewer.'),
 message:z.string().trim().min(10,'Please add a little more detail (at least 10 characters).').max(5000,'Message must be 5,000 characters or fewer.'),
 website:z.string().max(0).optional()
});
type ContactFields=z.infer<typeof formSchema>;
interface ShopPolicy{title:string;body:string;}
interface PolicyResponse{shop:{shippingPolicy:ShopPolicy|null;refundPolicy:ShopPolicy|null;termsOfService:ShopPolicy|null;};}
interface ContactResult{received:boolean;id:string;createdAt:string;}

function policyText(policy:ShopPolicy|null|undefined){
 if(!policy?.body)return '';
 const document=new DOMParser().parseFromString(policy.body,'text/html');
 return (document.body.textContent||'').replace(/\s+/g,' ').trim();
}

function Contact(){
 const settings=useStoreSettings();
 const [submitted,setSubmitted]=useState(false);
 const [chatBusy,setChatBusy]=useState(false);
 const {data:policies,isLoading:policiesLoading,isError:policiesError}=useQuery({
  queryKey:['contact-page-policies'],
  queryFn:()=>shopify<PolicyResponse>({op:'policies'}),
  staleTime:300000,
  retry:1
 });
 const {register,handleSubmit,reset,formState:{errors,isSubmitting}}=useForm<ContactFields>({
  resolver:zodResolver(formSchema),
  defaultValues:{name:'',email:'',orderNumber:'',subject:'',message:'',website:''}
 });
 const shipping=policyText(policies?.shop.shippingPolicy);
 const returns=policyText(policies?.shop.refundPolicy);
 const faq=useMemo(()=>[
  {id:'faq-track',question:'How can I track my order?',answer:<p>Sign in to your account to view orders and available tracking details. For secure assistance, <Link to="/us/user/orders/list">open your orders</Link>.</p>},
  {id:'faq-shipping',question:'How long does shipping take?',answer:<p>{shipping||'We could not verify a published shipping policy right now. Check the shipping options shown at checkout, or contact our team for help.'}</p>},
  {id:'faq-returns',question:'What is your return policy?',answer:<p>{returns||'We could not verify a published returns policy right now. Please contact our team before sending an item back.'}</p>},
  {id:'faq-cancel',question:'How can I cancel an order?',answer:<p>We could not verify a published cancellation policy. Send us your order number using the form and our team can review your request. Changes may not be possible once an order is being processed.</p>},
  {id:'faq-support',question:'How can I contact customer support?',answer:<p>Send a message with the form on this page, or start a conversation with the Tidio chat widget. The chat can offer automated assistance and route requests according to your Tidio setup.</p>},
  {id:'faq-product',question:'How do I find product information?',answer:<p>Product pages show the available details, options, and current prices. <Link to="/search">Search the Dah Glow collection</Link>, or ask a product question in chat.</p>}
 ],[shipping,returns]);
 const submit=async(values:ContactFields)=>{
  try{
   const result=await invoke<ContactResult>('dah-glow-support',{op:'contact-request',...values});
   if(!result.received||!result.id)throw new Error('Your request could not be confirmed. Please try again.');
   reset();
   setSubmitted(true);
   toast.success('Your message was sent to our support team.');
  }catch(error){
   toast.error(error instanceof Error?error.message:'Your message could not be sent. Please try again.');
  }
 };
 const openChat=async()=>{
  if(chatBusy)return;
  setChatBusy(true);
  try{await openTidioChat();}
  catch(error){toast.error(error instanceof Error?error.message:'Tidio chat could not be opened.');}
  finally{setChatBusy(false);}
 };
 const contactEmail=settings.data?.contactEmail?.trim()||'';
 const contactPhone=settings.data?.contactPhone?.trim()||'';

 return <main className="contact-page">
  <PageHeader title="Contact us"/>
  <section className="contact-hero">
   <div className="contact-hero-copy">
    <span className="contact-eyebrow"><Sparkles size={14}/> DAH GLOW CUSTOMER CARE</span>
    <h1>We&apos;re Here<br/><em>to Help.</em></h1>
    <p>Have a question about your order or our products? Our support team is here to help.</p>
    <a className="contact-hero-link" href="#contact-form">Send us a message <ArrowDown size={16}/></a>
   </div>
   <div className="contact-hero-art" aria-label="Dah Glow beauty and skincare" role="img">
    <div className="contact-art-orbit contact-art-orbit-one"/>
    <div className="contact-art-orbit contact-art-orbit-two"/>
    <div className="contact-art-caption"><span>YOUR GLOW,</span><strong>YOUR WAY.</strong><Sparkles size={19}/></div>
   </div>
   <div className="contact-hero-index"><span>01</span><i/> HERE FOR EVERY QUESTION</div>
  </section>

  <section className="contact-methods" aria-label="Ways to contact Dah Glow">
   <article className="contact-method-card contact-method-primary">
    <span className="contact-method-icon"><Headset size={20}/></span><span className="contact-method-label">PERSONAL CARE</span>
    <h2>Customer<br/>Support</h2><p>Questions about your experience? Send our team a message and we&apos;ll review it.</p>
    {contactEmail?<a href={`mailto:${encodeURIComponent(contactEmail)}`}>{contactEmail}<ArrowRight size={15}/></a>:<span className="contact-method-note">Use the secure contact form below</span>}
   </article>
   <article className="contact-method-card">
    <span className="contact-method-icon"><PackageSearch size={20}/></span><span className="contact-method-label">YOUR ORDER</span>
    <h2>Order<br/>Assistance</h2><p>Find your order and the latest verified tracking information in your account.</p>
    <Link to="/us/user/orders/list">View my orders <ArrowRight size={15}/></Link>
   </article>
   <article className="contact-method-card">
    <span className="contact-method-icon"><Sparkles size={20}/></span><span className="contact-method-label">FIND YOUR FIT</span>
    <h2>Product<br/>Questions</h2><p>Explore product details, availability, and variants in the collection.</p>
    <Link to="/search">Explore products <ArrowRight size={15}/></Link>
   </article>
   <article className="contact-method-card">
    <span className="contact-method-icon"><ShieldCheck size={20}/></span><span className="contact-method-label">HERE TO HELP</span>
    <h2>Returns &amp;<br/>Refunds</h2><p>Review the return information published by the store, or ask our team.</p>
    <a href="#faq-returns" onClick={()=>{const item=document.getElementById('faq-returns');if(item instanceof HTMLDetailsElement)item.open=true;}}>Read return information <ArrowRight size={15}/></a>
   </article>
  </section>

  <section className="contact-form-section" id="contact-form">
   <div className="contact-section-intro">
    <span className="contact-eyebrow">WE&apos;RE LISTENING</span>
    <h2>Let&apos;s make<br/><em>things right.</em></h2>
    <p>Share a few details and your message will be added to our private support queue for the Dah Glow team.</p>
    <div className="contact-response-note"><Clock3 size={16}/><span>Provide an email address where the team can reach you about this request.</span></div>
    <div className="contact-verified"><ShieldCheck size={17}/><span>Your details are sent securely and visible only to authorized support staff.</span></div>
   </div>
   <div className="contact-form-card">
    {submitted&&<div className="contact-success" role="status"><CheckCircle2 size={22}/><div><strong>We received your message.</strong><p>Your request is in the Dah Glow support queue. Keep an eye on your inbox for a reply.</p></div><button type="button" onClick={()=>setSubmitted(false)} aria-label="Dismiss confirmation">×</button></div>}
    <form onSubmit={handleSubmit(submit)} noValidate>
     <div className="contact-form-row">
      <label>Name <span>*</span><input autoComplete="name" placeholder="Your full name" maxLength={120} aria-invalid={!!errors.name} {...register('name')}/>{errors.name&&<small role="alert">{errors.name.message}</small>}</label>
      <label>Email address <span>*</span><input type="email" autoComplete="email" placeholder="you@example.com" maxLength={254} aria-invalid={!!errors.email} {...register('email')}/>{errors.email&&<small role="alert">{errors.email.message}</small>}</label>
     </div>
     <div className="contact-form-row">
      <label>Order number <span className="contact-optional">(optional)</span><input autoComplete="off" placeholder="e.g. #DG12345" maxLength={100} {...register('orderNumber')}/>{errors.orderNumber&&<small role="alert">{errors.orderNumber.message}</small>}</label>
      <label>Subject <span>*</span><input placeholder="What can we help with?" maxLength={180} aria-invalid={!!errors.subject} {...register('subject')}/>{errors.subject&&<small role="alert">{errors.subject.message}</small>}</label>
     </div>
     <label className="contact-message-label">Message <span>*</span><textarea rows={5} placeholder="Tell us a little more so we can help…" maxLength={5000} aria-invalid={!!errors.message} {...register('message')}/>{errors.message&&<small role="alert">{errors.message.message}</small>}</label>
     <label className="contact-honeypot" aria-hidden="true">Leave this field empty<input tabIndex={-1} autoComplete="off" {...register('website')}/></label>
     <div className="contact-submit-row"><p>Fields marked <span>*</span> are required.</p><button className="contact-submit" type="submit" disabled={isSubmitting}>{isSubmitting?'Sending…':<>Send message <Send size={16}/></>}</button></div>
     {isSubmitting&&<p className="contact-form-loading" role="status">Securely sending your message…</p>}
    </form>
   </div>
  </section>

  <section className="contact-chat-banner">
   <div className="contact-chat-symbol"><MessageCircle size={25}/><span><Sparkles size={13}/></span></div>
   <div className="contact-chat-copy"><span className="contact-eyebrow">A LITTLE MORE HELP?</span><h2>Need More Help? <em>Talk to Our Team.</em></h2><p>Start a conversation in the Tidio chat. Automated help and human handoff follow the availability and rules configured in Tidio.</p></div>
   <button type="button" onClick={()=>void openChat()} disabled={chatBusy}>{chatBusy?'Opening chat…':'Chat With Support'}<ArrowRight size={17}/></button>
  </section>

  <section className="contact-faq-section">
   <div className="contact-faq-heading"><div><span className="contact-eyebrow">THE DETAILS, MADE SIMPLE</span><h2>Frequently asked<br/><em>questions.</em></h2></div><p>Answers are based on Dah Glow&apos;s published store policies. If something isn&apos;t listed, our team can take a closer look.</p></div>
   <div className="contact-faq-list">{faq.map((item,index)=><details className="contact-faq-item" id={item.id} key={item.id} open={index===0}><summary><span className="contact-faq-number">0{index+1}</span><span>{item.question}</span><ChevronDown size={17}/></summary><div className="contact-faq-answer">{item.id==='faq-shipping'&&policiesLoading?<p>Loading published shipping information…</p>:item.id==='faq-returns'&&policiesLoading?<p>Loading published return information…</p>:policiesError&&(item.id==='faq-shipping'||item.id==='faq-returns')?<p>We couldn&apos;t load the published store policy. Check the options at checkout or contact our team for help.</p>:item.answer}{(item.id==='faq-shipping'||item.id==='faq-returns')&&<Link to="/support">Ask Dah Glow support <ArrowRight size={14}/></Link>}</div></details>)}</div>
   <div className="contact-faq-footer"><span>Still have a question?</span><button type="button" onClick={()=>void openChat()} disabled={chatBusy}>Ask in live chat <ArrowRight size={15}/></button></div>
  </section>

  <section className="contact-info-strip" aria-label="Verified Dah Glow contact details">
   <div><span className="contact-eyebrow">REACH US DIRECTLY</span><h2>Real details.<br/><em>Real support.</em></h2></div>
   {contactEmail?<a href={`mailto:${encodeURIComponent(contactEmail)}`}><Mail size={18}/><span><small>STORE EMAIL</small><strong>{contactEmail}</strong></span></a>:<div className="contact-info-missing"><Mail size={18}/><span><small>STORE EMAIL</small><strong>Not published yet</strong></span></div>}
   {contactPhone?<a href={`tel:${encodeURIComponent(contactPhone.replace(/[^\d+]/g,''))}`}><Phone size={18}/><span><small>STORE PHONE</small><strong>{contactPhone}</strong></span></a>:<div className="contact-info-missing"><Phone size={18}/><span><small>STORE PHONE</small><strong>Not published yet</strong></span></div>}
   <p>{settings.isLoading?'Loading store contact details…':!contactEmail&&!contactPhone?'Store contact details can be configured by an administrator in Store settings.':'Contact information provided by Dah Glow store settings.'}</p>
  </section>
 </main>;
}

export default Contact;
