'use client';

import { useEffect, useState } from 'react';
import type { ConstructionProject, Property } from '@/lib/types';

type CatalogResponse = {
  properties: Property[];
  projects: ConstructionProject[];
};

export function useCatalogData(admin = false) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [projects, setProjects] = useState<ConstructionProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const loadCatalog = async () => {
      try {
        setIsLoading(true);
        setError('');
        const endpoint = admin ? '/api/admin/catalog?kind=all' : '/api/catalog';
        const response = await fetch(endpoint, { cache: 'no-store' });
        const result = await response.json() as CatalogResponse & { message?: string };
        if (!response.ok) throw new Error(result.message || 'Listings could not be loaded.');
        if (!Array.isArray(result.properties) || !Array.isArray(result.projects)) {
          throw new Error('The server returned an invalid catalog.');
        }
        if (active) {
          setProperties(result.properties);
          setProjects(result.projects);
        }
      } catch (error) {
        if (active) setError(error instanceof Error ? error.message : 'Listings could not be loaded.');
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void loadCatalog();
    return () => { active = false; };
  }, [admin]);

  return { properties, projects, isLoading, error };
}
