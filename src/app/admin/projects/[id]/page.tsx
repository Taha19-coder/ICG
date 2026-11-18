'use client';

import { useParams } from 'next/navigation';
import { CatalogManager } from '@/components/admin/catalog-manager';

export default function AdminProjectEditorPage() {
  const { id } = useParams<{ id: string }>();
  return <CatalogManager kind="projects" editId={id} />;
}
