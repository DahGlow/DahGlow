import { lazy, Suspense } from 'react';
import { BrowserRouter,Routes,Route } from 'react-router-dom';
import { Sentry } from '@/lib/sentry';
import { Toaster } from 'sonner';
import { Analytics } from '@vercel/analytics/react';
import AccountShopBoundary from '@/components/features/AccountShopBoundary';
import { AuthProvider } from '@/hooks/useAuth';
import { SpeedInsights } from "@vercel/speed-insights/react"
import Header from '@/components/layout/Header';
import DesktopFooter from '@/components/layout/DesktopFooter';
import BottomTabs from '@/components/layout/BottomTabs';
import ScrollReset from '@/components/layout/ScrollReset';
import CustomerBridge from '@/components/features/CustomerBridge';
import ErrorBoundary from '@/components/features/ErrorBoundary';
mport TidioWidget from '@/components/features/TidioWidget';

const Shop=lazy(()=>import('@/pages/Shop')),Trends=lazy(()=>import('@/pages/Trends')),Cart=lazy(()=>import('@/pages/Cart')),Me=lazy(()=>import('@/pages/Me'));
const Settings=lazy(()=>import('@/pages/Settings')),Preferences=lazy(()=>import('@/pages/Preferences')),Login=lazy(()=>import('@/pages/Login')),AuthCallback=lazy(()=>import('@/pages/AuthCallback'));
const ProductDetail=lazy(()=>import('@/pages/ProductDetail')),Wishlist=lazy(()=>import('@/pages/Wishlist')),SuperDeals=lazy(()=>import('@/pages/SuperDeals')),Search=lazy(()=>import('@/pages/Search'));
const BlackFriday=lazy(()=>import('@/pages/BlackFriday')),VendorStore=lazy(()=>import('@/pages/VendorStore')),Orders=lazy(()=>import('@/pages/Orders')),OrderDetail=lazy(()=>import('@/pages/OrderDetail'));
const FindOrder=lazy(()=>import('@/pages/FindOrder')),OrderRecycleBin=lazy(()=>import('@/pages/OrderRecycleBin')),Coupons=lazy(()=>import('@/pages/Coupons')),Points=lazy(()=>import('@/pages/Points'));
const ShopifyCallback=lazy(()=>import('@/pages/ShopifyCallback')),IntegrationStatus=lazy(()=>import('@/pages/IntegrationStatus')),NotFound=lazy(()=>import('@/pages/NotFound'));
const PrivateControl=lazy(()=>import('@/pages/PrivateControl')),LoginCode=lazy(()=>import('@/pages/LoginCode')),ResetPassword=lazy(()=>import('@/pages/ResetPassword')),AccountRecovery=lazy(()=>import('@/pages/AccountRecovery'));
const EditProfile=lazy(()=>import('@/pages/EditProfile')),EditUsername=lazy(()=>import('@/pages/EditUsername')),ProfileQr=lazy(()=>import('@/pages/ProfileQr')),Support=lazy(()=>import('@/pages/Support'));
const OrderTrack=lazy(()=>import('@/pages/OrderTrack')),ReceiveSuccess=lazy(()=>import('@/pages/ReceiveSuccess'));
const SwitchAccounts=lazy(()=>import('@/pages/SwitchAccounts')),ContactPreferences=lazy(()=>import('@/pages/ContactPreferences')),MyStores=lazy(()=>import('@/pages/MyStores'));
const Wallet=lazy(()=>import('@/pages/Wallet')),WalletHistory=lazy(()=>import('@/pages/WalletHistory')),WalletPayment=lazy(()=>import('@/pages/WalletPayment'));
const VisualSearch=lazy(()=>import('@/pages/VisualSearchRoute')),MessageCenter=lazy(()=>import('@/pages/MessageCenter'));
const Contact=lazy(()=>import('@/pages/Contact'));
const Affiliate=lazy(()=>import('@/pages/Affiliate')),AffiliateItems=lazy(()=>import('@/pages/AffiliateItems')),AffiliateBoost=lazy(()=>import('@/pages/AffiliateBoost')),AffiliateBonus=lazy(()=>import('@/pages/AffiliateBonus'));
const AffiliateEarnings=lazy(()=>import('@/pages/AffiliateEarnings')),AffiliateData=lazy(()=>import('@/pages/AffiliateData')),AffiliateSocial=lazy(()=>import('@/pages/AffiliateSocial')),AffiliateAccount=lazy(()=>import('@/pages/AffiliateAccount'));
const AffiliateSettings=lazy(()=>import('@/pages/AffiliateSettings')),AffiliateConvert=lazy(()=>import('@/pages/AffiliateConvert')),AffiliateReferral=lazy(()=>import('@/pages/AffiliateReferral'));
const SentryRoutes=Sentry.withSentryReactRouterV6Routing(Routes);
export default function App(){return <BrowserRouter><ErrorBoundary><AuthProvider><AccountShopBoundary><ScrollReset/><CustomerBridge/><Header/>
 <Suspense fallback={<div className="page-loading"><span className="brand">DAH GLOW</span><p>Loading your next favorites…</p></div>}><SentryRoutes>
  <Route path="/" element={<Shop/>}/><Route path="/trends" element={<Trends/>}/><Route path="/cart" element={<Cart/>}/><Route path="/me" element={<Me/>}/>
  <Route path="/settings" element={<Settings/>}/><Route path="/settings/:type" element={<Preferences/>}/><Route path="/login" element={<Login/>}/>
  <Route path="/account/switch" element={<SwitchAccounts/>}/><Route path="/account/stores" element={<MyStores/>}/>
  <Route path="/settings/contact-preferences" element={<ContactPreferences/>}/><Route path="/wallet" element={<Wallet/>}/><Route path="/wallet/history" element={<WalletHistory/>}/><Route path="/wallet/payment" element={<WalletPayment/>}/>
  <Route path="/login/code" element={<LoginCode/>}/><Route path="/account/reset-password" element={<ResetPassword/>}/><Route path="/account/recovery" element={<AccountRecovery/>}/>
  <Route path="/account/profile" element={<EditProfile/>}/><Route path="/account/profile/username" element={<EditUsername/>}/><Route path="/account/profile/qr" element={<ProfileQr/>}/><Route path="/support" element={<Support/>}/><Route path="/contact" element={<Contact/>}/>
  <Route path="/auth/callback" element={<AuthCallback/>}/><Route path="/oauth/callback" element={<AuthCallback/>}/><Route path="/shopify/callback" element={<ShopifyCallback/>}/>
  <Route path="/products/:handle" element={<ProductDetail/>}/><Route path="/product/:id" element={<ProductDetail/>}/>
  <Route path="/wishlist" element={<Wishlist/>}/><Route path="/deals" element={<SuperDeals/>}/><Route path="/search" element={<Search/>}/>
  <Route path="/scan-product/*" element={<VisualSearch/>}/><Route path="/messages" element={<MessageCenter/>}/>
  <Route path="/black-Friday-2026-November-dah-glow" element={<BlackFriday/>}/><Route path="/stores/:slug" element={<VendorStore/>}/>
  <Route path="/us/user/orders/list" element={<Orders/>}/><Route path="/us/user/orders/find" element={<FindOrder/>}/>
  <Route path="/us/user/orders/recycle-bin" element={<OrderRecycleBin/>}/><Route path="/us/user/orders/detail/:id" element={<OrderDetail/>}/>
  <Route path="/us/user/coupons" element={<Coupons/>}/><Route path="/us/user/points" element={<Points/>}/><Route path="/integration" element={<IntegrationStatus/>}/>
  <Route path="/us/user/orders/track/:id" element={<OrderTrack/>}/><Route path="/us/user/orders/receive-success/:id" element={<ReceiveSuccess/>}/>
  <Route path="/affiliate" element={<Affiliate/>}/><Route path="/affiliate/items" element={<AffiliateItems/>}/>
  <Route path="/affiliate/boost" element={<AffiliateBoost/>}/><Route path="/affiliate/bonus" element={<AffiliateBonus/>}/>
  <Route path="/affiliate/earnings" element={<AffiliateEarnings/>}/><Route path="/affiliate/data" element={<AffiliateData/>}/>
  <Route path="/affiliate/social" element={<AffiliateSocial/>}/><Route path="/affiliate/account" element={<AffiliateAccount/>}/>
  <Route path="/affiliate/account/settings" element={<AffiliateSettings/>}/><Route path="/affiliate/convert" element={<AffiliateConvert/>}/>
  <Route path="/r/:code" element={<AffiliateReferral/>}/><Route path="/r/:code/:linkId" element={<AffiliateReferral/>}/>
  <Route path="/private-control/:segment" element={<PrivateControl/>}/><Route path="/private-control/:segment/:section" element={<PrivateControl/>}/>
  <Route path="*" element={<NotFound/>}/>
 </SentryRoutes></Suspense><DesktopFooter/><BottomTabs/><TidioWidget/><Analytics/><SpeedInsights/><Toaster position="top-center" richColors/>
 </AccountShopBoundary></AuthProvider></ErrorBoundary></BrowserRouter>;}
