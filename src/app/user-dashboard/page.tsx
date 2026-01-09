'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import {
  MessageSquare,
  FileText,
  Clock,
  TrendingUp,
  Scale,
  Sparkles,
  ArrowRight,
  Bot,
  BookOpen,
  History,
  Star,
  Target,
  Zap,
  Home,
  Mail,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ChevronRight
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import { IUser } from '@/types/next-auth'
import { NotificationDropdown } from '@/components/ui/NotificationDropdown'

// Mock data
const mockActivities = [
  {
    id: '1',
    type: 'chat' as const,
    title: 'Tư vấn về Luật Lao động',
    description: 'Hỏi về quyền lợi nghỉ phép năm',
    timestamp: '30 phút trước',
    icon: MessageSquare,
    color: 'blue'
  },
  {
    id: '2',
    type: 'document' as const,
    title: 'Hợp đồng thuê nhà',
    description: 'Đã tạo mẫu hợp đồng',
    timestamp: '2 giờ trước',
    icon: FileText,
    color: 'green'
  },
  {
    id: '3',
    type: 'legal' as const,
    title: 'Nghị định 168/2024',
    description: 'Xem chi tiết nghị định',
    timestamp: '5 giờ trước',
    icon: BookOpen,
    color: 'purple'
  },
  {
    id: '4',
    type: 'chat' as const,
    title: 'Thủ tục đăng ký kinh doanh',
    description: 'Tư vấn về hồ sơ',
    timestamp: '1 ngày trước',
    icon: MessageSquare,
    color: 'blue'
  },
]

const weeklyData = [
  { day: 'T2', value: 3 },
  { day: 'T3', value: 5 },
  { day: 'T4', value: 2 },
  { day: 'T5', value: 7 },
  { day: 'T6', value: 4 },
  { day: 'T7', value: 8 },
  { day: 'CN', value: 6 },
]

export default function UserDashboardPage() {
  const { data: session, status } = useSession()
  const user = session?.user as IUser | undefined
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Đang tải...</p>
        </div>
      </div>
    )
  }

  const userName = user?.username || user?.email?.split('@')[0] || 'Người dùng'
  const greeting = getGreeting()

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col fixed h-full z-20`}>
        {/* Logo */}
        <div className="p-4 border-b border-gray-200">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-white shadow-sm flex-shrink-0">
              <Image src="/1.png" alt="ViLaw" width={40} height={40} className="object-contain w-full h-full" />
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="font-bold text-slate-900">ViLaw</h1>
                <p className="text-xs text-slate-500">User Dashboard</p>
              </div>
            )}
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-hide">
          <Link href="/user-dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-600/10 text-blue-600 font-medium">
            <Home className="w-5 h-5" />
            {sidebarOpen && <span>Trang chủ</span>}
          </Link>
          <Link href="/chat" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-gray-100 hover:text-slate-900 transition-colors">
            <MessageSquare className="w-5 h-5" />
            {sidebarOpen && <span>Chat AI</span>}
          </Link>
          <Link href="/documents" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-gray-100 hover:text-slate-900 transition-colors">
            <FileText className="w-5 h-5" />
            {sidebarOpen && <span>Văn bản</span>}
          </Link>
          <Link href="/legal" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-gray-100 hover:text-slate-900 transition-colors">
            <BookOpen className="w-5 h-5" />
            {sidebarOpen && <span>Tra cứu pháp luật</span>}
          </Link>
          <Link href="/user-dashboard/history" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-gray-100 hover:text-slate-900 transition-colors">
            <History className="w-5 h-5" />
            {sidebarOpen && <span>Lịch sử</span>}
          </Link>

          <div className="pt-4 border-t border-gray-200 mt-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider px-4 mb-2">Cài đặt</p>
            <Link href="/user-dashboard/settings/newsletter" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-gray-100 hover:text-slate-900 transition-colors">
              <Mail className="w-5 h-5" />
              {sidebarOpen && <span>Newsletter</span>}
            </Link>
            <Link href="/user-dashboard/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-gray-100 hover:text-slate-900 transition-colors">
              <Settings className="w-5 h-5" />
              {sidebarOpen && <span>Cài đặt</span>}
            </Link>
          </div>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-slate-900 flex items-center justify-center font-semibold flex-shrink-0">
              {userName.charAt(0).toUpperCase()}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{userName}</p>
                <p className="text-xs text-slate-500">{user?.role || 'User'}</p>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Đăng xuất
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 text-slate-500 hover:text-slate-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div>
                <h1 className="text-xl font-bold text-slate-900">{greeting}, {userName}! 👋</h1>
                <p className="text-sm text-slate-500">Chào mừng trở lại với ViLaw</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <NotificationDropdown />
              <Link
                href="/chat"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                Chat AI
              </Link>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group"
            >
              <Link href="/chat" className="block bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 hover:from-blue-500 hover:to-blue-600 transition-all">
                <Bot className="w-10 h-10 text-slate-900/80 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-1">Chat với AI</h3>
                <p className="text-blue-200 text-sm">Hỏi đáp pháp lý 24/7</p>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Link href="/contract" className="block bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-6 hover:from-green-500 hover:to-green-600 transition-all">
                <FileText className="w-10 h-10 text-slate-900/80 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-1">Tạo hợp đồng</h3>
                <p className="text-green-200 text-sm">Soạn thảo tự động</p>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Link href="/legal" className="block bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl p-6 hover:from-purple-500 hover:to-purple-600 transition-all">
                <BookOpen className="w-10 h-10 text-slate-900/80 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-1">Tra cứu văn bản</h3>
                <p className="text-purple-200 text-sm">Kho pháp luật 50K+</p>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Link href="/user-dashboard/settings/newsletter" className="block bg-gradient-to-br from-orange-600 to-orange-700 rounded-2xl p-6 hover:from-orange-500 hover:to-orange-600 transition-all">
                <Mail className="w-10 h-10 text-slate-900/80 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-1">Đăng ký Newsletter</h3>
                <p className="text-orange-200 text-sm">Nhận thông báo văn bản mới</p>
              </Link>
            </motion.div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white border border-gray-200 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded-full">+15%</span>
              </div>
              <p className="text-3xl font-bold text-slate-900">12</p>
              <p className="text-sm text-slate-500 mt-1">Câu hỏi hôm nay</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white border border-gray-200 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900">156</p>
              <p className="text-sm text-slate-500 mt-1">Tổng câu hỏi</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white border border-gray-200 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-purple-400" />
                </div>
                <span className="text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded-full">+5</span>
              </div>
              <p className="text-3xl font-bold text-slate-900">8</p>
              <p className="text-sm text-slate-500 mt-1">Văn bản đã tạo</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white border border-gray-200 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-orange-400" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900">24h</p>
              <p className="text-sm text-slate-500 mt-1">Thời gian sử dụng</p>
            </motion.div>
          </div>

          {/* Charts and Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Weekly Activity Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Hoạt động trong tuần</h3>
              <p className="text-sm text-slate-500 mb-6">Số lượng tương tác với AI</p>

              <div className="flex items-end justify-between h-40 gap-2">
                {weeklyData.map((item, index) => (
                  <div key={item.day} className="flex-1 flex flex-col items-center gap-2">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(item.value / 8) * 100}%` }}
                      transition={{ delay: 0.9 + index * 0.1 }}
                      className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg min-h-[20px]"
                    />
                    <span className="text-xs text-slate-500">{item.day}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-slate-900">Hoạt động gần đây</h3>
                <p className="text-sm text-slate-500 mt-1">Những việc bạn đã làm</p>
              </div>
              <div className="divide-y divide-slate-700">
                {mockActivities.map((activity) => {
                  const Icon = activity.icon
                  return (
                    <div key={activity.id} className="px-6 py-4 hover:bg-gray-100/50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-${activity.color}-500/20 flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`w-5 h-5 text-${activity.color}-400`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">{activity.title}</p>
                          <p className="text-xs text-slate-500 truncate">{activity.description}</p>
                          <p className="text-xs text-slate-500 mt-1">{activity.timestamp}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="p-4 border-t border-gray-200">
                <Link href="/user-dashboard/history" className="flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-300 transition-colors">
                  Xem tất cả
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Newsletter CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-6"
          >
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-2xl p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-blue-500/30 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-7 h-7 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">Đăng ký nhận thông báo văn bản pháp luật</h3>
                  <p className="text-sm text-slate-500">
                    Nhận email cập nhật Luật, Nghị định, Thông tư mới nhất theo lựa chọn của bạn
                  </p>
                </div>
                <Link
                  href="/user-dashboard/settings/newsletter"
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium whitespace-nowrap"
                >
                  Đăng ký ngay
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="mt-6"
          >
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-slate-900 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

              <div className="relative z-10 flex items-start gap-4">
                <div className="bg-white/20 p-3 rounded-xl flex-shrink-0">
                  <Zap className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">Mẹo sử dụng AI hiệu quả</h3>
                  <p className="text-blue-100 mb-4">
                    Hỏi cụ thể và chi tiết để nhận được câu trả lời chính xác nhất.
                    Ví dụ: "Quy định về thời gian làm thêm giờ theo Bộ luật Lao động 2019"
                  </p>
                  <Link
                    href="/chat"
                    className="inline-flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                  >
                    Thử ngay
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  )
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Chào buổi sáng'
  if (hour < 18) return 'Chào buổi chiều'
  return 'Chào buổi tối'
}
