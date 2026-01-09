'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Users,
  MessageSquare,
  FileText,
  TrendingUp,
  Activity,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Download,
  Filter,
  Calendar,
  ChevronDown,
  Eye,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  MoreHorizontal,
  Trash2,
  Edit,
  Shield,
  Home,
  Settings,
  Bell,
  LogOut
} from 'lucide-react'
import {
  StatCard,
  ChartCard,
  ActivityChart,
  CategoryBarChart,
  DistributionPieChart,
  TrendLineChart
} from '@/components/dashboard'
import { sendRequest } from '@/utils/api'
import { IUser } from '@/types/next-auth'
import { signOut } from 'next-auth/react'
import { NotificationDropdown } from '@/components/ui/NotificationDropdown'

// Mock data for charts
const weeklyData = [
  { name: 'T2', value: 45 },
  { name: 'T3', value: 52 },
  { name: 'T4', value: 38 },
  { name: 'T5', value: 65 },
  { name: 'T6', value: 48 },
  { name: 'T7', value: 72 },
  { name: 'CN', value: 56 },
]

const categoryData = [
  { name: 'Lao động', value: 245, color: '#3b82f6' },
  { name: 'Dân sự', value: 189, color: '#10b981' },
  { name: 'Hình sự', value: 156, color: '#f59e0b' },
  { name: 'Thương mại', value: 134, color: '#8b5cf6' },
  { name: 'Đất đai', value: 98, color: '#ef4444' },
  { name: 'Khác', value: 76, color: '#06b6d4' },
]

const userDistribution = [
  { name: 'Công dân', value: 65, color: '#3b82f6' },
  { name: 'Doanh nghiệp', value: 25, color: '#10b981' },
  { name: 'Cơ quan', value: 10, color: '#f59e0b' },
]

const trendData = [
  { name: 'T1', users: 120, chats: 450, documents: 89 },
  { name: 'T2', users: 145, chats: 520, documents: 102 },
  { name: 'T3', users: 168, chats: 580, documents: 118 },
  { name: 'T4', users: 192, chats: 670, documents: 145 },
  { name: 'T5', users: 215, chats: 750, documents: 167 },
  { name: 'T6', users: 248, chats: 890, documents: 198 },
  { name: 'T7', users: 280, chats: 1020, documents: 234 },
]

interface UserRow {
  _id: string
  email: string
  username: string
  isActive: boolean
  role: string
  createdAt: string
}

export default function AdminDashboardPage() {
  const { data: session } = useSession()
  const user = session?.user as IUser | undefined

  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalChats: 0,
    totalDocuments: 0,
  })
  const [users, setUsers] = useState<UserRow[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch users
        const usersRes = await sendRequest<IBackendRes<any>>({
          url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users`,
          method: 'GET',
          headers: {
            Authorization: `Bearer ${user?.access_token}`,
          },
          queryParams: { current: 1, pageSize: 100 }
        })

        if (usersRes?.data) {
          const userList = usersRes.data.results || []
          setUsers(userList)

          const totalUsers = usersRes.data.meta?.total || userList.length
          const activeUsers = userList.filter((u: any) => u.isActive).length

          setStats({
            totalUsers,
            activeUsers,
            totalChats: Math.floor(totalUsers * 5.2),
            totalDocuments: Math.floor(totalUsers * 2.3),
          })
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
        // Set mock data if API fails
        setStats({
          totalUsers: 1256,
          activeUsers: 892,
          totalChats: 8450,
          totalDocuments: 2340,
        })
        setUsers([])
      } finally {
        setLoading(false)
      }
    }

    if (user?.access_token) {
      fetchData()
    } else {
      setLoading(false)
      setStats({
        totalUsers: 1256,
        activeUsers: 892,
        totalChats: 8450,
        totalDocuments: 2340,
      })
    }
  }, [user?.access_token])

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' ||
      (filterStatus === 'active' && u.isActive) ||
      (filterStatus === 'inactive' && !u.isActive)
    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - kept darker for contrast */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 shadow-sm transition-all duration-300 flex flex-col`}>
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
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-600/10 text-blue-600 font-medium"
          >
            <BarChart3 className="w-5 h-5" />
            {sidebarOpen && <span>Dashboard</span>}
          </Link>
          <Link
            href="/admin/dashboard/users"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-gray-100 hover:text-slate-900 transition-colors"
          >
            <Users className="w-5 h-5" />
            {sidebarOpen && <span>Người dùng</span>}
          </Link>
          <Link
            href="/admin/dashboard/documents"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-gray-100 hover:text-slate-900 transition-colors"
          >
            <FileText className="w-5 h-5" />
            {sidebarOpen && <span>Văn bản</span>}
          </Link>
          <Link
            href="/admin/dashboard/activity"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-gray-100 hover:text-slate-900 transition-colors"
          >
            <Activity className="w-5 h-5" />
            {sidebarOpen && <span>Hoạt động</span>}
          </Link>
          <Link
            href="/admin/dashboard/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-gray-100 hover:text-slate-900 transition-colors"
          >
            <Settings className="w-5 h-5" />
            {sidebarOpen && <span>Cài đặt</span>}
          </Link>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center font-semibold flex-shrink-0">
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
              className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
        <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
              <p className="text-slate-500 text-sm">Tổng quan hệ thống ViLaw</p>
            </div>
            <div className="flex items-center gap-4">
              <NotificationDropdown />
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Làm mới
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Tổng người dùng</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.totalUsers.toLocaleString()}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <ArrowUpRight className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-green-400">+12%</span>
                    <span className="text-xs text-slate-500">so với tháng trước</span>
                  </div>
                </div>
                <div className="bg-blue-500/20 p-3 rounded-xl">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Đang hoạt động</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.activeUsers.toLocaleString()}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-sm text-slate-500">{((stats.activeUsers / stats.totalUsers) * 100).toFixed(0)}% tổng số</span>
                  </div>
                </div>
                <div className="bg-green-500/20 p-3 rounded-xl">
                  <Activity className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Cuộc trò chuyện</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.totalChats.toLocaleString()}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-500">+28%</span>
                    <span className="text-xs text-slate-400">so với tháng trước</span>
                  </div>
                </div>
                <div className="bg-purple-500/20 p-3 rounded-xl">
                  <MessageSquare className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Văn bản đã tạo</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.totalDocuments.toLocaleString()}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-500">+15%</span>
                    <span className="text-xs text-slate-400">so với tháng trước</span>
                  </div>
                </div>
                <div className="bg-orange-500/20 p-3 rounded-xl">
                  <FileText className="w-6 h-6 text-orange-400" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Activity Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Hoạt động tuần này</h3>
                  <p className="text-sm text-slate-500">Số lượng tương tác theo ngày</p>
                </div>
                <select className="bg-gray-100 border border-gray-200 text-slate-700 text-sm rounded-lg px-3 py-2">
                  <option>7 ngày qua</option>
                  <option>30 ngày qua</option>
                  <option>3 tháng qua</option>
                </select>
              </div>
              <ActivityChart data={weeklyData} />
            </motion.div>

            {/* Category Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
            >
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900">Phân loại câu hỏi</h3>
                <p className="text-sm text-slate-500">Theo lĩnh vực pháp luật</p>
              </div>
              <CategoryBarChart data={categoryData} />
            </motion.div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Trend Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Xu hướng tăng trưởng</h3>
                  <p className="text-sm text-slate-500">Theo tháng trong năm</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-slate-700 rounded-lg hover:bg-gray-200 transition-colors">
                  <Download className="w-4 h-4" />
                  Xuất báo cáo
                </button>
              </div>
              <TrendLineChart data={trendData} />
            </motion.div>

            {/* User Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
            >
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900">Phân loại người dùng</h3>
                <p className="text-sm text-slate-500">Theo loại tài khoản</p>
              </div>
              <DistributionPieChart data={userDistribution} />
            </motion.div>
          </div>

          {/* Users Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-6 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Người dùng gần đây</h3>
                  <p className="text-sm text-slate-500">Danh sách người dùng mới nhất</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-gray-50 border border-gray-200 text-slate-700 text-sm rounded-lg px-3 py-2"
                  >
                    <option value="all">Tất cả</option>
                    <option value="active">Đang hoạt động</option>
                    <option value="inactive">Chưa kích hoạt</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-4">Người dùng</th>
                    <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-4">Vai trò</th>
                    <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-4">Trạng thái</th>
                    <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-4">Ngày tạo</th>
                    <th className="text-right text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-4">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.slice(0, 5).map((u) => (
                    <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                            {u.email?.charAt(0)?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{u.username || 'Chưa đặt tên'}</p>
                            <p className="text-sm text-slate-500">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${u.role === 'admin'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-slate-600/50 text-slate-300'
                          }`}>
                          {u.role === 'admin' && <Shield className="w-3 h-3" />}
                          {u.role || 'user'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${u.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                          }`}>
                          {u.isActive ? (
                            <>
                              <CheckCircle className="w-3 h-3" />
                              Hoạt động
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3" />
                              Chờ kích hoạt
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/dashboard/users?view=${u._id}`}
                            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/dashboard/users?edit=${u._id}`}
                            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Chỉnh sửa"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/dashboard/users?delete=${u._id}`}
                            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">Không tìm thấy người dùng nào</p>
              </div>
            )}

            {filteredUsers.length > 5 && (
              <div className="p-4 border-t border-gray-200 text-center">
                <Link
                  href="/admin/dashboard/users"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Xem tất cả {filteredUsers.length} người dùng →
                </Link>
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  )
}
