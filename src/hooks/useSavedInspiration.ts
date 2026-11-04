import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'dg-saved-inspiration';

function readSaved(): string[] {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(saved) ? saved.filter((slug): slug is string => typeof slug === 'string') : [];
  } catch {
    return [];
  }
}

export function useSavedInspiration() {
  const [savedSlugs, setSavedSlugs] = useState(readSaved);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedSlugs));
  }, [savedSlugs]);

  const toggleSaved = useCallback((slug: string) => {
    setSavedSlugs(current => current.includes(slug)
      ? current.filter(item => item !== slug)
      : [...current, slug]);
  }, []);

  return { savedSlugs, toggleSaved };
}
