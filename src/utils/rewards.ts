import { WeeklyReward } from '../types';

export const WEEKLY_REWARDS: Omit<WeeklyReward, 'id' | 'unlocked' | 'unlockedAt'>[] = [
  {
    title: "First Steps",
    description: "You completed your first week of tracking! Every journey begins with a single step.",
    icon: "👟",
    color: "from-green-400 to-green-600"
  },
  {
    title: "Building Momentum",
    description: "Two weeks strong! You're developing healthy habits that will last a lifetime.",
    icon: "🚀",
    color: "from-blue-400 to-blue-600"
  },
  {
    title: "Consistency Champion",
    description: "Three weeks of dedication! Your commitment is truly inspiring.",
    icon: "🏆",
    color: "from-yellow-400 to-yellow-600"
  },
  {
    title: "Monthly Milestone",
    description: "One month of progress! You've proven that change is possible.",
    icon: "🎯",
    color: "from-purple-400 to-purple-600"
  },
  {
    title: "Habit Master",
    description: "Five weeks! You're well on your way to making this a permanent lifestyle change.",
    icon: "⭐",
    color: "from-indigo-400 to-indigo-600"
  },
  {
    title: "Transformation Leader",
    description: "Six weeks of growth! You're becoming the person you want to be.",
    icon: "🌟",
    color: "from-pink-400 to-pink-600"
  },
  {
    title: "Wellness Warrior",
    description: "Seven weeks strong! Your dedication to health is remarkable.",
    icon: "⚡",
    color: "from-orange-400 to-orange-600"
  },
  {
    title: "Two Month Hero",
    description: "Eight weeks of commitment! You're an inspiration to others on similar journeys.",
    icon: "🦸",
    color: "from-red-400 to-red-600"
  },
  {
    title: "Lifestyle Legend",
    description: "Nine weeks! You've created lasting change that will benefit you for years to come.",
    icon: "👑",
    color: "from-emerald-400 to-emerald-600"
  },
  {
    title: "Perfect Ten",
    description: "Ten weeks of excellence! You've achieved something truly special.",
    icon: "💎",
    color: "from-cyan-400 to-cyan-600"
  }
];

export const getRewardForWeek = (weekNumber: number): Omit<WeeklyReward, 'id' | 'unlocked' | 'unlockedAt'> => {
  if (weekNumber <= WEEKLY_REWARDS.length) {
    return WEEKLY_REWARDS[weekNumber - 1];
  }
  
  // For weeks beyond our predefined rewards, generate dynamic ones
  const dynamicRewards = [
    { icon: "🔥", color: "from-red-400 to-red-600", title: "On Fire", description: "Your streak is incredible! Keep the momentum going." },
    { icon: "💪", color: "from-blue-400 to-blue-600", title: "Strength Builder", description: "You're stronger than you know. Amazing progress!" },
    { icon: "🌈", color: "from-purple-400 to-purple-600", title: "Rainbow Warrior", description: "You bring color and positivity to your health journey!" },
    { icon: "🎨", color: "from-pink-400 to-pink-600", title: "Life Artist", description: "You're painting a masterpiece with your healthy choices!" }
  ];
  
  const rewardIndex = (weekNumber - WEEKLY_REWARDS.length - 1) % dynamicRewards.length;
  return {
    ...dynamicRewards[rewardIndex],
    title: `${dynamicRewards[rewardIndex].title} - Week ${weekNumber}`,
    description: `Week ${weekNumber}: ${dynamicRewards[rewardIndex].description}`
  };
};