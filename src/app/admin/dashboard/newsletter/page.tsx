'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import {
    Mail,
    Users,
    BarChart3,
    Send,
    Calendar,
    Clock,
    Plus,
    Eye,
    Edit,
    Trash2,
    FileText,
    Activity,
    Settings,
    Home,
    TrendingUp,
    CheckCircle,
    AlertCircle,
    RefreshCw,
    LogOut
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import { IUser } from '@/types/next-auth'
import toast from 'react-hot-toast'
import {
    newsletterService,
    EmailCampaign,
    SubscriberStats
} from '@/services/newsletter.service'
import { NotificationDropdown } from '@/components/ui/NotificationDropdown'

export default function AdminNewsletterPage() {
    const { data: session } = useSession()
    const user = session?.user as IUser | undefined

    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [stats, setStats] = useState<SubscriberStats | null>(null)
    const [campaigns, setCampaigns] = useState<EmailCampaign[]>([])
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [newCampaignTitle, setNewCampaignTitle] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = () => {
        setLoading(true)
        setTimeout(() => {
            setStats(newsletterService.getSubscriberStats())
            setCampaigns(newsletterService.getCampaignHistory())
            setLoading(false)
        }, 500)
    }

    const handleCreateCampaign = () => {
        if (!newCampaignTitle.trim()) {
            toast.error('Vui lòng nhập tiêu đề campaign!')
            return
        }

        const campaign = newsletterService.createCampaign({
            title: newCampaignTitle,
            status: 'draft'
        })

        setCampaigns([campaign, ...campaigns])
        setNewCampaignTitle('')
        setShowCreateModal(false)
        toast.success('Đã tạo campaign mới!')
    }

    const handleSendCampaign = (campaignId: string) => {
        const success = newsletterService.updateCampaignStatus(campaignId, 'sent')
        if (success) {
            loadData()
            toast.success('Đã gửi email thành công!')
        } else {
            toast.error('Gửi email thất bại!')
        }
    }

    const getStatusBadge = (status: EmailCampaign['status']) => {
        switch (status) {
            case 'sent':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        <CheckCircle className="w-3 h-3" />
                        Đã gửi
                    </span>
                )
            case 'scheduled':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-600">
                        <Clock className="w-3 h-3" />
                        Đã lên lịch
                    </span>
                )
            case 'draft':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-500/20 text-slate-500">
                        <Edit className="w-3 h-3" />
                        Nháp
                    </span>
                )
        }
    }

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-'
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

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
                                <h1 className="font-bold text-slate-900">ViLaw</h1>
                                <p className="text-xs text-slate-500">Admin Panel</p>
                            </div>
                        )}
                    </Link>
                </div>

                {/* Nav */}
                <nav className="flex-1 p-4 space-y-2">
                    <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-gray-100 hover:text-slate-900 transition-colors">
                        <Home className="w-5 h-5" />
                        {sidebarOpen && <span>Dashboard</span>}
                    </Link>
                    <Link href="/admin/dashboard/users" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-gray-100 hover:text-slate-900 transition-colors">
                        <Users className="w-5 h-5" />
                        {sidebarOpen && <span>Người dùng</span>}
                    </Link>
                    <Link href="/admin/dashboard/documents" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-gray-100 hover:text-slate-900 transition-colors">
                        <FileText className="w-5 h-5" />
                        {sidebarOpen && <span>Văn bản</span>}
                    </Link>
                    <Link href="/admin/dashboard/activity" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-gray-100 hover:text-slate-900 transition-colors">
                        <Activity className="w-5 h-5" />
                        {sidebarOpen && <span>Hoạt động</span>}
                    </Link>
                    <Link href="/admin/dashboard/newsletter" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-600/10 text-blue-600 font-medium">
                        <Mail className="w-5 h-5" />
                        {sidebarOpen && <span>Newsletter</span>}
                    </Link>
                    <Link href="/admin/dashboard/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-gray-100 hover:text-slate-900 transition-colors">
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
                            <h1 className="text-2xl font-bold text-slate-900">Email Newsletter</h1>
                            <p className="text-slate-500 text-sm">Quản lý và gửi email thông báo văn bản pháp luật</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <NotificationDropdown />
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Tạo Campaign
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
                            className="bg-white border border-gray-200 rounded-2xl p-6"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                    <Users className="w-6 h-6 text-blue-600" />
                                </div>
                                <span className="text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded-full">
                                    +12%
                                </span>
                            </div>
                            <p className="text-3xl font-bold text-slate-900">{stats?.totalSubscribers.toLocaleString()}</p>
                            <p className="text-sm text-slate-500 mt-1">Tổng đăng ký</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white border border-gray-200 rounded-2xl p-6"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                                    <Mail className="w-6 h-6 text-green-400" />
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-slate-900">{stats?.activeSubscribers.toLocaleString()}</p>
                            <p className="text-sm text-slate-500 mt-1">Đang hoạt động</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white border border-gray-200 rounded-2xl p-6"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                                    <Eye className="w-6 h-6 text-purple-400" />
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-slate-900">{stats?.avgOpenRate}%</p>
                            <p className="text-sm text-slate-500 mt-1">Tỷ lệ mở TB</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white border border-gray-200 rounded-2xl p-6"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                                    <TrendingUp className="w-6 h-6 text-orange-400" />
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-slate-900">{stats?.avgClickRate}%</p>
                            <p className="text-sm text-slate-500 mt-1">Tỷ lệ click TB</p>
                        </motion.div>
                    </div>

                    {/* Subscriber Breakdown */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white border border-gray-200 rounded-2xl p-6"
                        >
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">Phân bố tần suất</h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-slate-500">Hàng tuần</span>
                                        <span className="text-slate-900 font-medium">{stats?.weeklyDigest}</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${((stats?.weeklyDigest || 0) / (stats?.totalSubscribers || 1)) * 100}%` }} />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-slate-500">Hàng ngày</span>
                                        <span className="text-slate-900 font-medium">{stats?.dailyDigest}</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${((stats?.dailyDigest || 0) / (stats?.totalSubscribers || 1)) * 100}%` }} />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-slate-500">Hàng tháng</span>
                                        <span className="text-slate-900 font-medium">{stats?.monthlyDigest}</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-purple-500 rounded-full" style={{ width: `${((stats?.monthlyDigest || 0) / (stats?.totalSubscribers || 1)) * 100}%` }} />
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6"
                        >
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">Campaigns gần đây</h3>
                            <div className="space-y-3">
                                {campaigns.slice(0, 3).map((campaign) => (
                                    <div key={campaign.id} className="flex items-center justify-between p-4 bg-gray-100/50 rounded-xl">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                                <Mail className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-slate-900 font-medium">{campaign.title}</p>
                                                <p className="text-sm text-slate-500">{formatDate(campaign.sentAt || campaign.scheduledAt || campaign.createdAt)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {getStatusBadge(campaign.status)}
                                            {campaign.status === 'draft' && (
                                                <button
                                                    onClick={() => handleSendCampaign(campaign.id)}
                                                    className="p-2 text-blue-600 hover:bg-blue-500/20 rounded-lg transition-colors"
                                                    title="Gửi ngay"
                                                >
                                                    <Send className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Campaign History Table */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="bg-white border border-gray-200 rounded-2xl overflow-hidden"
                    >
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-slate-900">Lịch sử Campaign</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-100/50">
                                    <tr>
                                        <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Tiêu đề</th>
                                        <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Trạng thái</th>
                                        <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Người nhận</th>
                                        <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Tỷ lệ mở</th>
                                        <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Tỷ lệ click</th>
                                        <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Ngày gửi</th>
                                        <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700">
                                    {campaigns.map((campaign) => (
                                        <tr key={campaign.id} className="hover:bg-gray-100/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                                                        <Mail className="w-4 h-4 text-blue-600" />
                                                    </div>
                                                    <span className="text-slate-900 font-medium">{campaign.title}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">{getStatusBadge(campaign.status)}</td>
                                            <td className="px-6 py-4 text-slate-900">{campaign.recipientCount.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-slate-900">{campaign.openRate ? `${campaign.openRate.toFixed(1)}%` : '-'}</td>
                                            <td className="px-6 py-4 text-slate-900">{campaign.clickRate ? `${campaign.clickRate.toFixed(1)}%` : '-'}</td>
                                            <td className="px-6 py-4 text-slate-500">{formatDate(campaign.sentAt || campaign.scheduledAt)}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {campaign.status === 'draft' && (
                                                        <button
                                                            onClick={() => handleSendCampaign(campaign.id)}
                                                            className="p-2 text-blue-600 hover:bg-blue-500/20 rounded-lg transition-colors"
                                                            title="Gửi ngay"
                                                        >
                                                            <Send className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button className="p-2 text-slate-500 hover:bg-gray-100 hover:text-slate-900 rounded-lg transition-colors">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </main>
            </div>

            {/* Create Campaign Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white border border-gray-200 rounded-2xl p-6 max-w-md w-full shadow-xl"
                    >
                        <h3 className="text-xl font-bold text-slate-900 mb-4">Tạo Campaign mới</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-500 mb-2">
                                    Tiêu đề Campaign
                                </label>
                                <input
                                    type="text"
                                    value={newCampaignTitle}
                                    onChange={(e) => setNewCampaignTitle(e.target.value)}
                                    placeholder="VD: Cập nhật văn bản tuần 09/01/2026"
                                    className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                />
                            </div>

                            <div className="bg-gray-100/50 rounded-xl p-4">
                                <p className="text-sm text-slate-500">
                                    Campaign sẽ được tạo ở trạng thái <strong className="text-slate-900">Nháp</strong>.
                                    Bạn có thể chỉnh sửa và thêm văn bản trước khi gửi.
                                </p>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 px-4 py-3 bg-gray-100 text-slate-900 rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleCreateCampaign}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Tạo Campaign
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    )
}
