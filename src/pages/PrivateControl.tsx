
import { lazy,Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { useAdminEntry,AdminProvider } from '@/hooks/useAdmin';
import { usePrivateMeta } from '@/hooks/usePrivateMeta';
import { ADMIN_NAVIGATION } from '@/constants/adminNavigation';
import NotFound from '@/pages/NotFound';
import AdminLayout from '@/components/layout/AdminLayout';
import AdminDataState from '@/components/features/AdminDataState';
const Overview=lazy(()=>import('@/pages/admin/AdminOverview')),Products=lazy(()=>import('@/pages/admin/AdminProducts')),AddProduct=lazy(()=>import('@/pages/admin/AdminAddProduct')),Store=lazy(()=>import('@/pages/admin/AdminStore')),Vendors=lazy(()=>import('@/pages/admin/AdminVendors')),Orders=lazy(()=>import('@/pages/admin/AdminOrders')),Customers=lazy(()=>import('@/pages/admin/AdminCustomers')),Analytics=lazy(()=>import('@/pages/admin/AdminAnalytics')),Management=lazy(()=>import('@/pages/admin/AdminManagement')),Settings=lazy(()=>import('@/pages/admin/AdminSettings'));
const Support=lazy(()=>import('@/pages/admin/AdminSupport'));
export default function PrivateControl(){usePrivateMeta();const entry=useAdminEntry();const {section}=useParams();const current=section||'overview';const nav=ADMIN_NAVIGATION.find(n=>n.id===current);if(entry.authLoading||entry.user&&entry.isLoading)return <div className="page-loading" aria-label="Loading page"/>;if(!entry.user||entry.error||!entry.data||!nav)return <NotFound/>;const allowed=entry.data.permissions.includes(nav.permission);const content=current==='overview'?<Overview/>:current==='products'?<Products/>:current==='add-product'?<AddProduct/>:current==='store'?<Store/>:current==='vendors'?<Vendors/>:current==='orders'?<Orders/>:current==='customers'?<Customers/>:current==='support'?<Support/>:current==='analytics'?<Analytics/>:current==='admins'?<Management/>:<Settings/>;return <AdminProvider session={entry.data} segment={entry.segment}><AdminLayout title={nav.label}>{allowed?<Suspense fallback={<AdminDataState loading/>}>{content}</Suspense>:<AdminDataState locked/>}</AdminLayout></AdminProvider>;}
