import { usePageMeta } from '@/hooks/usePageMeta';

export function usePrivateMeta() {
  usePageMeta('Dah Glow Admin', undefined, { noindex: true });
}
