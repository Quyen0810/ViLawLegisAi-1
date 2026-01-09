'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Users,
  Search,
  Filter,
  Plus,
  Download,
  Upload,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  Shield,
  CheckCircle,
  Clock,
  XCircle,
  MoreHorizontal,
  ArrowUpDown,
  Mail,
  Calendar,
  BarChart3,
  FileText,
  Settings,
  Bell,
  LogOut,
  X,
  AlertTriangle,
  Check,
  Activity
} from 'lucide-react'
import { sendRequest } from '@/utils/api'
import { IUser } from '@/types/next-auth'
import { signOut } from 'next-auth/react'
import { exportToExcel, formatDateForExport, formatBooleanForExport } from '@/utils/export'
import toast from 'react-hot-toast'
import { SimpleSelect } from '@/components/ui/CustomSelect'
import { NotificationDropdown } from '@/components/ui/NotificationDropdown'

interface UserRow {
  _id: string
  email: string
  username: string
  isActive: boolean
  role: string
  accountType?: string
  createdAt: string
  lastLogin?: string
}

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title: string
}

function Modal({ isOpen, onClose, children, title }: ModalProps) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-lg bg-white border border-gray-200 rounded-2xl shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
              <button
                onClick={onClose}
                className="p-2 text-slate-500 hover:text-slate-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">{children}</div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  )
}

export default function AdminUsersPage() {
  const { data: session } = useSession()
  const user = session?.user as IUser | undefined

  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<UserRow[]>([])
  const [totalUsers, setTotalUsers] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterRole, setFilterRole] = useState('all')
  const [sortField, setSortField] = useState<string>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Modal states
  const [viewModal, setViewModal] = useState<UserRow | null>(null)
  const [editModal, setEditModal] = useState<UserRow | null>(null)
  const [deleteModal, setDeleteModal] = useState<UserRow | null>(null)
  const [addModal, setAddModal] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  // New user form
  const [newUser, setNewUser] = useState({
    email: '',
    username: '',
    password: '',
    role: 'user'
  })

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)

      const res = await sendRequest<IBackendRes<any>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${user?.access_token}`,
        },
        queryParams: {
          current: currentPage,
          pageSize
        }
      })

      if (res?.data) {
        setUsers(res.data.results || [])
        setTotalUsers(res.data.meta?.total || 0)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [user?.access_token, currentPage, pageSize])

  useEffect(() => {
    if (user?.access_token) {
      fetchUsers()
    } else {
      setLoading(false)
    }
  }, [fetchUsers, user?.access_token])

  // Filter and sort users
  const filteredUsers = users
    .filter(u => {
      const matchesSearch =
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.username?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'active' && u.isActive) ||
        (filterStatus === 'inactive' && !u.isActive)
      const matchesRole =
        filterRole === 'all' || u.role === filterRole
      return matchesSearch && matchesStatus && matchesRole
    })
    .sort((a, b) => {
      let aVal = (a as any)[sortField] || ''
      let bVal = (b as any)[sortField] || ''
      if (sortField === 'createdAt') {
        aVal = new Date(aVal).getTime()
        bVal = new Date(bVal).getTime()
      }
      if (sortOrder === 'asc') return aVal > bVal ? 1 : -1
      return aVal < bVal ? 1 : -1
    })

  const totalPages = Math.ceil(totalUsers / pageSize)

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  // Generic update function for role, isActive, etc.
  const handleUpdateUser = async (userId: string, updates: { role?: string; isActive?: boolean }) => {
    setActionLoading(true)
    try {
      await sendRequest({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users`,
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${user?.access_token}`,
        },
        body: { _id: userId, ...updates }
      })

      // Update local state to reflect changes immediately
      setUsers(prev => prev.map(u =>
        u._id === userId ? { ...u, ...updates } : u
      ))

      // Update modal state if still open
      if (editModal && editModal._id === userId) {
        setEditModal({ ...editModal, ...updates } as UserRow)
      }

      const actionName = updates.role
        ? `Đã cập nhật vai trò thành ${updates.role}`
        : updates.isActive !== undefined
          ? (updates.isActive ? 'Đã kích hoạt tài khoản' : 'Đã vô hiệu hóa tài khoản')
          : 'Đã cập nhật thông tin'

      toast.success(actionName)
    } catch (error) {
      console.error('Failed to update user:', error)
      toast.error('Cập nhật thất bại!')
    } finally {
      setActionLoading(false)
    }
  }

  // Keep old function for backwards compatibility
  const handleActivateUser = async (userId: string, activate: boolean) => {
    await handleUpdateUser(userId, { isActive: activate })
    setEditModal(null)
  }

  const handleDeleteUser = async (userId: string) => {
    setActionLoading(true)
    try {
      await sendRequest({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/${userId}`,
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${user?.access_token}`,
        }
      })
      await fetchUsers()
      setDeleteModal(null)
    } catch (error) {
      console.error('Failed to delete user:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleExportExcel = () => {
    try {
      if (filteredUsers.length === 0) {
        toast.error('Không có dữ liệu để xuất!')
        return
      }

      exportToExcel({
        filename: 'danh-sach-nguoi-dung',
        columns: [
          { key: '_id', header: 'ID' },
          { key: 'email', header: 'Email' },
          { key: 'username', header: 'Tên người dùng' },
          { key: 'role', header: 'Vai trò' },
          { key: 'isActive', header: 'Trạng thái', format: (v: boolean) => formatBooleanForExport(v, 'Hoạt động', 'Chưa kích hoạt') },
          { key: 'createdAt', header: 'Ngày tạo', format: formatDateForExport },
        ],
        data: filteredUsers
      })
      toast.success(`Đã xuất ${filteredUsers.length} người dùng!`)
    } catch (error) {
      toast.error('Xuất file thất bại!')
    }
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
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-600/10 text-blue-600 font-medium"
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
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-gray-100 hover:text-slate-900 transition-colors"
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
              <h1 className="text-2xl font-bold text-slate-900">Quản lý người dùng</h1>
              <p className="text-slate-500 text-sm">{totalUsers} người dùng trong hệ thống</p>
            </div>
            <div className="flex items-center gap-4">
              <NotificationDropdown />
              <button
                onClick={fetchUsers}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-slate-900 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Làm mới
              </button>
              <button
                onClick={() => setAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Thêm người dùng
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
                  placeholder="Tìm kiếm theo email hoặc tên..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-100 border border-gray-300 rounded-xl text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-3">
                <SimpleSelect
                  options={[
                    { value: 'all', label: 'Tất cả trạng thái' },
                    { value: 'active', label: 'Đang hoạt động' },
                    { value: 'inactive', label: 'Chưa kích hoạt' },
                  ]}
                  value={filterStatus}
                  onChange={setFilterStatus}
                />

                <SimpleSelect
                  options={[
                    { value: 'all', label: 'Tất cả vai trò' },
                    { value: 'admin', label: 'Admin' },
                    { value: 'user', label: 'User' },
                  ]}
                  value={filterRole}
                  onChange={setFilterRole}
                />

                <button
                  onClick={handleExportExcel}
                  className="flex items-center gap-2 px-4 py-3 bg-gray-100 border border-gray-300 text-slate-900 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Xuất Excel
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100/50">
                      <tr>
                        <th className="text-left px-6 py-4">
                          <button
                            onClick={() => handleSort('email')}
                            className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-900"
                          >
                            Người dùng
                            <ArrowUpDown className="w-3 h-3" />
                          </button>
                        </th>
                        <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Vai trò</th>
                        <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Trạng thái</th>
                        <th className="text-left px-6 py-4">
                          <button
                            onClick={() => handleSort('createdAt')}
                            className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-900"
                          >
                            Ngày tạo
                            <ArrowUpDown className="w-3 h-3" />
                          </button>
                        </th>
                        <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Lần đăng nhập cuối</th>
                        <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {filteredUsers.map((u, index) => (
                        <motion.tr
                          key={u._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-100/30 transition-colors"
                        >
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
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            }) : 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500">
                            {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('vi-VN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : 'Chưa đăng nhập'}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setViewModal(u)}
                                className="p-2 text-slate-500 hover:text-slate-900 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Xem chi tiết"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setEditModal(u)}
                                className="p-2 text-slate-500 hover:text-slate-900 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Chỉnh sửa"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteModal(u)}
                                className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-500/10 rounded-lg transition-colors"
                                title="Xóa"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredUsers.length === 0 && !loading && (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-500">Không tìm thấy người dùng nào</p>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between p-4 border-t border-gray-200">
                    <p className="text-sm text-slate-500">
                      Hiển thị {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalUsers)} của {totalUsers}
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
              </>
            )}
          </div>
        </main>
      </div>

      {/* View Modal */}
      <Modal isOpen={!!viewModal} onClose={() => setViewModal(null)} title="Chi tiết người dùng">
        {viewModal && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-semibold">
                {viewModal.email?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <h4 className="text-lg font-semibold text-slate-900">{viewModal.username || 'Chưa đặt tên'}</h4>
                <p className="text-slate-500">{viewModal.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-gray-100/50 rounded-xl p-4">
                <p className="text-xs text-slate-500 uppercase mb-1">Vai trò</p>
                <p className="text-slate-900 font-medium capitalize">{viewModal.role || 'user'}</p>
              </div>
              <div className="bg-gray-100/50 rounded-xl p-4">
                <p className="text-xs text-slate-500 uppercase mb-1">Trạng thái</p>
                <p className={`font-medium ${viewModal.isActive ? 'text-green-400' : 'text-yellow-400'}`}>
                  {viewModal.isActive ? 'Đang hoạt động' : 'Chờ kích hoạt'}
                </p>
              </div>
              <div className="bg-gray-100/50 rounded-xl p-4">
                <p className="text-xs text-slate-500 uppercase mb-1">Loại tài khoản</p>
                <p className="text-slate-900 font-medium capitalize">{viewModal.accountType || 'Cá nhân'}</p>
              </div>
              <div className="bg-gray-100/50 rounded-xl p-4">
                <p className="text-xs text-slate-500 uppercase mb-1">Ngày tạo</p>
                <p className="text-slate-900 font-medium">
                  {viewModal.createdAt ? new Date(viewModal.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setViewModal(null)
                  setEditModal(viewModal)
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Chỉnh sửa
              </button>
              <button
                onClick={() => setViewModal(null)}
                className="flex-1 px-4 py-3 bg-gray-100 text-slate-900 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editModal} onClose={() => setEditModal(null)} title="Chỉnh sửa người dùng">
        {editModal && (
          <div className="space-y-5">
            {/* User Info */}
            <div className="flex items-center gap-4 p-4 bg-gray-100/50 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg font-semibold">
                {editModal.email?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <p className="text-slate-900 font-medium">{editModal.username || 'Chưa đặt tên'}</p>
                <p className="text-sm text-slate-500">{editModal.email}</p>
              </div>
            </div>

            {/* Role Selector */}
            <div>
              <label className="block text-sm text-slate-500 mb-2">Vai trò</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    if (editModal.role === 'user') return
                    // Check self-demotion
                    if (editModal._id === user?._id) {
                      toast.error('Bạn không thể hạ cấp chính mình!')
                      return
                    }
                    handleUpdateUser(editModal._id, { role: 'user' })
                  }}
                  disabled={actionLoading}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-colors ${(editModal.role || 'user') === 'user'
                    ? 'bg-slate-600 text-slate-900 border border-slate-500'
                    : 'bg-gray-100/50 text-slate-500 hover:bg-gray-100'
                    }`}
                >
                  <Users className="w-4 h-4" />
                  User
                </button>
                <button
                  onClick={() => {
                    if (editModal.role === 'admin') return
                    if (confirm('Bạn có chắc muốn cấp quyền Admin cho người dùng này?')) {
                      handleUpdateUser(editModal._id, { role: 'admin' })
                    }
                  }}
                  disabled={actionLoading}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-colors ${editModal.role === 'admin'
                    ? 'bg-purple-100 text-purple-700 border border-purple-500/50'
                    : 'bg-gray-100/50 text-slate-500 hover:bg-gray-100'
                    }`}
                >
                  <Shield className="w-4 h-4" />
                  Admin
                </button>
              </div>
            </div>

            {/* Status Selector */}
            <div>
              <label className="block text-sm text-slate-500 mb-2">Trạng thái tài khoản</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    if (editModal.isActive) return
                    handleUpdateUser(editModal._id, { isActive: true })
                  }}
                  disabled={actionLoading}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-colors ${editModal.isActive
                    ? 'bg-green-100 text-green-700 border border-green-500/50'
                    : 'bg-gray-100/50 text-slate-500 hover:bg-gray-100'
                    }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  Hoạt động
                </button>
                <button
                  onClick={() => {
                    if (!editModal.isActive) return
                    if (editModal._id === user?._id) {
                      toast.error('Bạn không thể vô hiệu hóa chính mình!')
                      return
                    }
                    handleUpdateUser(editModal._id, { isActive: false })
                  }}
                  disabled={actionLoading}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-colors ${!editModal.isActive
                    ? 'bg-yellow-100 text-yellow-700 border border-yellow-500/50'
                    : 'bg-gray-100/50 text-slate-500 hover:bg-gray-100'
                    }`}
                >
                  <XCircle className="w-4 h-4" />
                  Vô hiệu hóa
                </button>
              </div>
            </div>

            {/* Self-edit warning */}
            {editModal._id === user?._id && (
              <div className="flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <p className="text-sm text-amber-400">Đây là tài khoản của bạn. Một số thao tác bị hạn chế.</p>
              </div>
            )}

            <button
              onClick={() => setEditModal(null)}
              className="w-full px-4 py-3 bg-gray-100 text-slate-900 rounded-xl hover:bg-gray-200 transition-colors mt-2"
            >
              Đóng
            </button>
          </div>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Xác nhận xóa">
        {deleteModal && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <AlertTriangle className="w-10 h-10 text-red-600" />
              <div>
                <p className="text-slate-900 font-medium">Bạn chắc chắn muốn xóa?</p>
                <p className="text-sm text-slate-500">Hành động này không thể hoàn tác</p>
              </div>
            </div>

            <div className="bg-gray-100/50 rounded-xl p-4">
              <p className="text-sm text-slate-500 mb-1">Người dùng sẽ bị xóa:</p>
              <p className="text-slate-900 font-medium">{deleteModal.email}</p>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDeleteModal(null)}
                className="flex-1 px-4 py-3 bg-gray-100 text-slate-900 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => handleDeleteUser(deleteModal._id)}
                disabled={actionLoading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-slate-900 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {actionLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Xóa người dùng
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add User Modal */}
      <Modal isOpen={addModal} onClose={() => setAddModal(false)} title="Thêm người dùng mới">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-2">
              Email *
            </label>
            <input
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              placeholder="email@example.com"
              className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-500 mb-2">
              Tên người dùng
            </label>
            <input
              type="text"
              value={newUser.username}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              placeholder="Nhập tên người dùng"
              className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-500 mb-2">
              Mật khẩu *
            </label>
            <input
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              placeholder="Nhập mật khẩu"
              className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-500 mb-2">
              Vai trò
            </label>
            <SimpleSelect
              options={[
                { value: 'user', label: 'User' },
                { value: 'admin', label: 'Admin' },
              ]}
              value={newUser.role}
              onChange={(v) => setNewUser({ ...newUser, role: v })}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => {
                setAddModal(false)
                setNewUser({ email: '', username: '', password: '', role: 'user' })
              }}
              className="flex-1 px-4 py-3 bg-gray-100 text-slate-900 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={async () => {
                if (!newUser.email || !newUser.password) {
                  toast.error('Vui lòng điền email và mật khẩu!')
                  return
                }
                setActionLoading(true)
                try {
                  const res = await sendRequest<IBackendRes<any>>({
                    url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/register`,
                    method: 'POST',
                    body: {
                      email: newUser.email,
                      password: newUser.password,
                      username: newUser.username || newUser.email.split('@')[0],
                    }
                  })
                  if (res?.data) {
                    toast.success('Thêm người dùng thành công!')
                    setAddModal(false)
                    setNewUser({ email: '', username: '', password: '', role: 'user' })
                    fetchUsers()
                  } else {
                    toast.error(res?.message || 'Thêm người dùng thất bại!')
                  }
                } catch (error) {
                  toast.error('Có lỗi xảy ra!')
                } finally {
                  setActionLoading(false)
                }
              }}
              disabled={actionLoading || !newUser.email || !newUser.password}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {actionLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Thêm người dùng
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
