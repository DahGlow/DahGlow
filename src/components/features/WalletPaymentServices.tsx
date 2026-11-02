import { Link } from 'react-router-dom';
import friday from '@/assets/black-friday-wallet.jpeg';
import card from '@/assets/card-logo.jpeg';

export default function WalletPaymentServices(){return <section className="wallet-services"><h2>Payment Service</h2><div className="wallet-service-tiles"><Link to="/black-Friday-2026-November-dah-glow" className="wallet-friday-tile"><img src={friday} alt="Black Friday wallet campaign"/><span>Explore Black Friday</span></Link><Link to="/wallet/payment" className="wallet-card-tile"><span><strong>Bind Card</strong><b>Fast Checkout</b></span><img src={card} alt="Payment card for secure Shopify checkout"/></Link></div><p>Payment methods and any promotional eligibility are confirmed by Shopify checkout.</p></section>;}
