// This will hold IDs for setTimeout fallbacks
const timeoutIds: number[] = [];

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
    return await Notification.requestPermission() === 'granted';
  }

  testNotification(): void {
    if (Notification.permission === 'granted') {
      new Notification('Test Notification', {
        body: 'If you see this, notifications are working!',
        icon: '/vite.svg',
        tag: 'fizzy-tracker-test',
      });
    } else {
      alert('Notification permission has not been granted.');
    }
  }

  async scheduleNotifications(): Promise<void> {
    const registration = await navigator.serviceWorker.ready;
    timeoutIds.forEach(clearTimeout);
    timeoutIds.length = 0;

    const existingNotifications = await registration.getNotifications({ tag: 'fizzy-tracker-reminder' });
    existingNotifications.forEach(notification => notification.close());

    const supportsScheduling = !!window.TimestampTrigger;

    for (let i = 0; i < 7; i++) {
      const afternoonTime = new Date();
      afternoonTime.setDate(afternoonTime.getDate() + i);
      afternoonTime.setHours(15, 0, 0, 0);

      const eveningTime = new Date();
      eveningTime.setDate(eveningTime.getDate() + i);
      eveningTime.setHours(20, 45, 0, 0);

      if (afternoonTime.getTime() > Date.now()) {
        this.createReminder('Afternoon Check-in', 'Time for your 3:00 PM check-in!', afternoonTime, supportsScheduling);
      }
      if (eveningTime.getTime() > Date.now()) {
        this.createReminder('Evening Check-in', 'Time for your 8:45 PM check-in!', eveningTime, supportsScheduling);
      }
    }
  }

  private createReminder(title: string, body: string, time: Date, useScheduling: boolean): void {
    if (useScheduling && window.TimestampTrigger) {
      // Use modern, reliable scheduling
      this.showScheduledNotification(title, body, new window.TimestampTrigger(time.getTime()));
    } else {
      // FIX: Use setTimeout as a fallback for browsers that don't support scheduling
      const delay = time.getTime() - Date.now();
      if (delay > 0) {
        const id = window.setTimeout(() => {
          new Notification(title, { body, icon: '/vite.svg' });
        }, delay);
        timeoutIds.push(id);
      }
    }
  }

  private async showScheduledNotification(title: string, body: string, trigger?: TimestampTrigger): Promise<void> {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, {
        body,
        icon: '/vite.svg',
        badge: '/vite.svg',
        tag: 'fizzy-tracker-reminder',
        showTrigger: trigger,
      });
    } catch (e) {
      console.error('Error showing scheduled notification: ', e);
    }
  }
}