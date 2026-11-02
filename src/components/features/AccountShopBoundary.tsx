import type { ReactNode } from 'react';
import { ShopProvider } from '@/hooks/useShop';
interface Props { children:ReactNode; }
export default function AccountShopBoundary({children}:Props){return <ShopProvider>{children}</ShopProvider>;}
