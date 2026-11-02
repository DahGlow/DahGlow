import { useSearchParams } from 'react-router-dom';
import { useAdminData } from '@/hooks/useAdmin';
import type { Analytics } from '@/types/admin';
import AdminDateFilter from '@/components/features/AdminDateFilter';
import AdminDataState from '@/components/features/AdminDataState';
import AdminMetrics from '@/components/features/AdminMetrics';
import AdminChart from '@/components/features/AdminChart';
import AdminTopCustomers from '@/components/features/AdminTopCustomers';
import AdminActivity from '@/components/features/AdminActivity';

export default function AdminOverview(){const [params]=useSearchParams();const query=useAdminData<Analytics>('overview',{start:params.get('start')||undefined,end:params.get('end')||undefined},true);return <><AdminDateFilter/><AdminDataState loading={query.isLoading} error={query.error} onRetry={()=>void query.refetch()}/>{query.data&&<><AdminMetrics data={query.data}/><div className="admin-grid two"><AdminChart title="Net payments over time" data={query.data.series} dataKey="net"/><AdminChart title="Orders over time" data={query.data.series} dataKey="orders"/></div><div className="admin-grid two"><AdminTopCustomers data={query.data}/><AdminActivity/></div><p className="admin-footnote">{query.data.notes} Reporting timezone: {query.data.timezone}.</p></>}</>;}
