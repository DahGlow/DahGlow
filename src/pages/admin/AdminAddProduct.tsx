import { useSearchParams } from 'react-router-dom';
import { useAdminData } from '@/hooks/useAdmin';
import type { AdminProduct } from '@/types/admin';
import AdminProductForm from '@/components/forms/AdminProductForm';
import AdminDataState from '@/components/features/AdminDataState';
import AdminPublicationControls from '@/components/features/AdminPublicationControls';
import AdminProductMedia from '@/components/features/AdminProductMedia';

export default function AdminAddProduct(){const [params]=useSearchParams();const id=params.get('id');const query=useAdminData<{product:AdminProduct|null}>('product',{id:id||''},false,!!id);if(!id)return <AdminProductForm/>;if(query.isLoading||query.error)return <AdminDataState loading={query.isLoading} error={query.error}/>;const product=query.data?.product;if(!product)return <AdminDataState empty/>;return <><AdminProductForm key={product.id} product={product}/><AdminProductMedia product={product}/><AdminPublicationControls id={product.id}/></>;}
