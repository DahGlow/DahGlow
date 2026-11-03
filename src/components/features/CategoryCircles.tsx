import { Link } from 'react-router-dom';
import { useShop } from '@/hooks/useShop';
import { CATEGORY_VISUALS } from '@/constants/categoryVisuals';
const CATEGORIES=[{name:'Women',visual:'Women'},{name:'Curve',visual:'Curve'},{name:'Men',visual:'Men'},{name:'Kids',visual:'Kids'},{name:'Fall & Winter',visual:'Winter'},{name:'Jewelry & Accessories',visual:'Jewelry'},{name:'Baby & Maternity',visual:'Baby'},{name:'Phone Accessories',visual:'Phone'},{name:'Shoes',visual:'Shoes'},{name:'Home',visual:'Home'},{name:'Beauty & Health',visual:'Beauty'},{name:'Underwear & Sleepwear',visual:'Sleepwear'},{name:'Sports & Outdoor',visual:'Sports'},{name:'Dresses',visual:'Dress'},{name:'Tops',visual:'Tops'}];

export default function CategoryCircles(){const {t}=useShop();return <section className="category-circles" aria-label="Explore categories">{CATEGORIES.map(({name,visual})=>{const image=CATEGORY_VISUALS.find(item=>item.name===visual)?.image;return <Link to={`/?category=${encodeURIComponent(name)}`} key={name}><div>{image&&<img loading="lazy" src={image} alt={t(name)}/>}</div><span>{t(name==='Home'?'Home & Living':name)}</span></Link>;})}</section>;}
