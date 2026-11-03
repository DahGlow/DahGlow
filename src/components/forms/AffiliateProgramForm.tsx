import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { affiliateApi } from '@/lib/affiliate';

interface ProgramSettings {
  enabled: boolean;
  commission_rate: number | string | null;
  returning_rate: number | string | null;
}

const schema = z.object({
  enabled: z.boolean(),
  commissionRate: z.number().min(0).max(100),
  returningRate: z.number().min(0).max(100),
});
type Fields = z.infer<typeof schema>;
const queryKey = ['affiliate-program-settings'];

export default function AffiliateProgramForm() {
  const client = useQueryClient();
  const query = useQuery({
    queryKey,
    queryFn: () => affiliateApi<{ program: ProgramSettings }>({ op: 'program-settings' }),
    retry: false,
  });
  const form = useForm<Fields>({
    resolver: zodResolver(schema),
    values: query.data ? {
      enabled: query.data.program.enabled,
      commissionRate: Number(query.data.program.commission_rate || 0) * 100,
      returningRate: Number(query.data.program.returning_rate || 0) * 100,
    } : { enabled: false, commissionRate: 0, returningRate: 0 },
  });
  const mutation = useMutation({
    mutationFn: (values: Fields) => affiliateApi<{ saved: boolean }>({
      op: 'program-save',
      enabled: values.enabled,
      commissionRate: values.commissionRate / 100,
      returningRate: values.returningRate / 100,
    }),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey });
      toast.success('Affiliate program settings saved');
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (query.isLoading) return <p className="admin-muted" role="status">Loading affiliate program settings…</p>;
  if (query.error) {
    return <p className="admin-error" role="alert">Affiliate settings could not be loaded: {query.error.message}</p>;
  }

  return (
    <form className="admin-panel" onSubmit={form.handleSubmit(values => mutation.mutate(values))}>
      <h2>Affiliate program</h2>
      <p className="admin-muted">Rates apply only to qualifying, verified orders and remain subject to program rules.</p>
      <label className="admin-checkbox">
        <input type="checkbox" {...form.register('enabled')} />
        Enable affiliate commissions
      </label>
      <div className="admin-form-row">
        <label>
          Standard commission (%)
          <input type="number" min="0" max="100" step="0.01" {...form.register('commissionRate', { valueAsNumber: true })} />
          {form.formState.errors.commissionRate && <span className="admin-error">Enter a rate from 0 to 100.</span>}
        </label>
        <label>
          Returning-customer commission (%)
          <input type="number" min="0" max="100" step="0.01" {...form.register('returningRate', { valueAsNumber: true })} />
          {form.formState.errors.returningRate && <span className="admin-error">Enter a rate from 0 to 100.</span>}
        </label>
      </div>
      <button className="admin-button" disabled={mutation.isPending}>
        {mutation.isPending ? 'Saving…' : 'Save affiliate settings'}
      </button>
    </form>
  );
}
