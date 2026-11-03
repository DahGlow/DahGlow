import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { affiliateApi } from '@/lib/affiliate';
import type { AffiliateSummary } from '@/types/affiliate';

export function useAffiliate() {
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ['affiliate-summary', user?.id];
  const query = useQuery({
    queryKey,
    queryFn: () => affiliateApi<AffiliateSummary>({ op: 'summary' }),
    enabled: !!user && !loading,
    retry: false,
    staleTime: 30_000,
  });
  const mutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      affiliateApi<{ saved: boolean }>(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return {
    user,
    data: query.data,
    error: query.error,
    isLoading: loading || (!!user && query.isLoading),
    busy: mutation.isPending,
    pick: (handle: string, saved = true) =>
      mutation.mutateAsync({ op: 'pick', handle, saved }),
    save: (body: Record<string, unknown>) => mutation.mutateAsync(body),
  };
}
