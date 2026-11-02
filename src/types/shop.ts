export interface Product { id: string; name: string; category: string; image: string; price: number; original: number; tag: string; }
export interface CartItem { id: string; size: string; quantity: number; }
export type Language = 'en' | 'fr' | 'es' | 'zh';
export interface AuthUser { id: string; email: string; username: string; }
