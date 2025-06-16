import React, { useState, useEffect } from "react";
import { Droplets, BarChart3, Settings, Home, AlertCircle } from "lucide-react";
import { useTracker } from "./hooks/useTracker";
import { CheckInCard } from "./components/CheckInCard";
import { StreakCard } from "./components/StreakCard";
import { WeekProgress } from "./components/WeekProgress";
import { MonthProgress } from "./components/MonthProgress";
import { ReminderSettings } from "./components/ReminderSettings";
import { WeekData, MonthData } from "./types";
import { PwaUpdater } from "./components/PwaUpdater";

type Tab = "home" | "progress" | "settings";

function App() {
	const [activeTab, setActiveTab] = useState<Tab>("home");
	const [currentWeekData, setCurrentWeekData] = useState<WeekData | null>(null);
	const [currentMonthData, setCurrentMonthData] = useState<MonthData | null>(
		null
	);

	const {
		currentStreak,
		longestStreak,
		getTodayEntry,
		checkIn,
		getCurrentWeekData,
		getCurrentMonthData,
		loading,
		error,
	} = useTracker();

	const todayEntry = getTodayEntry();

	useEffect(() => {
		const loadData = async () => {
			if (loading) return;
			try {
				const [weekData, monthData] = await Promise.all([
					getCurrentWeekData(),
					getCurrentMonthData(),
				]);
				setCurrentWeekData(weekData);
				setCurrentMonthData(monthData);
			} catch (err) {
				console.error("Error loading data:", err);
			}
		};
		loadData();
	}, [loading, getTodayEntry, getCurrentWeekData, getCurrentMonthData]);

	const handleCheckIn = async (
		period: "afternoon" | "evening",
		hadFizzyDrink: boolean
	) => {
		await checkIn(period, hadFizzyDrink);

		const [weekData, monthData] = await Promise.all([
			getCurrentWeekData(),
			getCurrentMonthData(),
		]);
		setCurrentWeekData(weekData);
		setCurrentMonthData(monthData);
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Loading your progress...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
				<div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
					<div className="flex items-center mb-4">
						<AlertCircle className="text-red-600 mr-3" size={24} />
						<h2 className="text-xl font-bold text-gray-800">
							Connection Issue
						</h2>
					</div>
					<p className="text-gray-600 mb-6">{error}</p>
					<button
						onClick={() => window.location.reload()}
						className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
					>
						Retry Connection
					</button>
				</div>
			</div>
		);
	}

	const renderContent = () => {
		switch (activeTab) {
			case "home":
				return (
					<div className="space-y-6">
						<CheckInCard todayEntry={todayEntry} onCheckIn={handleCheckIn} />
						<StreakCard
							currentStreak={currentStreak}
							longestStreak={longestStreak}
						/>
						{currentWeekData && <WeekProgress weekData={currentWeekData} />}
					</div>
				);
			case "progress":
				return (
					<div className="space-y-6">
						{currentMonthData && <MonthProgress monthData={currentMonthData} />}
						{currentWeekData && (
							<WeekProgress
								weekData={currentWeekData}
								title="Current Week Progress"
							/>
						)}
						<div className="bg-white rounded-2xl shadow-lg p-6">
							<h3 className="font-bold text-gray-800 mb-4">
								Journey Statistics
							</h3>
							<div className="grid grid-cols-2 gap-4">
								<div className="text-center p-4 bg-blue-50 rounded-lg">
									<div className="text-2xl font-bold text-blue-600">
										{currentStreak}
									</div>
									<div className="text-sm text-gray-600">Current Streak</div>
								</div>
								<div className="text-center p-4 bg-purple-50 rounded-lg">
									<div className="text-2xl font-bold text-purple-600">
										{longestStreak}
									</div>
									<div className="text-sm text-gray-600">Best Streak</div>
								</div>
							</div>
						</div>
					</div>
				);
			case "settings":
				return (
					<div className="space-y-6">
						<ReminderSettings />
						<div className="bg-white rounded-2xl shadow-lg p-6">
							<h3 className="font-bold text-gray-800 mb-4">
								About Your Journey
							</h3>
							<div className="space-y-4 text-sm text-gray-600">
								<p>
									This tracker helps you overcome fizzy drink addiction by
									providing:
								</p>
								<ul className="list-disc list-inside space-y-2 ml-4">
									<li>
										Dual daily check-ins (3:00 PM & 8:45 PM) for better
										accountability
									</li>
									<li>Cloud-based progress tracking that never gets lost</li>
									<li>Weekly rewards to celebrate your achievements</li>
									<li>Smart notifications to keep you consistent</li>
									<li>Visual progress tracking and motivation</li>
								</ul>
								<p className="font-medium text-gray-700">
									Remember: Recovery is a journey, not a destination. Every
									honest check-in is progress! 🌟
								</p>
							</div>
						</div>
					</div>
				);
			default:
				return null;
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
			<PwaUpdater />
			<header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-10">
				<div className="max-w-4xl mx-auto px-4 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center">
							<div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-full mr-3">
								<Droplets className="text-white" size={24} />
							</div>
							<div>
								<h1 className="text-lg sm:text-2xl font-bold text-gray-800">
									Fizzy Free Journey
								</h1>
								<p className="text-xs sm:text-sm text-gray-600">
									Your path to a healthier lifestyle
								</p>
							</div>
						</div>

						<div className="hidden sm:block text-right">
							<div className="text-sm text-gray-500">
								{new Date().toLocaleDateString("en-US", {
									weekday: "long",
									year: "numeric",
									month: "long",
									day: "numeric",
								})}
							</div>
						</div>
					</div>
				</div>
			</header>

			{/* FIX: Add padding-bottom to main content to avoid overlap with fixed nav */}
			<main className="max-w-4xl mx-auto px-4 py-8 pb-24">
				{renderContent()}
			</main>

			<nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
				<div className="max-w-4xl mx-auto">
					<div className="flex justify-around py-2">
						{[
							{ id: "home", icon: Home, label: "Home" },
							{ id: "progress", icon: BarChart3, label: "Progress" },
							{ id: "settings", icon: Settings, label: "Settings" },
						].map(({ id, icon: Icon, label }) => (
							<button
								key={id}
								onClick={() => setActiveTab(id as Tab)}
								className={`flex flex-col items-center justify-center w-full py-2 px-2 rounded-lg transition-all duration-200 ${
									activeTab === id
										? "text-blue-600 bg-blue-50"
										: "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
								}`}
							>
								<Icon size={20} className="mb-1" />
								<span className="text-xs font-medium">{label}</span>
							</button>
						))}
					</div>
				</div>
			</nav>

			{/* FIX: The spacer div is no longer needed as we added padding to <main> */}
		</div>
	);
}

export default App;
