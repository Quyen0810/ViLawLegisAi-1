'use client';

import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Clock, Server, Database, Bot } from 'lucide-react';
import type { SystemServiceStatus } from '@/services/dashboard.service';

interface SystemStatusProps {
    services: SystemServiceStatus[];
}

const iconMap: Record<string, React.ElementType> = {
    'API Backend': Server,
    'AI Chat Service': Bot,
    'Database MongoDB': Database,
};

const statusStyles = {
    online: {
        icon: CheckCircle,
        bg: 'bg-green-500/10',
        text: 'text-green-400',
        badge: 'bg-green-500/20 text-green-400',
        label: 'Online'
    },
    offline: {
        icon: AlertCircle,
        bg: 'bg-red-500/10',
        text: 'text-red-400',
        badge: 'bg-red-500/20 text-red-400',
        label: 'Offline'
    },
    degraded: {
        icon: AlertCircle,
        bg: 'bg-yellow-500/10',
        text: 'text-yellow-400',
        badge: 'bg-yellow-500/20 text-yellow-400',
        label: 'Degraded'
    }
};

export default function SystemStatus({ services }: SystemStatusProps) {
    const lastUpdated = new Date().toLocaleString('vi-VN');

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white border border-gray-200 rounded-2xl p-6"
        >
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-slate-900">Trạng thái hệ thống</h3>
                    <p className="text-sm text-slate-500">Theo dõi các dịch vụ</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock className="w-3 h-3" />
                    <span>{lastUpdated}</span>
                </div>
            </div>

            <div className="space-y-4">
                {services.map((service, index) => {
                    const style = statusStyles[service.status];
                    const StatusIcon = style.icon;
                    const ServiceIcon = iconMap[service.name] || Server;

                    return (
                        <motion.div
                            key={service.name}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 + index * 0.1 }}
                            className={`flex items-center justify-between p-4 rounded-xl ${style.bg}`}
                        >
                            <div className="flex items-center gap-3">
                                <ServiceIcon className={`w-5 h-5 ${style.text}`} />
                                <div>
                                    <p className="text-sm font-medium text-slate-900">{service.name}</p>
                                    {service.latency && (
                                        <p className="text-xs text-slate-500">Latency: {service.latency}ms</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${style.badge}`}>
                                    {style.label}
                                </span>
                                <StatusIcon className={`w-4 h-4 ${style.text}`} />
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Overall Status */}
            <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Tổng quan</span>
                    {services.every(s => s.status === 'online') ? (
                        <span className="flex items-center gap-2 text-sm text-green-400">
                            <CheckCircle className="w-4 h-4" />
                            Tất cả hệ thống hoạt động bình thường
                        </span>
                    ) : (
                        <span className="flex items-center gap-2 text-sm text-yellow-400">
                            <AlertCircle className="w-4 h-4" />
                            Một số dịch vụ đang gặp sự cố
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
