import { useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowRight, Check, ChevronDown, Gift, Heart, LockKeyhole, Sparkles } from 'lucide-react';
import { useCatalog } from '@/hooks/useCatalog';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useShop } from '@/hooks/useShop';
import { formatMoney } from '@/lib/shopify';
import type { Product, Variant } from '@/types/shop';
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

const faq = [
  ['How do I purchase a Dah Glow Gift Card?', 'Choose an available gift card product and amount shown on this page, add it to your bag, and complete payment through Shopify checkout. The product and price shown there are the source of truth.'],
  ['How is the gift card delivered?', 'Dah Glow Gift Cards use Shopify’s native gift card checkout flow. Shopify handles gift card code generation and the delivery details shown during checkout and after the order is processed. This page does not schedule a separate delivery.'],
  ['Can I schedule delivery for later?', 'Scheduled delivery is not currently offered on this page. Gift card processing and delivery are handled through the options Shopify presents during checkout.'],
  ['How do I redeem a gift card?', 'Enter the gift card code in the gift card field at Shopify checkout. Shopify validates the code and applies any eligible remaining balance.'],
  ['How can I check my remaining balance?', 'This storefront does not have an authorized balance lookup. You can try the code at Shopify checkout, where Shopify validates it, or contact our team for help. Do not send your full gift card code in a public message.'],
  ['Can I use more than one gift card?', 'Gift card combination and redemption rules are determined by Shopify checkout and the store’s current configuration. Review the options Shopify shows when you place your order.'],
  ['Can I use a discount code with a gift card?', 'Shopify checkout determines which discounts and gift cards can be used together for your specific order. Review the final order total before completing payment.'],
  ['Do gift cards expire or qualify for refunds?', 'Expiration and refund eligibility depend on applicable law and Dah Glow’s current published terms. Review the store policies or contact our team before purchasing if you need clarification.'],
];

function isGiftCard(product: Product) {
  return product.isGiftCard;
}

function availableGiftVariants(products: Product[]) {
  return products.filter(isGiftCard).flatMap(product =>
    product.variants.filter(variant => variant.availableForSale).map(variant => ({ product, variant })),
  );
}

export default function GiftCards() {
  usePageMeta('Dah Glow Gift Cards | Give the Gift of Glow', 'Give beauty, self-care, and confidence with a Dah Glow Gift Card. Shop available gift cards through secure Shopify checkout.');
  const catalog = useCatalog({ query: 'gift card', first: 48 });
  const gifts = useMemo(() => availableGiftVariants(catalog.products), [catalog.products]);
  const [selectedId, setSelectedId] = useState('');
  const [design, setDesign] = useState(giftDesigns[0].name);
  const [recipient, setRecipient] = useState('');
  const [sender, setSender] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [addError, setAddError] = useState('');
  const { addCart } = useShop();
  const selectedGift = gifts.find(item => item.variant.id === selectedId) || gifts[0];
  const selectedDesign = giftDesigns.find(item => item.name === design) || giftDesigns[0];
  const previewImage = artwork[selectedDesign.image]?.url;

  const addGiftCard = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedGift) return;
    setSubmitting(true);
    setAddError('');
    const attributes = [
      { key: 'Gift design preview', value: design },
      ...(recipient.trim() ? [{ key: 'Gift recipient', value: recipient.trim() }] : []),
      ...(sender.trim() ? [{ key: 'Gift from', value: sender.trim() }] : []),
      ...(message.trim() ? [{ key: 'Gift message', value: message.trim() }] : []),
    ];
    try {
      await addCart(selectedGift.variant.id, 1, attributes);
    } catch (error) {
      const description = error instanceof Error ? error.message : 'Please try again.';
      setAddError(`We couldn’t add this gift card. ${description}`);
    } finally {
      setSubmitting(false);
    }
  };

  const formatVariantPrice = (variant: Variant) => formatMoney(variant.price);

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
          {previewImage && <img src={previewImage} alt="Gift card artwork inspiration" fetchPriority="high" />}
          <div className="gift-hero-visual-label"><span>DAH GLOW</span><span>THE GIFT OF GLOW</span></div>
          <div className="gift-hero-orbit" aria-hidden="true"><Sparkles/><Heart/></div>
        </div>
        <div className="gift-hero-bottom"><span>BEAUTY • SELF-CARE • CONFIDENCE</span><span>01 — A THOUGHTFUL GIFT</span></div>
      </section>

      <section className="gift-section gift-buy-section" id="choose-gift">
        <div className="gift-section-heading">
          <p className="gift-eyebrow"><span>01</span> MAKE IT PERSONAL</p>
          <h2>A gift that feels <em>like them.</em></h2>
          <p>Choose from gift cards currently available in our Shopify store, then add a note for your recipient.</p>
        </div>
        <div className="gift-buy-layout">
          <form className="gift-builder" onSubmit={addGiftCard}>
            <div className="gift-step-heading"><span>01</span><h3>Choose an available gift card</h3></div>
            {catalog.isLoading ? <p className="gift-state" role="status">Loading current Shopify gift card products…</p>
              : catalog.isError ? <div className="gift-state gift-state-error" role="alert"><p>We couldn’t load the current gift card options from Shopify.</p><button type="button" className="gift-outline-button" onClick={() => void catalog.refetch()} disabled={catalog.isFetching}>{catalog.isFetching ? 'Retrying…' : 'Try again'}</button></div>
                : gifts.length ? <div className="gift-amount-grid">
                  {gifts.map(({ product, variant }) => <button type="button" key={variant.id} className={`gift-amount-option${(selectedId || gifts[0]?.variant.id) === variant.id ? ' is-selected' : ''}`} onClick={() => setSelectedId(variant.id)} aria-pressed={(selectedId || gifts[0]?.variant.id) === variant.id}>
                    <span>{variant.title === 'Default Title' ? product.name : variant.title}</span><strong>{formatVariantPrice(variant)}</strong><small>{product.name}</small>
                  </button>)}
                </div> : <div className="gift-state"><Gift size={25}/><p>No purchasable gift card options are currently published by the store.</p><Link to="/contact" className="gift-inline-link">Ask our team about gift cards <ArrowRight size={15}/></Link></div>}

            <div className="gift-step-heading gift-step-next"><span>02</span><h3>Choose a design preview</h3></div>
            <p className="gift-small-print">This is a personalization preview only. Shopify controls the issued gift card artwork and delivery.</p>
            <div className="gift-design-grid">
              {giftDesigns.map(item => <button type="button" key={item.name} className={`gift-design-option${design === item.name ? ' is-selected' : ''}`} onClick={() => setDesign(item.name)} aria-pressed={design === item.name}>
                {artwork[item.image] && <img src={artwork[item.image].url} alt="" loading="lazy"/>}<span>{item.name}</span>{design === item.name && <Check size={17}/>}
              </button>)}
            </div>

            <div className="gift-step-heading gift-step-next"><span>03</span><h3>Add a personal note</h3></div>
            <div className="gift-personal-fields">
              <label>Recipient name <span>Optional</span><input value={recipient} onChange={event => setRecipient(event.target.value)} maxLength={40} autoComplete="off" placeholder="Who is it for?"/></label>
              <label>Your name <span>Optional</span><input value={sender} onChange={event => setSender(event.target.value)} maxLength={40} autoComplete="off" placeholder="Who is it from?"/></label>
              <label className="gift-message-field">Personal message <span>{message.length}/160</span><textarea value={message} onChange={event => setMessage(event.target.value)} maxLength={160} rows={3} placeholder="Write a little something special…"/></label>
            </div>
            <p className="gift-small-print">Your note is attached as a private Shopify cart item detail and may appear in order processing. It does not send a separate email or change Shopify’s gift card email.</p>
            {addError && <p className="gift-form-error" role="alert">{addError}</p>}
            <button type="submit" className="gift-primary-button gift-add-button" disabled={!selectedGift || submitting || catalog.isLoading}>
              {submitting ? 'Adding to your bag…' : selectedGift ? `Add gift card — ${formatVariantPrice(selectedGift.variant)}` : 'Gift cards unavailable'} <ArrowRight size={18}/>
            </button>
            <p className="gift-checkout-note"><LockKeyhole size={15}/> Final pricing, payment, and gift card issuance are confirmed by Shopify checkout.</p>
          </form>

          <aside className="gift-preview-panel" aria-label="Gift card personalization preview">
            <div className="gift-preview-top"><span>YOUR GIFT PREVIEW</span><span>DAH GLOW</span></div>
            <div className="gift-preview-card">
              {previewImage && <img src={previewImage} alt="" loading="lazy"/>}
              <div className="gift-preview-overlay"><span>DAH GLOW</span><Sparkles/><strong>{design}</strong><small>GIFT CARD INSPIRATION</small></div>
            </div>
            <div className="gift-preview-details">
              <p>              {selectedGift ? formatVariantPrice(selectedGift.variant) : 'Select a gift card'}</p>
              <span>{recipient.trim() ? `For ${recipient.trim()}` : 'A thoughtful gift, made personal'}</span>
              {message.trim() && <blockquote>“{message.trim()}”</blockquote>}
              {sender.trim() && <small>With love, {sender.trim()}</small>}
            </div>
            <div className="gift-preview-disclaimer">Illustrative preview only. Available Shopify gift card products and checkout details determine the actual purchase.</div>
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
            ['01', 'Choose your gift card', 'Select a currently available Shopify gift card product.'],
            ['02', 'Personalize your note', 'Add a name or message to your Shopify cart item.'],
            ['03', 'Complete checkout', 'Review final details and pay through Shopify checkout.'],
            ['04', 'Shop & enjoy', 'Shopify handles gift card issuance and the checkout delivery flow.'],
          ].map(([number, title, description]) => <article key={number}><span>{number}</span><div><h3>{title}</h3><p>{description}</p></div></article>)}
        </div>
      </section>

      <section className="gift-balance-section" id="balance-help">
        <div className="gift-balance-icon"><LockKeyhole size={25}/></div>
        <div><p className="gift-eyebrow">GIFT CARD BALANCE</p><h2>Need to check a balance?</h2><p>Secure balance lookup is not available on this storefront. Shopify can validate your gift card at checkout. For help, contact our team without including the full gift card code.</p><Link to="/contact" className="gift-outline-button">Contact Dah Glow <ArrowRight size={16}/></Link></div>
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
