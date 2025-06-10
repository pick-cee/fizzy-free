/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import {
	Calendar,
	CheckCircle,
	XCircle,
	Clock,
	Gift,
	Star,
} from "lucide-react";
import { WeekData } from "../types";

interface WeekProgressProps {
	weekData: WeekData;
	title?: string;
}

export const WeekProgress: React.FC<WeekProgressProps> = ({
	weekData,
	title = "This Week",
}) => {
	const getProgressColor = (percentage: number) => {
		if (percentage >= 90) return "bg-green-500";
		if (percentage >= 70) return "bg-blue-500";
		if (percentage >= 50) return "bg-yellow-500";
		return "bg-red-500";
	};

	const getDayStatus = (entry: any) => {
		const afternoonStatus = entry.afternoon_checkin
			? entry.afternoon_had_drink
				? "bad"
				: "good"
			: "pending";
		const eveningStatus = entry.evening_checkin
			? entry.evening_had_drink
				? "bad"
				: "good"
			: "pending";

		return { afternoonStatus, eveningStatus };
	};

	const getStatusIcon = (status: string, size = 12) => {
		switch (status) {
			case "good":
				return <CheckCircle size={size} className="text-green-500 mx-auto" />;
			case "bad":
				return <XCircle size={size} className="text-red-500 mx-auto" />;
			default:
				return <Clock size={size} className="text-gray-400 mx-auto" />;
		}
	};

	return (
		<div className="bg-white rounded-2xl shadow-lg p-6">
			<div className="flex items-center justify-between mb-6">
				<div className="flex items-center">
					<Calendar className="text-blue-600 mr-3" size={24} />
					<div>
						<h3 className="font-bold text-gray-800">{title}</h3>
						<p className="text-sm text-gray-600">
							{new Date(weekData.weekStart).toLocaleDateString()} -{" "}
							{new Date(weekData.weekEnd).toLocaleDateString()}
						</p>
					</div>
				</div>

				<div className="text-right">
					<div className="text-2xl font-bold text-gray-800">
						{weekData.percentage.toFixed(0)}%
					</div>
					<p className="text-sm text-gray-600">success rate</p>
				</div>
			</div>

			{weekData.reward && (
				<div
					className={`mb-6 p-4 rounded-xl bg-gradient-to-r ${weekData.reward.color} text-white`}
				>
					<div className="flex items-center justify-between">
						<div className="flex items-center">
							<div className="text-2xl mr-3">{weekData.reward.icon}</div>
							<div>
								<h4 className="font-bold text-lg">{weekData.reward.title}</h4>
								<p className="text-sm opacity-90">
									{weekData.reward.description}
								</p>
							</div>
						</div>
						<Star className="text-yellow-300" size={24} />
					</div>
				</div>
			)}

			<div className="mb-6">
				<div className="flex justify-between text-sm text-gray-600 mb-2">
					<span>{weekData.cleanDays} clean check-ins</span>
					<span>{weekData.totalCheckins} total check-ins</span>
				</div>
				<div className="w-full bg-gray-200 rounded-full h-3">
					<div
						className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(
							weekData.percentage
						)}`}
						style={{ width: `${weekData.percentage}%` }}
					/>
				</div>
			</div>

			{/* FIX: Changed gap and padding for better mobile view */}
			<div className="grid grid-cols-7 gap-1 mb-4">
				{weekData.entries.map((entry) => {
					const date = new Date(entry.date);
					const dayName = date.toLocaleDateString("en-US", {
						weekday: "short",
					});
					const { afternoonStatus, eveningStatus } = getDayStatus(entry);

					return (
						<div
							key={entry.date}
							className="p-1 sm:p-2 rounded-lg border-2 border-gray-100 bg-gray-50"
						>
							<div className="text-center">
								<div className="text-xs font-medium text-gray-600 mb-1">
									{dayName}
								</div>
								<div className="text-sm font-bold text-gray-800 mb-2">
									{date.getDate()}
								</div>

								{/* FIX: Stacked time and icon vertically for better responsiveness */}
								<div className="space-y-2">
									<div className="text-center">
										<div className="text-xs text-gray-500">3PM</div>
										{getStatusIcon(afternoonStatus, 14)}
									</div>
									<div className="text-center">
										<div className="text-xs text-gray-500">8:45PM</div>
										{getStatusIcon(eveningStatus, 14)}
									</div>
								</div>
							</div>
						</div>
					);
				})}
			</div>

			<div className="p-4 bg-gray-50 rounded-lg">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-sm font-medium text-gray-700">
							{weekData.totalCheckins === 0
								? "No check-ins this week yet"
								: weekData.isComplete && weekData.percentage >= 70
								? "🎉 Excellent week! Reward earned!"
								: weekData.percentage === 100
								? "🎉 Perfect week! Keep it up!"
								: weekData.percentage >= 70
								? "Great progress this week!"
								: "Every check-in is progress. Keep going!"}
						</p>
						<p className="text-xs text-gray-500 mt-1">
							{14 - weekData.totalCheckins > 0 &&
								`${14 - weekData.totalCheckins} check-ins remaining`}
						</p>
					</div>

					{weekData.isComplete &&
						weekData.percentage >= 70 &&
						!weekData.reward && <Gift className="text-purple-600" size={20} />}
				</div>
			</div>
		</div>
	);
};
