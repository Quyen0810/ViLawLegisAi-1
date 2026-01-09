'use client';

import { motion } from 'framer-motion';

interface FeatureUsageProps {
    features: {
        name: string;
        usage: number;
        color: string;
    }[];
}

export default function FeatureUsage({ features }: FeatureUsageProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white border border-gray-200 rounded-2xl p-6"
        >
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900">Mức độ sử dụng tính năng</h3>
                <p className="text-sm text-slate-500">Thống kê theo tháng</p>
            </div>

            <div className="space-y-5">
                {features.map((feature, index) => (
                    <motion.div
                        key={feature.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-slate-600">{feature.name}</span>
                            <span className="text-sm font-semibold text-slate-900">{feature.usage}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${feature.usage}%` }}
                                transition={{ delay: 0.7 + index * 0.1, duration: 0.8, ease: 'easeOut' }}
                                className="h-full rounded-full"
                                style={{ backgroundColor: feature.color }}
                            />
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Legend */}
            <div className="mt-6 pt-4 border-t border-gray-200 flex flex-wrap gap-4">
                {features.map((feature) => (
                    <div key={feature.name} className="flex items-center gap-2">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: feature.color }}
                        />
                        <span className="text-xs text-slate-500">{feature.name}</span>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}
