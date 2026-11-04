import { createContext,useContext,useState,useEffect,type ReactNode } from 'react';
import { TRANSLATIONS } from '@/constants/translations';
import { useCart } from '@/hooks/useCart';
import { useCloudWishlist } from '@/hooks/useCloudWishlist';
import type { CartLine,CartLineAttribute,ShopifyCart,Language } from '@/types/shop';
interface ShopContextType {language:Language;currency:string;setLanguage:(l:Language)=>void;setCurrency:(c:string)=>void;t:(s:string)=>string;money:(p:number,currency?:string)=>string;cart:CartLine[];shopifyCart:ShopifyCart|null;cartLoading:boolean;cartBusy:boolean;cartError:Error|null;addCart:(variantId:string,quantity?:number,attributes?:CartLineAttribute[])=>Promise<void>;updateCart:(lineId:string,quantity:number)=>void;checkout:()=>Promise<void>;wishlist:string[];toggleWish:(handle:string)=>void;wishBusy:boolean;recent:string[];viewProduct:(handle:string)=>void;}
const ShopContext=createContext<ShopContextType>(null!);
function stored<T>(key:string,fallback:T):T{try{return JSON.parse(localStorage.getItem(key)||'null')||fallback;}catch{return fallback;}}
function detect():Language{const lang=navigator.language.toLowerCase().split('-')[0];return ['en','fr','es','zh'].includes(lang)?lang as Language:'en';}
export function ShopProvider({children}:{children:ReactNode}){const [language,setLanguage]=useState<Language>(()=>stored('dg-language',detect()));const [currency,setCurrency]=useState(()=>stored('dg-currency','USD'));const [recent,setRecent]=useState<string[]>(()=>stored<string[]>('dg-recent',[]).filter(id=>!id.startsWith('dg-')));const bag=useCart();const favorites=useCloudWishlist();
useEffect(()=>{localStorage.setItem('dg-language',JSON.stringify(language));document.documentElement.lang=language;},[language]);useEffect(()=>{localStorage.setItem('dg-currency',JSON.stringify(currency));},[currency]);useEffect(()=>{localStorage.setItem('dg-recent',JSON.stringify(recent));},[recent]);
const t=(s:string)=>language==='en'?s:TRANSLATIONS[s]?.[({fr:0,es:1,zh:2} as const)[language]]||s;
const money=(p:number,sourceCurrency=currency)=>new Intl.NumberFormat(language==='zh'?'zh-CN':language,{style:'currency',currency:sourceCurrency}).format(p);
const viewProduct=(handle:string)=>setRecent(old=>[handle,...old.filter(x=>x!==handle)].slice(0,30));
return <ShopContext.Provider value={{language,currency,setLanguage,setCurrency,t,money,cart:bag.lines,shopifyCart:bag.cart,cartLoading:bag.loading,cartBusy:bag.busy,cartError:bag.error,addCart:bag.add,updateCart:bag.update,checkout:bag.checkout,...favorites,recent,viewProduct}}>{children}</ShopContext.Provider>;}
export const useShop=()=>useContext(ShopContext);
