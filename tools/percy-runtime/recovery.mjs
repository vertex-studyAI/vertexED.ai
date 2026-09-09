export function recoverInterruptedTasks(store) {
  if (!store || typeof store.recoverInterrupted !== 'function') {
    throw new TypeError('PercyStore with recoverInterrupted() required');
  }
  return store.recoverInterrupted();
}
