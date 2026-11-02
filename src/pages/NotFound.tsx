import { Link } from 'react-router-dom';
import { useShop } from '@/hooks/useShop';
export default function NotFound(){const {t}=useShop();return <main className="empty-state"><span className="eyebrow">404 · DAH GLOW</span><h1>This look is off the rack.</h1><p>Let’s find something you’ll love instead.</p><Link to="/" className="primary-button">{t('Start shopping')}</Link></main>;}
