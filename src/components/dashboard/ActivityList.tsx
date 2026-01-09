'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ChevronRight, Clock, MessageSquare, FileText, Gavel } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

interface Activity {
  id: string
  type: 'chat' | 'document' | 'legal'
  title: string
  description: string
  timestamp: Date
  href: string
}

interface ActivityListProps {
  activities: Activity[]
  maxItems?: number
  showViewAll?: boolean
}

const typeConfig = {
  chat: {
    icon: MessageSquare,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  document: {
    icon: FileText,
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  legal: {
    icon: Gavel,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  }
}

export default function ActivityList({ 
  activities, 
  maxItems = 5,
  showViewAll = true 
}: ActivityListProps) {
  const displayedActivities = activities.slice(0, maxItems)

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Clock className="w-12 h-12 text-slate-300 mb-4" />
        <p className="text-slate-500 font-medium">Chưa có hoạt động nào</p>
        <p className="text-sm text-slate-400 mt-1">
          Bắt đầu bằng cách chat với AI hoặc tạo văn bản
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {displayedActivities.map((activity, index) => {
        const config = typeConfig[activity.type]
        const Icon = config.icon

        return (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link
              href={activity.href}
              className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors duration-200 group"
            >
              <div className={`${config.bgColor} p-2.5 rounded-xl shrink-0`}>
                <Icon className={`w-5 h-5 ${config.color}`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                  {activity.title}
                </p>
                <p className="text-sm text-slate-500 truncate mt-0.5">
                  {activity.description}
                </p>
                <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDistanceToNow(activity.timestamp, { addSuffix: true, locale: vi })}
                </p>
              </div>

              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors shrink-0" />
            </Link>
          </motion.div>
        )
      })}

      {showViewAll && activities.length > maxItems && (
        <Link
          href="/dashboard/activities"
          className="flex items-center justify-center gap-2 py-3 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
        >
          Xem tất cả hoạt động
          <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  )
}
