import React from "react";
import { BarChart3, TrendingUp } from "lucide-react";
import { MonthData } from "../types";

interface MonthProgressProps {
	monthData: MonthData;
}

export const MonthProgress: React.FC<MonthProgressProps> = ({ monthData }) => {
	const getProgressColor = (percentage: number) => {
		if (percentage >= 90) return "from-green-400 to-green-600";
		if (percentage >= 70) return "from-blue-400 to-blue-600";
		if (percentage >= 50) return "from-yellow-400 to-yellow-600";
		return "from-red-400 to-red-600";
	};

	const getMotivationalMessage = (percentage: number) => {
		if (percentage >= 95) return "Outstanding dedication! 🎊";
		if (percentage >= 85) return "Excellent progress! ✨";
		if (percentage >= 70) return "Great job staying consistent! 👍";
		if (percentage >= 50) return "Good progress, keep pushing! 💪";
		return "Every step forward counts! 🚶";
	};

	return (
		<div className="bg-white rounded-2xl shadow-lg p-6">
			<div className="flex items-center justify-between mb-6">
				<div className="flex items-center">
					<BarChart3 className="text-purple-600 mr-3" size={24} />
					<div>
						<h3 className="font-bold text-gray-800">Monthly Overview</h3>
						<p className="text-sm text-gray-600">
							{monthData.month} {monthData.year}
						</p>
					</div>
				</div>
				<div className="text-right">
					<div className="text-3xl font-bold text-gray-800">
						{monthData.percentage.toFixed(0)}%
					</div>
					<p className="text-sm text-gray-600">success rate</p>
				</div>
			</div>

			<div className="flex justify-center mb-6">
				<div className="relative w-32 h-32">
					<svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
						<path
							d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
							fill="none"
							stroke="#e5e7eb"
							strokeWidth="3"
						/>
						<path
							d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
							fill="none"
							stroke="url(#gradient)"
							strokeWidth="3"
							strokeDasharray={`${monthData.percentage}, 100`}
							className="transition-all duration-1000"
						/>
						<defs>
							<linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
								<stop offset="0%" stopColor="#60a5fa" />
								<stop offset="100%" stopColor="#3b82f6" />
							</linearGradient>
						</defs>
					</svg>
					<div className="absolute inset-0 flex items-center justify-center">
						<div className="text-center">
							<div className="text-2xl font-bold text-gray-800">
								{monthData.cleanDays}
							</div>
							<div className="text-xs text-gray-600">clean check-ins</div>
						</div>
					</div>
				</div>
			</div>

			{/* FIX: Make stats grid responsive. */}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
				<div className="bg-blue-50 p-4 rounded-lg text-center">
					<div className="text-2xl font-bold text-blue-600">
						{monthData.cleanDays}
					</div>
					<div className="text-sm text-gray-600">Clean Check-ins</div>
				</div>
				<div className="bg-gray-50 p-4 rounded-lg text-center">
					<div className="text-2xl font-bold text-gray-600">
						{monthData.totalCheckins}
					</div>
					<div className="text-sm text-gray-600">Total Check-ins</div>
				</div>
			</div>

			<div className="space-y-3 mb-6">
				<h4 className="font-semibold text-gray-700 text-sm">
					Weekly Breakdown
				</h4>
				{monthData.weeks.map((week, index) => (
					<div key={week.weekStart} className="flex items-center space-x-3">
						<div className="text-xs text-gray-500 w-16">Week {index + 1}</div>
						<div className="flex-1 bg-gray-200 rounded-full h-2">
							<div
								className={`h-2 rounded-full bg-gradient-to-r ${getProgressColor(
									week.percentage
								)} transition-all duration-500`}
								style={{ width: `${week.percentage}%` }}
							/>
						</div>
						<div className="text-xs text-gray-600 w-12 text-right">
							{week.percentage.toFixed(0)}%
						</div>
					</div>
				))}
			</div>

			<div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-100">
				<div className="flex items-center">
					<TrendingUp className="text-blue-600 mr-2" size={20} />
					<p className="text-sm font-medium text-gray-700">
						{getMotivationalMessage(monthData.percentage)}
					</p>
				</div>
			</div>
		</div>
	);
};
