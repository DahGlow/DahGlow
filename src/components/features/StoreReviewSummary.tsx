
import { Star } from 'lucide-react';
import type { StoreStats } from '@/hooks/useStoreStats';
interface Props {stats?:StoreStats;}
export default function StoreReviewSummary({stats}:Props){return <section className="store-review-summary"><Star size={28}/><h2>{stats?.rating!==null&&stats?.rating!==undefined?stats.rating.toFixed(2):'No product ratings available'}</h2>{stats&&stats.ratingCount>0?<p>Weighted from {stats.ratingCount.toLocaleString()} product ratings in this vendor’s Shopify catalog.</p>:<p>Verified product-review ratings will appear when Shopify exposes them to the storefront.</p>}<small>Written reviews are not supplied by the connected Shopify API. No reviews or ratings have been invented.</small></section>;}
