import { sendRequest } from '@/utils/api';

// Types
export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalChats: number;
  totalDocuments: number;
  userGrowth: number;
}

export interface RecentUser {
  _id: string;
  email: string;
  username: string;
  isActive: boolean;
  role: string;
  createdAt: string;
}

export interface WeeklyActivity {
  name: string;
  value: number;
}

export interface SystemServiceStatus {
  name: string;
  status: 'online' | 'offline' | 'degraded';
  latency?: number;
}

// Server-side data fetching functions
// These are meant to be called from Server Components

/**
 * Fetch dashboard statistics
 * @param accessToken - User's access token from session
 */
export async function getDashboardStats(accessToken: string): Promise<DashboardStats> {
  try {
    const response = await sendRequest<IBackendRes<any>>({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      queryParams: { current: 1, pageSize: 100 }
    });

    if (response?.data) {
      const users = response.data.results || [];
      const totalUsers = response.data.meta?.total || users.length;
      const activeUsers = users.filter((u: any) => u.isActive).length;
      const userGrowth = totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0;

      return {
        totalUsers,
        activeUsers,
        // Mock data for now - TODO: implement real endpoints
        totalChats: Math.floor(totalUsers * 5.2),
        totalDocuments: Math.floor(totalUsers * 2.3),
        userGrowth
      };
    }

    return getDefaultStats();
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
    return getDefaultStats();
  }
}

/**
 * Fetch recent users
 * @param accessToken - User's access token from session
 * @param limit - Number of users to fetch
 */
export async function getRecentUsers(accessToken: string, limit: number = 5): Promise<RecentUser[]> {
  try {
    const response = await sendRequest<IBackendRes<any>>({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      queryParams: { current: 1, pageSize: limit }
    });

    if (response?.data?.results) {
      return response.data.results.map((user: any) => ({
        _id: user._id,
        email: user.email,
        username: user.username || '',
        isActive: user.isActive || false,
        role: user.role || 'user',
        createdAt: user.createdAt || new Date().toISOString()
      }));
    }

    return [];
  } catch (error) {
    console.error('Failed to fetch recent users:', error);
    return [];
  }
}

/**
 * Get weekly activity data
 * @param accessToken - User's access token from session
 */
export async function getWeeklyActivity(accessToken: string): Promise<WeeklyActivity[]> {
  // TODO: Implement real API endpoint
  // For now, return mock data
  return [
    { name: 'T2', value: 45 },
    { name: 'T3', value: 52 },
    { name: 'T4', value: 38 },
    { name: 'T5', value: 65 },
    { name: 'T6', value: 48 },
    { name: 'T7', value: 72 },
    { name: 'CN', value: 56 },
  ];
}

/**
 * Get system services status
 */
export async function getSystemStatus(): Promise<SystemServiceStatus[]> {
  // TODO: Implement real health check endpoints
  return [
    { name: 'API Backend', status: 'online', latency: 45 },
    { name: 'AI Chat Service', status: 'online', latency: 120 },
    { name: 'Database MongoDB', status: 'online', latency: 15 },
  ];
}

/**
 * Get feature usage statistics
 */
export async function getFeatureUsage(): Promise<{ name: string; usage: number; color: string }[]> {
  // TODO: Implement real API endpoint
  return [
    { name: 'Chat AI', usage: 68, color: '#3b82f6' },
    { name: 'Soạn văn bản', usage: 45, color: '#10b981' },
    { name: 'Phân tích HĐ', usage: 32, color: '#f59e0b' },
    { name: 'Tra cứu luật', usage: 78, color: '#8b5cf6' },
  ];
}

// Helper functions
function getDefaultStats(): DashboardStats {
  return {
    totalUsers: 0,
    activeUsers: 0,
    totalChats: 0,
    totalDocuments: 0,
    userGrowth: 0
  };
}
