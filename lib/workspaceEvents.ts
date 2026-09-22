const CHANGE_EVENT = 'veelion:workspace-changed';
const STORAGE_KEY = 'veelion:workspace-revision';
export function notifyWorkspaceChanged() {
  window.dispatchEvent(new Event(CHANGE_EVENT));
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ time: Date.now(), nonce: Math.random() }));
  } catch {
    /* Same-tab notifications still work when storage is unavailable. */
  }
}
export function subscribeToWorkspaceChanges(refresh: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) refresh();
  };
  window.addEventListener(CHANGE_EVENT, refresh);
  window.addEventListener('storage', onStorage);
  window.addEventListener('focus', refresh);
  return () => {
    window.removeEventListener(CHANGE_EVENT, refresh);
    window.removeEventListener('storage', onStorage);
    window.removeEventListener('focus', refresh);
  };
}
