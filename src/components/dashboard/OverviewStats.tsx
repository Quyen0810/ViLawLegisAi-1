'use client';

import { motion } from 'framer-motion';
import {
    Users,
    Activity,
    MessageSquare,
    FileText,
    ArrowUpRight,
    ArrowDownRight,
    TrendingUp
} from 'lucide-react';
import type { DashboardStats } from '@/services/dashboard.service';

interface OverviewStatsProps {
    stats: DashboardStats;
}

interface StatCardProps {
    title: string;
    value: number | string;
    icon: React.ElementType;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    description?: string;
    color: 'blue' | 'green' | 'purple' | 'orange';
    delay?: number;
}

const colorClasses = {
    blue: {
        bg: 'bg-blue-500/20',
        text: 'text-blue-400',
        icon: 'text-blue-400'
    },
    green: {
        bg: 'bg-green-500/20',
        text: 'text-green-400',
        icon: 'text-green-400'
    },
    purple: {
        bg: 'bg-purple-500/20',
        text: 'text-purple-400',
        icon: 'text-purple-400'
    },
    orange: {
        bg: 'bg-orange-500/20',
        text: 'text-orange-400',
        icon: 'text-orange-400'
    }
};

function StatCard({ title, value, icon: Icon, trend, description, color, delay = 0 }: StatCardProps) {
    const colors = colorClasses[color];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-slate-600 transition-colors"
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm text-slate-500 mb-1">{title}</p>
                    <p className="text-3xl font-bold text-slate-900">
                        {typeof value === 'number' ? value.toLocaleString() : value}
                    </p>

                    {trend && (
                        <div className="flex items-center gap-1 mt-2">
                            {trend.isPositive ? (
                                <ArrowUpRight className="w-4 h-4 text-green-400" />
                            ) : (
                                <ArrowDownRight className="w-4 h-4 text-red-400" />
                            )}
                            <span className={trend.isPositive ? 'text-sm text-green-400' : 'text-sm text-red-400'}>
                                {trend.isPositive ? '+' : ''}{trend.value}%
                            </span>
                            <span className="text-xs text-slate-500">so với tháng trước</span>
                        </div>
                    )}

                    {description && !trend && (
                        <p className="text-sm text-slate-500 mt-2">{description}</p>
                    )}
                </div>

                <div className={`${colors.bg} p-3 rounded-xl`}>
                    <Icon className={`w-6 h-6 ${colors.icon}`} />
                </div>
            </div>
        </motion.div>
    );
}

export default function OverviewStats({ stats }: OverviewStatsProps) {
    const activePercentage = stats.totalUsers > 0
        ? Math.round((stats.activeUsers / stats.totalUsers) * 100)
        : 0;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
                title="Tổng người dùng"
                value={stats.totalUsers}
                icon={Users}
                trend={{ value: 12, isPositive: true }}
                color="blue"
                delay={0}
            />

            <StatCard
                title="Đang hoạt động"
                value={stats.activeUsers}
                icon={Activity}
                description={`${activePercentage}% tổng số`}
                color="green"
                delay={0.1}
            />

            <StatCard
                title="Cuộc trò chuyện"
                value={stats.totalChats}
                icon={MessageSquare}
                trend={{ value: 28, isPositive: true }}
                color="purple"
                delay={0.2}
            />

            <StatCard
                title="Văn bản đã tạo"
                value={stats.totalDocuments}
                icon={FileText}
                trend={{ value: 15, isPositive: true }}
                color="orange"
                delay={0.3}
            />
        </div>
    );
}
