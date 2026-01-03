'use client'

import { useEffect, useMemo, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search as SearchIcon,
  Filter,
  Calendar,
  FileText,
  Download,
  Share2,
  Bookmark,
  BookmarkPlus,
  Eye,
  ChevronDown,
  ChevronUp,
  Grid,
  List,
  ArrowLeft,
  Building,
  Globe,
  TrendingUp,
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

type SortBy = 'dateIssued' | 'title' | 'type' | 'authority'
type SortOrder = 'asc' | 'desc'
type ViewMode = 'grid' | 'list'
type ActiveTab = 'browse' | 'search'

interface LegalDoc {
  id: string
  title: string
  type: string
  authority: string
  dateIssued: string
  url: string
  status: 'active' | 'draft' | 'archived' | 'amended' | 'repealed'
  source?: string
  content?: string
  summary?: string
  number?: string
  tags?: string[]
  views?: number
  downloads?: number
  isNew?: boolean
  lastCrawled?: string
}

const documentTypes = [
  'Hiến pháp', 'Luật', 'Bộ luật', 'Pháp lệnh',
  'Nghị quyết', 'Nghị định', 'Quyết định',
  'Thông tư', 'Chỉ thị', 'Quy chế',
  'Hướng dẫn', 'Công văn', 'Văn bản khác'
]

const authorities = [
  'Quốc hội', 'Chính phủ', 'Thủ tướng Chính phủ',
  'Bộ Tư pháp', 'Bộ Tài chính', 'Bộ Lao động - Thương binh và Xã hội',
  'Tòa án Tối cao', 'Viện Kiểm sát Tối cao'
]

const trendingSearches = [
  'hợp đồng lao động',
  'thừa kế',
  'mua bán nhà',
  'thành lập công ty',
  'khiếu nại hành chính',
  'tố cáo',
]

function getTypeBadgeColor(type: string): string {
  const colors: Record<string, string> = {
    'Hiến pháp': 'bg-red-100 text-red-800',
    'Luật': 'bg-blue-100 text-blue-800',
    'Bộ luật': 'bg-purple-100 text-purple-800',
    'Nghị quyết': 'bg-green-100 text-green-800',
    'Nghị định': 'bg-yellow-100 text-yellow-800',
    'Quyết định': 'bg-orange-100 text-orange-800',
    'Thông tư': 'bg-pink-100 text-pink-800',
    'Chỉ thị': 'bg-indigo-100 text-indigo-800',
  }
  return colors[type] || 'bg-gray-100 text-gray-800'
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

function useDeepLinkedState<T>(key: string, initial: T, parser: (v: string | null) => T, serializer: (v: T) => string) {
  const router = useRouter()
  const params = useSearchParams()
  const [value, setValue] = useState<T>(() => parser(params.get(key)))

  useEffect(() => {
    const urlValue = parser(params.get(key))
    setValue(urlValue)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, key])

  useEffect(() => {
    const current = new URLSearchParams(params.toString())
    const serialized = serializer(value)
    if (serialized) current.set(key, serialized)
    else current.delete(key)
    router.replace(`?${current.toString()}`, { scroll: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return [value, setValue] as const
}

function useLegalData() {
  const [documents, setDocuments] = useState<LegalDoc[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      try {
        await new Promise(resolve => setTimeout(resolve, 400))
        if (typeof window !== 'undefined' && (window as any).legalCrawler) {
          const docs = (window as any).legalCrawler.getAllDocuments() as LegalDoc[]
          setDocuments(docs)
        } else {
          // Sample unified dataset (mix of browse + search fields)
          const sample: LegalDoc[] = [
            {
              id: '1',
              title: 'Luật Bảo vệ môi trường 2020 (sửa đổi)',
              type: 'Luật',
              authority: 'Quốc hội',
              dateIssued: '2024-01-15',
              url: 'https://thuvienphapluat.vn/van-ban/Bo-may-hanh-chinh/Luat-Bao-ve-moi-truong-2020-sua-doi',
              status: 'active',
              source: 'library',
              summary: 'Quy định về bảo vệ môi trường, phòng ngừa, kiểm soát ô nhiễm...',
              tags: ['môi trường', 'bảo vệ', 'ô nhiễm'],
              views: 15420,
              downloads: 3240,
            },
            {
              id: '2',
              title: 'Nghị định 01/2024/NĐ-CP về đầu tư công',
              type: 'Nghị định',
              authority: 'Chính phủ',
              dateIssued: '2024-01-10',
              url: 'https://vanban.chinhphu.vn/chi-tiet-van-ban?Ngay=2024-01-15&So=01',
              status: 'active',
              source: 'government',
              isNew: true,
              summary: 'Quy định chi tiết về quản lý đầu tư công, thủ tục đầu tư...'
            },
            {
              id: '3',
              title: 'Thông tư 02/2024/TT-BTC hướng dẫn Luật Thuế',
              type: 'Thông tư',
              authority: 'Bộ Tài chính',
              dateIssued: '2024-01-08',
              url: 'https://vanban.chinhphu.vn/chi-tiet-van-ban?Ngay=2024-01-20&So=02',
              status: 'active',
              source: 'government',
              summary: 'Hướng dẫn thực hiện một số điều của Luật Thuế...',
            },
          ]
          setDocuments(sample)
        }
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  return { documents, isLoading }
}

function LegalPageContent() {
  const router = useRouter()
  const params = useSearchParams()
  const { documents, isLoading } = useLegalData()

  const [activeTab, setActiveTab] = useDeepLinkedState<ActiveTab>(
    'tab',
    'browse',
    (v) => (v === 'search' ? 'search' : 'browse'),
    (v) => v
  )

  const [searchQuery, setSearchQuery] = useDeepLinkedState<string>('q', '', v => v ?? '', v => v)
  const [selectedType, setSelectedType] = useDeepLinkedState<string>('type', '', v => v ?? '', v => v)
  const [selectedAuthority, setSelectedAuthority] = useDeepLinkedState<string>('authority', '', v => v ?? '', v => v)
  const [dateRange, setDateRange] = useDeepLinkedState<string>('dateRange', '', v => v ?? '', v => v)
  const [sortBy, setSortBy] = useDeepLinkedState<SortBy>('sortBy', 'dateIssued', v => (['title','type','authority','dateIssued'].includes(String(v)) ? (v as SortBy) : 'dateIssued'), v => v)
  const [sortOrder, setSortOrder] = useDeepLinkedState<SortOrder>('sortOrder', 'desc', v => (v === 'asc' ? 'asc' : 'desc'), v => v)
  const [viewMode, setViewMode] = useDeepLinkedState<ViewMode>('view', 'grid', v => (v === 'list' ? 'list' : 'grid'), v => v)

  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set())

  useEffect(() => {
    const saved = localStorage.getItem('vilaw_bookmarks')
    if (saved) setBookmarks(new Set(JSON.parse(saved)))
  }, [])

  const saveBookmarks = (next: Set<string>) => {
    localStorage.setItem('vilaw_bookmarks', JSON.stringify(Array.from(next)))
    setBookmarks(new Set(next))
  }

  const filteredDocuments = useMemo(() => {
    let list = [...documents]

    // Common filters
    if (selectedType) list = list.filter(d => d.type === selectedType)
    if (selectedAuthority) list = list.filter(d => d.authority === selectedAuthority)

    if (dateRange) {
      const now = new Date()
      let startDate: Date
      switch (dateRange) {
        case 'week': startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break
        case 'month': startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); break
        case 'year': startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000); break
        default: startDate = new Date(0)
      }
      list = list.filter(d => new Date(d.dateIssued) >= startDate)
    }

    // Tab-specific filtering
    if (activeTab === 'search' && searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(d =>
        d.title.toLowerCase().includes(q) ||
        d.authority.toLowerCase().includes(q) ||
        d.type.toLowerCase().includes(q) ||
        (d.summary && d.summary.toLowerCase().includes(q)) ||
        (d.content && d.content.toLowerCase().includes(q)) ||
        (d.tags && d.tags.some(t => t.toLowerCase().includes(q)))
      )
    }

    // Sort
    list.sort((a, b) => {
      let aVal: any, bVal: any
      switch (sortBy) {
        case 'title': aVal = a.title; bVal = b.title; break
        case 'type': aVal = a.type; bVal = b.type; break
        case 'authority': aVal = a.authority; bVal = b.authority; break
        default: aVal = new Date(a.dateIssued).getTime(); bVal = new Date(b.dateIssued).getTime();
      }
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    return list
  }, [documents, selectedType, selectedAuthority, dateRange, activeTab, searchQuery, sortBy, sortOrder])

  const handleShare = (doc: LegalDoc) => {
    if (navigator.share) {
      navigator.share({ title: doc.title, text: `${doc.type} - ${doc.authority}`, url: doc.url })
    } else {
      navigator.clipboard.writeText(doc.url)
      toast.success('Đã sao chép link')
    }
  }

  const handleDownload = async (doc: LegalDoc) => {
    try {
      const response = await fetch(doc.url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${doc.title}.pdf`
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success('Đã tải xuống')
    } catch (e) {
      toast.error('Không thể tải xuống')
    }
  }

  const toggleBookmark = (id: string) => {
    const next = new Set(bookmarks)
    if (next.has(id)) { next.delete(id); toast.success('Đã bỏ đánh dấu') }
    else { next.add(id); toast.success('Đã đánh dấu') }
    saveBookmarks(next)
  }

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
              <h1 className="text-2xl font-bold text-gray-900">Văn bản Pháp luật</h1>
              <p className="text-sm text-gray-500">Duyệt và tra cứu văn bản trong một nơi</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-600 hover:bg-gray-100'}`}
              title="Chế độ lưới"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-600 hover:bg-gray-100'}`}
              title="Chế độ danh sách"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Tabs */}
        <div className="flex space-x-1 mb-4 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('browse')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${activeTab === 'browse' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Duyệt
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${activeTab === 'search' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Tìm kiếm
          </button>
        </div>

        {/* Unified Search + Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">{activeTab === 'search' ? 'Từ khóa' : 'Tìm kiếm'}</label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={activeTab === 'search' ? 'Tìm kiếm văn bản pháp luật...' : 'Lọc nhanh theo tiêu đề, cơ quan...'}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  aria-label="Tìm kiếm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Loại văn bản</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label="Lọc theo loại văn bản"
              >
                <option value="">Tất cả</option>
                {documentTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cơ quan ban hành</label>
              <select
                value={selectedAuthority}
                onChange={(e) => setSelectedAuthority(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label="Lọc theo cơ quan ban hành"
              >
                <option value="">Tất cả</option>
                {authorities.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Thời gian</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label="Lọc theo thời gian"
              >
                <option value="">Tất cả</option>
                <option value="week">Tuần này</option>
                <option value="month">Tháng này</option>
                <option value="year">Năm nay</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Sắp xếp theo:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="px-3 py-1 border border-gray-300 rounded text-sm"
                aria-label="Sắp xếp theo"
              >
                <option value="dateIssued">Ngày ban hành</option>
                <option value="title">Tiêu đề</option>
                <option value="type">Loại văn bản</option>
                <option value="authority">Cơ quan</option>
              </select>

              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-1 text-gray-600 hover:text-gray-900"
                title={sortOrder === 'asc' ? 'Sắp xếp giảm dần' : 'Sắp xếp tăng dần'}
              >
                {sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            <div className="text-sm text-gray-500">{filteredDocuments.length} kết quả</div>
          </div>

          {activeTab === 'search' && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Tìm kiếm phổ biến</h3>
              <div className="flex flex-wrap gap-2">
                {trendingSearches.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => setSearchQuery(t)}
                    className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm"
                    title={`Tìm kiếm: ${t}`}
                  >
                    <TrendingUp className="w-3 h-3 text-primary-600" />
                    <span>{t}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-center py-12">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-primary-600 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-primary-600 rounded-full animate-bounce animation-delay-100"></div>
                <div className="w-3 h-3 bg-primary-600 rounded-full animate-bounce animation-delay-200"></div>
              </div>
              <span className="ml-3 text-gray-600">Đang tải...</span>
            </div>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center py-12">
            <SearchIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy kết quả</h3>
            <p className="text-gray-500">Thử thay đổi bộ lọc hoặc từ khóa</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredDocuments.map((doc, index) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.03 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeBadgeColor(doc.type)}`}>{doc.type}</span>
                      <div className="flex items-center space-x-1">
                        {doc.isNew && (
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">MỚI</span>
                        )}
                        <button
                          onClick={() => toggleBookmark(doc.id)}
                          className={`p-1 rounded ${bookmarks.has(doc.id) ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
                          title={bookmarks.has(doc.id) ? 'Bỏ đánh dấu' : 'Đánh dấu'}
                        >
                          <Bookmark className="w-4 h-4" fill={bookmarks.has(doc.id) ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-3">{doc.title}</h3>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600"><Building className="w-4 h-4 mr-2" />{doc.authority}</div>
                      <div className="flex items-center text-sm text-gray-600"><Calendar className="w-4 h-4 mr-2" />{formatDate(doc.dateIssued)}</div>
                    </div>

                    {doc.summary && <p className="text-sm text-gray-600 mb-4 line-clamp-3">{doc.summary}</p>}

                    <div className="flex items-center justify-between">
                      <a href={doc.url} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 text-sm font-medium">
                        <Eye className="w-4 h-4" />
                        <span>Xem chi tiết</span>
                      </a>
                      <div className="flex items-center space-x-2">
                        <button onClick={() => handleShare(doc)} className="p-1 text-gray-400 hover:text-gray-600" title="Chia sẻ"><Share2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDownload(doc)} className="p-1 text-gray-400 hover:text-gray-600" title="Tải xuống"><Download className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="divide-y divide-gray-200">
              <AnimatePresence>
                {filteredDocuments.map((doc, index) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.02 }}
                    className="p-6 hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeBadgeColor(doc.type)}`}>{doc.type}</span>
                          {doc.isNew && <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">MỚI</span>}
                          <button
                            onClick={() => toggleBookmark(doc.id)}
                            className={`p-1 rounded ${bookmarks.has(doc.id) ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
                            title={bookmarks.has(doc.id) ? 'Bỏ đánh dấu' : 'Đánh dấu'}
                          >
                            <Bookmark className="w-4 h-4" fill={bookmarks.has(doc.id) ? 'currentColor' : 'none'} />
                          </button>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{doc.title}</h3>
                        <div className="flex items-center space-x-6 text-sm text-gray-600 mb-3">
                          <div className="flex items-center"><Building className="w-4 h-4 mr-1" />{doc.authority}</div>
                          <div className="flex items-center"><Calendar className="w-4 h-4 mr-1" />{formatDate(doc.dateIssued)}</div>
                          <div className="flex items-center"><Globe className="w-4 h-4 mr-1" /><a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700">Xem toàn văn</a></div>
                        </div>
                        {doc.summary && <p className="text-sm text-gray-600 mb-3">{doc.summary}</p>}
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button onClick={() => handleShare(doc)} className="p-2 text-gray-400 hover:text-gray-600" title="Chia sẻ"><Share2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDownload(doc)} className="p-2 text-gray-400 hover:text-gray-600" title="Tải xuống"><Download className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function LegalPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-accent-50 to-primary-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    }>
      <LegalPageContent />
    </Suspense>
  )
}


