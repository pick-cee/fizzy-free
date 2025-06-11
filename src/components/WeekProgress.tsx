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

	const getStatusIcon = (status: string, size = 14) => {
		switch (status) {
			case "good":
				return <CheckCircle size={size} className="text-green-500" />;
			case "bad":
				return <XCircle size={size} className="text-red-500" />;
			default:
				return <Clock size={size} className="text-gray-400" />;
		}
	};

	return (
		<div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
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
				<div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-2">
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

			<div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-4">
				{weekData.entries.map((entry) => {
					const date = new Date(entry.date);
					const dayName = date.toLocaleDateString("en-US", {
						weekday: "short",
					});
					const { afternoonStatus, eveningStatus } = getDayStatus(entry);

					return (
						<div
							key={entry.date}
							className="p-1 sm:p-2 rounded-lg border border-gray-100 bg-gray-50"
						>
							<div className="text-center">
								<div className="text-xs font-medium text-gray-600">
									{dayName}
								</div>
								<div className="text-sm sm:text-base font-bold text-gray-800 my-1">
									{date.getDate()}
								</div>

								{/* FIX: Using flex-col for better alignment and spacing. */}
								<div className="space-y-2 mt-1">
									<div className="flex flex-col items-center space-y-0.5">
										<span
											className="text-xs text-gray-500"
											style={{ fontSize: "0.6rem" }}
										>
											3PM
										</span>
										{getStatusIcon(afternoonStatus)}
									</div>
									<div className="flex flex-col items-center space-y-0.5">
										<span
											className="text-xs text-gray-500"
											style={{ fontSize: "0.6rem" }}
										>
											8:45PM
										</span>
										{getStatusIcon(eveningStatus)}
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
								? "No check-ins yet"
								: weekData.percentage === 100
								? "🎉 Perfect week! Keep it up!"
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
