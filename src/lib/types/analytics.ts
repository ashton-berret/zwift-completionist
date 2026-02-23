export interface DashboardStats {
  totalRoutes: number;
  completedRoutes: number;
  completionPercentage: number;
  totalDistanceRidden: number;
  totalDistanceAvailable: number;
  distancePercentage: number;
  totalElevationRidden: number;
  totalElevationAvailable: number;
  elevationPercentage: number;
  totalRideTimeMinutes: number;
  averageRideTimeMinutes: number;
  totalXpEarned: number;
  totalXpAvailable: number;
  xpPercentage: number;
  weeklyDistance: number;
  weeklyTime: number;
  weeklyRides: number;
  monthlyDistance: number;
  monthlyTime: number;
  monthlyRides: number;
  completionByWorld: { world: string; completed: number; total: number; color: string }[];
  difficultyDistribution: { difficulty: number; completed: number; total: number }[];
  weeklyActivity: { week: string; distance: number; timeMinutes: number; rides: number }[];
  monthlyProgress: { month: string; cumulativeRoutes: number; cumulativeDistance: number }[];
  recentRides: { routeName: string; world: string; date: string; time: number; difficulty: number }[];
}
