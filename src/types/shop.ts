export interface Money { amount:string; currencyCode:string; }
export interface ProductImage { url:string; altText:string|null; width?:number; height?:number; }
export interface Metafield { namespace:string; key:string; value:string; type:string; }
export interface SelectedOption { name:string; value:string; }
export interface Variant { id:string; title:string; availableForSale:boolean; quantityAvailable:number|null; selectedOptions:SelectedOption[]; price:Money; compareAtPrice:Money|null; image:ProductImage|null; metafields:(Metafield|null)[]; }
export interface ProductOption { name:string; optionValues:{name:string;swatch?:{color:string|null;image:{previewImage:ProductImage|null}|null}|null}[]; }
export interface Product { createdAt?:string; id:string; handle:string; name:string; category:string; image:string; price:number; original:number; tag:string; currency:string; vendor:string; description:string; descriptionHtml:string; images:ProductImage[]; variants:Variant[]; options:ProductOption[]; tags:string[]; metafields:Metafield[]; available:boolean; }
export interface RawProduct { createdAt?:string; id:string;handle:string;title:string;description:string;descriptionHtml:string;vendor:string;productType:string;tags:string[];availableForSale:boolean;options:ProductOption[];priceRange:{minVariantPrice:Money};compareAtPriceRange:{minVariantPrice:Money};images:{nodes:ProductImage[]};variants:{nodes:Variant[]};metafields:(Metafield|null)[]; }
export interface CartLine { id:string;quantity:number;cost:{totalAmount:Money};merchandise:{id:string;title:string;availableForSale:boolean;selectedOptions:SelectedOption[];price:Money;image:ProductImage|null;product:{handle:string;title:string;vendor:string}}; }
export interface ShopifyCart { id:string;checkoutUrl:string;totalQuantity:number;cost:{subtotalAmount:Money;totalAmount:Money};lines:{nodes:CartLine[];pageInfo:{hasNextPage:boolean;endCursor:string|null}}; }
export interface Vendor { id:string;name:string;avatar:string;displayName?:string;description?:string; }
export interface PageInfo { hasNextPage:boolean;endCursor:string|null; }
export interface OrderItem { title:string;quantity:number;variantTitle:string;image:ProductImage|null;price:Money|null;options:SelectedOption[]; }
export interface Tracking { number:string|null;company:string|null;url:string|null; }
export interface FulfillmentTrace {displayStatus:string;deliveredAt:string|null;estimatedDeliveryAt:string|null;events:{nodes:{status:string;message:string;happenedAt:string;city:string|null}[]};}
export interface Order { receiptConfirmedAt?:string|null;shippingMethod?:string|null;sellers?:string[];fulfillments?:FulfillmentTrace[];logisticsNotice?:string;id:string;name:string;createdAt:string;financialStatus:string;fulfillmentStatus:string;cancelledAt:string|null;total:Money;items:OrderItem[];tracking:Tracking[];shippingAddress:{formatted?:string[]}|null;statusPageUrl:string|null; }
export type Language = 'en' | 'fr' | 'es' | 'zh';
export interface AuthUser { id:string;email:string;username:string;avatar?:string; }
