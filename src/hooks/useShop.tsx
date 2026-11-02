import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { toast } from 'sonner';
import type { CartItem, Language } from '@/types/shop';
import { TRANSLATIONS } from '@/constants/translations';
interface ShopContextType { language:Language; currency:string; setLanguage:(l:Language)=>void; setCurrency:(c:string)=>void; t:(s:string)=>string; money:(p:number)=>string; cart:CartItem[]; addCart:(id:string,size?:string)=>void; updateCart:(id:string,size:string,quantity:number)=>void; wishlist:string[]; toggleWish:(id:string)=>void; recent:string[]; viewProduct:(id:string)=>void; }
const ShopContext = createContext<ShopContextType>(null!);
function stored<T>(key:string,fallback:T):T { const value=localStorage.getItem(key); if(!value) return fallback; try { return JSON.parse(value) as T; } catch { return fallback; } }
function detect():Language { const lang=navigator.language.toLowerCase().split('-')[0]; return ['en','fr','es','zh'].includes(lang) ? lang as Language : 'en'; }
export function ShopProvider({children}:{children:ReactNode}) {
const [language,setLanguage]=useState<Language>(()=>stored('dg-language',detect())); const [currency,setCurrency]=useState(()=>stored('dg-currency','USD'));
const [cart,setCart]=useState<CartItem[]>(()=>stored('dg-cart',[])); const [wishlist,setWishlist]=useState<string[]>(()=>stored('dg-wishlist',[])); const [recent,setRecent]=useState<string[]>(()=>stored('dg-recent',[]));
useEffect(()=>{ localStorage.setItem('dg-language',JSON.stringify(language)); document.documentElement.lang=language; },[language]);
useEffect(()=>{localStorage.setItem('dg-currency',JSON.stringify(currency));},[currency]);
useEffect(()=>{localStorage.setItem('dg-cart',JSON.stringify(cart));},[cart]); useEffect(()=>{localStorage.setItem('dg-wishlist',JSON.stringify(wishlist));},[wishlist]); useEffect(()=>{localStorage.setItem('dg-recent',JSON.stringify(recent));},[recent]);
const t=(s:string)=> language==='en'?s:TRANSLATIONS[s]?.[({fr:0,es:1,zh:2} as const)[language]] || s;
const money=(p:number)=>new Intl.NumberFormat(language==='zh'?'zh-CN':language,{style:'currency',currency}).format(p*({USD:1,EUR:.92,GBP:.77,CAD:1.38,CNY:7.12}[currency] || 1));
const addCart=(id:string,size='M')=>{setCart(old=>old.some(x=>x.id===id&&x.size===size)?old.map(x=>x.id===id&&x.size===size?{...x,quantity:x.quantity+1}:x):[...old,{id,size,quantity:1}]); toast.success(t('Added to your bag'));};
const updateCart=(id:string,size:string,quantity:number)=>setCart(old=>old.map(x=>x.id===id&&x.size===size?{...x,quantity}:x).filter(x=>x.quantity>0));
const toggleWish=(id:string)=>setWishlist(old=>old.includes(id)?old.filter(x=>x!==id):[id,...old]); const viewProduct=(id:string)=>setRecent(old=>[id,...old.filter(x=>x!==id)].slice(0,30));
return <ShopContext.Provider value={{language,currency,setLanguage,setCurrency,t,money,cart,addCart,updateCart,wishlist,toggleWish,recent,viewProduct}}>{children}</ShopContext.Provider>;
}
export const useShop=()=>useContext(ShopContext);
