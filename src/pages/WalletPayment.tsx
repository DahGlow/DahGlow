import { Link,useSearchParams } from 'react-router-dom';
import { LockKeyhole,CreditCard,Gift } from 'lucide-react';
import { useShop } from '@/hooks/useShop';
import { toast } from 'sonner';
import PageHeader from '@/components/layout/PageHeader';
import card from '@/assets/card-logo.jpeg';

export default function WalletPayment(){const [params]=useSearchParams();const gift=params.get('tab')==='giftcard';const {cart,checkout,cartBusy}=useShop();return <main className="compact-page payment-page"><PageHeader title={gift?'Gift Card':'Payment Options'}/><section className="payment-intro">{gift?<Gift size={32}/>:<img src={card} alt="Secure payment card"/>}<span className="eyebrow">PROTECTED BY SHOPIFY</span><h1>{gift?'Redeem at checkout.':'Fast checkout. Safely.'}</h1><p>{gift?'Enter an existing Shopify gift-card code during checkout. Its balance and validity are checked by Shopify.':'Add or save your card only inside secure Shopify checkout, where supported by Shop Pay. Dah Glow never collects your full card number or security code.'}</p><div className="payment-security"><LockKeyhole size={20}/><span>Payment details stay with the payment provider.</span></div>{cart.length?<button className="primary-button" disabled={cartBusy} onClick={()=>void checkout().catch((error:Error)=>toast.error(error.message))}><CreditCard size={18}/>Continue to Shopify checkout</button>:<Link to="/cart" className="primary-button">Open your bag</Link>}<Link to="/wallet" className="payment-back">Back to Wallet</Link></section></main>;}
