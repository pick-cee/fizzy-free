export class NotificationManager {
  private static instance: NotificationManager;

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      return false;
    }
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  // FIX: A simple test function that does NOT rely on the service worker for display.
  // This makes the test button reliable.
  testNotification(): void {
    if (Notification.permission === 'granted') {
      new Notification('Test Notification', {
        body: 'If you see this, notifications are working!',
        icon: '/vite.svg',
        tag: 'fizzy-tracker-test',
      });
    } else {
      console.warn('Cannot send test notification: Permission not granted.');
      alert('Notification permission has not been granted. Please enable it in the settings.');
    }
  }

  async scheduleNotifications(): Promise<void> {
    const registration = await navigator.serviceWorker.ready;

    // Clear any previously scheduled notifications to avoid duplicates
    const existingNotifications = await registration.getNotifications({ tag: 'fizzy-tracker-reminder' });
    existingNotifications.forEach(notification => notification.close());

    const TimestampTrigger = window.TimestampTrigger;
    const supportsScheduling = !!TimestampTrigger;

    for (let i = 0; i < 7; i++) {
      const afternoonTime = new Date();
      afternoonTime.setDate(afternoonTime.getDate() + i);
      afternoonTime.setHours(15, 0, 0, 0);

      const eveningTime = new Date();
      eveningTime.setDate(eveningTime.getDate() + i);
      eveningTime.setHours(20, 45, 0, 0);

      if (afternoonTime.getTime() > Date.now()) {
        this.showScheduledNotification(
          'Afternoon Check-in',
          'Time for your 3:00 PM check-in!',
          supportsScheduling && TimestampTrigger ? new TimestampTrigger(afternoonTime.getTime()) : undefined
        );
      }

      if (eveningTime.getTime() > Date.now()) {
        this.showScheduledNotification(
          'Evening Check-in',
          'Time for your 8:45 PM check-in!',
          supportsScheduling && TimestampTrigger ? new TimestampTrigger(eveningTime.getTime()) : undefined
        );
      }
    }
  }

  // This function is now only for scheduled notifications via the service worker.
  private async showScheduledNotification(title: string, body: string, trigger?: TimestampTrigger): Promise<void> {
    try {
      const registration = await navigator.serviceWorker.ready;
      const options: NotificationOptions = {
        body,
        icon: '/vite.svg',
        badge: '/vite.svg',
        tag: 'fizzy-tracker-reminder',
        showTrigger: trigger,
      };
      await registration.showNotification(title, options);
    } catch (e) {
      console.error('Error showing scheduled notification: ', e);
    }
  }
}