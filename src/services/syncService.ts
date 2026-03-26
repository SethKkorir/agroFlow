import { dataService } from './dataService';

/**
 * Sync Service
 * Manages background synchronization and network status monitoring.
 */
export const syncService = {
  init() {
    window.addEventListener('online', () => {
      console.log('App is online. Triggering sync...');
      dataService.triggerSync();
    });

    window.addEventListener('offline', () => {
      console.log('App is offline. Queueing changes...');
    });

    // Periodic sync attempt
    setInterval(() => {
      if (navigator.onLine) {
        dataService.triggerSync();
      }
    }, 60000); // Every minute
  }
};
