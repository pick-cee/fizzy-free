import React, { useState, useEffect } from 'react';
import { Bell, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { NotificationManager } from '../utils/notifications';

export const ReminderSettings: React.FC = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setPermission(Notification.permission);
    setNotificationsEnabled(Notification.permission === 'granted');
  }, []);

  const handleEnableNotifications = async () => {
    setIsLoading(true);
    
    try {
      const notificationManager = NotificationManager.getInstance();
      const granted = await notificationManager.requestPermission();
      
      if (granted) {
        setNotificationsEnabled(true);
        setPermission('granted');
        
        // Schedule notifications
        notificationManager.scheduleNotifications();
        
        // Show test notification
        setTimeout(() => {
          notificationManager.testNotification();
        }, 1000);
      } else {
        setPermission('denied');
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = () => {
    const notificationManager = NotificationManager.getInstance();
    notificationManager.testNotification();
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center mb-6">
        <Bell className="text-indigo-600 mr-3" size={24} />
        <div>
          <h3 className="font-bold text-gray-800">Daily Reminders</h3>
          <p className="text-sm text-gray-600">Get notified for your check-ins</p>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
          <div className="flex items-center">
            <Clock size={20} className="text-orange-600 mr-3" />
            <div>
              <p className="font-medium text-gray-800">3:00 PM</p>
              <p className="text-sm text-gray-600">Afternoon check-in reminder</p>
            </div>
          </div>
          <div className={`w-3 h-3 rounded-full ${notificationsEnabled ? 'bg-green-500' : 'bg-gray-300'}`}></div>
        </div>

        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
          <div className="flex items-center">
            <Clock size={20} className="text-indigo-600 mr-3" />
            <div>
              <p className="font-medium text-gray-800">8:45 PM</p>
              <p className="text-sm text-gray-600">Evening check-in reminder</p>
            </div>
          </div>
          <div className={`w-3 h-3 rounded-full ${notificationsEnabled ? 'bg-green-500' : 'bg-gray-300'}`}></div>
        </div>
      </div>

      {permission === 'default' && (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="text-blue-600 mr-3 mt-0.5" size={20} />
              <div>
                <p className="text-sm font-medium text-blue-800 mb-1">Enable Notifications</p>
                <p className="text-sm text-blue-700">
                  Get timely reminders for your daily check-ins to stay consistent with your recovery journey.
                </p>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleEnableNotifications}
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Setting up notifications...
              </>
            ) : (
              <>
                <Bell className="mr-2" size={20} />
                Enable Notifications
              </>
            )}
          </button>
        </div>
      )}

      {permission === 'granted' && (
        <div className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="text-green-600 mr-3" size={20} />
              <div>
                <p className="text-sm font-medium text-green-800">Notifications Active</p>
                <p className="text-sm text-green-700">
                  You'll receive daily reminders at 3:00 PM and 8:45 PM. Stay consistent!
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleTestNotification}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            <Bell className="mr-2" size={20} />
            Test Notification
          </button>
        </div>
      )}

      {permission === 'denied' && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="text-red-600 mr-3 mt-0.5" size={20} />
            <div>
              <p className="text-sm font-medium text-red-800 mb-1">Notifications Blocked</p>
              <p className="text-sm text-red-700">
                Notifications are currently blocked. To enable them, please allow notifications in your browser settings and refresh the page.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-700 text-sm mb-2">💡 Pro Tips</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Notifications work even when the app is closed</li>
          <li>• Set your phone to allow notifications from this website</li>
          <li>• Consistent check-ins lead to better recovery outcomes</li>
        </ul>
      </div>
    </div>
  );
};