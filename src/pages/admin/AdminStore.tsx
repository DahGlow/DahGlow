import { useAdminData } from '@/hooks/useAdmin';
import type { StoreSettings } from '@/types/admin';
import AdminStoreForm from '@/components/forms/AdminStoreForm';
import AdminDataState from '@/components/features/AdminDataState';
import AffiliateProgramForm from '@/components/forms/AffiliateProgramForm';
export default function AdminStore(){const q=useAdminData<StoreSettings>('store');return <><AdminDataState loading={q.isLoading} error={q.error}/>{q.data&&<><AdminStoreForm data={q.data}/><AffiliateProgramForm/></>}</>;}
