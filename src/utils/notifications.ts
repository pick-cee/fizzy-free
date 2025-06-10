export class NotificationManager {
  private static instance: NotificationManager;
  private scheduledNotifications: number[] = [];

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  scheduleNotifications(): void {
    this.clearScheduledNotifications();

    if (Notification.permission !== 'granted') {
      return;
    }

    this.scheduleRecurringNotifications();
  }

  private scheduleRecurringNotifications(): void {
    const scheduleForDate = (date: Date) => {
      const afternoonTime = new Date(date);
      afternoonTime.setHours(15, 0, 0, 0);

      const eveningTime = new Date(date);
      eveningTime.setHours(20, 45, 0, 0);

      const now = new Date();

      if (afternoonTime > now) {
        const timeoutId = window.setTimeout(() => {
          this.showNotification('Afternoon Check-in', 'Time for your 3:00 PM check-in! How are you doing today?', '🌅');
        }, afternoonTime.getTime() - now.getTime());
        this.scheduledNotifications.push(timeoutId);
      }

      if (eveningTime > now) {
        const timeoutId = window.setTimeout(() => {
          this.showNotification('Evening Check-in', 'Time for your 8:45 PM check-in! Finish strong today!', '🌙');
        }, eveningTime.getTime() - now.getTime());
        this.scheduledNotifications.push(timeoutId);
      }
    };

    scheduleForDate(new Date());

    for (let i = 1; i <= 7; i++) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + i);
      scheduleForDate(futureDate);
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 1, 0, 0);

    const timeUntilMidnight = tomorrow.getTime() - new Date().getTime();
    const midnightTimeout = window.setTimeout(() => {
      this.scheduleRecurringNotifications();
    }, timeUntilMidnight);

    this.scheduledNotifications.push(midnightTimeout);
  }

  private showNotification(title: string, body: string, icon?: string): void { //
    if (Notification.permission === 'granted') {
      const notification = new Notification(title, { //
        body,
        icon: '/vite.svg',
        badge: '/vite.svg',
        tag: 'fizzy-tracker',
        requireInteraction: true,
        // FIX: The 'actions' property is not supported in this context and was causing the error.
        // It has been removed. The 'onclick' handler below provides the same functionality.
      });

      notification.onclick = () => { //
        window.focus();
        notification.close();
      };

      setTimeout(() => notification.close(), 10000);
    }
  }

  clearScheduledNotifications(): void {
    this.scheduledNotifications.forEach(id => clearTimeout(id));
    this.scheduledNotifications = [];
  }

  testNotification(): void { //
    this.showNotification('Test Notification', 'Notifications are working! You\'ll receive reminders at 3:00 PM and 8:45 PM daily.', '✅'); //
  }
}