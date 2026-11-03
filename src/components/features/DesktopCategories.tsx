
import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';
import { CATEGORY_VISUALS } from '@/constants/categoryVisuals';
import ProductCard from '@/components/features/ProductCard';
import { useCatalog } from '@/hooks/useCatalog';
const CATEGORIES=[
 {name:'Women',q:'Women',terms:['women','womens','woman']},
 {name:'Curve',q:'Curve',terms:['curve','plus size','curvy']},
 {name:'Kids',q:'Kids',terms:['kids','children','toddler']},
 {name:'Men',q:'Men',terms:['men','mens','man']},
 {name:'Fall & Winter',q:'Winter',terms:['winter','coat','sweater']},
 {name:'Jewelry & Accessories',q:'Jewelry',terms:['jewelry','jewellery','accessory','accessories']},
 {name:'Baby & Maternity',q:'Baby',terms:['baby','maternity','newborn']},
 {name:'Phone Accessories',q:'Phone',terms:['phone','case','charger']},
 {name:'Shoes',q:'Shoes',terms:['shoe','sneaker','boot']},
 {name:'Home & Living',q:'Home',terms:['home','living','decor']},
 {name:'Beauty & Health',q:'Beauty',terms:['beauty','health','makeup','skincare']},
 {name:'Underwear & Sleepwear',q:'Sleepwear',terms:['underwear','sleepwear','lingerie','pajama']},
 {name:'Sports & Outdoor',q:'Sports',terms:['sports','outdoor','active','gym']},
 {name:'Tops',q:'Tops',terms:['top','blouse','shirt']},
 {name:'Dresses',q:'Dress',terms:['dress','gown']},
 {name:'Bags & Luggage',q:'Bag',terms:['bag','luggage','purse']},
];

export default function DesktopCategories(){
 const catalog=useCatalog({first:48});
 const availableProducts=catalog.products.filter(product=>product.image);
 const usedProductIds=new Set<string>();
 const categoryProducts=CATEGORIES.map(category=>{
  const matches=availableProducts.filter(product=>{
   const details=`${product.category} ${product.name} ${product.tags.join(' ')}`.toLowerCase();
   return category.terms.some(term=>details.includes(term));
  });
  const products=[...matches,...availableProducts.filter(product=>!matches.includes(product))]
   .filter(product=>!usedProductIds.has(product.id))
   .slice(0,2);
  products.forEach(product=>usedProductIds.add(product.id));
  return products;
 });

 return <section className="desktop-categories" aria-label="Shop by category">
  {CATEGORIES.map((category,index)=>{
   const visual=CATEGORY_VISUALS.find(item=>item.name===category.q)?.image;
   const image=visual||categoryProducts[index][0]?.image;
   return <article className="desktop-category-tile" key={category.name}>
    <Link className="desktop-category-banner" to={`/search?q=${encodeURIComponent(category.q)}`}>
     <span>{image?<img src={image} alt={category.name} loading="lazy"/>:<Package size={32}/>}</span>
     <p>{category.name}</p>
    </Link>
    <div className="desktop-category-products">
     {categoryProducts[index].map(product=><ProductCard key={product.id} product={product} compact/>)}
    </div>
   </article>;
  })}
 </section>;
}
