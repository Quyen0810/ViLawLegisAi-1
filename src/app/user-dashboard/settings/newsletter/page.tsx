'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import {
    Mail,
    Bell,
    Clock,
    FileText,
    Building,
    Check,
    Save,
    ArrowLeft,
    Eye,
    Home,
    MessageCircle,
    History,
    Settings,
    LogOut
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import { IUser } from '@/types/next-auth'
import toast from 'react-hot-toast'
import {
    newsletterService,
    NewsletterPreferences,
    DOCUMENT_TYPES,
    AUTHORITIES,
    FREQUENCY_OPTIONS,
    TIME_OPTIONS
} from '@/services/newsletter.service'
import { SimpleSelect } from '@/components/ui/CustomSelect'

export default function UserNewsletterSettingsPage() {
    const { data: session } = useSession()
    const user = session?.user as IUser | undefined

    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [preferences, setPreferences] = useState<NewsletterPreferences | null>(null)
    const [saving, setSaving] = useState(false)
    const [showPreview, setShowPreview] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadPreferences()
    }, [user])

    const loadPreferences = () => {
        setLoading(true)
        setTimeout(() => {
            const prefs = newsletterService.getUserPreferences(user?._id)
            setPreferences(prefs)
            setLoading(false)
        }, 300)
    }

    const handleSave = () => {
        if (!preferences) return

        setSaving(true)
        setTimeout(() => {
            const success = newsletterService.saveUserPreferences(preferences, user?._id)
            if (success) {
                toast.success('Đã lưu cài đặt thành công!')
            } else {
                toast.error('Lưu cài đặt thất bại!')
            }
            setSaving(false)
        }, 500)
    }

    const toggleDocumentType = (type: string) => {
        if (!preferences) return
        const types = preferences.documentTypes.includes(type)
            ? preferences.documentTypes.filter(t => t !== type)
            : [...preferences.documentTypes, type]
        setPreferences({ ...preferences, documentTypes: types })
    }

    const toggleAuthority = (authority: string) => {
        if (!preferences) return
        const authorities = preferences.authorities.includes(authority)
            ? preferences.authorities.filter(a => a !== authority)
            : [...preferences.authorities, authority]
        setPreferences({ ...preferences, authorities })
    }

    if (loading || !preferences) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-500">Đang tải cài đặt...</p>
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
                                <p className="text-xs text-slate-500">User Dashboard</p>
                            </div>
                        )}
                    </Link>
                </div>

                {/* Nav */}
                <nav className="flex-1 p-4 space-y-2">
                    <Link href="/user-dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-gray-100 hover:text-slate-900 transition-colors">
                        <Home className="w-5 h-5" />
                        {sidebarOpen && <span>Trang chủ</span>}
                    </Link>
                    <Link href="/chat" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-gray-100 hover:text-slate-900 transition-colors">
                        <MessageCircle className="w-5 h-5" />
                        {sidebarOpen && <span>Chat AI</span>}
                    </Link>
                    <Link href="/user-dashboard/history" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-gray-100 hover:text-slate-900 transition-colors">
                        <History className="w-5 h-5" />
                        {sidebarOpen && <span>Lịch sử</span>}
                    </Link>
                    <Link href="/user-dashboard/settings/newsletter" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-600/10 text-blue-600 font-medium">
                        <Mail className="w-5 h-5" />
                        {sidebarOpen && <span>Newsletter</span>}
                    </Link>
                    <Link href="/user-dashboard/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-gray-100 hover:text-slate-900 transition-colors">
                        <Settings className="w-5 h-5" />
                        {sidebarOpen && <span>Cài đặt</span>}
                    </Link>
                </nav>

                {/* User Section */}
                <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-slate-900 flex items-center justify-center font-semibold flex-shrink-0">
                            {user?.email?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        {sidebarOpen && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900 truncate">{user?.username || user?.email?.split('@')[0]}</p>
                                <p className="text-xs text-slate-500">User</p>
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
                        <div className="flex items-center gap-4">
                            <Link href="/user-dashboard" className="p-2 text-slate-500 hover:text-slate-900 hover:bg-gray-100 rounded-lg transition-colors">
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">Đăng ký Newsletter</h1>
                                <p className="text-slate-500 text-sm">Nhận thông báo văn bản pháp luật qua email</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowPreview(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-slate-900 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                <Eye className="w-4 h-4" />
                                Xem trước
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-slate-900 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                {saving ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                Lưu cài đặt
                            </button>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 p-6 overflow-auto">
                    <div className="max-w-3xl mx-auto space-y-6">
                        {/* Enable Toggle */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white border border-gray-200 rounded-2xl p-6"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                        <Mail className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-900">Nhận email thông báo</h3>
                                        <p className="text-sm text-slate-500">Bật để nhận thông báo văn bản pháp luật mới qua email</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setPreferences({ ...preferences, enabled: !preferences.enabled })}
                                    className={`relative w-14 h-8 rounded-full transition-colors ${preferences.enabled ? 'bg-blue-600' : 'bg-slate-600'}`}
                                >
                                    <span className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${preferences.enabled ? 'left-7' : 'left-1'}`} />
                                </button>
                            </div>
                        </motion.div>

                        {preferences.enabled && (
                            <>
                                {/* Frequency & Time */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="bg-white border border-gray-200 rounded-2xl p-6"
                                >
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                                            <Clock className="w-5 h-5 text-green-400" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-slate-900">Tần suất gửi</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-500 mb-2">Tần suất</label>
                                            <SimpleSelect
                                                options={FREQUENCY_OPTIONS}
                                                value={preferences.frequency}
                                                onChange={(v) => setPreferences({ ...preferences, frequency: v as NewsletterPreferences['frequency'] })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-500 mb-2">Giờ gửi</label>
                                            <SimpleSelect
                                                options={TIME_OPTIONS}
                                                value={preferences.sendTime}
                                                onChange={(v) => setPreferences({ ...preferences, sendTime: v })}
                                            />
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Document Types */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="bg-white border border-gray-200 rounded-2xl p-6"
                                >
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                            <FileText className="w-5 h-5 text-purple-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-900">Loại văn bản quan tâm</h3>
                                            <p className="text-sm text-slate-500">Chọn các loại văn bản bạn muốn nhận thông báo</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {DOCUMENT_TYPES.map((type) => (
                                            <button
                                                key={type.value}
                                                onClick={() => toggleDocumentType(type.value)}
                                                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${preferences.documentTypes.includes(type.value)
                                                        ? 'bg-blue-600/10 border-blue-500 text-blue-600'
                                                        : 'bg-gray-100/50 border-gray-300 text-slate-500 hover:border-slate-500'
                                                    }`}
                                            >
                                                <span className="text-sm font-medium">{type.label}</span>
                                                {preferences.documentTypes.includes(type.value) && (
                                                    <Check className="w-4 h-4" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>

                                {/* Authorities */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="bg-white border border-gray-200 rounded-2xl p-6"
                                >
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                                            <Building className="w-5 h-5 text-orange-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-900">Cơ quan ban hành</h3>
                                            <p className="text-sm text-slate-500">Chọn cơ quan ban hành văn bản bạn quan tâm</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        {AUTHORITIES.map((authority) => (
                                            <button
                                                key={authority.value}
                                                onClick={() => toggleAuthority(authority.value)}
                                                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${preferences.authorities.includes(authority.value)
                                                        ? 'bg-blue-600/10 border-blue-500 text-blue-600'
                                                        : 'bg-gray-100/50 border-gray-300 text-slate-500 hover:border-slate-500'
                                                    }`}
                                            >
                                                <span className="text-sm font-medium">{authority.label}</span>
                                                {preferences.authorities.includes(authority.value) && (
                                                    <Check className="w-4 h-4" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>

                                {/* Summary */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-2xl p-6"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-blue-500/30 flex items-center justify-center flex-shrink-0">
                                            <Bell className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-900 mb-2">Tóm tắt đăng ký</h3>
                                            <p className="text-sm text-slate-300">
                                                Bạn sẽ nhận email <strong className="text-slate-900">{FREQUENCY_OPTIONS.find(f => f.value === preferences.frequency)?.label.toLowerCase()}</strong> vào lúc <strong className="text-slate-900">{preferences.sendTime}</strong> với{' '}
                                                <strong className="text-slate-900">{preferences.documentTypes.length}</strong> loại văn bản từ{' '}
                                                <strong className="text-slate-900">{preferences.authorities.length}</strong> cơ quan ban hành.
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </div>
                </main>
            </div>

            {/* Preview Modal */}
            {showPreview && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-auto shadow-xl"
                    >
                        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-900">Xem trước Email</h3>
                            <button
                                onClick={() => setShowPreview(false)}
                                className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
                            >
                                ✕
                            </button>
                        </div>
                        <div
                            dangerouslySetInnerHTML={{
                                __html: newsletterService.generateEmailPreview(preferences, [
                                    { title: 'Luật Bảo vệ môi trường 2024', type: 'Luật', url: '#' },
                                    { title: 'Nghị định 01/2024/NĐ-CP về đầu tư công', type: 'Nghị định', url: '#' },
                                    { title: 'Nghị định 02/2024/NĐ-CP về tài sản công', type: 'Nghị định', url: '#' },
                                    { title: 'Thông tư 02/2024/TT-BTC hướng dẫn Luật Thuế', type: 'Thông tư', url: '#' }
                                ])
                            }}
                        />
                    </motion.div>
                </div>
            )}
        </div>
    )
}
