import { useSearchParams } from 'react-router-dom';
import { useAdminData } from '@/hooks/useAdmin';
import type { Analytics } from '@/types/admin';
import AdminDateFilter from '@/components/features/AdminDateFilter';
import AdminDataState from '@/components/features/AdminDataState';
import AdminChart from '@/components/features/AdminChart';
import AdminMetrics from '@/components/features/AdminMetrics';

export default function AdminAnalytics(){const [params]=useSearchParams();const q=useAdminData<Analytics>('analytics',{start:params.get('start')||undefined,end:params.get('end')||undefined});return <><AdminDateFilter/><AdminDataState loading={q.isLoading} error={q.error}/>{q.data&&<><AdminMetrics data={q.data}/><div className="admin-grid two"><AdminChart title="Gross product sales" data={q.data.performance} dataKey="gross" nameKey="name" bar/><AdminChart title="Customer growth" data={q.data.series} dataKey="customers"/><AdminChart title="Gross sales by category" data={q.data.categories} dataKey="gross" nameKey="name" bar/><AdminChart title="Gross sales by vendor" data={q.data.vendors} dataKey="gross" nameKey="name" bar/><AdminChart title="Payments received" data={q.data.series} dataKey="payments"/><AdminChart title="Refunds" data={q.data.series} dataKey="refunds"/></div><p className="admin-footnote">{q.data.notes}</p></>}</>;}
