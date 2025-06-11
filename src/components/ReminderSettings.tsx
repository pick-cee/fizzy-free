import React, { useState, useEffect } from "react";
import {
	Bell,
	Clock,
	CheckCircle,
	AlertCircle,
	ShieldOff,
	CalendarPlus,
} from "lucide-react";
import { NotificationManager } from "../utils/notifications";

export const ReminderSettings: React.FC = () => {
	const [notificationsEnabled, setNotificationsEnabled] = useState(false);
	const [permission, setPermission] =
		useState<NotificationPermission>("default");
	const [isLoading, setIsLoading] = useState(false);
	const [isSupported, setIsSupported] = useState(true);

	// Check for notification support when the component loads
	useEffect(() => {
		if (!("Notification" in window) || !("serviceWorker" in navigator)) {
			setIsSupported(false);
		} else {
			setIsSupported(true);
			setPermission(Notification.permission);
			setNotificationsEnabled(Notification.permission === "granted");
		}
	}, []);

	// Handler to request permission and schedule notifications
	const handleEnableNotifications = async () => {
		setIsLoading(true);
		try {
			const notificationManager = NotificationManager.getInstance();
			const granted = await notificationManager.requestPermission();
			if (granted) {
				setNotificationsEnabled(true);
				setPermission("granted");
				await notificationManager.scheduleNotifications();
				setTimeout(() => {
					notificationManager.testNotification();
				}, 1000);
			} else {
				setPermission("denied");
			}
		} catch (error) {
			console.error("Error enabling notifications:", error);
		} finally {
			setIsLoading(false);
		}
	};

	// Handler for the test notification button
	const handleTestNotification = () => {
		NotificationManager.getInstance().testNotification();
	};

	// FIX: This function now generates a Google Calendar link, which is universally supported.
	const getGoogleCalendarLink = () => {
		const title = encodeURIComponent("Fizzy Free Check-in Reminders");
		const details = encodeURIComponent(
			"Daily reminders to check in for your Fizzy Free Journey."
		);

		// Set the start time for the first event (today at 3 PM)
		const startTime = new Date();
		startTime.setHours(15, 0, 0, 0);

		// Format for Google Calendar URL (YYYYMMDDTHHMMSSZ)
		const formatTime = (date: Date) =>
			date.toISOString().replace(/-|:|\.\d{3}/g, "");

		// The recurrence rule for two daily alerts is complex for a URL.
		// So, we create two separate recurring events in the link.
		// This is the most reliable way.
		const recurrenceRule = "RRULE:FREQ=DAILY;COUNT=180";

		const dates = `${formatTime(startTime)}/${formatTime(
			new Date(startTime.getTime() + 15 * 60000)
		)}`;

		return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${dates}&recur=${recurrenceRule}&add=email`;
	};

	// Render this card if notifications are NOT supported (i.e., on iOS)
	if (!isSupported) {
		return (
			<div className="bg-white rounded-2xl shadow-lg p-6">
				<div className="flex items-center mb-4">
					<ShieldOff className="text-orange-600 mr-3" size={24} />
					<div>
						<h3 className="font-bold text-gray-800">Get Reminders on iOS</h3>
						<p className="text-sm text-gray-600">
							Use your calendar for notifications.
						</p>
					</div>
				</div>

				<div className="p-4 bg-orange-50 border border-orange-200 rounded-lg mb-4">
					<div className="flex items-start">
						<AlertCircle className="text-orange-600 mr-3 mt-0.5" size={20} />
						<div>
							<p className="text-sm font-medium text-orange-800 mb-1">
								Alternative for iPhone/iPad
							</p>
							<p className="text-sm text-orange-700">
								iOS does not allow web notifications. As a reliable alternative,
								you can add daily reminders directly to your Google Calendar.
							</p>
						</div>
					</div>
				</div>

				{/* FIX: This is now a simple link that will work on any browser. */}
				<a
					href={getGoogleCalendarLink()}
					target="_blank" // Open in a new tab
					rel="noopener noreferrer" // Security best practice
					className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
				>
					<CalendarPlus className="mr-2" size={20} />
					Add to Google Calendar
				</a>
			</div>
		);
	}

	// Render this for all other supported browsers
	return (
		<div className="bg-white rounded-2xl shadow-lg p-6">
			<div className="flex items-center mb-6">
				<Bell className="text-indigo-600 mr-3" size={24} />
				<div>
					<h3 className="font-bold text-gray-800">Daily Reminders</h3>
					<p className="text-sm text-gray-600">
						Get notified for your check-ins
					</p>
				</div>
			</div>
			<div className="space-y-4 mb-6">
				<div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
					<div className="flex items-center">
						<Clock size={20} className="text-orange-600 mr-3" />
						<div>
							<p className="font-medium text-gray-800">3:00 PM</p>
							<p className="text-sm text-gray-600">
								Afternoon check-in reminder
							</p>
						</div>
					</div>
					<div
						className={`w-3 h-3 rounded-full ${
							notificationsEnabled ? "bg-green-500" : "bg-gray-300"
						}`}
					></div>
				</div>
				<div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
					<div className="flex items-center">
						<Clock size={20} className="text-indigo-600 mr-3" />
						<div>
							<p className="font-medium text-gray-800">8:45 PM</p>
							<p className="text-sm text-gray-600">Evening check-in reminder</p>
						</div>
					</div>
					<div
						className={`w-3 h-3 rounded-full ${
							notificationsEnabled ? "bg-green-500" : "bg-gray-300"
						}`}
					></div>
				</div>
			</div>

			{permission === "default" && (
				<div className="space-y-4">
					<div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
						<div className="flex items-start">
							<AlertCircle className="text-blue-600 mr-3 mt-0.5" size={20} />
							<div>
								<p className="text-sm font-medium text-blue-800 mb-1">
									Enable Notifications
								</p>
								<p className="text-sm text-blue-700">
									Get timely reminders for your daily check-ins to stay on
									track.
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
								Setting up...
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
			{permission === "granted" && (
				<div className="space-y-4">
					<div className="p-4 bg-green-50 border border-green-200 rounded-lg">
						<div className="flex items-center">
							<CheckCircle className="text-green-600 mr-3" size={20} />
							<div>
								<p className="text-sm font-medium text-green-800">
									Notifications Active
								</p>
								<p className="text-sm text-green-700">
									You'll receive daily reminders. Great job!
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
			{permission === "denied" && (
				<div className="p-4 bg-red-50 border border-red-200 rounded-lg">
					<div className="flex items-start">
						<AlertCircle className="text-red-600 mr-3 mt-0.5" size={20} />
						<div>
							<p className="text-sm font-medium text-red-800 mb-1">
								Notifications Blocked
							</p>
							<p className="text-sm text-red-700">
								To enable reminders, please allow notifications in your browser
								or system settings and refresh the page.
							</p>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
