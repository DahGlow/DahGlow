import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { formatMoney,productUrl } from '@/lib/shopify';
import type { ScanMatch } from '@/types/scan';
interface Props {match:ScanMatch;}
export default function ScanMatchCard({match}:Props){const p=match.product;return <article className="scan-match-card"><Link to={productUrl(p)} className="product-image"><img src={p.image} alt={p.name} loading="lazy"/></Link><div><span className="scan-match-label">Visually similar · {Math.round(match.score*100)}% AI estimate</span><Link to={productUrl(p)}><h2>{p.name}</h2></Link><p>{p.vendor} {p.category&&`· ${p.category}`}</p><strong>{formatMoney(p.price,p.currency)}</strong><small>{p.available?'Available in the connected catalog':'Currently sold out'}</small><p className="scan-match-reason">{match.reason}</p><Link to={productUrl(p)} className="scan-product-link">View product<ArrowUpRight size={16}/></Link></div></article>;}
