import { productInput, type ProductSelection } from '@/domain/validation';

// One pending direct order per tab. The URL key also identifies retries after reload.
const storageKey = 'nijoow:direct-order';
export function startDirectOrder(workspace: string, item: ProductSelection) {
  const key = crypto.randomUUID();
  sessionStorage.setItem(storageKey, JSON.stringify({ key, workspace, item }));
  return `/checkout?buy=${key}`;
}

export function readDirectOrder(workspace: string, key: string) {
  try {
    const draft = JSON.parse(sessionStorage.getItem(storageKey) ?? 'null');
    if (draft?.key !== key || draft.workspace !== workspace) return null;
    return productInput(draft.item);
  } catch {
    return null;
  }
}
