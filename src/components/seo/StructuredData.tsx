import { useEffect } from 'react';

interface Props {
  data: Record<string, unknown> | null;
}

export default function StructuredData({ data }: Props) {
  useEffect(() => {
    if (!data) return;
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
    return () => script.remove();
  }, [data]);

  return null;
}
