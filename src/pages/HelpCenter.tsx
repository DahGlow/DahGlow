import { useMemo, useState, type ComponentType } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowDown, ArrowRight, ArrowUpRight, BadgePercent, BookOpenText, Check, ChevronDown,
  CircleHelp, CreditCard, Headphones, LockKeyhole, MailCheck, PackageCheck, PackageSearch,
  Search, ShieldCheck, ShoppingBag, Sparkles, Truck, UserRound, X,
} from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePageMeta } from '@/hooks/usePageMeta';
import { shopify } from '@/lib/shopify';
import blushCare from '@/assets/about/images/skincare/pink-skincare-cream-collection.jpg';
import beautyPortrait from '@/assets/about/images/confidence/minimalist-beauty-portrait.jpg';
import roseEditorial from '@/assets/about/images/beauty/rose-serum-product-editorial.jpg';
import '@/customer-service.css';

type CategoryId = 'orders' | 'shipping' | 'returns' | 'payments' | 'products' | 'promotions' | 'account' | 'shopping';
interface ShopPolicy { title: string; body: string; }
interface ShopifyPolicies { shop: { shippingPolicy: ShopPolicy | null; refundPolicy: ShopPolicy | null; termsOfService: ShopPolicy | null; }; }
interface PaymentSettings { acceptedCardBrands: string[]; supportedDigitalWallets: string[]; }
interface HelpCategory { id: CategoryId; title: string; description: string; icon: ComponentType<LucideProps>; }
interface HelpQuestion { id: string; category: CategoryId; question: string; answer: string; popular?: boolean; }

const categories: HelpCategory[] = [
  { id: 'orders', title: 'Orders & Order Status', description: 'Find an order, confirmation, or tracking update.', icon: PackageSearch },
  { id: 'shipping', title: 'Shipping & Delivery', description: 'Review shipping details and delivery updates.', icon: Truck },
  { id: 'returns', title: 'Returns & Refunds', description: 'Read the current store return and refund policy.', icon: PackageCheck },
  { id: 'payments', title: 'Payments & Billing', description: 'Check the options available at Shopify checkout.', icon: CreditCard },
  { id: 'products', title: 'Products & Availability', description: 'Explore product pages, details, and availability.', icon: Sparkles },
  { id: 'promotions', title: 'Promotions & Discounts', description: 'Get help applying a discount at checkout.', icon: BadgePercent },
  { id: 'account', title: 'Account & Privacy', description: 'Manage your Dah Glow account and preferences.', icon: UserRound },
  { id: 'shopping', title: 'Shopping & Checkout', description: 'Get help browsing and completing a purchase.', icon: ShoppingBag },
];

const popularQuestions = [
  'How can I track my order?',
  'How long does shipping take?',
  'Can I change or cancel my order?',
  'What happens if my package is delayed?',
  'How can I return an item?',
  'When will I receive my refund?',
  'What payment methods are accepted?',
  'How can I apply a discount code?',
  'How can I update my account information?',
  'Is shopping on Dah Glow secure?',
];

function policyText(policy: ShopPolicy | null | undefined): string {
  if (!policy?.body) return '';
  return new DOMParser().parseFromString(policy.body, 'text/html').body.textContent?.replace(/\s+/g, ' ').trim() || '';
}

function getQuestions(
  shippingPolicy: string,
  returnsPolicy: string,
  payments: string[],
  policiesLoading: boolean,
  policiesError: boolean,
  paymentsLoading: boolean,
  paymentsError: boolean,
): HelpQuestion[] {
  const paymentText = payments.length
    ? `Shopify currently reports these methods as available: ${payments.map(method => method.replace(/_/g, ' ')).join(', ')}. The options shown at checkout are the current source of truth.`
    : paymentsLoading
      ? 'Payment options are provided by Shopify at checkout. Please review the methods shown before placing your order.'
      : paymentsError
        ? 'Current payment options could not be loaded. Please review the methods shown by Shopify at checkout before placing your order.'
        : 'Payment options are provided by Shopify at checkout. Please review the methods shown before placing your order.';
  const shippingText = shippingPolicy
    ? `${shippingPolicy} For current rates and delivery options, review the details available at checkout.`
    : policiesLoading
      ? 'We are loading the store’s current shipping policy. Shipping rates and available delivery options are shown at Shopify checkout.'
      : policiesError
        ? 'We could not load the current shipping policy. Shipping rates and available delivery options are shown at Shopify checkout; contact our team if you need help.'
        : 'Dah Glow has not published shipping details yet. Shipping rates and available delivery options are shown at Shopify checkout. For help with an order, contact our team.';
  const returnsText = returnsPolicy
    ? `${returnsPolicy} If you have a question about a specific order, contact our team before sending an item back.`
    : policiesLoading
      ? 'We are loading the store’s current returns policy. Please contact our team for guidance before sending an item back.'
      : policiesError
        ? 'We could not load the current returns policy. Please contact our team for guidance before sending an item back.'
        : 'Dah Glow has not published a returns policy yet. Please contact our team for guidance before sending an item back.';

  return [
    { id: 'track-order', category: 'orders', question: 'How can I track my order?', answer: 'Sign in and open your orders to see available order and tracking details. If your order is not listed, use Find your order or contact our team for help.', popular: true },
    { id: 'confirmation-email', category: 'orders', question: 'Where can I find my order confirmation?', answer: 'After checkout, check the inbox for the email address used for your purchase, including your spam or promotions folder. You can also sign in to review your orders.' },
    { id: 'change-cancel', category: 'orders', question: 'Can I change or cancel my order?', answer: 'Changes or cancellation may depend on the order’s processing status, and we cannot promise a change will be possible. Contact our team as soon as possible with your order number so they can review your request.', popular: true },
    { id: 'delayed-package', category: 'orders', question: 'What happens if my package is delayed?', answer: 'Check your order page for the latest tracking information. Carrier scans can take time to update. If the tracking has not changed or you need help, contact our team with your order number.', popular: true },
    { id: 'shipping-time', category: 'shipping', question: 'How long does shipping take?', answer: shippingText, popular: true },
    { id: 'shipping-options', category: 'shipping', question: 'Where can I find shipping rates and options?', answer: 'Available delivery options and applicable charges are presented at Shopify checkout. You can also review the store’s published shipping information.' },
    { id: 'tracking-stalled', category: 'shipping', question: 'Why has my tracking not updated?', answer: 'Tracking updates are provided when information becomes available from the carrier. Check the order page again later; if you still need help, contact our team with the order number.' },
    { id: 'return-item', category: 'returns', question: 'How can I return an item?', answer: returnsText, popular: true },
    { id: 'refund-timing', category: 'returns', question: 'When will I receive my refund?', answer: 'Refund timing depends on the store’s return policy and the payment provider. Review the published returns policy for current details, or contact our team about a specific order.', popular: true },
    { id: 'damaged-item', category: 'returns', question: 'What should I do if an item arrives damaged?', answer: 'Contact our team with your order number and a description of the issue so they can review it and advise on next steps.' },
    { id: 'return-policy', category: 'returns', question: 'Where can I read the returns policy?', answer: returnsText },
    { id: 'payment-methods', category: 'payments', question: 'What payment methods are accepted?', answer: paymentText, popular: true },
    { id: 'payment-issue', category: 'payments', question: 'Why was my payment declined?', answer: 'Payment authorization is handled during checkout. Check that the details are correct, confirm with your payment provider, or try another option presented by Shopify. Dah Glow does not receive full payment credentials.' },
    { id: 'billing-currency', category: 'payments', question: 'Where can I review my order total?', answer: 'Review the item prices, shipping charges, taxes, and final total shown at checkout before submitting your order. Your order confirmation also includes purchase details.' },
    { id: 'product-details', category: 'products', question: 'Where can I find product information?', answer: 'Open a product page to review its available description, images, options, and current price. For more items, browse or search the Dah Glow catalog.' },
    { id: 'product-availability', category: 'products', question: 'How can I check if a product is available?', answer: 'The current availability and selectable options are shown on the product page. Availability can change, so check the listing again before checkout.' },
    { id: 'product-help', category: 'products', question: 'Who can help me with a product question?', answer: 'Contact our team with the product name or link and your question. We will direct you to the information available for that listing.' },
    { id: 'discount-code', category: 'promotions', question: 'How can I apply a discount code?', answer: 'Enter the code in the discount field at checkout and review the updated order total before placing your order. The checkout will indicate whether the code was accepted.' , popular: true },
    { id: 'discount-not-working', category: 'promotions', question: 'Why is my discount code not working?', answer: 'Check that the code was entered correctly and review any terms supplied with the promotion. Not all codes apply to every item or order. The checkout will show whether a code is accepted.' },
    { id: 'account-update', category: 'account', question: 'How can I update my account information?', answer: 'Sign in and open your account settings to review and update the information available there.', popular: true },
    { id: 'privacy-preferences', category: 'account', question: 'How can I manage my privacy or contact preferences?', answer: 'Use Contact Preferences to review the marketing preferences associated with your account. You can also review the store’s privacy information where published.' },
    { id: 'secure-shopping', category: 'shopping', question: 'Is shopping on Dah Glow secure?', answer: 'Checkout and payment processing are provided through Shopify. Review your order details before submitting, and use only the payment options presented during checkout.', popular: true },
    { id: 'checkout-help', category: 'shopping', question: 'What should I do if checkout is not working?', answer: 'Refresh the page and check that all required information is complete. If the issue continues, try again later or contact our team and describe what happened.' },
    { id: 'order-status', category: 'shopping', question: 'Where can I see my order status?', answer: 'Sign in and open your orders to review the latest status available for your purchase. You can also use Find your order if you need help locating an order.' },
  ];
}

const trustCards = [
  { icon: LockKeyhole, title: 'Checkout through Shopify', text: 'Checkout and payment processing are provided through Shopify.' },
  { icon: CreditCard, title: 'Payment options shown at checkout', text: 'Review the payment choices and total presented before submitting an order.' },
  { icon: MailCheck, title: 'Order details by email', text: 'Check the email used at checkout for your order confirmation and purchase details.' },
  { icon: Truck, title: 'Shipping details before purchase', text: 'Review current shipping options and charges at checkout and the published policy.' },
  { icon: ShieldCheck, title: 'Preferences you can manage', text: 'Review your account’s contact and marketing preferences in Contact Preferences.' },
  { icon: Headphones, title: 'Help when you need it', text: 'Browse answers here or contact the Dah Glow team for order-specific questions.' },
];

export default function HelpCenter() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryId | 'all'>('all');
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);

  usePageMeta(
    'Customer Service & Help Center | Dah Glow',
    'Find help with Dah Glow orders, shipping, returns, payments, products, and checkout. Search customer-friendly answers or contact our team.',
  );

  const policiesQuery = useQuery({
    queryKey: ['help-center-store-policies'],
    queryFn: () => shopify<ShopifyPolicies>({ op: 'policies' }),
    staleTime: 300000,
    retry: 1,
  });
  const paymentsQuery = useQuery({
    queryKey: ['shopify-payment-methods'],
    queryFn: () => shopify<PaymentSettings>({ op: 'paymentMethods' }),
    staleTime: 60000,
    retry: 1,
  });

  const questions = useMemo(() => getQuestions(
    policyText(policiesQuery.data?.shop.shippingPolicy),
    policyText(policiesQuery.data?.shop.refundPolicy),
    [...new Set([...(paymentsQuery.data?.acceptedCardBrands || []), ...(paymentsQuery.data?.supportedDigitalWallets || [])])],
    policiesQuery.isLoading,
    policiesQuery.isError,
    paymentsQuery.isLoading,
    paymentsQuery.isError,
  ), [policiesQuery.data, policiesQuery.isError, policiesQuery.isLoading, paymentsQuery.data, paymentsQuery.isError, paymentsQuery.isLoading]);

  const filteredQuestions = useMemo(() => {
    const term = search.trim().toLowerCase();
    return questions.filter(item =>
      (activeCategory === 'all' || item.category === activeCategory)
      && (!term || `${item.question} ${item.answer} ${categories.find(category => category.id === item.category)?.title || ''}`.toLowerCase().includes(term)),
    );
  }, [activeCategory, questions, search]);

  const selectCategory = (category: CategoryId | 'all') => {
    setActiveCategory(category);
    setOpenQuestion(null);
    document.getElementById('help-faq')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const selectPopularQuestion = (question: string) => {
    const match = questions.find(item => item.question === question);
    setSearch(question);
    setActiveCategory('all');
    setOpenQuestion(match?.id || null);
    window.setTimeout(() => document.getElementById('help-faq')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  };

  return (
    <main className="customer-service-page" id="top">
      <section className="help-hero">
        <div className="help-hero-image"><img src={blushCare} alt="" fetchPriority="high" decoding="async"/></div>
        <div className="help-hero-glow" aria-hidden="true"/>
        <div className="help-hero-content">
          <span className="help-eyebrow"><Sparkles size={14}/> DAH GLOW CUSTOMER CARE</span>
          <h1>How Can We<br/><em>Help You Glow?</em></h1>
          <p>Find thoughtful answers about your orders, products, and shopping experience.</p>
          <form className="help-search" role="search" onSubmit={event => { event.preventDefault(); document.getElementById('help-faq')?.scrollIntoView({ behavior: 'smooth' }); }}>
            <Search size={20} aria-hidden="true"/>
            <label className="sr-only" htmlFor="help-search-input">Search help articles and answers</label>
            <input id="help-search-input" type="search" value={search} onChange={event => { setSearch(event.target.value); setActiveCategory('all'); setOpenQuestion(null); }} placeholder="Search orders, shipping, returns, and more"/>
            {search && <button className="help-search-clear" type="button" onClick={() => { setSearch(''); setOpenQuestion(null); }} aria-label="Clear search"><X size={18}/></button>}
            <button type="submit" className="help-search-submit" aria-label="Search answers"><ArrowRight size={18}/></button>
          </form>
          <div className="help-popular-searches"><span>POPULAR:</span>{popularQuestions.slice(0, 3).map(question => <button key={question} onClick={() => selectPopularQuestion(question)}>{question}</button>)}</div>
        </div>
        <span className="help-hero-caption">BEAUTY. SELFCARE. HERE FOR YOU.</span>
      </section>

      <nav className="help-quick-nav" aria-label="Quick help links">
        <a href="#help-categories"><BookOpenText size={17}/> Browse topics</a>
        <a href="#help-faq"><CircleHelp size={17}/> Popular questions</a>
        <Link to="/us/user/orders/list"><PackageSearch size={17}/> Track an order</Link>
        <Link to="/contact"><Headphones size={17}/> Contact us</Link>
      </nav>

      <section className="help-categories-section" id="help-categories">
        <div className="help-section-heading">
          <span className="help-eyebrow">FIND THE RIGHT ANSWER</span>
          <h2>How can we help <em>today?</em></h2>
          <p>Choose a topic to see answers tailored to what you need.</p>
        </div>
        <div className="help-category-grid">
          {categories.map(({ id, title, description, icon: Icon }) => (
            <button className="help-category-card" type="button" key={id} onClick={() => selectCategory(id)}>
              <span className="help-category-icon"><Icon size={21}/></span>
              <span className="help-category-copy"><strong>{title}</strong><small>{description}</small></span>
              <ArrowUpRight size={17} className="help-category-arrow"/>
            </button>
          ))}
        </div>
      </section>

      <section className="help-popular-section">
        <div className="help-section-heading">
          <span className="help-eyebrow">A GOOD PLACE TO START</span>
          <h2>Popular <em>questions</em></h2>
          <p>Quick links to the answers customers look for most.</p>
        </div>
        <div className="help-popular-grid">
          {popularQuestions.map((question, index) => (
            <button type="button" key={question} onClick={() => selectPopularQuestion(question)}>
              <span>{String(index + 1).padStart(2, '0')}</span><strong>{question}</strong><ArrowRight size={16}/>
            </button>
          ))}
        </div>
      </section>

      <section className="help-faq-section" id="help-faq">
        <div className="help-faq-heading">
          <div className="help-section-heading">
            <span className="help-eyebrow">THE HELP CENTER</span>
            <h2>Answers, <em>made clear.</em></h2>
            <p>Search across questions and answers, or choose a category to narrow the list.</p>
          </div>
          <label className="help-faq-search">
            <Search size={18}/><span className="sr-only">Filter questions and answers</span>
            <input value={search} onChange={event => { setSearch(event.target.value); setOpenQuestion(null); }} placeholder="Search all help topics"/>
            {search && <button type="button" aria-label="Clear search" onClick={() => { setSearch(''); setOpenQuestion(null); }}><X size={16}/></button>}
          </label>
        </div>
        <div className="help-faq-layout">
          <aside className="help-faq-categories" aria-label="Filter questions by category">
            <button type="button" className={activeCategory === 'all' ? 'active' : ''} onClick={() => { setActiveCategory('all'); setOpenQuestion(null); }}>All questions <span>{questions.length}</span></button>
            {categories.map(category => {
              const count = questions.filter(question => question.category === category.id).length;
              return <button type="button" className={activeCategory === category.id ? 'active' : ''} key={category.id} onClick={() => { setActiveCategory(category.id); setOpenQuestion(null); }}>
                {category.title}<span>{count}</span>
              </button>;
            })}
          </aside>
          <div className="help-faq-list" aria-live="polite">
            {filteredQuestions.length ? filteredQuestions.map((item, index) => {
              const isOpen = openQuestion === item.id;
              return <article className={`help-faq-item${isOpen ? ' open' : ''}`} key={item.id}>
                <h3><button type="button" aria-expanded={isOpen} aria-controls={`help-answer-${item.id}`} onClick={() => setOpenQuestion(isOpen ? null : item.id)}>
                  <span className="help-faq-number">{String(index + 1).padStart(2, '0')}</span><span>{item.question}</span><ChevronDown size={19}/>
                </button></h3>
                <div id={`help-answer-${item.id}`} className="help-faq-answer" hidden={!isOpen}>
                  <p>{item.answer}</p>
                  {item.id === 'track-order' && <Link to="/us/user/orders/list">View your orders <ArrowRight size={15}/></Link>}
                  {item.id === 'shipping-time' && <Link to="/shipping-information">Read shipping information <ArrowRight size={15}/></Link>}
                  {(item.id === 'return-item' || item.id === 'return-policy') && <Link to="/returns-refunds">Open returns & refunds policy <ArrowRight size={15}/></Link>}
                  {item.id === 'account-update' && <Link to="/settings">Go to account settings <ArrowRight size={15}/></Link>}
                  {item.id === 'privacy-preferences' && <Link to="/settings/contact-preferences">Manage contact preferences <ArrowRight size={15}/></Link>}
                  {(item.id === 'product-details' || item.id === 'product-availability') && <Link to="/search">Explore products <ArrowRight size={15}/></Link>}
                  {(item.id === 'change-cancel' || item.id === 'delayed-package' || item.id === 'damaged-item') && <Link to="/contact">Contact our team <ArrowRight size={15}/></Link>}
                </div>
              </article>;
            }) : <div className="help-no-results"><Search size={24}/><h3>No matching answers</h3><p>Try a different search or clear the selected category.</p><button type="button" onClick={() => { setSearch(''); setActiveCategory('all'); }}>Clear filters</button></div>}
            {policiesQuery.isError && <p className="help-data-note" role="status">Store policies could not be loaded right now. Shipping and return details will be available from their policy pages or our Contact page.</p>}
            {paymentsQuery.isError && <p className="help-data-note" role="status">Current payment options could not be loaded. The payment choices shown at Shopify checkout are the most up-to-date.</p>}
          </div>
        </div>
      </section>

      <section className="help-confidence">
        <div className="help-confidence-image"><img src={beautyPortrait} alt="A natural beauty portrait reflecting the Dah Glow shopping experience" loading="lazy" decoding="async"/></div>
        <div className="help-confidence-content">
          <div className="help-section-heading">
            <span className="help-eyebrow">SHOP WITH CONFIDENCE</span>
            <h2>Clear details.<br/><em>Thoughtful support.</em></h2>
            <p>Know what to expect as you browse and place an order.</p>
          </div>
          <div className="help-trust-grid">
            {trustCards.map(({ icon: Icon, title, text }) => <article key={title}>
              <span><Icon size={18}/></span><div><h3>{title}</h3><p>{text}</p></div>
            </article>)}
          </div>
        </div>
      </section>

      <section className="help-before-contact">
        <div className="help-before-image"><img src={roseEditorial} alt="A rose-toned skincare product in a soft editorial setting" loading="lazy" decoding="async"/></div>
        <div className="help-before-copy">
          <span className="help-eyebrow">BEFORE YOU CONTACT US</span>
          <h2>A few details can<br/><em>help us help you.</em></h2>
          <p>If you have a question about an order, these quick checks can help you find the right information.</p>
          <ul>
            <li><span><Check size={15}/></span><div><strong>Check your order confirmation</strong><small>Look in the inbox for the email address used at checkout.</small></div></li>
            <li><span><Check size={15}/></span><div><strong>Review your order status</strong><small>Sign in to see available order and tracking details.</small></div></li>
            <li><span><Check size={15}/></span><div><strong>Read the relevant store policy</strong><small>Shipping and returns pages display policies published by the store.</small></div></li>
            <li><span><Check size={15}/></span><div><strong>Search the help topics</strong><small>Find answers by category or search the full FAQ above.</small></div></li>
          </ul>
          <Link className="help-inline-link" to="/us/user/orders/list">Go to your orders <ArrowRight size={16}/></Link>
        </div>
      </section>

      <section className="help-contact-cta">
        <div className="help-cta-orb" aria-hidden="true"/>
        <div className="help-contact-copy">
          <span className="help-eyebrow">WE'RE HERE FOR YOU</span>
          <h2>We&apos;re Always<br/><em>Here to Help.</em></h2>
          <p>Can&apos;t find the answer you&apos;re looking for? Our team is ready to help.</p>
          <Link to="/contact" className="help-contact-button">Contact Dah Glow <ArrowRight size={17}/></Link>
        </div>
        <div className="help-contact-decoration" aria-hidden="true"><Headphones size={70}/><span>DAH GLOW<br/>CUSTOMER CARE</span></div>
        <a className="help-back-top" href="#top" onClick={event => { event.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}><ArrowDown size={15}/> Back to top</a>
      </section>
    </main>
  );
}
