// src/components/CheckInCard.tsx

import React, { useState, useEffect } from "react";
import { Check, X, Clock, Sun, Moon, AlertTriangle } from "lucide-react";
import { DayEntry } from "../types";

interface CheckInCardProps {
	todayEntry: DayEntry | null;
	onCheckIn: (period: "afternoon" | "evening", hadFizzyDrink: boolean) => void;
}

export const CheckInCard: React.FC<CheckInCardProps> = ({
	todayEntry,
	onCheckIn,
}) => {
	const [now, setNow] = useState(new Date());

	useEffect(() => {
		// This timer updates the component every minute to check grace periods.
		const timerId = setInterval(() => setNow(new Date()), 60000);
		return () => clearInterval(timerId);
	}, []);

	// --- Check-in Status & Time Logic ---
	const needsAfternoonCheckin = !todayEntry?.afternoon_checkin;
	const needsEveningCheckin = !todayEntry?.evening_checkin;

	const afternoonCheckinTime = new Date(now);
	afternoonCheckinTime.setHours(15, 0, 0, 0); // 3:00 PM

	const afternoonGraceEnd = new Date(now);
	afternoonGraceEnd.setHours(16, 0, 0, 0); // Grace period ends at 4:00 PM

	const eveningCheckinTime = new Date(now);
	eveningCheckinTime.setHours(20, 45, 0, 0); // 8:45 PM

	const eveningGraceEnd = new Date(now);
	eveningGraceEnd.setHours(21, 45, 0, 0); // Grace period ends at 9:45 PM

	// --- RENDER LOGIC BY PRIORITY ---

	// Priority 1: Is there an active check-in window RIGHT NOW?
	const isAfternoonActive =
		needsAfternoonCheckin &&
		now >= afternoonCheckinTime &&
		now <= afternoonGraceEnd;
	const isEveningActive =
		needsEveningCheckin && now >= eveningCheckinTime && now <= eveningGraceEnd;

	if (isAfternoonActive || isEveningActive) {
		const period = isEveningActive ? "evening" : "afternoon";
		const timeLabel = isEveningActive ? "8:45 PM" : "3:00 PM";
		const IconComponent = isEveningActive ? Moon : Sun;
		const iconColor = isEveningActive ? "text-indigo-600" : "text-yellow-600";
		const title = isEveningActive ? "Evening Check-in" : "Afternoon Check-in";

		return (
			<div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-6 border border-blue-100">
				<div className="flex items-center justify-between mb-4">
					<div className="flex items-center">
						<IconComponent className={`mr-3 ${iconColor}`} size={24} />
						<div>
							<h2 className="text-xl font-bold text-gray-800">{title}</h2>
							<p className="text-sm text-gray-600">{timeLabel}</p>
						</div>
					</div>
					<div className="flex items-center text-sm text-gray-500">
						<Clock size={16} className="mr-1" />
						{now.toLocaleTimeString("en-US", {
							hour: "2-digit",
							minute: "2-digit",
							hour12: true,
						})}
					</div>
				</div>

				{isEveningActive && todayEntry?.afternoon_checkin && (
					<div className="mb-4 p-3 bg-white rounded-lg border">
						<div className="flex items-center justify-between">
							<div className="flex items-center">
								<Sun size={16} className="text-yellow-600 mr-2" />
								<span className="text-sm font-medium">3:00 PM Check-in</span>
							</div>
							<div className="flex items-center">
								{todayEntry.afternoon_had_drink ? (
									<>
										<X size={16} className="text-red-600 mr-1" />
										<span className="text-sm text-red-600">Had drink</span>
									</>
								) : (
									<>
										<Check size={16} className="text-green-600 mr-1" />
										<span className="text-sm text-green-600">Stayed clean</span>
									</>
								)}
							</div>
						</div>
					</div>
				)}
				<div className="text-center mb-6">
					<h3 className="text-lg font-semibold mb-2 text-gray-800">
						Did you have any fizzy drinks since your last check-in?
					</h3>
					<p className="text-gray-600 text-sm">
						Be honest with yourself - this is your journey to health
					</p>
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<button
						onClick={() => onCheckIn(period, false)}
						className="bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
					>
						<div className="flex flex-col items-center">
							<Check size={24} className="mb-2" />
							<span>No, stayed clean!</span>
						</div>
					</button>
					<button
						onClick={() => onCheckIn(period, true)}
						className="bg-red-500 hover:bg-red-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
					>
						<div className="flex flex-col items-center">
							<X size={24} className="mb-2" />
							<span>Yes, I had some</span>
						</div>
					</button>
				</div>
			</div>
		);
	}

	// Priority 2: If no active window, check if a check-in has been missed.
	const isAfternoonMissed =
		needsAfternoonCheckin &&
		now > afternoonGraceEnd &&
		now < eveningCheckinTime;
	const isEveningMissed = needsEveningCheckin && now > eveningGraceEnd;

	if (isAfternoonMissed || isEveningMissed) {
		const period = isEveningMissed ? "Evening" : "Afternoon";
		const Icon = isEveningMissed ? Moon : Sun;
		const iconColor = isEveningMissed ? "text-indigo-600" : "text-yellow-600";

		return (
			<div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-l-yellow-500">
				<div className="flex items-center justify-between mb-4">
					<div className="flex items-center">
						<Icon className={`mr-3 ${iconColor}`} size={24} />
						<div>
							<h2 className="text-xl font-bold text-gray-800">
								{period} Check-in Missed
							</h2>
							<p className="text-sm text-gray-600">
								The check-in window has closed.
							</p>
						</div>
					</div>
				</div>
				<div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
					<div className="flex items-start">
						<AlertTriangle className="text-yellow-600 mr-3 mt-0.5" size={20} />
						<div>
							<p className="text-sm font-medium text-yellow-800 mb-1">
								Don't worry, just get the next one!
							</p>
							<p className="text-sm text-yellow-700">
								Consistency is key. Missing one check-in doesn't erase your
								progress. Focus on being ready for your next one to keep your
								journey going.
							</p>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// Priority 3: Handle completed or waiting states.
	if (!needsAfternoonCheckin && !needsEveningCheckin) {
		// Both check-ins are done for the day.
		const totalHadDrinks =
			(todayEntry.afternoon_had_drink ? 1 : 0) +
			(todayEntry.evening_had_drink ? 1 : 0);
		return (
			<div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-l-blue-500">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-xl font-bold text-gray-800">
						Today's Check-ins Complete
					</h2>
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
					<div
						className={`p-4 rounded-lg border-2 bg-green-50 border-green-200`}
					>
						<div className="flex items-center justify-between mb-2">
							<div className="flex items-center">
								<Sun size={16} className="text-yellow-600 mr-2" />
								<span className="font-medium text-sm">3:00 PM</span>
							</div>
							{todayEntry.afternoon_had_drink ? (
								<X size={16} className="text-red-600" />
							) : (
								<Check size={16} className="text-green-600" />
							)}
						</div>
						<p className="text-xs text-gray-600">
							{todayEntry.afternoon_had_drink ? "Had drink" : "Stayed clean"}
						</p>
					</div>
					<div
						className={`p-4 rounded-lg border-2 ${
							todayEntry.evening_had_drink
								? "bg-red-50 border-red-200"
								: "bg-green-50 border-green-200"
						}`}
					>
						<div className="flex items-center justify-between mb-2">
							<div className="flex items-center">
								<Moon size={16} className="text-indigo-600 mr-2" />
								<span className="font-medium text-sm">8:45 PM</span>
							</div>
							{todayEntry.evening_had_drink ? (
								<X size={16} className="text-red-600" />
							) : (
								<Check size={16} className="text-green-600" />
							)}
						</div>
						<p className="text-xs text-gray-600">
							{todayEntry.evening_had_drink ? "Had drink" : "Stayed clean"}
						</p>
					</div>
				</div>
				<div className="text-center py-4">
					<div
						className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3 ${
							totalHadDrinks === 0
								? "bg-green-100 text-green-600"
								: totalHadDrinks === 1
								? "bg-yellow-100 text-yellow-600"
								: "bg-red-100 text-red-600"
						}`}
					>
						{totalHadDrinks === 0 ? <Check size={24} /> : <X size={24} />}
					</div>
					<h3 className="text-lg font-semibold mb-2">
						{totalHadDrinks === 0
							? "Perfect day! Both check-ins clean!"
							: totalHadDrinks === 1
							? "One slip, but you checked in honestly"
							: "Tough day, but tomorrow is a fresh start"}
					</h3>
					<p className="text-gray-600 text-sm">
						{totalHadDrinks === 0
							? "You're building incredible momentum!"
							: "Every honest check-in is progress. Keep going!"}
					</p>
				</div>
			</div>
		);
	}

	// Default Fallback: It's a new day, waiting for the first check-in, OR afternoon is done and waiting for evening.
	if (!needsAfternoonCheckin && now < eveningCheckinTime) {
		// Afternoon is done, waiting for evening.
		return (
			<div className="bg-white rounded-2xl shadow-lg p-6">
				<div className="flex items-center mb-4">
					<Moon className="text-indigo-600 mr-3" size={24} />
					<div>
						<h2 className="text-xl font-bold text-gray-800">
							Next Up: Evening
						</h2>
						<p className="text-sm text-gray-600">
							Your next check-in is at 8:45 PM.
						</p>
					</div>
				</div>
				<div
					className={`p-4 rounded-lg border-2 ${
						todayEntry.afternoon_had_drink
							? "bg-red-50 border-red-200"
							: "bg-green-50 border-green-200"
					}`}
				>
					<div className="flex items-center justify-between mb-2">
						<div className="flex items-center">
							<Sun size={16} className="text-yellow-600 mr-2" />
							<span className="font-medium text-sm">
								Afternoon Check-in: Complete
							</span>
						</div>
						{todayEntry.afternoon_had_drink ? (
							<X size={16} className="text-red-600" />
						) : (
							<Check size={16} className="text-green-600" />
						)}
					</div>
					<p className="text-xs text-gray-600">
						{todayEntry.afternoon_had_drink
							? "Result: Had a fizzy drink."
							: "Result: Stayed clean. Great job!"}
					</p>
				</div>
			</div>
		);
	}

	// It's before 3 PM, waiting for the first check-in.
	return (
		<div className="bg-white rounded-2xl shadow-lg p-6 text-center">
			<div className="flex justify-center items-center mb-4">
				<Sun className="text-yellow-500 mr-3" size={28} />
				<h2 className="text-xl font-bold text-gray-800">
					Get Ready for Today!
				</h2>
			</div>
			<p className="text-gray-600 mb-2">
				Your first check-in is for the afternoon.
			</p>
			<div className="inline-flex items-center justify-center p-3 bg-gray-100 rounded-lg">
				<Clock size={20} className="text-blue-600 mr-2" />
				<p className="font-medium text-gray-800">
					Check-in window opens at 3:00 PM
				</p>
			</div>
			<p className="text-sm text-gray-500 mt-4">
				Focus on your goal until then. You can do it!
			</p>
		</div>
	);
};
