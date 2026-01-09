'use client';

import { motion } from 'framer-motion';
import {
    ActivityChart,
    CategoryBarChart,
    DistributionPieChart,
    TrendLineChart
} from '@/components/dashboard';

interface DashboardChartsProps {
    weeklyData: { name: string; value: number }[];
}

// Mock data for charts that don't have real APIs yet
const categoryData = [
    { name: 'Lao động', value: 245, color: '#3b82f6' },
    { name: 'Dân sự', value: 189, color: '#10b981' },
    { name: 'Hình sự', value: 156, color: '#f59e0b' },
    { name: 'Thương mại', value: 134, color: '#8b5cf6' },
    { name: 'Đất đai', value: 98, color: '#ef4444' },
    { name: 'Khác', value: 76, color: '#06b6d4' },
];

const userDistribution = [
    { name: 'Công dân', value: 65, color: '#3b82f6' },
    { name: 'Doanh nghiệp', value: 25, color: '#10b981' },
    { name: 'Cơ quan', value: 10, color: '#f59e0b' },
];

const trendData = [
    { name: 'T1', users: 120, chats: 450, documents: 89 },
    { name: 'T2', users: 145, chats: 520, documents: 102 },
    { name: 'T3', users: 168, chats: 580, documents: 118 },
    { name: 'T4', users: 192, chats: 670, documents: 145 },
    { name: 'T5', users: 215, chats: 750, documents: 167 },
    { name: 'T6', users: 248, chats: 890, documents: 198 },
    { name: 'T7', users: 280, chats: 1020, documents: 234 },
];

export default function DashboardCharts({ weeklyData }: DashboardChartsProps) {
    return (
        <div className="space-y-6">
            {/* First Row - Activity & Category */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Weekly Activity Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-slate-800 border border-slate-700 rounded-2xl p-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-semibold text-white">Hoạt động tuần này</h3>
                            <p className="text-sm text-slate-400">Số lượng tương tác theo ngày</p>
                        </div>
                        <select className="bg-slate-700 border border-slate-600 text-white text-sm rounded-lg px-3 py-2">
                            <option>7 ngày qua</option>
                            <option>30 ngày qua</option>
                            <option>3 tháng qua</option>
                        </select>
                    </div>
                    <ActivityChart data={weeklyData} />
                </motion.div>

                {/* Category Distribution */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="bg-slate-800 border border-slate-700 rounded-2xl p-6"
                >
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-white">Phân loại câu hỏi</h3>
                        <p className="text-sm text-slate-400">Theo lĩnh vực pháp luật</p>
                    </div>
                    <CategoryBarChart data={categoryData} />
                </motion.div>
            </div>

            {/* Second Row - Trend & User Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Trend Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-2xl p-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-semibold text-white">Xu hướng tăng trưởng</h3>
                            <p className="text-sm text-slate-400">Theo tháng trong năm</p>
                        </div>
                    </div>
                    <TrendLineChart data={trendData} />
                </motion.div>

                {/* User Distribution Pie */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                    className="bg-slate-800 border border-slate-700 rounded-2xl p-6"
                >
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-white">Phân loại người dùng</h3>
                        <p className="text-sm text-slate-400">Theo loại tài khoản</p>
                    </div>
                    <DistributionPieChart data={userDistribution} />
                </motion.div>
            </div>
        </div>
    );
}
