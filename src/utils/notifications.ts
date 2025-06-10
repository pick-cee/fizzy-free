/* eslint-disable @typescript-eslint/no-explicit-any */
export class NotificationManager {
  private static instance: NotificationManager;

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window) || !navigator.serviceWorker) {
      console.warn('This browser does not support notifications.');
      return false;
    }
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  async scheduleNotifications(): Promise<void> {
    if (Notification.permission !== 'granted') {
      console.log('Notification permission not granted.');
      return;
    }

    const registration = await navigator.serviceWorker.ready;

    // Clear any previously scheduled notifications
    const scheduledNotifications = await registration.getNotifications({ tag: 'fizzy-tracker-reminder' });
    scheduledNotifications.forEach(notification => notification.close());

    // Check for modern scheduling support
    const supportsScheduling = 'showTrigger' in Notification.prototype;

    // Schedule notifications for the next 7 days
    for (let i = 0; i < 7; i++) {
      const afternoonTime = new Date();
      afternoonTime.setDate(afternoonTime.getDate() + i);
      afternoonTime.setHours(15, 0, 0, 0);

      const eveningTime = new Date();
      eveningTime.setDate(eveningTime.getDate() + i);
      eveningTime.setHours(20, 45, 0, 0);

      const now = Date.now();

      if (afternoonTime.getTime() > now) {
        this.showNotification(
          'Afternoon Check-in',
          'Time for your 3:00 PM check-in! How are you doing today?',
          supportsScheduling ? new (window as any).TimestampTrigger(afternoonTime.getTime()) : undefined
        );
      }

      if (eveningTime.getTime() > now) {
        this.showNotification(
          'Evening Check-in',
          'Time for your 8:45 PM check-in! Finish strong today!',
          supportsScheduling ? new (window as any).TimestampTrigger(eveningTime.getTime()) : undefined
        );
      }
    }

    if (supportsScheduling) {
      console.log('Successfully scheduled notifications using TimestampTrigger.');
    } else {
      console.log('Browser does not support scheduling, notifications will only appear if the app is open.');
    }
  }

  async showNotification(title: string, body: string, trigger?: any): Promise<void> {
    const registration = await navigator.serviceWorker.ready;
    const options: NotificationOptions = {
      body,
      icon: '/vite.svg',
      badge: '/vite.svg',
      tag: 'fizzy-tracker-reminder',
    };

    if (trigger) {
      options.showTrigger = trigger;
    }

    await registration.showNotification(title, options);
  }

  async testNotification(): Promise<void> {
    if (Notification.permission === 'granted') {
      this.showNotification('Test Notification', 'If you see this, notifications are working!');
    } else {
      alert('Notification permission is not granted. Please enable it first.');
    }
  }
}