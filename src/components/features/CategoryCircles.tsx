import { Link } from 'react-router-dom';
import { CATEGORIES,PRODUCTS } from '@/constants/products';
import { useShop } from '@/hooks/useShop';
export default function CategoryCircles(){const {t}=useShop();return <section className="category-circles" aria-label="Explore categories">{CATEGORIES.map(c=><Link to={`/?category=${c}`} key={c}><div><img loading="lazy" src={PRODUCTS.find(p=>p.category===c)!.image} alt={t(c)}/></div><span>{t(c==='Home'?'Home & Living':c)}</span></Link>)}</section>;}
