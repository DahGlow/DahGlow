import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowRight, Check, ChevronDown, Heart, LockKeyhole, Mail, Sparkles } from 'lucide-react';
import { usePageMeta } from '@/hooks/usePageMeta';
import { invoke } from '@/lib/shopify';
import '@/gift-cards.css';

const artwork = Object.entries(import.meta.glob<string>('/src/assets/gift-cards/*.jpg', {
  eager: true,
  query: '?url',
  import: 'default',
})).sort(([first], [second]) => first.localeCompare(second)).map(([path, url], index) => ({
  path,
  url,
  number: index + 1,
}));

const giftDesigns = [
  { name: 'Classic Glow', image: 0 },
  { name: 'Elegant Beauty', image: 1 },
  { name: 'Birthday Glow', image: 2 },
  { name: 'Minimal Luxury', image: 3 },
];
const denominations = [10, 25, 50, 75, 100, 150, 200, 250];

const faq = [
  ['How do I purchase a Dah Glow Gift Card?', 'Choose an amount and delivery time, enter the buyer and recipient details, and continue to Shopify checkout. A native Shopify Gift Card is issued only after Shopify confirms payment.'],
  ['How is the gift card delivered?', 'After payment is verified, Shopify creates the gift card and sends its native gift card notification to the recipient email you entered.'],
  ['Can I schedule delivery for later?', 'Yes. Choose a future date and time during purchase. Shopify handles the scheduled notification and aims to send it within an hour of that time.'],
  ['How do I redeem a gift card?', 'Enter the gift card code in the gift card field at Shopify checkout. Shopify validates the code and applies any eligible remaining balance.'],
  ['How can I check my remaining balance?', 'Enter your gift card code in the secure balance checker on this page. Shopify provides the balance and status; this page does not display the code or customer details.'],
  ['Can I use more than one gift card?', 'Gift card combination and redemption rules are determined by Shopify checkout and the store’s current configuration. Review the options Shopify shows when you place your order.'],
  ['Can I use a discount code with a gift card?', 'Shopify checkout determines which discounts and gift cards can be used together for your specific order. Review the final order total before completing payment.'],
  ['Do gift cards expire or qualify for refunds?', 'Expiration and refund eligibility depend on applicable law and Dah Glow’s current published terms. Review the store policies or contact our team before purchasing if you need clarification.'],
];

export default function GiftCards() {
  usePageMeta('Dah Glow Gift Cards | Give the Gift of Glow', 'Give beauty, self-care, and confidence with a Dah Glow Gift Card. Shop available gift cards through secure Shopify checkout.');
  const [design, setDesign] = useState(giftDesigns[0].name);
  const [selectedAmount, setSelectedAmount] = useState('50');
  const [customAmount, setCustomAmount] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [sendToSelf, setSendToSelf] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [sender, setSender] = useState('');
  const [message, setMessage] = useState('');
  const [delivery, setDelivery] = useState<'immediate'|'scheduled'>('immediate');
  const [scheduledLocal, setScheduledLocal] = useState('');
  const [requestId,setRequestId]=useState(()=>crypto.randomUUID());
  const [submitting, setSubmitting] = useState(false);
  const [purchaseError, setPurchaseError] = useState('');
  const [balanceCode,setBalanceCode]=useState('');
  const [balanceBusy,setBalanceBusy]=useState(false);
  const [balanceResult,setBalanceResult]=useState<{balance:{amount:string;currencyCode:string};status:string;expiresOn:string|null}|null>(null);
  const [balanceMessage,setBalanceMessage]=useState('');
  const amount=selectedAmount==='custom'?Number(customAmount):Number(selectedAmount);
  const selectedDesign = giftDesigns.find(item => item.name === design) || giftDesigns[0];
  const previewImage = artwork[selectedDesign.image]?.url;

  const changed=()=>setRequestId(crypto.randomUUID());
  const createCheckout = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if(!Number.isFinite(amount)||amount<1||amount>2000)return;
    if(delivery==='scheduled'&&!scheduledLocal)return;
    setSubmitting(true);
    setPurchaseError('');
    try {
      const {checkoutUrl}=await invoke<{checkoutUrl:string}>('shopify-gift-cards',{
        op:'create-checkout',
        requestId,
        amount,
        buyerEmail:buyerEmail.trim(),
        recipientEmail:(sendToSelf?buyerEmail:recipientEmail).trim(),
        recipientName:recipient.trim(),
        senderName:sender.trim(),
        message:message.trim(),
        design,
        sendAt:delivery==='scheduled'?new Date(scheduledLocal).toISOString():null,
        timezone:delivery==='scheduled'?Intl.DateTimeFormat().resolvedOptions().timeZone:null,
      });
      const checkout=new URL(checkoutUrl);
      if(checkout.protocol!=='https:'||(!checkout.hostname.endsWith('.myshopify.com')&&checkout.hostname!=='us.dahglow.com'&&checkout.hostname!=='dahglow.com'))throw new Error('Shopify returned an invalid checkout address.');
      window.location.assign(checkout.href);
    } catch (error) {
      const description = error instanceof Error ? error.message : 'Please try again.';
      setPurchaseError(description);
    } finally {
      setSubmitting(false);
    }
  };

  const lookupBalance=async(event:FormEvent<HTMLFormElement>)=>{
    event.preventDefault();
    setBalanceBusy(true);setBalanceResult(null);setBalanceMessage('');
    const code=balanceCode;
    setBalanceCode('');
    try{
      const result=await invoke<{found:boolean;balance?:{amount:string;currencyCode:string};status?:string;expiresOn?:string|null}>('shopify-gift-cards',{op:'balance',code});
      if(result.found&&result.balance)setBalanceResult({balance:result.balance,status:result.status||'unknown',expiresOn:result.expiresOn||null});
      else setBalanceMessage('We couldn’t find an active gift card matching that code. Check it and try again.');
    }catch(error){setBalanceMessage(error instanceof Error?error.message:'Balance lookup is temporarily unavailable.');}
    finally{setBalanceBusy(false);}
  };
  const minScheduleDate=new Date(Date.now()+60*60*1000-new Date().getTimezoneOffset()*60000).toISOString().slice(0,16);

  return (
    <main className="gift-page">
      <section className="gift-hero" aria-labelledby="gift-hero-title">
        <div className="gift-hero-glow" aria-hidden="true" />
        <div className="gift-hero-copy">
          <p className="gift-eyebrow"><Sparkles size={15} /> A little beauty, a lot of joy</p>
          <h1 id="gift-hero-title">Give the Gift<br /><em>of Glow.</em></h1>
          <p className="gift-hero-description">Make every occasion special with a Dah Glow Gift Card. A thoughtful way to share beauty, self-care, and confidence.</p>
          <div className="gift-hero-actions">
            <a className="gift-primary-button" href="#choose-gift">Shop Gift Cards <ArrowRight size={17} /></a>
            <a className="gift-text-link" href="#balance-help">Check Gift Card Balance <ArrowDown size={16} /></a>
          </div>
          <div className="gift-hero-note"><LockKeyhole size={15} /><span>Purchases and gift card codes are handled through Shopify checkout.</span></div>
        </div>
        <div className="gift-hero-visual">
          {previewImage && <img src={previewImage} alt="Gift card artwork inspiration" loading="eager" />}
          <div className="gift-hero-visual-label"><span>DAH GLOW</span><span>THE GIFT OF GLOW</span></div>
          <div className="gift-hero-orbit" aria-hidden="true"><Sparkles/><Heart/></div>
        </div>
        <div className="gift-hero-bottom"><span>BEAUTY • SELF-CARE • CONFIDENCE</span><span>01 — A THOUGHTFUL GIFT</span></div>
      </section>

      <section className="gift-section gift-buy-section" id="choose-gift">
        <div className="gift-section-heading">
          <p className="gift-eyebrow"><span>01</span> MAKE IT PERSONAL</p>
          <h2>A gift that feels <em>like them.</em></h2>
          <p>Select a fixed or custom amount, personalize your gift, and complete payment through Shopify checkout.</p>
        </div>
        <div className="gift-buy-layout">
          <form className="gift-builder" onSubmit={createCheckout}>
            <div className="gift-step-heading"><span>01</span><h3>Choose your amount <small>USD</small></h3></div>
            <div className="gift-amount-grid">
              {denominations.map(value=><button type="button" key={value} className={`gift-amount-option${selectedAmount===String(value)?' is-selected':''}`} onClick={()=>{setSelectedAmount(String(value));changed();}} aria-pressed={selectedAmount===String(value)}>
                <span>DAH GLOW</span><strong>${value}</strong><small>Digital gift card</small>
              </button>)}
              <button type="button" className={`gift-amount-option${selectedAmount==='custom'?' is-selected':''}`} onClick={()=>{setSelectedAmount('custom');changed();}} aria-pressed={selectedAmount==='custom'}>
                <span>YOUR CHOICE</span><strong>Custom</strong><small>$1–$2,000 USD</small>
              </button>
            </div>
            {selectedAmount==='custom'&&<label className="gift-custom-amount">Custom amount (USD)<span>$</span><input aria-label="Custom gift card amount in US dollars" type="number" min="1" max="2000" step="0.01" value={customAmount} onChange={event=>{setCustomAmount(event.target.value);changed();}} required placeholder="Enter $1–$2,000"/></label>}

            <div className="gift-step-heading gift-step-next"><span>02</span><h3>Choose a design</h3></div>
            <p className="gift-small-print">Preview only. Shopify sends its native gift card email; this selection does not change Shopify’s email artwork.</p>
            <div className="gift-design-grid">
              {giftDesigns.map(item => <button type="button" key={item.name} className={`gift-design-option${design === item.name ? ' is-selected' : ''}`} onClick={() => {setDesign(item.name);changed();}} aria-pressed={design === item.name}>
                {artwork[item.image] && <img src={artwork[item.image].url} alt="" loading="lazy"/>}<span>{item.name}</span>{design === item.name && <Check size={17}/>}
              </button>)}
            </div>

            <div className="gift-step-heading gift-step-next"><span>03</span><h3>Who’s the gift for?</h3></div>
            <div className="gift-personal-fields">
              <label className="gift-message-field">Buyer email <input type="email" autoComplete="email" maxLength={254} required value={buyerEmail} onChange={event=>{setBuyerEmail(event.target.value);changed();}} placeholder="Your order confirmation email"/></label>
              <label className="gift-self-toggle"><input type="checkbox" checked={sendToSelf} onChange={event=>{setSendToSelf(event.target.checked);changed();}}/> Send this gift card to myself</label>
              {!sendToSelf&&<label className="gift-message-field">Recipient email <input type="email" autoComplete="off" maxLength={254} required value={recipientEmail} onChange={event=>{setRecipientEmail(event.target.value);changed();}} placeholder="Where should Shopify send the gift card?"/></label>}
              <label>Recipient name <span>Required</span><input value={recipient} onChange={event=>{setRecipient(event.target.value);changed();}} maxLength={80} autoComplete="off" required placeholder="Who is it for?"/></label>
              <label>Your name <span>Required</span><input value={sender} onChange={event=>{setSender(event.target.value);changed();}} maxLength={80} autoComplete="name" required placeholder="Who is it from?"/></label>
              <label className="gift-message-field">Personal message <span>{message.length}/160</span><textarea value={message} onChange={event=>{setMessage(event.target.value);changed();}} maxLength={160} rows={3} placeholder="Write a little something special…"/></label>
            </div>
            <p className="gift-small-print">Recipient details are used only to issue and send this Shopify gift card. Shopify sends the recipient’s native gift card email and buyer receipt.</p>

            <div className="gift-step-heading gift-step-next"><span>04</span><h3>When should it arrive?</h3></div>
            <div className="gift-delivery-options" role="group" aria-label="Gift card delivery timing">
              <button type="button" className={delivery==='immediate'?'is-selected':''} onClick={()=>{setDelivery('immediate');setScheduledLocal('');changed();}} aria-pressed={delivery==='immediate'}><Mail size={18}/><span><strong>Send immediately</strong><small>After verified payment</small></span></button>
              <button type="button" className={delivery==='scheduled'?'is-selected':''} onClick={()=>{setDelivery('scheduled');changed();}} aria-pressed={delivery==='scheduled'}><Sparkles size={18}/><span><strong>Schedule for later</strong><small>Sent by Shopify within one hour</small></span></button>
            </div>
            {delivery==='scheduled'&&<label className="gift-schedule-field">Delivery date and time ({Intl.DateTimeFormat().resolvedOptions().timeZone})<input type="datetime-local" value={scheduledLocal} min={minScheduleDate} onChange={event=>{setScheduledLocal(event.target.value);changed();}} required/><small>Shopify schedules the native recipient notification after payment is verified.</small></label>}

            {purchaseError && <p className="gift-form-error" role="alert">{purchaseError}</p>}
            <button type="submit" className="gift-primary-button gift-add-button" disabled={submitting||!Number.isFinite(amount)||amount<1||amount>2000}>
              {submitting ? 'Preparing secure checkout…' : `Continue to Shopify — $${Number.isFinite(amount)?amount.toFixed(2):'0.00'}`} <ArrowRight size={18}/>
            </button>
            <p className="gift-checkout-note"><LockKeyhole size={15}/> Payment is collected by Shopify. A native Shopify Gift Card is created only after the paid order is independently verified.</p>
          </form>

          <aside className="gift-preview-panel" aria-label="Gift card personalization preview">
            <div className="gift-preview-top"><span>YOUR GIFT PREVIEW</span><span>DAH GLOW</span></div>
            <div className="gift-preview-card">
              {previewImage && <img src={previewImage} alt="" loading="lazy"/>}
              <div className="gift-preview-overlay"><span>DAH GLOW</span><Sparkles/><strong>{design}</strong><small>GIFT CARD INSPIRATION</small></div>
            </div>
            <div className="gift-preview-details">
              <p>${Number.isFinite(amount)?amount.toFixed(2):'0.00'} USD</p>
              <span>{recipient.trim() ? `For ${recipient.trim()}` : 'A thoughtful gift, made personal'}</span>
              {message.trim() && <blockquote>“{message.trim()}”</blockquote>}
              {sender.trim() && <small>With love, {sender.trim()}</small>}
              <small>Delivery: {delivery==='scheduled'&&scheduledLocal?new Date(scheduledLocal).toLocaleString():delivery==='scheduled'?'Scheduled':'Immediately after payment verification'}</small>
            </div>
            <div className="gift-preview-disclaimer">Illustrative design preview. Shopify generates the actual gift card code and sends it using the store’s native gift card email.</div>
          </aside>
        </div>
      </section>

      <section className="gift-moments" aria-labelledby="gift-moments-title">
        <div className="gift-section-heading">
          <p className="gift-eyebrow"><span>02</span> FOR EVERY LITTLE MOMENT</p>
          <h2 id="gift-moments-title">Make their moment <em>glow.</em></h2>
          <p>A thoughtful way to celebrate the moments that matter.</p>
        </div>
        <div className="gift-occasion-grid">
          {['Birthday', 'Mother’s Day', 'Valentine’s Day', 'Christmas & Holidays', 'Graduation', 'Thank You', 'Just Because'].map((occasion, index) => <a key={occasion} href="#choose-gift" className={`gift-occasion gift-occasion-${index + 1}`}><span>0{index + 1}</span><strong>{occasion}</strong><ArrowRight size={17}/></a>)}
        </div>
      </section>

      <section className="gift-gallery-section">
        <div className="gift-section-heading">
          <p className="gift-eyebrow"><span>03</span> A GALLERY OF GIFT INSPIRATION</p>
          <h2>Find a little <em>inspiration.</em></h2>
          <p>Explore the full collection of locally supplied gift card images.</p>
        </div>
        <div className="gift-gallery" aria-label={`${artwork.length} gift card inspiration images`}>
          {artwork.map(image => <figure key={image.path}><img src={image.url} alt={`Gift card inspiration ${image.number}`} loading="lazy" decoding="async"/><figcaption>INSPIRATION {String(image.number).padStart(2, '0')}</figcaption></figure>)}
        </div>
      </section>

      <section className="gift-how-section">
        <div className="gift-section-heading">
          <p className="gift-eyebrow"><span>04</span> SIMPLE AND THOUGHTFUL</p>
          <h2>How it <em>works.</em></h2>
        </div>
        <div className="gift-how-grid">
          {[
            ['01', 'Choose your amount', 'Pick a fixed denomination or enter a custom USD amount.'],
            ['02', 'Personalize your gift', 'Add recipient details and a personal message.'],
            ['03', 'Complete checkout', 'Pay securely through Shopify checkout.'],
            ['04', 'Send & enjoy', 'After payment verification, Shopify issues and delivers the gift card.'],
          ].map(([number, title, description]) => <article key={number}><span>{number}</span><div><h3>{title}</h3><p>{description}</p></div></article>)}
        </div>
      </section>

      <section className="gift-balance-section" id="balance-help">
        <div className="gift-balance-icon"><LockKeyhole size={25}/></div>
        <div>
          <p className="gift-eyebrow">GIFT CARD BALANCE</p>
          <h2>Need to check a balance?</h2>
          <p>Your code is checked securely against Shopify. It is not shown in the result or stored by this page.</p>
          <form className="gift-balance-form" onSubmit={lookupBalance}>
            <label htmlFor="gift-balance-code">Gift card code</label>
            <div><input id="gift-balance-code" type="password" autoComplete="off" autoCapitalize="characters" spellCheck={false} minLength={8} maxLength={40} required value={balanceCode} onChange={event=>setBalanceCode(event.target.value)} placeholder="Enter your gift card code"/><button className="gift-outline-button" type="submit" disabled={balanceBusy}>{balanceBusy?'Checking…':'Check balance'}</button></div>
          </form>
          {balanceMessage&&<p className="gift-balance-message" role="alert">{balanceMessage}</p>}
          {balanceResult&&<div className="gift-balance-result" role="status" aria-live="polite">
            <span>Remaining balance</span>
            <strong>{new Intl.NumberFormat(undefined,{style:'currency',currency:balanceResult.balance.currencyCode}).format(Number(balanceResult.balance.amount))}</strong>
            <small>Status: {balanceResult.status}{balanceResult.expiresOn?` · Expires ${new Date(`${balanceResult.expiresOn}T00:00:00`).toLocaleDateString()}`:''}</small>
          </div>}
          <p className="gift-small-print">For your security, the balance result does not reveal the gift card code or customer details.</p>
          <Link to="/contact" className="gift-inline-link">Need help? Contact Dah Glow <ArrowRight size={16}/></Link>
        </div>
      </section>

      <section className="gift-faq-section" aria-labelledby="gift-faq-title">
        <div className="gift-section-heading">
          <p className="gift-eyebrow"><span>05</span> THE DETAILS</p>
          <h2 id="gift-faq-title">Gift card <em>questions.</em></h2>
        </div>
        <div className="gift-faq-list">{faq.map(([question, answer]) => <details key={question}><summary>{question}<ChevronDown size={19}/></summary><p>{answer}</p></details>)}</div>
      </section>

      <section className="gift-final-cta">
        <Sparkles aria-hidden="true"/>
        <p className="gift-eyebrow">A THOUGHTFUL LITTLE SOMETHING</p>
        <h2>Make Someone’s Day<br/>a Little More <em>Beautiful.</em></h2>
        <p>Give them the freedom to choose something they truly love.</p>
        <a className="gift-primary-button" href="#choose-gift">Shop Dah Glow Gift Cards <ArrowRight size={17}/></a>
      </section>
    </main>
  );
}
