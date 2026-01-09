'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, Check, CheckCheck, Trash2, User, MessageSquare, AlertTriangle, FileText, Settings } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

export interface Notification {
    id: string
    type: 'info' | 'success' | 'warning' | 'error' | 'message' | 'user' | 'document'
    title: string
    message: string
    timestamp: Date
    read: boolean
    link?: string
}

interface NotificationDropdownProps {
    className?: string
}

// Mock notifications - in production, this would come from API/context
const mockNotifications: Notification[] = [
    {
        id: '1',
        type: 'user',
        title: 'Người dùng mới',
        message: 'hungdoan1304@gmail.com vừa đăng ký tài khoản',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        read: false,
        link: '/admin/dashboard/users'
    },
    {
        id: '2',
        type: 'message',
        title: 'Hội thoại mới',
        message: 'Có 15 cuộc hội thoại mới từ người dùng',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        read: false,
        link: '/admin/dashboard/activity'
    },
    {
        id: '3',
        type: 'document',
        title: 'Văn bản cập nhật',
        message: '25 văn bản pháp luật mới được đồng bộ',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        read: true,
        link: '/admin/dashboard/documents'
    },
    {
        id: '4',
        type: 'warning',
        title: 'Cảnh báo hệ thống',
        message: 'Tài nguyên CPU đang sử dụng cao (85%)',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        read: true
    },
    {
        id: '5',
        type: 'success',
        title: 'Sao lưu hoàn tất',
        message: 'Database đã được sao lưu thành công',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        read: true
    }
]

export function NotificationDropdown({ className = '' }: NotificationDropdownProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const unreadCount = notifications.filter(n => !n.read).length

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

    const getIcon = (type: Notification['type']) => {
        switch (type) {
            case 'user':
                return <User className="w-4 h-4" />
            case 'message':
                return <MessageSquare className="w-4 h-4" />
            case 'warning':
                return <AlertTriangle className="w-4 h-4" />
            case 'document':
                return <FileText className="w-4 h-4" />
            case 'success':
                return <Check className="w-4 h-4" />
            default:
                return <Bell className="w-4 h-4" />
        }
    }

    const getIconColor = (type: Notification['type']) => {
        switch (type) {
            case 'user':
                return 'bg-blue-500/20 text-blue-400'
            case 'message':
                return 'bg-green-500/20 text-green-400'
            case 'warning':
                return 'bg-orange-500/20 text-orange-400'
            case 'error':
                return 'bg-red-500/20 text-red-400'
            case 'document':
                return 'bg-purple-500/20 text-purple-400'
            case 'success':
                return 'bg-emerald-500/20 text-emerald-400'
            default:
                return 'bg-slate-500/20 text-slate-500'
        }
    }

    const markAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        )
    }

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    }

    const deleteNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id))
    }

    const clearAll = () => {
        setNotifications([])
    }

    return (
        <div ref={dropdownRef} className={`relative ${className}`}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-500 hover:text-slate-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold text-slate-900 bg-red-500 rounded-full px-1">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                            <div>
                                <h3 className="text-slate-900 font-semibold">Thông báo</h3>
                                {unreadCount > 0 && (
                                    <p className="text-xs text-slate-500">{unreadCount} chưa đọc</p>
                                )}
                            </div>
                            <div className="flex items-center gap-1">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-gray-100 rounded-lg transition-colors"
                                        title="Đánh dấu tất cả đã đọc"
                                    >
                                        <CheckCheck className="w-4 h-4" />
                                    </button>
                                )}
                                {notifications.length > 0 && (
                                    <button
                                        onClick={clearAll}
                                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-gray-100 rounded-lg transition-colors"
                                        title="Xóa tất cả"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Notifications List */}
                        <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
                            {notifications.length === 0 ? (
                                <div className="py-12 text-center">
                                    <Bell className="w-12 h-12 mx-auto text-slate-600 mb-3" />
                                    <p className="text-slate-500">Không có thông báo</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-700">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`relative px-4 py-3 hover:bg-gray-100/50 transition-colors cursor-pointer ${!notification.read ? 'bg-blue-500/5' : ''
                                                }`}
                                            onClick={() => {
                                                markAsRead(notification.id)
                                                if (notification.link) {
                                                    window.location.href = notification.link
                                                }
                                            }}
                                        >
                                            <div className="flex gap-3">
                                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${getIconColor(notification.type)}`}>
                                                    {getIcon(notification.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <p className={`text-sm font-medium truncate ${notification.read ? 'text-slate-600' : 'text-slate-900'}`}>
                                                            {notification.title}
                                                        </p>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                deleteNotification(notification.id)
                                                            }}
                                                            className="p-1 text-slate-500 hover:text-red-400 hover:bg-slate-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                    <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-xs text-slate-500 mt-1">
                                                        {formatDistanceToNow(notification.timestamp, { addSuffix: true, locale: vi })}
                                                    </p>
                                                </div>
                                            </div>
                                            {!notification.read && (
                                                <span className="absolute top-3 right-3 w-2 h-2 bg-blue-500 rounded-full" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="px-4 py-3 border-t border-gray-200 bg-white/50">
                                <button
                                    onClick={() => {
                                        setIsOpen(false)
                                        window.location.href = '/admin/dashboard/activity'
                                    }}
                                    className="w-full text-center text-sm text-blue-400 hover:text-blue-300 font-medium"
                                >
                                    Xem tất cả hoạt động →
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default NotificationDropdown
