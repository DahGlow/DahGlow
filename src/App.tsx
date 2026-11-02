import { lazy,Suspense } from 'react';
import { BrowserRouter,Routes,Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ShopProvider } from '@/hooks/useShop';
import { AuthProvider } from '@/hooks/useAuth';
import Header from '@/components/layout/Header';
import BottomTabs from '@/components/layout/BottomTabs';
import ScrollReset from '@/components/layout/ScrollReset';
import CustomerBridge from '@/components/features/CustomerBridge';
import ErrorBoundary from '@/components/features/ErrorBoundary';

const Shop=lazy(()=>import('@/pages/Shop')),Trends=lazy(()=>import('@/pages/Trends')),Cart=lazy(()=>import('@/pages/Cart')),Me=lazy(()=>import('@/pages/Me'));
const Settings=lazy(()=>import('@/pages/Settings')),Preferences=lazy(()=>import('@/pages/Preferences')),Login=lazy(()=>import('@/pages/Login')),AuthCallback=lazy(()=>import('@/pages/AuthCallback'));
const ProductDetail=lazy(()=>import('@/pages/ProductDetail')),Wishlist=lazy(()=>import('@/pages/Wishlist')),SuperDeals=lazy(()=>import('@/pages/SuperDeals')),Search=lazy(()=>import('@/pages/Search'));
const BlackFriday=lazy(()=>import('@/pages/BlackFriday')),VendorStore=lazy(()=>import('@/pages/VendorStore')),Orders=lazy(()=>import('@/pages/Orders')),OrderDetail=lazy(()=>import('@/pages/OrderDetail'));
const FindOrder=lazy(()=>import('@/pages/FindOrder')),OrderRecycleBin=lazy(()=>import('@/pages/OrderRecycleBin')),Coupons=lazy(()=>import('@/pages/Coupons')),Points=lazy(()=>import('@/pages/Points'));
const ShopifyCallback=lazy(()=>import('@/pages/ShopifyCallback')),IntegrationStatus=lazy(()=>import('@/pages/IntegrationStatus')),NotFound=lazy(()=>import('@/pages/NotFound'));
export default function App(){return <BrowserRouter><ErrorBoundary><AuthProvider><ShopProvider><ScrollReset/><CustomerBridge/><Header/>
 <Suspense fallback={<div className="page-loading"><span className="brand">DAH GLOW</span><p>Loading your next favorites…</p></div>}><Routes>
  <Route path="/" element={<Shop/>}/><Route path="/trends" element={<Trends/>}/><Route path="/cart" element={<Cart/>}/><Route path="/me" element={<Me/>}/>
  <Route path="/settings" element={<Settings/>}/><Route path="/settings/:type" element={<Preferences/>}/><Route path="/login" element={<Login/>}/>
  <Route path="/auth/callback" element={<AuthCallback/>}/><Route path="/oauth/callback" element={<AuthCallback/>}/><Route path="/shopify/callback" element={<ShopifyCallback/>}/>
  <Route path="/products/:handle" element={<ProductDetail/>}/><Route path="/product/:id" element={<ProductDetail/>}/>
  <Route path="/wishlist" element={<Wishlist/>}/><Route path="/deals" element={<SuperDeals/>}/><Route path="/search" element={<Search/>}/>
  <Route path="/black-Friday-2026-November-dah-glow" element={<BlackFriday/>}/><Route path="/stores/:slug" element={<VendorStore/>}/>
  <Route path="/us/user/orders/list" element={<Orders/>}/><Route path="/us/user/orders/find" element={<FindOrder/>}/>
  <Route path="/us/user/orders/recycle-bin" element={<OrderRecycleBin/>}/><Route path="/us/user/orders/detail/:id" element={<OrderDetail/>}/>
  <Route path="/us/user/coupons" element={<Coupons/>}/><Route path="/us/user/points" element={<Points/>}/><Route path="/integration" element={<IntegrationStatus/>}/>
  <Route path="*" element={<NotFound/>}/>
 </Routes></Suspense><BottomTabs/><Toaster position="top-center" richColors/>
 </ShopProvider></AuthProvider></ErrorBoundary></BrowserRouter>;}
