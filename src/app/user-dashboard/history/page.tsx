'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import {
    MessageSquare,
    FileText,
    BookOpen,
    Clock,
    Calendar,
    Search,
    Filter,
    ChevronRight,
    Home,
    History,
    Mail,
    Settings,
    LogOut,
    Menu,
    X,
    Trash2,
    ExternalLink,
    Bot,
    Scale,
    Download,
    MoreVertical
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import { IUser } from '@/types/next-auth'
import { NotificationDropdown } from '@/components/ui/NotificationDropdown'
import { SimpleSelect } from '@/components/ui/CustomSelect'

// Mock history data
const mockHistoryItems = [
    {
        id: '1',
        type: 'chat' as const,
        title: 'Tư vấn về Luật Lao động 2019',
        description: 'Hỏi về quyền lợi nghỉ phép năm theo quy định mới',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        category: 'Lao động',
        messages: 8
    },
    {
        id: '2',
        type: 'document' as const,
        title: 'Hợp đồng thuê nhà ở',
        description: 'Đã tạo mẫu hợp đồng thuê nhà theo Luật Nhà ở 2014',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        category: 'Hợp đồng',
        pages: 5
    },
    {
        id: '3',
        type: 'legal' as const,
        title: 'Nghị định 168/2024/NĐ-CP',
        description: 'Xem chi tiết nghị định về xử phạt vi phạm giao thông',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
        category: 'Giao thông'
    },
    {
        id: '4',
        type: 'chat' as const,
        title: 'Thủ tục đăng ký kinh doanh',
        description: 'Tư vấn về hồ sơ thành lập doanh nghiệp tư nhân',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
        category: 'Doanh nghiệp',
        messages: 12
    },
    {
        id: '5',
        type: 'document' as const,
        title: 'Đơn khiếu nại quyết định hành chính',
        description: 'Soạn thảo đơn khiếu nại theo Luật Khiếu nại 2011',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
        category: 'Hành chính',
        pages: 3
    },
    {
        id: '6',
        type: 'chat' as const,
        title: 'Quyền lợi người lao động khi nghỉ việc',
        description: 'Tư vấn về trợ cấp thất nghiệp và bảo hiểm xã hội',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72),
        category: 'Lao động',
        messages: 15
    },
    {
        id: '7',
        type: 'legal' as const,
        title: 'Luật Bảo vệ môi trường 2020',
        description: 'Tra cứu quy định về đánh giá tác động môi trường',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 96),
        category: 'Môi trường'
    },
    {
        id: '8',
        type: 'chat' as const,
        title: 'Thủ tục ly hôn thuận tình',
        description: 'Tư vấn về hồ sơ và quy trình ly hôn tại tòa án',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 120),
        category: 'Hôn nhân gia đình',
        messages: 20
    }
]

const typeOptions = [
    { value: '', label: 'Tất cả loại' },
    { value: 'chat', label: 'Chat AI' },
    { value: 'document', label: 'Văn bản' },
    { value: 'legal', label: 'Tra cứu' }
]

const timeOptions = [
    { value: '', label: 'Tất cả thời gian' },
    { value: 'today', label: 'Hôm nay' },
    { value: 'week', label: 'Tuần này' },
    { value: 'month', label: 'Tháng này' }
]

export default function UserHistoryPage() {
    const { data: session, status } = useSession()
    const user = session?.user as IUser | undefined
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [typeFilter, setTypeFilter] = useState('')
    const [timeFilter, setTimeFilter] = useState('')
    const [historyItems, setHistoryItems] = useState(mockHistoryItems)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setTimeout(() => setLoading(false), 300)
    }, [])

    const filteredItems = historyItems.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesType = !typeFilter || item.type === typeFilter

        let matchesTime = true
        if (timeFilter) {
            const now = new Date()
            const itemDate = new Date(item.timestamp)
            if (timeFilter === 'today') {
                matchesTime = itemDate.toDateString() === now.toDateString()
            } else if (timeFilter === 'week') {
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                matchesTime = itemDate >= weekAgo
            } else if (timeFilter === 'month') {
                const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
                matchesTime = itemDate >= monthAgo
            }
        }

        return matchesSearch && matchesType && matchesTime
    })

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'chat':
                return <Bot className="w-5 h-5 text-blue-600" />
            case 'document':
                return <FileText className="w-5 h-5 text-green-400" />
            case 'legal':
                return <BookOpen className="w-5 h-5 text-purple-400" />
            default:
                return <Clock className="w-5 h-5 text-slate-500" />
        }
    }

    const getTypeBgColor = (type: string) => {
        switch (type) {
            case 'chat': return 'bg-blue-500/20'
            case 'document': return 'bg-green-500/20'
            case 'legal': return 'bg-purple-500/20'
            default: return 'bg-slate-500/20'
        }
    }

    const formatTimestamp = (date: Date) => {
        const now = new Date()
        const diff = now.getTime() - date.getTime()
        const minutes = Math.floor(diff / (1000 * 60))
        const hours = Math.floor(diff / (1000 * 60 * 60))
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))

        if (minutes < 60) return `${minutes} phút trước`
        if (hours < 24) return `${hours} giờ trước`
        if (days < 7) return `${days} ngày trước`
        return date.toLocaleDateString('vi-VN')
    }

    const userName = user?.username || user?.email?.split('@')[0] || 'Người dùng'

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-500">Đang tải lịch sử...</p>
                </div>
            </div>
        )
    }

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
                    <Link href="/user-dashboard/history" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-600/10 text-blue-600 font-medium">
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
                                <h1 className="text-xl font-bold text-slate-900">Lịch sử hoạt động</h1>
                                <p className="text-sm text-slate-500">Xem lại tất cả hoạt động của bạn</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <NotificationDropdown />
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 p-6 overflow-auto">
                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white border border-gray-200 rounded-2xl p-5"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                    <Bot className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-slate-900">{mockHistoryItems.filter(i => i.type === 'chat').length}</p>
                                    <p className="text-sm text-slate-500">Cuộc hội thoại</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white border border-gray-200 rounded-2xl p-5"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                                    <FileText className="w-6 h-6 text-green-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-slate-900">{mockHistoryItems.filter(i => i.type === 'document').length}</p>
                                    <p className="text-sm text-slate-500">Văn bản đã tạo</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white border border-gray-200 rounded-2xl p-5"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                                    <BookOpen className="w-6 h-6 text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-slate-900">{mockHistoryItems.filter(i => i.type === 'legal').length}</p>
                                    <p className="text-sm text-slate-500">Văn bản tra cứu</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Filters */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white border border-gray-200 rounded-2xl p-4 mb-6"
                    >
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm trong lịch sử..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-100 border border-gray-300 rounded-xl text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex gap-3">
                                <div className="w-40">
                                    <SimpleSelect
                                        options={typeOptions}
                                        value={typeFilter}
                                        onChange={setTypeFilter}
                                        placeholder="Loại"
                                    />
                                </div>
                                <div className="w-44">
                                    <SimpleSelect
                                        options={timeOptions}
                                        value={timeFilter}
                                        onChange={setTimeFilter}
                                        placeholder="Thời gian"
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* History List */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white border border-gray-200 rounded-2xl overflow-hidden"
                    >
                        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="font-semibold text-slate-900">
                                {filteredItems.length} kết quả
                            </h3>
                        </div>

                        <div className="divide-y divide-slate-700">
                            {filteredItems.length === 0 ? (
                                <div className="p-12 text-center">
                                    <History className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-slate-900 mb-2">Không tìm thấy kết quả</h3>
                                    <p className="text-slate-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                                </div>
                            ) : (
                                filteredItems.map((item, index) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.05 * index }}
                                        className="p-4 hover:bg-gray-100/50 transition-colors group"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={`w-12 h-12 rounded-xl ${getTypeBgColor(item.type)} flex items-center justify-center flex-shrink-0`}>
                                                {getTypeIcon(item.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-medium text-slate-900 truncate">{item.title}</h4>
                                                        <p className="text-sm text-slate-500 truncate mt-1">{item.description}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button className="p-2 text-slate-500 hover:text-slate-900 hover:bg-gray-200 rounded-lg transition-colors">
                                                            <ExternalLink className="w-4 h-4" />
                                                        </button>
                                                        <button className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-500/10 rounded-lg transition-colors">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 mt-2">
                                                    <span className="text-xs text-slate-500 flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {formatTimestamp(item.timestamp)}
                                                    </span>
                                                    <span className="text-xs bg-gray-100 text-slate-300 px-2 py-0.5 rounded-full">
                                                        {item.category}
                                                    </span>
                                                    {item.type === 'chat' && 'messages' in item && (
                                                        <span className="text-xs text-slate-500">
                                                            {item.messages} tin nhắn
                                                        </span>
                                                    )}
                                                    {item.type === 'document' && 'pages' in item && (
                                                        <span className="text-xs text-slate-500">
                                                            {item.pages} trang
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </main>
            </div>
        </div>
    )
}
