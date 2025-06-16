import React from "react";
import {
	BarChart3,
	TrendingUp,
	TrendingDown,
	Minus,
	Trophy,
	ShieldAlert,
} from "lucide-react";
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

	const getTrendIcon = (
		trend: "Improving" | "Declining" | "Steady" | "N/A"
	) => {
		switch (trend) {
			case "Improving":
				return <TrendingUp className="text-green-600" size={24} />;
			case "Declining":
				return <TrendingDown className="text-red-600" size={24} />;
			case "Steady":
				return <Minus className="text-gray-600" size={24} />;
			default:
				return null;
		}
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
						{/* FIX: Add overflow-hidden to the container div */}
						<div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
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

			<div>
				<h4 className="font-semibold text-gray-700 text-sm mb-3">
					Monthly Insights
				</h4>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{monthData.bestWeek && (
						<div className="bg-green-50 p-4 rounded-lg flex items-center">
							<div className="bg-green-100 p-2 rounded-full mr-3">
								<Trophy className="text-green-600" size={20} />
							</div>
							<div>
								<p className="font-semibold text-sm text-green-800">
									Best Week
								</p>
								<p className="text-xs text-green-700">
									{/* FIX: Add timeZone: 'UTC' to prevent date shifting */}
									Week of{" "}
									{new Date(monthData.bestWeek.weekStart).toLocaleDateString(
										"en-US",
										{ month: "short", day: "numeric", timeZone: "UTC" }
									)}{" "}
									was your strongest!
								</p>
							</div>
						</div>
					)}
					{monthData.trend !== "N/A" && (
						<div className="bg-blue-50 p-4 rounded-lg flex items-center">
							<div className="bg-blue-100 p-2 rounded-full mr-3">
								{getTrendIcon(monthData.trend)}
							</div>
							<div>
								<p className="font-semibold text-sm text-blue-800">
									Monthly Trend
								</p>
								<p className="text-xs text-blue-700">
									Your progress is {monthData.trend.toLowerCase()} this month.
								</p>
							</div>
						</div>
					)}
					{monthData.missedCheckins > 0 && (
						<div className="bg-yellow-50 p-4 rounded-lg flex items-center md:col-span-2">
							<div className="bg-yellow-100 p-2 rounded-full mr-3">
								<ShieldAlert className="text-yellow-600" size={20} />
							</div>
							<div>
								<p className="font-semibold text-sm text-yellow-800">
									Missed Check-ins
								</p>
								<p className="text-xs text-yellow-700">
									You missed a total of {monthData.missedCheckins} check-ins
									this month.
								</p>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};
