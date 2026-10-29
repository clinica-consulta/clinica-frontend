import { useSyncExternalStore } from "react";

/**
 * Busca do cabeçalho: guarda o texto para a tela de destino usar como filtro inicial.
 * O contador força a tela a recomeçar quando a busca aponta para a página já aberta.
 */
let pending: { path: string; text: string } | null = null;
let version = 0;
const listeners = new Set<() => void>();

export function handOffSearch(path: string, text: string) {
  pending = { path, text };
  version += 1;
  listeners.forEach((listener) => listener());
}

/** Lê o texto deixado para esta tela. Ele vale só para a abertura atual da tela. */
export function takeSearch(path: string) {
  if (pending?.path !== path) return "";
  const current = pending;
  // Limpa depois da renderização, para as duas leituras do modo estrito do React verem o mesmo texto.
  setTimeout(() => {
    if (pending === current) pending = null;
  }, 0);
  return current.text;
}

export function useSearchVersion() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => version,
    () => 0,
  );
}
