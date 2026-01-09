'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    Users,
    MessageSquare,
    FileText,
    BookOpen,
    Settings,
    BarChart3,
    Shield,
    Zap
} from 'lucide-react';

interface QuickAction {
    title: string;
    description: string;
    icon: React.ElementType;
    href: string;
    color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'cyan';
}

const defaultActions: QuickAction[] = [
    {
        title: 'Quản lý Users',
        description: 'Xem và quản lý người dùng',
        icon: Users,
        href: '/admin/dashboard/users',
        color: 'blue'
    },
    {
        title: 'Chat AI',
        description: 'Thử nghiệm AI Assistant',
        icon: MessageSquare,
        href: '/chat',
        color: 'green'
    },
    {
        title: 'Soạn văn bản',
        description: 'Tạo hợp đồng, đơn từ',
        icon: FileText,
        href: '/documents',
        color: 'orange'
    },
    {
        title: 'Tra cứu luật',
        description: 'Tìm kiếm văn bản pháp luật',
        icon: BookOpen,
        href: '/legal',
        color: 'purple'
    }
];

const colorClasses = {
    blue: {
        bg: 'bg-blue-500/10 hover:bg-blue-500/20',
        icon: 'text-blue-400',
        border: 'border-blue-500/20 hover:border-blue-500/40'
    },
    green: {
        bg: 'bg-green-500/10 hover:bg-green-500/20',
        icon: 'text-green-400',
        border: 'border-green-500/20 hover:border-green-500/40'
    },
    purple: {
        bg: 'bg-purple-500/10 hover:bg-purple-500/20',
        icon: 'text-purple-400',
        border: 'border-purple-500/20 hover:border-purple-500/40'
    },
    orange: {
        bg: 'bg-orange-500/10 hover:bg-orange-500/20',
        icon: 'text-orange-400',
        border: 'border-orange-500/20 hover:border-orange-500/40'
    },
    red: {
        bg: 'bg-red-500/10 hover:bg-red-500/20',
        icon: 'text-red-400',
        border: 'border-red-500/20 hover:border-red-500/40'
    },
    cyan: {
        bg: 'bg-cyan-500/10 hover:bg-cyan-500/20',
        icon: 'text-cyan-400',
        border: 'border-cyan-500/20 hover:border-cyan-500/40'
    }
};

interface AdminQuickActionsProps {
    actions?: QuickAction[];
}

export default function AdminQuickActions({ actions = defaultActions }: AdminQuickActionsProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="bg-white border border-gray-200 rounded-2xl p-6"
        >
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900">Thao tác nhanh</h3>
                <p className="text-sm text-slate-500">Truy cập nhanh các tính năng</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {actions.map((action, index) => {
                    const Icon = action.icon;
                    const colors = colorClasses[action.color];

                    return (
                        <motion.div
                            key={action.href}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 + index * 0.05 }}
                        >
                            <Link
                                href={action.href}
                                className={`
                  block p-4 rounded-xl border transition-all duration-200
                  ${colors.bg} ${colors.border}
                  group
                `}
                            >
                                <Icon className={`w-6 h-6 ${colors.icon} mb-3 group-hover:scale-110 transition-transform`} />
                                <h4 className="text-sm font-medium text-slate-900 mb-1">{action.title}</h4>
                                <p className="text-xs text-slate-500">{action.description}</p>
                            </Link>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
}
