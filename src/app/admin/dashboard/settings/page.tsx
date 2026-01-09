'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Settings,
  BarChart3,
  Users,
  FileText,
  Bell,
  LogOut,
  Shield,
  Mail,
  Database,
  Server,
  Globe,
  Key,
  Lock,
  AlertTriangle,
  Check,
  ChevronRight,
  Save,
  RefreshCw,
  Trash2,
  HardDrive,
  Zap,
  Cloud,
  Activity,
  ArrowRightLeft,
  X
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import { IUser } from '@/types/next-auth'
import { sendRequest } from '@/utils/api'
import toast from 'react-hot-toast'
import { CustomSelect } from '@/components/ui/CustomSelect'
import { NotificationDropdown } from '@/components/ui/NotificationDropdown'

interface SettingCardProps {
  title: string
  description: string
  icon?: React.ReactNode
  children: React.ReactNode
}

function SettingCard({ title, description, icon, children }: SettingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-2xl p-6"
    >
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          {icon}
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        </div>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
      {children}
    </motion.div>
  )
}

interface SettingToggleProps {
  label: string
  description?: string
  enabled: boolean
  onChange: (enabled: boolean) => void
}

function SettingToggle({ label, description, enabled, onChange }: SettingToggleProps) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-200 last:border-0">
      <div className="flex-1 pr-4">
        <p className="text-slate-900 font-medium">{label}</p>
        {description && <p className="text-sm text-slate-500 mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-7 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 ${enabled ? 'bg-blue-600' : 'bg-slate-600'
          }`}
        role="switch"
        aria-checked={enabled}
      >
        <span
          className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${enabled ? 'translate-x-7' : 'translate-x-0'
            }`}
        />
      </button>
    </div>
  )
}

export default function AdminSettingsPage() {
  const { data: session } = useSession()
  const user = session?.user as IUser | undefined
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Settings state
  const [settings, setSettings] = useState({
    // Email
    emailNotifications: true,
    newUserNotifications: true,
    weeklyReports: true,

    // Security
    twoFactorRequired: false,
    ipWhitelist: false,
    sessionTimeout: '30',

    // System
    maintenanceMode: false,
    debugMode: false,
    cacheEnabled: true,

    // API
    apiRateLimit: '1000',
    apiLogging: true,
  })

  // Admin transfer states
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState('')
  const [transferConfirm, setTransferConfirm] = useState('')
  const [transferring, setTransferring] = useState(false)
  const [availableUsers, setAvailableUsers] = useState<Array<{ _id: string, email: string, username?: string, role: string }>>([])
  const [loadingUsers, setLoadingUsers] = useState(false)

  // Fetch users when modal opens
  const fetchUsersForTransfer = async () => {
    setLoadingUsers(true)
    try {
      const res = await sendRequest<{ data: { results: Array<{ _id: string, email: string, username?: string, role: string }> } }>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${user?.access_token}`,
        },
        queryParams: {
          pageSize: 100 // Get all users
        }
      })
      if (res?.data?.results) {
        // Filter out current admin user only
        const filtered = res.data.results.filter(
          (u) => u.email !== user?.email
        )
        setAvailableUsers(filtered)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
      toast.error('Không thể tải danh sách người dùng')
      setAvailableUsers([])
    } finally {
      setLoadingUsers(false)
    }
  }

  const handleOpenTransferModal = () => {
    setShowTransferModal(true)
    fetchUsersForTransfer()
  }

  const handleSave = async () => {
    setSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleAddAdmin = async () => {
    if (!selectedUserId) {
      toast.error('Vui lòng chọn người dùng để thêm quyền admin')
      return
    }

    const selectedUser = availableUsers.find(u => u._id === selectedUserId)
    setTransferring(true)
    try {
      // Call real API to update user role
      const res = await sendRequest<{ statusCode?: number; message?: string }>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users`,
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${user?.access_token}`,
        },
        body: { _id: selectedUserId, role: 'admin' }
      })

      // Check if API returned error
      if (res?.statusCode && res.statusCode >= 400) {
        toast.error(res.message || 'Thêm quyền admin thất bại!')
        return
      }

      toast.success(`Đã thêm quyền admin cho ${selectedUser?.email || selectedUser?.username}!`)
      setShowTransferModal(false)
      setSelectedUserId('')
      setTransferConfirm('')

      // Reload users list
      fetchUsersForTransfer()
    } catch (error) {
      console.error('Add admin failed:', error)
      toast.error('Thêm quyền admin thất bại!')
    } finally {
      setTransferring(false)
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
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-gray-100 hover:text-slate-900 transition-colors"
          >
            <Activity className="w-5 h-5" />
            {sidebarOpen && <span>Hoạt động</span>}
          </Link>
          <Link
            href="/admin/dashboard/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-600/10 text-blue-600 font-medium"
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
              <h1 className="text-2xl font-bold text-slate-900">Cài đặt hệ thống</h1>
              <p className="text-slate-500 text-sm">Quản lý cấu hình và tùy chọn hệ thống</p>
            </div>
            <div className="flex items-center gap-4">
              <NotificationDropdown />
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : saved ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? 'Đang lưu...' : saved ? 'Đã lưu' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Email Settings */}
            <SettingCard
              title="Thông báo Email"
              description="Cấu hình các thông báo gửi qua email"
            >
              <div className="space-y-1">
                <SettingToggle
                  label="Thông báo email"
                  description="Bật/tắt tất cả thông báo qua email"
                  enabled={settings.emailNotifications}
                  onChange={(v) => setSettings(s => ({ ...s, emailNotifications: v }))}
                />
                <SettingToggle
                  label="Thông báo người dùng mới"
                  description="Nhận email khi có người dùng đăng ký mới"
                  enabled={settings.newUserNotifications}
                  onChange={(v) => setSettings(s => ({ ...s, newUserNotifications: v }))}
                />
                <SettingToggle
                  label="Báo cáo hàng tuần"
                  description="Nhận báo cáo tổng hợp mỗi tuần"
                  enabled={settings.weeklyReports}
                  onChange={(v) => setSettings(s => ({ ...s, weeklyReports: v }))}
                />
              </div>
            </SettingCard>

            {/* Security Settings */}
            <SettingCard
              title="Bảo mật"
              description="Cấu hình các tính năng bảo mật hệ thống"
            >
              <div className="space-y-1">
                <SettingToggle
                  label="Yêu cầu xác thực 2 lớp"
                  description="Bắt buộc tất cả admin sử dụng 2FA"
                  enabled={settings.twoFactorRequired}
                  onChange={(v) => setSettings(s => ({ ...s, twoFactorRequired: v }))}
                />
                <SettingToggle
                  label="IP Whitelist"
                  description="Chỉ cho phép truy cập từ các IP trong danh sách"
                  enabled={settings.ipWhitelist}
                  onChange={(v) => setSettings(s => ({ ...s, ipWhitelist: v }))}
                />
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div>
                    <p className="text-slate-900 font-medium">Thời gian hết phiên</p>
                    <p className="text-sm text-slate-500">Tự động đăng xuất sau khoảng thời gian không hoạt động</p>
                  </div>
                  <select
                    value={settings.sessionTimeout}
                    onChange={(e) => setSettings(s => ({ ...s, sessionTimeout: e.target.value }))}
                    className="px-3 py-2 bg-gray-100 border border-gray-300 text-slate-900 rounded-lg"
                  >
                    <option value="15">15 phút</option>
                    <option value="30">30 phút</option>
                    <option value="60">1 giờ</option>
                    <option value="120">2 giờ</option>
                  </select>
                </div>
              </div>
            </SettingCard>

            {/* System Settings */}
            <SettingCard
              title="Hệ thống"
              description="Cấu hình hoạt động của hệ thống"
            >
              <div className="space-y-1">
                <SettingToggle
                  label="Chế độ bảo trì"
                  description="Hiển thị trang bảo trì cho người dùng"
                  enabled={settings.maintenanceMode}
                  onChange={(v) => setSettings(s => ({ ...s, maintenanceMode: v }))}
                />
                <SettingToggle
                  label="Chế độ Debug"
                  description="Hiển thị thông tin lỗi chi tiết (chỉ dành cho phát triển)"
                  enabled={settings.debugMode}
                  onChange={(v) => setSettings(s => ({ ...s, debugMode: v }))}
                />
                <SettingToggle
                  label="Cache"
                  description="Bật cache để tăng tốc độ tải trang"
                  enabled={settings.cacheEnabled}
                  onChange={(v) => setSettings(s => ({ ...s, cacheEnabled: v }))}
                />
              </div>
            </SettingCard>

            {/* API Settings */}
            <SettingCard
              title="API & Tích hợp"
              description="Cấu hình API và các dịch vụ tích hợp"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div>
                    <p className="text-slate-900 font-medium">Giới hạn request API</p>
                    <p className="text-sm text-slate-500">Số lượng request tối đa mỗi phút</p>
                  </div>
                  <input
                    type="number"
                    value={settings.apiRateLimit}
                    onChange={(e) => setSettings(s => ({ ...s, apiRateLimit: e.target.value }))}
                    className="w-24 px-3 py-2 bg-gray-100 border border-gray-300 text-slate-900 rounded-lg text-center"
                  />
                </div>
                <SettingToggle
                  label="Ghi log API"
                  description="Lưu lại tất cả các request đến API"
                  enabled={settings.apiLogging}
                  onChange={(v) => setSettings(s => ({ ...s, apiLogging: v }))}
                />
              </div>
            </SettingCard>

            {/* System Info */}
            <SettingCard
              title="Thông tin hệ thống"
              description="Trạng thái và thông tin phiên bản"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-100/50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Server className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-slate-500">Server</span>
                  </div>
                  <p className="text-lg font-semibold text-slate-900">Node.js v20.x</p>
                  <p className="text-xs text-green-400 flex items-center gap-1 mt-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full" />
                    Hoạt động
                  </p>
                </div>

                <div className="bg-gray-100/50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Database className="w-5 h-5 text-purple-400" />
                    <span className="text-sm text-slate-500">Database</span>
                  </div>
                  <p className="text-lg font-semibold text-slate-900">MongoDB</p>
                  <p className="text-xs text-green-400 flex items-center gap-1 mt-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full" />
                    Đã kết nối
                  </p>
                </div>

                <div className="bg-gray-100/50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Cloud className="w-5 h-5 text-cyan-400" />
                    <span className="text-sm text-slate-500">AI Model</span>
                  </div>
                  <p className="text-lg font-semibold text-slate-900">Gemini 1.5</p>
                  <p className="text-xs text-green-400 flex items-center gap-1 mt-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full" />
                    Sẵn sàng
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-900 font-medium">Phiên bản ứng dụng</p>
                    <p className="text-sm text-slate-500">ViLaw Legal AI Platform</p>
                  </div>
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-600 rounded-full text-sm font-medium">
                    v1.0.0
                  </span>
                </div>
              </div>
            </SettingCard>

            {/* Danger Zone */}
            <SettingCard
              title="Vùng nguy hiểm"
              description="Các hành động không thể hoàn tác"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <div>
                    <p className="text-slate-900 font-medium">Xóa cache hệ thống</p>
                    <p className="text-sm text-slate-500">Xóa tất cả dữ liệu cache</p>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-500/50 rounded-lg hover:bg-red-500/10 transition-colors">
                    <Trash2 className="w-4 h-4" />
                    Xóa cache
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <div>
                    <p className="text-slate-900 font-medium">Reset cấu hình</p>
                    <p className="text-sm text-slate-500">Đặt lại tất cả cài đặt về mặc định</p>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-500/50 rounded-lg hover:bg-red-500/10 transition-colors">
                    <RefreshCw className="w-4 h-4" />
                    Reset
                  </button>
                </div>
              </div>
            </SettingCard>

            {/* Add Admin Section */}
            <SettingCard
              title="Quản lý Admin"
              description="Thêm quyền admin cho người dùng khác"
              icon={<Shield className="w-5 h-5 text-blue-600" />}
            >
              <div className="space-y-4">
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-blue-600 font-medium">Hệ thống hỗ trợ nhiều Admin</p>
                      <p className="text-sm text-slate-500 mt-1">
                        Bạn có thể thêm nhiều người dùng làm admin. Quyền của bạn sẽ không bị ảnh hưởng khi thêm admin mới.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleOpenTransferModal}
                  className="flex items-center gap-2 px-4 py-3 bg-blue-500/20 text-blue-600 border border-blue-500/50 rounded-xl hover:bg-blue-500/30 transition-colors"
                >
                  <Shield className="w-4 h-4" />
                  Thêm Admin mới
                </button>
              </div>
            </SettingCard>
          </div>
        </main>
      </div>

      <AnimatePresence>
        {showTransferModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => !transferring && setShowTransferModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-md border border-gray-200"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Thêm Admin mới</h3>
                <button
                  onClick={() => !transferring && setShowTransferModal(false)}
                  className="p-2 text-slate-500 hover:text-slate-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl mb-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-blue-600 font-medium text-sm">Thêm quyền admin cho người dùng</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Người dùng được chọn sẽ có toàn quyền quản trị hệ thống.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-2">
                    Chọn người dùng
                  </label>
                  <CustomSelect
                    options={availableUsers.filter(u => u.role !== 'admin').map((u) => ({
                      value: u._id,
                      label: u.username || u.email.split('@')[0],
                      sublabel: u.email
                    }))}
                    value={selectedUserId}
                    onChange={setSelectedUserId}
                    placeholder="-- Chọn người dùng --"
                    searchable={true}
                    disabled={transferring}
                    loading={loadingUsers}
                    emptyMessage="Không có người dùng phù hợp"
                    showAvatar={true}
                    maxHeight={240}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowTransferModal(false)}
                    disabled={transferring}
                    className="flex-1 px-4 py-2 bg-gray-100 text-slate-900 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleAddAdmin}
                    disabled={transferring || !selectedUserId}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {transferring ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Đang thêm...
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4" />
                        Thêm Admin
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
