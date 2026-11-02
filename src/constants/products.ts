import type { Product } from '@/types/shop';
const image = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=650&q=85`;
const raw = [
['Soft knit everyday cardigan','Women','photo-1434389677669-e08b4cac3105',18.90,'#SoftLayers'],
['City girl shoulder bag','Women','photo-1548036328-c9fa89d128fa',14.20,'#EverydayMuse'],
['Everyday white sneakers','Shoes','photo-1549298916-b41d501d3772',22.49,'#StreetStyle'],
['Golden hour essentials','Lips','photo-1596462502278-27bfdc403348',5.46,'#BeautyEdit'],
['The effortless linen shirt','Men','photo-1598033129183-c4f50c736f10',16.80,'#QuietLuxury'],
['Sculptural gold jewelry','Women','photo-1611652022419-a9419f74343d',3.90,'#GoldenGlow'],
['A little everyday luxury','Home','photo-1602874801007-bd458bb1b8b6',8.90,'#SlowLiving'],
['The classic oversized tee','Tops','photo-1521572163474-6864f9cf17ab',9.49,'#OversizedFits'],
['Your new favorite dress','Women','photo-1515372039744-b8f02a3ae446',24.90,'#MemorableWedding'],
['Modern minimal sunglasses','Women','photo-1511499767150-a48a237f0083',4.80,'#SunKissed'],
['Weekend denim jacket','Men','photo-1544022613-e87ca75a784a',27.90,'#DenimDays'],
['Little adventures collection','Kids','photo-1519689680058-324335c77eba',12.20,'#MiniGlow'],
['Signature nude lip collection','Lips','photo-1586495777744-4413f21062fa',6.90,'#FreshFace'],
['Cozy neutral cushion','Home','photo-1584100936595-c0654b55a2e2',11.40,'#HomeMood'],
['Everyday curve essentials','Curve','photo-1483985988355-763728e1935b',19.90,'#YourOwnStyle'],
['Suede ankle boots','Shoes','photo-1543163521-1bf539c55dd2',28.89,'#FallFavorites'],
['The everyday crossbody','Women','photo-1553062407-98eeb64c6a62',17.99,'#CityEssentials'],
['Clean cotton essentials','Tops','photo-1503341504253-dff4815485f1',10.99,'#SimpleLooks'],
['The statement timepiece','Men','photo-1524805444758-089113d48a6d',21.80,'#FinishingTouch'],
['Airy living room accents','Home','photo-1494438639946-1ebd1d20bf85',7.99,'#NaturalHome'],
['Soft blush occasion dress','Women','photo-1595777457583-95e059d581b8',32.40,'#MemorableWedding'],
['Fresh white low tops','Shoes','photo-1600269452121-4f2416e55c28',25.60,'#FreshSteps'],
['Modern everyday jacket','Men','photo-1551028719-00167b16eac5',34.90,'#CityLayers'],
['The warm knit edit','Tops','photo-1576566588028-4147f3842f27',15.20,'#SoftLayers']
] as const;
export const PRODUCTS: Product[] = raw.map((p,i) => ({ id: `dg-${i+1}`, name:p[0],category:p[1],image:image(p[2]),price:p[3],original: +(p[3]*1.6).toFixed(2),tag:p[4] }));
export const SHUFFLED_PRODUCTS = [...PRODUCTS].sort(() => Math.random()-.5);
export const CATEGORIES = ['Women','Curve','Kids','Men','Shoes','Tops','Lips','Home'];
export const ASSETS = { deals:'https://img.ltwebstatic.com/v4/p/ccc/2026/03/09/23/1773047383f0f700fd5359994ee5b757e648beadd8_thumbnail_240x.avif', trends:'https://img.ltwebstatic.com/v4/p/ccc/2026/03/09/69/1773046319ce7456bd44ad5837cb586d1022c6323c_thumbnail_144x.avif', brands:'https://img.ltwebstatic.com/v4/p/ccc/2026/08/24/83/17875542345ec8ddbb14dec8e07bc0d9f1a1b83671_thumbnail_240x.avif', cart:'https://img.ltwebstatic.com/images3_ccc/2024/09/14/c4/1726308103afb22656373fc035549a3b184a4363c0.avif', addCart:'https://shein.ltwebstatic.com/svgicons/2025/06/09/17494608673220285452.svg', vip:'https://img.ltwebstatic.com/images3_app/2019/10/18/icon_normal_vip_s0.png' };
