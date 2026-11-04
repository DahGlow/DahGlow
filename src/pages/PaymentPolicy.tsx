import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, CheckCircle2, CreditCard, LockKeyhole, ShieldCheck } from 'lucide-react';
import { usePageMeta } from '@/hooks/usePageMeta';
import { shopify } from '@/lib/shopify';
import '@/gift-cards.css';

interface PaymentSettings {
  acceptedCardBrands: string[];
  supportedDigitalWallets: string[];
}

interface ShopPolicy {
  title: string;
  body: string;
}

interface PolicyResponse {
  shop: {
    termsOfService: ShopPolicy | null;
  };
}

const paymentNames: Record<string, string> = {
  AMERICAN_EXPRESS: 'American Express',
  DINERS_CLUB: 'Diners Club',
  DISCOVER: 'Discover',
  JCB: 'JCB',
  MASTERCARD: 'Mastercard',
  VISA: 'Visa',
  ANDROID_PAY: 'Android Pay',
  APPLE_PAY: 'Apple Pay',
  GOOGLE_PAY: 'Google Pay',
  SHOPIFY_PAY: 'Shop Pay',
};

export default function PaymentPolicy() {
  usePageMeta('Payment Policy | Dah Glow', 'Learn how Dah Glow checkout payments are processed and review the payment methods Shopify currently reports.');
  const methods = useQuery({
    queryKey: ['shopify-payment-methods'],
    queryFn: () => shopify<PaymentSettings>({ op: 'paymentMethods' }),
    staleTime: 300000,
    retry: 1,
  });
  const terms = useQuery({
    queryKey: ['shopify', 'payment-policy-terms'],
    queryFn: () => shopify<PolicyResponse>({ op: 'policies' }),
    staleTime: 300000,
    retry: 1,
  });
  const listedMethods = [...new Set([
    ...(methods.data?.acceptedCardBrands || []),
    ...(methods.data?.supportedDigitalWallets || []),
  ])].map(method => paymentNames[method]).filter((method): method is string => !!method);

  return (
    <main className="payment-policy-page">
      <section className="payment-policy-hero">
        <p className="gift-eyebrow"><LockKeyhole size={15}/> DAH GLOW CHECKOUT</p>
        <h1>Payment <em>Policy</em></h1>
        <p>Clear information about payments and checkout on Dah Glow.</p>
        <a href="#payment-details" className="gift-primary-button">Explore payment details <ArrowRight size={17}/></a>
        <a href="/en/How-to-Pay-a-278.html" className="gift-outline-button">How to Pay <ArrowRight size={16}/></a>
      </section>

      <section className="payment-policy-content" id="payment-details">
        <article className="payment-policy-intro">
          <div className="payment-policy-icon"><CreditCard size={24}/></div>
          <div>
            <p className="gift-eyebrow">HOW PAYMENT WORKS</p>
            <h2>Checkout is securely processed by Shopify.</h2>
            <p>When you place an order, payment is handled through the Shopify checkout flow. The payment options, order total, taxes, and any applicable charges shown at checkout are the current source of truth for your purchase.</p>
          </div>
        </article>

        <article className="payment-methods-panel">
          <div className="payment-policy-icon"><ShieldCheck size={24}/></div>
          <div>
            <p className="gift-eyebrow">CURRENTLY REPORTED PAYMENT OPTIONS</p>
            <h2>Available at Shopify checkout</h2>
            {methods.isLoading ? <p role="status">Loading payment methods reported by Shopify…</p>
              : methods.isError ? <div role="alert"><p>We couldn’t load Shopify’s current payment method settings. Please review the options presented directly at checkout.</p><button className="gift-outline-button" onClick={() => void methods.refetch()} disabled={methods.isFetching}>{methods.isFetching ? 'Retrying…' : 'Try again'}</button></div>
                : listedMethods.length ? <><div className="payment-method-chips">{listedMethods.map(name => <span key={name}><CheckCircle2 size={16}/>{name}</span>)}</div><p className="payment-policy-footnote">The options shown in your Shopify checkout may vary by order, location, and current store settings.</p></>
                  : <p>Payment options are displayed by Shopify during checkout. Review the methods shown before placing your order.</p>}
          </div>
        </article>

        <div className="payment-policy-cards">
          <article><span>01</span><h3>Review before paying</h3><p>Confirm your items, shipping selection, taxes, and final total in Shopify checkout before submitting payment.</p></article>
          <article><span>02</span><h3>Order confirmation</h3><p>After an order is successfully placed, Shopify sends order updates using the contact details entered during checkout. Refer to your order confirmation for purchase details.</p></article>
          <article><span>03</span><h3>Gift cards</h3><p>Gift card purchases and redemptions use Shopify’s native gift card checkout. Gift card code generation and eligible balance application are handled by Shopify.</p><Link to="/gift-cards">Explore Dah Glow Gift Cards <ArrowRight size={15}/></Link></article>
        </div>

        <article className="payment-policy-terms">
          <p className="gift-eyebrow">STORE TERMS</p>
          <h2>Published store terms</h2>
          {terms.isLoading ? <p role="status">Checking for current Shopify store terms…</p>
            : terms.isError ? <p role="alert">We couldn’t load the store terms. Please review the terms available during Shopify checkout or contact our team.</p>
              : terms.data?.shop?.termsOfService?.body ? <p>Dah Glow’s store terms are published by Shopify and available during the checkout process. Please review the current terms before placing an order.</p>
                : <p>No separate payment terms are available on this page. Applicable checkout details are presented by Shopify before you complete your purchase.</p>}
          <div><Link to="/contact" className="gift-outline-button">Need payment help? Contact us <ArrowRight size={15}/></Link><Link to="/returns-refunds" className="payment-policy-link">Returns & refunds</Link></div>
        </article>
      </section>
    </main>
  );
}
