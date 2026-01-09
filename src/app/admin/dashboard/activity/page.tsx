'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Activity,
  Search,
  Filter,
  Calendar,
  RefreshCw,
  BarChart3,
  Users,
  FileText,
  Settings,
  Bell,
  LogOut,
  MessageSquare,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Info,
  ChevronLeft,
  ChevronRight,
  Download,
  User,
  Shield
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import { IUser } from '@/types/next-auth'
import { format, formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { SimpleSelect } from '@/components/ui/CustomSelect'
import { NotificationDropdown } from '@/components/ui/NotificationDropdown'

interface ActivityLog {
  id: string
  type: 'chat' | 'document' | 'login' | 'register' | 'admin' | 'error'
  action: string
  user: {
    email: string
    role: string
  }
  details?: string
  ip?: string
  timestamp: string
}

// Mock data
const mockLogs: ActivityLog[] = [
  {
    id: '1',
    type: 'login',
    action: 'Đăng nhập hệ thống',
    user: { email: 'admin@vilaw.vn', role: 'admin' },
    ip: '192.168.1.1',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: '2',
    type: 'chat',
    action: 'Tạo cuộc trò chuyện mới',
    user: { email: 'user1@gmail.com', role: 'user' },
    details: 'Tư vấn về luật lao động',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: '3',
    type: 'document',
    action: 'Tạo văn bản mới',
    user: { email: 'user2@gmail.com', role: 'user' },
    details: 'Hợp đồng lao động',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: '4',
    type: 'register',
    action: 'Đăng ký tài khoản mới',
    user: { email: 'newuser@gmail.com', role: 'user' },
    ip: '10.0.0.5',
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    id: '5',
    type: 'admin',
    action: 'Cập nhật cấu hình hệ thống',
    user: { email: 'admin@vilaw.vn', role: 'admin' },
    details: 'Bật cache hệ thống',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: '6',
    type: 'error',
    action: 'Lỗi xác thực API',
    user: { email: 'system', role: 'system' },
    details: 'Invalid API key',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: '7',
    type: 'chat',
    action: 'Gửi tin nhắn',
    user: { email: 'user3@gmail.com', role: 'user' },
    details: 'Hỏi về quy định bồi thường',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
  },
  {
    id: '8',
    type: 'document',
    action: 'Tải xuống văn bản',
    user: { email: 'user1@gmail.com', role: 'user' },
    details: 'Bộ luật Dân sự 2015',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
]

const typeConfig = {
  chat: { icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-500/20' },
  document: { icon: FileText, color: 'text-green-400', bg: 'bg-green-500/20' },
  login: { icon: User, color: 'text-purple-400', bg: 'bg-purple-500/20' },
  register: { icon: Users, color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
  admin: { icon: Shield, color: 'text-orange-400', bg: 'bg-orange-500/20' },
  error: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-500/20' },
}

export default function AdminActivityPage() {
  const { data: session } = useSession()
  const user = session?.user as IUser | undefined
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [logs, setLogs] = useState<ActivityLog[]>(mockLogs)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const filteredLogs = logs.filter(log => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || log.type === filterType
    return matchesSearch && matchesType
  })

  const totalPages = Math.ceil(filteredLogs.length / pageSize)
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleRefresh = () => {
    setLoading(true)
    setTimeout(() => {
      setLogs([...mockLogs])
      setLoading(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="p-4 border-b border-gray-200">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-white shadow-sm flex-shrink-0">
              <Image src="/1.png" alt="ViLaw" width={40} height={40} className="object-contain w-full h-full" />
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="text-lg font-bold text-slate-900">ViLaw</h1>
                <p className="text-xs text-slate-500">Admin Panel</p>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-gray-100 hover:text-slate-900 transition-colors"
          >
            <BarChart3 className="w-5 h-5" />
            {sidebarOpen && <span>Dashboard</span>}
          </Link>
          <Link
            href="/admin/dashboard/users"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-gray-100 hover:text-slate-900 transition-colors"
          >
            <Users className="w-5 h-5" />
            {sidebarOpen && <span>Người dùng</span>}
          </Link>
          <Link
            href="/admin/dashboard/documents"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-gray-100 hover:text-slate-900 transition-colors"
          >
            <FileText className="w-5 h-5" />
            {sidebarOpen && <span>Văn bản</span>}
          </Link>
          <Link
            href="/admin/dashboard/activity"
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-600/10 text-blue-600 font-medium"
          >
            <Activity className="w-5 h-5" />
            {sidebarOpen && <span>Hoạt động</span>}
          </Link>
          <Link
            href="/admin/dashboard/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-gray-100 hover:text-slate-900 transition-colors"
          >
            <Settings className="w-5 h-5" />
            {sidebarOpen && <span>Cài đặt</span>}
          </Link>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-slate-900 flex items-center justify-center font-semibold flex-shrink-0">
              {user?.email?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{user?.email?.split('@')[0]}</p>
                <p className="text-xs text-slate-500">Administrator</p>
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
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Nhật ký hoạt động</h1>
              <p className="text-slate-500 text-sm">Theo dõi tất cả hoạt động trong hệ thống</p>
            </div>
            <div className="flex items-center gap-4">
              <NotificationDropdown />
              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-slate-900 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Làm mới
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="w-4 h-4" />
                Xuất log
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          {/* Filters */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Tìm kiếm hoạt động..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-100 border border-gray-300 rounded-xl text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Type Filter */}
              <SimpleSelect
                options={[
                  { value: 'all', label: 'Tất cả loại' },
                  { value: 'chat', label: 'Chat' },
                  { value: 'document', label: 'Văn bản' },
                  { value: 'login', label: 'Đăng nhập' },
                  { value: 'register', label: 'Đăng ký' },
                  { value: 'admin', label: 'Admin' },
                  { value: 'error', label: 'Lỗi' },
                ]}
                value={filterType}
                onChange={setFilterType}
              />
            </div>
          </div>

          {/* Activity Log Table */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100/50">
                  <tr>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Hoạt động</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Người dùng</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Chi tiết</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Thời gian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {paginatedLogs.map((log, index) => {
                    const config = typeConfig[log.type]
                    const Icon = config.icon
                    return (
                      <motion.tr
                        key={log.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-100/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${config.bg}`}>
                              <Icon className={`w-4 h-4 ${config.color}`} />
                            </div>
                            <span className="text-slate-900 font-medium">{log.action}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold">
                              {log.user.email.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-slate-900 text-sm">{log.user.email}</p>
                              <p className="text-xs text-slate-500 capitalize">{log.user.role}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-slate-500 text-sm">{log.details || log.ip || '—'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-slate-900 text-sm">
                              {format(new Date(log.timestamp), 'HH:mm')}
                            </p>
                            <p className="text-xs text-slate-500">
                              {formatDistanceToNow(new Date(log.timestamp), {
                                addSuffix: true,
                                locale: vi
                              })}
                            </p>
                          </div>
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {filteredLogs.length === 0 && (
              <div className="text-center py-12">
                <Activity className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-500">Không có hoạt động nào</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-gray-200">
                <p className="text-sm text-slate-500">
                  Hiển thị {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredLogs.length)} của {filteredLogs.length}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 text-slate-500 hover:text-slate-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const page = i + 1
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-lg transition-colors ${currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-500 hover:text-slate-900 hover:bg-gray-100'
                          }`}
                      >
                        {page}
                      </button>
                    )
                  })}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 text-slate-500 hover:text-slate-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
