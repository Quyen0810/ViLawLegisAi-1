'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  description?: string
  color?: 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'indigo'
}

const colorVariants = {
  blue: {
    bg: 'bg-blue-50',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    trendUp: 'text-green-600',
    trendDown: 'text-red-600'
  },
  green: {
    bg: 'bg-green-50',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    trendUp: 'text-green-600',
    trendDown: 'text-red-600'
  },
  orange: {
    bg: 'bg-orange-50',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    trendUp: 'text-green-600',
    trendDown: 'text-red-600'
  },
  purple: {
    bg: 'bg-purple-50',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    trendUp: 'text-green-600',
    trendDown: 'text-red-600'
  },
  red: {
    bg: 'bg-red-50',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    trendUp: 'text-green-600',
    trendDown: 'text-red-600'
  },
  indigo: {
    bg: 'bg-indigo-50',
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
    trendUp: 'text-green-600',
    trendDown: 'text-red-600'
  }
}

export default function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  description,
  color = 'blue' 
}: StatCardProps) {
  const colors = colorVariants[color]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(0,0,0,0.12)' }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition-all duration-300"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mb-2">{value}</p>
          
          {trend && (
            <div className="flex items-center gap-1">
              <span className={`text-sm font-medium ${trend.isPositive ? colors.trendUp : colors.trendDown}`}>
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-slate-400">so với tháng trước</span>
            </div>
          )}
          
          {description && (
            <p className="text-sm text-slate-500 mt-2">{description}</p>
          )}
        </div>
        
        <div className={`${colors.iconBg} p-3 rounded-xl`}>
          <Icon className={`w-6 h-6 ${colors.iconColor}`} />
        </div>
      </div>
    </motion.div>
  )
}
