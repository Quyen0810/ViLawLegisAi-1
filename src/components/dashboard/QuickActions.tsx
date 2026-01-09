'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, LucideIcon } from 'lucide-react'

interface QuickActionProps {
  title: string
  description: string
  icon: LucideIcon
  href: string
  color: 'blue' | 'green' | 'orange' | 'purple' | 'indigo'
}

const colorVariants = {
  blue: {
    gradient: 'from-blue-500 to-blue-600',
    hover: 'hover:from-blue-600 hover:to-blue-700',
    shadow: 'shadow-blue-500/25'
  },
  green: {
    gradient: 'from-green-500 to-green-600',
    hover: 'hover:from-green-600 hover:to-green-700',
    shadow: 'shadow-green-500/25'
  },
  orange: {
    gradient: 'from-orange-500 to-orange-600',
    hover: 'hover:from-orange-600 hover:to-orange-700',
    shadow: 'shadow-orange-500/25'
  },
  purple: {
    gradient: 'from-purple-500 to-purple-600',
    hover: 'hover:from-purple-600 hover:to-purple-700',
    shadow: 'shadow-purple-500/25'
  },
  indigo: {
    gradient: 'from-indigo-500 to-indigo-600',
    hover: 'hover:from-indigo-600 hover:to-indigo-700',
    shadow: 'shadow-indigo-500/25'
  }
}

export function QuickAction({ title, description, icon: Icon, href, color }: QuickActionProps) {
  const colors = colorVariants[color]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link
        href={href}
        className={`block p-5 rounded-2xl bg-gradient-to-br ${colors.gradient} ${colors.hover} shadow-lg ${colors.shadow} transition-all duration-300`}
      >
        <div className="flex items-start justify-between">
          <div className="bg-white/20 p-2.5 rounded-xl">
            <Icon className="w-6 h-6 text-white" />
          </div>
          <ArrowRight className="w-5 h-5 text-white/60" />
        </div>
        <div className="mt-4">
          <h3 className="font-semibold text-white">{title}</h3>
          <p className="text-sm text-white/80 mt-1">{description}</p>
        </div>
      </Link>
    </motion.div>
  )
}

interface QuickActionsGridProps {
  actions: QuickActionProps[]
}

export function QuickActionsGrid({ actions }: QuickActionsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action, index) => (
        <motion.div
          key={action.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <QuickAction {...action} />
        </motion.div>
      ))}
    </div>
  )
}
