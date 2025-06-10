export interface DayEntry {
  id?: string;
  date: string; // YYYY-MM-DD format
  afternoon_checkin: boolean; // 3:00 PM check-in
  evening_checkin: boolean; // 8:45 PM check-in
  afternoon_had_drink: boolean;
  evening_had_drink: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface WeekData {
  weekStart: string;
  weekEnd: string;
  entries: DayEntry[];
  cleanDays: number;
  totalCheckins: number;
  percentage: number;
  isComplete: boolean;
  reward?: WeeklyReward;
}

export interface MonthData {
  month: string;
  year: number;
  cleanDays: number;
  totalCheckins: number;
  percentage: number;
  weeks: WeekData[];
}

export interface WeeklyReward {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface NotificationSettings {
  enabled: boolean;
  afternoonTime: string; // "15:00"
  eveningTime: string; // "20:45"
}