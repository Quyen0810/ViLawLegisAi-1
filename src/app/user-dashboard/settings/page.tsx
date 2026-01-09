'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Bell,
  Moon,
  Globe,
  Lock,
  Trash2,
  Save,
  ChevronRight,
  Mail,
  MessageSquare,
  Shield,
  Home,
  FileText,
  BookOpen,
  History,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import toast from 'react-hot-toast'
import { IUser } from '@/types/next-auth'
import { NotificationDropdown } from '@/components/ui/NotificationDropdown'

interface SettingToggleProps {
  label: string
  description: string
  enabled: boolean
  onChange: (value: boolean) => void
}

function SettingToggle({ label, description, enabled, onChange }: SettingToggleProps) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-200 last:border-0">
      <div>
        <p className="font-medium text-slate-900">{label}</p>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${enabled ? 'bg-blue-600' : 'bg-slate-600'
          }`}
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${enabled ? 'translate-x-6' : 'translate-x-0'
            }`}
        />
      </button>
    </div>
  )
}

interface SettingLinkProps {
  icon: React.ElementType
  label: string
  description: string
  href: string
}

function SettingLink({ icon: Icon, label, description, href }: SettingLinkProps) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between py-4 border-b border-gray-200 last:border-0 hover:bg-gray-100/50 -mx-6 px-6 transition-colors"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
          <Icon className="w-5 h-5 text-slate-300" />
        </div>
        <div>
          <p className="font-medium text-slate-900">{label}</p>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-slate-500" />
    </Link>
  )
}

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const user = session?.user as IUser | undefined
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mounted, setMounted] = useState(false)

  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    darkMode: true,
    language: 'vi',
    twoFactor: false,
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSave = () => {
    toast.success('Đã lưu cài đặt!')
  }

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
          <Link href="/user-dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-gray-100 hover:text-slate-900 transition-colors">
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
            <Link href="/user-dashboard/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-600/10 text-blue-600 font-medium">
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
                <h1 className="text-xl font-bold text-slate-900">Cài đặt</h1>
                <p className="text-sm text-slate-500">Quản lý tài khoản và ứng dụng</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <NotificationDropdown />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Settings - Left 2 columns */}
            <div className="lg:col-span-2 space-y-6">
              {/* Notifications */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-gray-200 rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <Bell className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Thông báo</h2>
                    <p className="text-sm text-slate-500">Quản lý cách bạn nhận thông báo</p>
                  </div>
                </div>

                <SettingToggle
                  label="Thông báo qua email"
                  description="Nhận cập nhật và tin tức qua email"
                  enabled={settings.emailNotifications}
                  onChange={(value) => setSettings({ ...settings, emailNotifications: value })}
                />
                <SettingToggle
                  label="Thông báo đẩy"
                  description="Nhận thông báo trực tiếp trên trình duyệt"
                  enabled={settings.pushNotifications}
                  onChange={(value) => setSettings({ ...settings, pushNotifications: value })}
                />

                <SettingLink
                  icon={Mail}
                  label="Cài đặt Newsletter"
                  description="Đăng ký nhận thông báo văn bản pháp luật"
                  href="/user-dashboard/settings/newsletter"
                />
              </motion.div>

              {/* Appearance */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white border border-gray-200 rounded-2xl p-6 mb-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <Moon className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Giao diện</h2>
                    <p className="text-sm text-slate-500">Tùy chỉnh giao diện ứng dụng</p>
                  </div>
                </div>

                <SettingToggle
                  label="Chế độ tối"
                  description="Giảm mỏi mắt khi sử dụng vào ban đêm"
                  enabled={settings.darkMode}
                  onChange={(value) => setSettings({ ...settings, darkMode: value })}
                />

                <div className="py-4 border-b border-gray-200">
                  <label className="block font-medium text-slate-900 mb-2">Ngôn ngữ</label>
                  <select
                    value={settings.language}
                    onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
                  >
                    <option value="vi">Tiếng Việt</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </motion.div>

              {/* Security */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white border border-gray-200 rounded-2xl p-6 mb-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <Shield className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Bảo mật</h2>
                    <p className="text-sm text-slate-500">Bảo vệ tài khoản của bạn</p>
                  </div>
                </div>

                <SettingToggle
                  label="Xác thực hai yếu tố"
                  description="Thêm lớp bảo mật cho tài khoản"
                  enabled={settings.twoFactor}
                  onChange={(value) => setSettings({ ...settings, twoFactor: value })}
                />

                <SettingLink
                  icon={Lock}
                  label="Đổi mật khẩu"
                  description="Cập nhật mật khẩu tài khoản"
                  href="/user-dashboard/settings/password"
                />
              </motion.div>

              {/* Danger Zone */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white border border-red-500/30 rounded-2xl p-6 mb-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-red-600">Vùng nguy hiểm</h2>
                    <p className="text-sm text-slate-500">Các hành động không thể hoàn tác</p>
                  </div>
                </div>

                <button
                  className="w-full py-3 border-2 border-red-500/30 text-red-600 rounded-xl font-medium hover:bg-red-500/10 transition-colors"
                  onClick={() => toast.error('Tính năng này đang được phát triển')}
                >
                  Xóa tài khoản
                </button>
              </motion.div>
            </div>

            {/* Right Sidebar - Profile & Actions */}
            <div className="space-y-6">
              {/* Profile Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white border border-gray-200 rounded-2xl p-6"
              >
                <div className="text-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-slate-900 flex items-center justify-center text-3xl font-bold mx-auto mb-4">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">{userName}</h3>
                  <p className="text-sm text-slate-500">{user?.email || 'user@vilaw.vn'}</p>
                  <span className="inline-block mt-2 px-3 py-1 bg-blue-500/20 text-blue-600 text-xs rounded-full">
                    {user?.role || 'User'}
                  </span>
                </div>

                <div className="space-y-3">
                  <Link
                    href="/user-dashboard/profile"
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-gray-100 text-slate-900 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Xem hồ sơ
                  </Link>
                </div>
              </motion.div>

              {/* Quick Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white border border-gray-200 rounded-2xl p-6"
              >
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Thống kê</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Câu hỏi đã hỏi</span>
                    <span className="text-slate-900 font-medium">156</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Văn bản đã tạo</span>
                    <span className="text-slate-900 font-medium">8</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Thời gian sử dụng</span>
                    <span className="text-slate-900 font-medium">24h</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Ngày tham gia</span>
                    <span className="text-slate-900 font-medium">01/2026</span>
                  </div>
                </div>
              </motion.div>

              {/* Help Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-2xl p-6"
              >
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Cần hỗ trợ?</h3>
                <p className="text-sm text-slate-500 mb-4">
                  Liên hệ với đội ngũ hỗ trợ của chúng tôi
                </p>
                <Link
                  href="/contact"
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Liên hệ hỗ trợ
                </Link>
              </motion.div>

              {/* Save Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <button
                  onClick={handleSave}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Lưu cài đặt
                </button>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
