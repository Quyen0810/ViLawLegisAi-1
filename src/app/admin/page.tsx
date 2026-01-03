'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  RefreshCw, 
  Download, 
  Upload,
  Search,
  Filter,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowLeft,
  Settings,
  Database,
  Globe,
  Zap,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  ExternalLink,
  Bell,
  Users,
  BarChart3,
  RotateCcw,
  AlertTriangle,
  Plus
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface LegalDocument {
  id: string
  title: string
  type: string
  authority: string
  dateIssued: string
  dateModified?: string
  url: string
  status: 'active' | 'draft' | 'archived'
  source: string
  isNew?: boolean
  lastCrawled: string
}

interface UpdateStats {
  total: number
  thisWeek: number
  thisMonth: number
  byType: Record<string, number>
  lastUpdate: string
}

export default function AdminPage() {
  const [documents, setDocuments] = useState<LegalDocument[]>([])
  const [filteredDocuments, setFilteredDocuments] = useState<LegalDocument[]>([])
  const [stats, setStats] = useState<UpdateStats | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [selectedSource, setSelectedSource] = useState('')
  const [selectedAuthority, setSelectedAuthority] = useState('')
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(true)
  const [updateInterval, setUpdateInterval] = useState(6) // hours
  const [currentPage, setCurrentPage] = useState(1)
  const [docsPerPage] = useState(20)

  const documentTypes = [
    'Hiến pháp', 'Luật', 'Bộ luật', 'Pháp lệnh',
    'Nghị quyết', 'Nghị định', 'Quyết định',
    'Thông tư', 'Chỉ thị', 'Quy chế',
    'Hướng dẫn', 'Công văn', 'Văn bản khác'
  ]

  const sources = [
    'government', 'library', 'assembly', 'court', 
    'google_search', 'ministry_justice', 'ministry_finance'
  ]

  const authorities = [
    'Quốc hội', 'Chính phủ', 'Thủ tướng Chính phủ',
    'Bộ Tư pháp', 'Bộ Tài chính', 'Bộ Lao động - Thương binh và Xã hội',
    'Tòa án Tối cao', 'Viện Kiểm sát Tối cao'
  ]

  useEffect(() => {
    // Wait for window to be available (client-side only)
    const timer = setTimeout(() => {
      initializeCrawler()
      loadDocuments()
      loadStats()
    }, 1000) // Give time for scripts to load

    // Listen for crawler updates
    const handleUpdate = (event: CustomEvent) => {
      toast.success(`Đã cập nhật: ${event.detail.newDocuments} văn bản mới`)
      loadDocuments()
      loadStats()
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('vilaw-legal-update', handleUpdate as EventListener)
    }
    
    return () => {
      clearTimeout(timer)
      if (typeof window !== 'undefined') {
        window.removeEventListener('vilaw-legal-update', handleUpdate as EventListener)
      }
    }
  }, [])

  useEffect(() => {
    filterDocuments()
  }, [documents, searchTerm, selectedType, selectedSource, selectedAuthority])

  const initializeCrawler = async () => {
    if (typeof window !== 'undefined' && window.legalCrawler) {
      await window.legalCrawler.initialize()
    } else {
      console.log('Legal crawler not available yet')
    }
  }

  const loadDocuments = () => {
    if (typeof window !== 'undefined' && window.legalCrawler) {
      const docs = window.legalCrawler.getAllDocuments()
      setDocuments(docs)
    } else {
      // Load sample data if crawler not available
      setDocuments(getSampleDocuments())
    }
  }

  const loadStats = () => {
    if (typeof window !== 'undefined' && window.legalCrawler) {
      const statsData = window.legalCrawler.getUpdateStats()
      setStats(statsData)
    } else {
      // Load sample stats
      setStats({
        total: 156,
        thisWeek: 12,
        thisMonth: 43,
        byType: {
          'Luật': 23,
          'Nghị định': 45,
          'Thông tư': 67,
          'Quyết định': 21
        },
        lastUpdate: new Date().toISOString()
      })
    }
  }

  const getSampleDocuments = () => [
    {
      id: '1',
      title: 'Luật Bảo vệ môi trường 2020 (sửa đổi)',
      type: 'Luật',
      authority: 'Quốc hội',
      dateIssued: '2024-01-15',
      url: 'https://thuvienphapluat.vn/van-ban/Bo-may-hanh-chinh/Luat-Bao-ve-moi-truong-2020-sua-doi',
      status: 'active' as const,
      source: 'library',
      lastCrawled: '2024-01-16T10:00:00Z'
    },
    {
      id: '2',
      title: 'Nghị định 01/2024/NĐ-CP về đầu tư công',
      type: 'Nghị định',
      authority: 'Chính phủ',
      dateIssued: '2024-01-10',
      url: 'https://vanban.chinhphu.vn/chi-tiet-van-ban?Ngay=2024-01-15&So=01',
      status: 'active' as const,
      source: 'government',
      isNew: true,
      lastCrawled: '2024-01-16T11:00:00Z'
    },
    {
      id: '3',
      title: 'Thông tư 02/2024/TT-BTC hướng dẫn Luật Thuế',
      type: 'Thông tư',
      authority: 'Bộ Tài chính',
      dateIssued: '2024-01-08',
      url: 'https://vanban.chinhphu.vn/chi-tiet-van-ban?Ngay=2024-01-20&So=02',
      status: 'active' as const,
      source: 'government',
      lastCrawled: '2024-01-16T12:00:00Z'
    }
  ]

  const filterDocuments = () => {
    let filtered = documents

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(doc => 
        doc.title.toLowerCase().includes(term) ||
        doc.authority.toLowerCase().includes(term) ||
        doc.type.toLowerCase().includes(term)
      )
    }

    if (selectedType) {
      filtered = filtered.filter(doc => doc.type === selectedType)
    }

    if (selectedSource) {
      filtered = filtered.filter(doc => doc.source === selectedSource)
    }

    if (selectedAuthority) {
      filtered = filtered.filter(doc => doc.authority === selectedAuthority)
    }

    setFilteredDocuments(filtered)
  }

  const handleForceUpdate = async () => {
    setIsUpdating(true)
    toast.loading('Đang cập nhật văn bản pháp luật...', { duration: 2000 })
    
    try {
      if (typeof window !== 'undefined' && window.legalCrawler) {
        await window.legalCrawler.forceUpdate()
        loadDocuments()
        loadStats()
        toast.success('Cập nhật thành công!')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      toast.error('Cập nhật thất bại: ' + message)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleExportDocuments = () => {
    const dataStr = JSON.stringify(filteredDocuments, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `vilaw-documents-${new Date().toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
    
    toast.success('Đã xuất dữ liệu thành công!')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  const getSourceName = (source: string) => {
    const sourceNames: Record<string, string> = {
      'government': 'Chính phủ',
      'library': 'Thư viện Pháp luật',
      'assembly': 'Quốc hội',
      'court': 'Tòa án',
      'google_search': 'Google Search',
      'ministry_justice': 'Bộ Tư pháp',
      'ministry_finance': 'Bộ Tài chính'
    }
    return sourceNames[source] || source
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100'
      case 'draft': return 'text-yellow-600 bg-yellow-100'
      case 'archived': return 'text-gray-600 bg-gray-100'
      default: return 'text-blue-600 bg-blue-100'
    }
  }

  // Pagination
  const indexOfLastDoc = currentPage * docsPerPage
  const indexOfFirstDoc = indexOfLastDoc - docsPerPage
  const currentDocs = filteredDocuments.slice(indexOfFirstDoc, indexOfLastDoc)
  const totalPages = Math.ceil(filteredDocuments.length / docsPerPage)

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-accent-50 to-primary-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-primary-600 hover:text-primary-700">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-sm text-gray-500">Quản lý hệ thống và dữ liệu</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleForceUpdate}
              disabled={isUpdating}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isUpdating ? 'animate-spin' : ''}`} />
              <span>{isUpdating ? 'Đang cập nhật...' : 'Cập nhật ngay'}</span>
            </button>
            <button
              onClick={handleExportDocuments}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              <Download className="w-4 h-4" />
              <span>Xuất dữ liệu</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Tổng văn bản</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total.toLocaleString()}</p>
                </div>
                <Database className="w-8 h-8 text-blue-600" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Tuần này</p>
                  <p className="text-2xl font-bold text-green-600">{stats.thisWeek}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Tháng này</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.thisMonth}</p>
                </div>
                <Calendar className="w-8 h-8 text-purple-600" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Cập nhật cuối</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(stats.lastUpdate)}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </motion.div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tìm kiếm
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm văn bản..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại văn bản
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label="Lọc theo loại văn bản"
              >
                <option value="">Tất cả loại</option>
                {documentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nguồn
              </label>
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label="Lọc theo nguồn"
              >
                <option value="">Tất cả nguồn</option>
                {sources.map(source => (
                  <option key={source} value={source}>{getSourceName(source)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cơ quan ban hành
              </label>
              <select
                value={selectedAuthority}
                onChange={(e) => setSelectedAuthority(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label="Lọc theo cơ quan ban hành"
              >
                <option value="">Tất cả cơ quan</option>
                {authorities.map(authority => (
                  <option key={authority} value={authority}>{authority}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              Hiển thị {filteredDocuments.length} trong tổng số {documents.length} văn bản
            </div>
            
            <button
              onClick={handleExportDocuments}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              <Download className="w-4 h-4" />
              <span>Xuất dữ liệu</span>
            </button>
          </div>
        </div>

        {/* Document List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Danh sách văn bản</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Văn bản
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loại
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cơ quan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày ban hành
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nguồn
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <AnimatePresence>
                  {currentDocs.map((doc, index) => (
                    <motion.tr
                      key={doc.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.02 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {doc.isNew && (
                            <span className="mr-2 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                              MỚI
                            </span>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900 line-clamp-2">
                              {doc.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {doc.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {doc.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {doc.authority}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(doc.dateIssued)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getSourceName(doc.source)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(doc.status)}`}>
                          {doc.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-900"
                          title="Xem văn bản"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Trang {currentPage} / {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50"
                >
                  Trước
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}