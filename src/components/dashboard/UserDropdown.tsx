'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import {
  User,
  LayoutDashboard,
  Settings,
  Shield,
  LogOut,
  ChevronDown,
  MessageSquare,
  FileText,
  CreditCard,
  HelpCircle
} from 'lucide-react'
import { IUser } from '@/types/next-auth'

interface MenuItem {
  icon: React.ElementType
  label: string
  href?: string
  onClick?: () => void
  divider?: boolean
  adminOnly?: boolean
}

export default function UserDropdown() {
  const { data: session } = useSession()
  const user = session?.user as IUser | undefined
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const userInitial = user?.email?.charAt(0)?.toUpperCase() || 'U'
  // Check role first, fallback to email pattern if role not set by backend
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'admin' ||
    (user?.email?.includes('admin') || user?.email?.includes('hungdoan'))

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  const menuItems: MenuItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', href: isAdmin ? '/admin/dashboard' : '/user-dashboard' },
    { icon: MessageSquare, label: 'Lịch sử chat', href: '/chat' },
    { icon: FileText, label: 'Văn bản của tôi', href: '/documents' },
    { icon: CreditCard, label: 'Gói dịch vụ', href: '/payment', divider: true },
    { icon: User, label: 'Hồ sơ cá nhân', href: '/user-dashboard/profile' },
    { icon: Settings, label: 'Cài đặt', href: '/user-dashboard/settings' },
    ...(isAdmin ? [{ icon: Shield, label: 'Quản trị viên', href: '/admin/dashboard', adminOnly: true, divider: true }] : []),
    { icon: HelpCircle, label: 'Trợ giúp', href: '/help', divider: true },
    { icon: LogOut, label: 'Đăng xuất', onClick: () => signOut({ callbackUrl: '/' }) },
  ]

  if (!user) return null

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 transition-colors duration-200"
        whileTap={{ scale: 0.95 }}
      >
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center font-semibold shadow-md text-sm">
          {userInitial}
        </div>
        <div className="hidden sm:flex flex-col items-start">
          <span className="text-sm font-medium text-slate-900 max-w-[120px] truncate">
            {user?.email?.split('@')[0] || 'Người dùng'}
          </span>
          <span className="text-xs text-slate-500">
            {isAdmin ? 'Quản trị viên' : 'Người dùng'}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden z-50"
          >
            {/* User Info Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center font-semibold shadow-md">
                  {userInitial}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {user?.email?.split('@')[0]}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              {menuItems.map((item, index) => (
                <div key={index}>
                  {item.divider && index > 0 && (
                    <div className="my-1 border-t border-slate-100" />
                  )}

                  {item.href ? (
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-150 ${item.adminOnly
                        ? 'text-purple-600 hover:bg-purple-50'
                        : 'text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                      {item.adminOnly && (
                        <span className="ml-auto text-[10px] font-medium bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded">
                          ADMIN
                        </span>
                      )}
                    </Link>
                  ) : (
                    <button
                      onClick={() => {
                        setIsOpen(false)
                        item.onClick?.()
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
