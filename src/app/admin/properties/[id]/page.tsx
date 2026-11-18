'use client';

import { useParams } from 'next/navigation';
import { CatalogManager } from '@/components/admin/catalog-manager';

export default function AdminPropertyEditorPage() {
  const { id } = useParams<{ id: string }>();
  return <CatalogManager kind="properties" editId={id} />;
}
