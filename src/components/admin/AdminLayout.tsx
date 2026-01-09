'use client';

import { useState, createContext, useContext, ReactNode, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Users,
    FileText,
    Settings,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Bell,
    Menu,
    X,
    Shield,
    Activity,
    Clock,
    MessageSquare,
    UserPlus
} from 'lucide-react';
import { IUser } from '@/types/next-auth';

// Context for sidebar state
interface AdminLayoutContextType {
    sidebarCollapsed: boolean;
    toggleSidebar: () => void;
    mobileMenuOpen: boolean;
    setMobileMenuOpen: (open: boolean) => void;
}

const AdminLayoutContext = createContext<AdminLayoutContextType | null>(null);

export function useAdminLayout() {
    const context = useContext(AdminLayoutContext);
    if (!context) {
        throw new Error('useAdminLayout must be used within AdminLayoutProvider');
    }
    return context;
}

// Navigation items
const navigationItems = [
    {
        name: 'Dashboard',
        href: '/admin/dashboard',
        icon: LayoutDashboard,
    },
    {
        name: 'Người dùng',
        href: '/admin/dashboard/users',
        icon: Users,
    },
    {
        name: 'Văn bản pháp luật',
        href: '/admin/dashboard/documents',
        icon: FileText,
    },
    {
        name: 'Hoạt động',
        href: '/admin/dashboard/activity',
        icon: Activity,
    },
    {
        name: 'Cài đặt',
        href: '/admin/dashboard/settings',
        icon: Settings,
    },
];

// Mock notifications
interface Notification {
    id: string;
    type: 'user' | 'message' | 'system';
    title: string;
    message: string;
    time: string;
    read: boolean;
}

const mockNotifications: Notification[] = [
    {
        id: '1',
        type: 'user',
        title: 'Người dùng mới',
        message: 'newuser@gmail.com vừa đăng ký tài khoản',
        time: '5 phút trước',
        read: false,
    },
    {
        id: '2',
        type: 'message',
        title: 'Tin nhắn mới',
        message: 'Có 3 câu hỏi tư vấn pháp luật đang chờ',
        time: '15 phút trước',
        read: false,
    },
    {
        id: '3',
        type: 'system',
        title: 'Cập nhật hệ thống',
        message: 'Đã cập nhật 45 văn bản pháp luật mới',
        time: '1 giờ trước',
        read: true,
    },
];

interface AdminLayoutProps {
    children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [notificationOpen, setNotificationOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
    const notificationRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();
    const { data: session } = useSession();
    const user = session?.user as IUser | undefined;

    const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    // Close notification dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setNotificationOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const isActiveRoute = (href: string) => {
        if (href === '/admin/dashboard') {
            return pathname === '/admin/dashboard' || pathname === '/admin';
        }
        return pathname.startsWith(href);
    };

    const getNotificationIcon = (type: Notification['type']) => {
        switch (type) {
            case 'user': return <UserPlus className="w-4 h-4 text-blue-400" />;
            case 'message': return <MessageSquare className="w-4 h-4 text-green-400" />;
            case 'system': return <Settings className="w-4 h-4 text-purple-400" />;
        }
    };

    return (
        <AdminLayoutContext.Provider
            value={{ sidebarCollapsed, toggleSidebar, mobileMenuOpen, setMobileMenuOpen }}
        >
            <div className="min-h-screen bg-gray-50 flex">
                {/* Mobile overlay */}
                {mobileMenuOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <aside
                    className={`
                        fixed lg:static inset-y-0 left-0 z-50
                        ${sidebarCollapsed ? 'w-20' : 'w-64'}
                        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                        bg-white border-r border-gray-200 
                        transition-all duration-300 ease-in-out
                        flex flex-col
                    `}
                >
                    {/* Logo */}
                    <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-white shadow-sm flex-shrink-0">
                                <Image
                                    src="/1.png"
                                    alt="ViLaw"
                                    width={40}
                                    height={40}
                                    className="object-contain w-full h-full"
                                />
                            </div>
                            {!sidebarCollapsed && (
                                <div>
                                    <h1 className="text-lg font-bold text-slate-900">ViLaw</h1>
                                    <p className="text-xs text-slate-500">Admin Panel</p>
                                </div>
                            )}
                        </Link>

                        {/* Mobile close button */}
                        <button
                            onClick={() => setMobileMenuOpen(false)}
                            className="lg:hidden p-2 text-slate-500 hover:text-slate-900"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                        {navigationItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = isActiveRoute(item.href);

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`
                                        flex items-center gap-3 px-4 py-3 rounded-xl
                                        transition-all duration-200
                                        ${isActive
                                            ? 'bg-blue-600/20 text-blue-400 font-medium'
                                            : 'text-slate-500 hover:bg-gray-100 hover:text-slate-900'
                                        }
                                    `}
                                    title={sidebarCollapsed ? item.name : undefined}
                                >
                                    <Icon className="w-5 h-5 flex-shrink-0" />
                                    {!sidebarCollapsed && <span>{item.name}</span>}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Section */}
                    <div className="p-4 border-t border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-slate-900 flex items-center justify-center font-semibold flex-shrink-0">
                                {user?.email?.charAt(0)?.toUpperCase() || 'A'}
                            </div>
                            {!sidebarCollapsed && (
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-900 truncate">
                                        {user?.email?.split('@')[0] || 'Admin'}
                                    </p>
                                    <p className="text-xs text-slate-500 flex items-center gap-1">
                                        <Shield className="w-3 h-3" />
                                        Administrator
                                    </p>
                                </div>
                            )}
                        </div>

                        {!sidebarCollapsed && (
                            <button
                                onClick={() => signOut({ callbackUrl: '/' })}
                                className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                Đăng xuất
                            </button>
                        )}

                        {sidebarCollapsed && (
                            <button
                                onClick={() => signOut({ callbackUrl: '/' })}
                                className="w-full mt-3 flex items-center justify-center p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                title="Đăng xuất"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Collapse button - Desktop only */}
                    <button
                        onClick={toggleSidebar}
                        className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-gray-100 border border-slate-600 rounded-full items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-600 transition-colors"
                    >
                        {sidebarCollapsed ? (
                            <ChevronRight className="w-4 h-4" />
                        ) : (
                            <ChevronLeft className="w-4 h-4" />
                        )}
                    </button>
                </aside>

                {/* Main Content */}
                <div className="flex-1 flex flex-col min-w-0">
                    {/* Header */}
                    <header className="h-16 bg-white border-b border-gray-200 px-4 lg:px-6 flex items-center justify-between sticky top-0 z-30">
                        <div className="flex items-center gap-4">
                            {/* Mobile menu button */}
                            <button
                                onClick={() => setMobileMenuOpen(true)}
                                className="lg:hidden p-2 text-slate-500 hover:text-slate-900 hover:bg-gray-100 rounded-lg"
                            >
                                <Menu className="w-5 h-5" />
                            </button>

                            <div>
                                <h1 className="text-xl font-bold text-slate-900">Admin Dashboard</h1>
                                <p className="text-sm text-slate-500 hidden sm:block">
                                    Quản lý hệ thống ViLaw
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Notifications */}
                            <div className="relative" ref={notificationRef}>
                                <button
                                    onClick={() => setNotificationOpen(!notificationOpen)}
                                    className="p-2 text-slate-500 hover:text-slate-900 hover:bg-gray-100 rounded-lg transition-colors relative"
                                >
                                    <Bell className="w-5 h-5" />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold text-slate-900 flex items-center justify-center">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>

                                {/* Notification Dropdown */}
                                <AnimatePresence>
                                    {notificationOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 8, scale: 0.96 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50"
                                        >
                                            {/* Header */}
                                            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                                                <h3 className="font-semibold text-slate-900">Thông báo</h3>
                                                {unreadCount > 0 && (
                                                    <button
                                                        onClick={markAllAsRead}
                                                        className="text-xs text-blue-400 hover:text-blue-300"
                                                    >
                                                        Đánh dấu đã đọc
                                                    </button>
                                                )}
                                            </div>

                                            {/* Notifications List */}
                                            <div className="max-h-80 overflow-y-auto">
                                                {notifications.length === 0 ? (
                                                    <div className="p-8 text-center">
                                                        <Bell className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                                                        <p className="text-slate-500 text-sm">Không có thông báo</p>
                                                    </div>
                                                ) : (
                                                    notifications.map(notification => (
                                                        <div
                                                            key={notification.id}
                                                            onClick={() => markAsRead(notification.id)}
                                                            className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-100/50 cursor-pointer transition-colors ${!notification.read ? 'bg-blue-500/5' : ''
                                                                }`}
                                                        >
                                                            <div className="mt-1">
                                                                {getNotificationIcon(notification.type)}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className={`text-sm ${notification.read ? 'text-slate-600' : 'text-slate-900 font-medium'}`}>
                                                                    {notification.title}
                                                                </p>
                                                                <p className="text-xs text-slate-500 truncate">
                                                                    {notification.message}
                                                                </p>
                                                                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                                                    <Clock className="w-3 h-3" />
                                                                    {notification.time}
                                                                </p>
                                                            </div>
                                                            {!notification.read && (
                                                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                                                            )}
                                                        </div>
                                                    ))
                                                )}
                                            </div>

                                            {/* Footer */}
                                            <div className="px-4 py-3 border-t border-gray-200">
                                                <Link
                                                    href="/admin/dashboard/activity"
                                                    onClick={() => setNotificationOpen(false)}
                                                    className="text-sm text-blue-400 hover:text-blue-300 flex items-center justify-center gap-1"
                                                >
                                                    Xem tất cả hoạt động
                                                    <ChevronRight className="w-4 h-4" />
                                                </Link>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* User avatar - Mobile */}
                            <div className="lg:hidden w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-slate-900 flex items-center justify-center text-sm font-semibold">
                                {user?.email?.charAt(0)?.toUpperCase() || 'A'}
                            </div>
                        </div>
                    </header>

                    {/* Page Content */}
                    <main className="flex-1 p-4 lg:p-6 overflow-auto">
                        {children}
                    </main>
                </div>
            </div>
        </AdminLayoutContext.Provider>
    );
}
