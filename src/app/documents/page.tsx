'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  FileText, 
  Download, 
  Copy, 
  Save, 
  Wand2, 
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  AlertCircle,
  Clock,
  Upload,
  Bot,
  Type,
  Share2,
  Crown,
  Award,
  Lock
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { useSession } from 'next-auth/react'
import { IUser } from '@/types/next-auth'


interface DocumentTemplate {
  id: string
  name: string
  category: string
  description: string
  content: string
}

interface Document {
  id: string
  title: string
  type: string
  content: string
  status: 'draft' | 'completed'
  createdAt: Date
  updatedAt: Date
}

// Giới hạn số lần soạn thảo theo gói user
const DRAFTING_LIMITS = {
  normal: 15,
  pro: 50,
  admin: Infinity,
} as const

// Lưu trữ lịch sử soạn thảo trong localStorage
const getDraftingHistoryKey = (userId: string) => `vilaw_document_drafting_${userId}`
const getDraftingCountKey = (userId: string) => `vilaw_document_drafting_count_${userId}`

// Lấy user level từ email hoặc metadata
const getUserLevel = (email?: string): 'normal' | 'pro' | 'admin' => {
  if (!email) return 'normal'
  if (email.includes('admin') || email.includes('@vilaw.com')) return 'admin'
  if (email.includes('pro')) return 'pro'
  return 'normal'
}

export default function DocumentsPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const user = session?.user as IUser | undefined
  const userId = user?._id

  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null)
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const [draftingCount, setDraftingCount] = useState(0)
  const [userLevel, setUserLevel] = useState<'normal' | 'pro' | 'admin'>('normal')
  const [isLimitReached, setIsLimitReached] = useState(false)

  // Redirect nếu chưa đăng nhập
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace(`/auth/login?redirect=${encodeURIComponent('/documents')}`)
    }
  }, [status, router])

  // Lấy user level khi user đăng nhập
  useEffect(() => {
    if (user?.email) {
      const level = getUserLevel(user.email)
      setUserLevel(level)
    }
  }, [user])

  // Tải số lượng soạn thảo đã sử dụng khi user đăng nhập
  useEffect(() => {
    if (user && status === 'authenticated' && userId) {
      const countKey = getDraftingCountKey(userId)

      try {
        const savedCount = localStorage.getItem(countKey)
        if (savedCount) {
          const count = parseInt(savedCount, 10)
          if (!isNaN(count)) {
            setDraftingCount(count)
            checkLimitReached(count, getUserLevel(user.email))
          }
        }
      } catch (error) {
        console.error('Error loading drafting count:', error)
      }
    }
  }, [user, status, userId])

  // Kiểm tra giới hạn
  const checkLimitReached = (count: number, level: 'normal' | 'pro' | 'admin') => {
    const limit = DRAFTING_LIMITS[level]
    if (limit !== Infinity && count >= limit) {
      setIsLimitReached(true)
      return true
    }
    setIsLimitReached(false)
    return false
  }

  // Lưu số lượng soạn thảo
  const saveDraftingCount = (userId: string, count: number) => {
    try {
      const countKey = getDraftingCountKey(userId)
      localStorage.setItem(countKey, count.toString())
    } catch (error) {
      console.error('Error saving drafting count:', error)
    }
  }

  // Lưu lịch sử soạn thảo vào localStorage
  const saveDraftingHistory = (userId: string, document: Document) => {
    try {
      const historyKey = getDraftingHistoryKey(userId)
      const existingHistory = localStorage.getItem(historyKey)
      const history = existingHistory ? JSON.parse(existingHistory) : []
      
      const newEntry = {
        ...document,
        createdAt: document.createdAt.toISOString(),
        updatedAt: document.updatedAt.toISOString(),
      }
      
      // Tìm và cập nhật nếu đã tồn tại, hoặc thêm mới
      const existingIndex = history.findIndex((doc: any) => doc.id === document.id)
      if (existingIndex >= 0) {
        history[existingIndex] = newEntry
      } else {
        history.unshift(newEntry)
      }
      
      // Giữ tối đa 50 bản ghi
      if (history.length > 50) {
        history.pop()
      }
      
      localStorage.setItem(historyKey, JSON.stringify(history))
    } catch (error) {
      console.error('Error saving drafting history:', error)
    }
  }

  const templates: DocumentTemplate[] = [
    {
      id: '1',
      name: 'Đơn khiếu nại',
      category: 'Khiếu nại',
      description: 'Mẫu đơn khiếu nại hành chính',
      content: `Kính gửi: [Tên cơ quan có thẩm quyền]

Tôi là: [Họ và tên]
Sinh năm: [Năm sinh]
CMND/CCCD: [Số CMND/CCCD]
Địa chỉ: [Địa chỉ hiện tại]
Số điện thoại: [Số điện thoại]

NỘI DUNG KHIẾU NẠI

1. Quyết định hành chính, hành vi hành chính bị khiếu nại:
[Ghi rõ quyết định, hành vi bị khiếu nại]

2. Nội dung khiếu nại:
[Trình bày chi tiết lý do khiếu nại]

3. Yêu cầu của người khiếu nại:
[Ghi rõ yêu cầu cụ thể]

Tôi cam đoan những thông tin trên là đúng sự thật và chịu trách nhiệm trước pháp luật về nội dung khiếu nại.

[Địa điểm], ngày [ngày] tháng [tháng] năm [năm]

Người khiếu nại
(Ký và ghi rõ họ tên)`
    },
    {
      id: '2',
      name: 'Hợp đồng thuê nhà',
      category: 'Hợp đồng',
      description: 'Mẫu hợp đồng thuê nhà cơ bản',
      content: `HỢP ĐỒNG THUÊ NHÀ

Số: [Số hợp đồng]

Căn cứ vào Bộ luật Dân sự số 91/2015/QH13;
Căn cứ vào Luật Nhà ở số 65/2014/QH13;
Căn cứ vào nhu cầu và khả năng của các bên;

Hôm nay, ngày [ngày] tháng [tháng] năm [năm], tại [địa điểm], chúng tôi gồm:

BÊN CHO THUÊ (Bên A):
Họ và tên: [Họ và tên]
CMND/CCCD: [Số CMND/CCCD]
Địa chỉ: [Địa chỉ]
Số điện thoại: [Số điện thoại]

BÊN THUÊ (Bên B):
Họ và tên: [Họ và tên]
CMND/CCCD: [Số CMND/CCCD]
Địa chỉ: [Địa chỉ]
Số điện thoại: [Số điện thoại]

Hai bên thống nhất ký kết hợp đồng thuê nhà với các điều khoản sau:

ĐIỀU 1: ĐỐI TƯỢNG HỢP ĐỒNG
Bên A cho bên B thuê căn nhà tại địa chỉ: [Địa chỉ nhà]
Diện tích: [Diện tích] m²
Số phòng: [Số phòng]

ĐIỀU 2: THỜI HẠN THUÊ
Thời hạn thuê: [Số tháng] tháng
Từ ngày: [Ngày bắt đầu]
Đến ngày: [Ngày kết thúc]

ĐIỀU 3: GIÁ THUÊ VÀ PHƯƠNG THỨC THANH TOÁN
Giá thuê: [Số tiền] VNĐ/tháng
Phương thức thanh toán: [Ghi rõ phương thức]

ĐIỀU 4: QUYỀN VÀ NGHĨA VỤ CỦA CÁC BÊN
[Ghi rõ quyền và nghĩa vụ của từng bên]

ĐIỀU 5: ĐIỀU KHOẢN CHUNG
[Ghi rõ các điều khoản khác]

Hợp đồng này có hiệu lực từ ngày ký và được lập thành [số] bản, mỗi bên giữ [số] bản có giá trị pháp lý như nhau.

Đại diện bên cho thuê Đại diện bên thuê
(Ký và ghi rõ họ tên) (Ký và ghi rõ họ tên)`
    },
    {
      id: '3',
      name: 'Đơn xin việc',
      category: 'Đơn từ',
      description: 'Mẫu đơn xin việc chuyên nghiệp',
      content: `ĐƠN XIN VIỆC

Kính gửi: [Tên công ty/đơn vị]
Địa chỉ: [Địa chỉ công ty]

Tôi là: [Họ và tên]
Sinh năm: [Năm sinh]
CMND/CCCD: [Số CMND/CCCD]
Địa chỉ: [Địa chỉ hiện tại]
Số điện thoại: [Số điện thoại]
Email: [Email]

Tôi viết đơn này để xin ứng tuyển vào vị trí: [Tên vị trí]

LÝ LỊCH TRÍCH NGANG

1. Học vấn:
- Trường: [Tên trường]
- Chuyên ngành: [Chuyên ngành]
- Bằng cấp: [Bằng cấp]
- Năm tốt nghiệp: [Năm tốt nghiệp]

2. Kinh nghiệm làm việc:
[Liệt kê kinh nghiệm làm việc]

3. Kỹ năng:
[Liệt kê các kỹ năng]

4. Thành tích:
[Liệt kê các thành tích đạt được]

LÝ DO ỨNG TUYỂN
[Trình bày lý do muốn làm việc tại công ty]

Tôi cam đoan những thông tin trên là đúng sự thật và sẵn sàng cung cấp thêm thông tin khi cần thiết.

[Địa điểm], ngày [ngày] tháng [tháng] năm [năm]

Người xin việc
(Ký và ghi rõ họ tên)`
    },
    {
      id: '4',
      name: 'Đơn tố cáo',
      category: 'Tố cáo',
      description: 'Mẫu đơn tố cáo hành vi vi phạm pháp luật',
      content: `ĐƠN TỐ CÁO

Kính gửi: [Tên cơ quan có thẩm quyền]

Tôi là: [Họ và tên]
Sinh năm: [Năm sinh]
CMND/CCCD: [Số CMND/CCCD]
Địa chỉ: [Địa chỉ hiện tại]
Số điện thoại: [Số điện thoại]

NỘI DUNG TỐ CÁO

1. Thông tin người bị tố cáo:
Họ và tên: [Họ và tên]
Địa chỉ: [Địa chỉ]
Chức vụ: [Chức vụ] (nếu có)

2. Hành vi vi phạm:
[Trình bày chi tiết hành vi vi phạm pháp luật]

3. Thời gian, địa điểm xảy ra:
Thời gian: [Thời gian]
Địa điểm: [Địa điểm]

4. Chứng cứ:
[Liệt kê các chứng cứ có được]

5. Yêu cầu:
[Ghi rõ yêu cầu xử lý]

Tôi cam đoan những thông tin trên là đúng sự thật và chịu trách nhiệm trước pháp luật về nội dung tố cáo.

[Địa điểm], ngày [ngày] tháng [tháng] năm [năm]

Người tố cáo
(Ký và ghi rõ họ tên)`
    }
  ]

  const handleTemplateSelect = (template: DocumentTemplate) => {
    setSelectedTemplate(template)
    setCurrentDocument({
      id: Date.now().toString(),
      title: `Bản thảo - ${template.name}`,
      type: template.category,
      content: template.content,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    })
  }

  const handleGenerateWithAI = async () => {
    // Kiểm tra đăng nhập
    if (!user) {
      toast.error('Vui lòng đăng nhập để sử dụng chức năng soạn thảo văn bản')
      router.push(`/auth/login?redirect=${encodeURIComponent('/documents')}`)
      return
    }

    // Kiểm tra có document hoặc template để soạn thảo
    if (!currentDocument && !selectedTemplate) {
      toast.error('Vui lòng chọn mẫu văn bản hoặc tạo văn bản mới trước khi soạn thảo')
      return
    }

    // Kiểm tra giới hạn số lần soạn thảo
    const limit = DRAFTING_LIMITS[userLevel]
    if (limit !== Infinity && draftingCount >= limit) {
      toast.error(`Bạn đã đạt giới hạn ${limit} lần soạn thảo cho gói ${userLevel}. Vui lòng nâng cấp để tiếp tục sử dụng.`)
      setIsLimitReached(true)
      return
    }
  
    setIsGenerating(true)
    toast.loading('AI đang soạn thảo văn bản...', { id: 'drafting' })

    // Tăng số lượng soạn thảo và lưu
    const newDraftingCount = draftingCount + 1
    setDraftingCount(newDraftingCount)
    if (userId) {
      saveDraftingCount(userId, newDraftingCount)
    }
    checkLimitReached(newDraftingCount, userLevel)

    try {
      // Xác định document type và summary
      let backendDocumentType = 'Hợp Đồng Thuê Nhà' // default
      let summary = 'Soạn thảo văn bản pháp lý'

      if (selectedTemplate) {
        // Map document type từ template sang format backend
        const documentTypeMap: Record<string, string> = {
          'Đơn khiếu nại': 'Đơn Khiếu Nại',
          'Hợp đồng thuê nhà': 'Hợp Đồng Thuê Nhà',
          'Đơn xin việc': 'Đơn xin Việc',
          'Đơn tố cáo': 'Đơn tố cáo'
        }
        backendDocumentType = documentTypeMap[selectedTemplate.name] || selectedTemplate.name

        // Tạo summary từ template
        summary = currentDocument?.content && currentDocument.content.trim()
          ? `Soạn thảo ${selectedTemplate.name} với nội dung: ${currentDocument.content.substring(0, 200)}...`
          : `Soạn thảo ${selectedTemplate.name} - ${selectedTemplate.description}`
      } else if (currentDocument) {
        // Nếu không có template nhưng có document, dùng thông tin từ document
        const typeMap: Record<string, string> = {
          'Khiếu nại': 'Đơn Khiếu Nại',
          'Hợp đồng': 'Hợp Đồng Thuê Nhà',
          'Đơn từ': 'Đơn xin Việc',
          'Tố cáo': 'Đơn tố cáo'
        }
        backendDocumentType = typeMap[currentDocument.type] || 'Hợp Đồng Thuê Nhà'
        summary = currentDocument.content && currentDocument.content.trim()
          ? `Soạn thảo ${currentDocument.title || currentDocument.type} với nội dung: ${currentDocument.content.substring(0, 200)}...`
          : `Soạn thảo ${currentDocument.title || currentDocument.type}`
      }

      // Gọi API soạn thảo từ backend
      const backendUrl = 'https://vilawbot.onrender.com'
      const response = await fetch(`${backendUrl}/api/v1/contracts/draft`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.user?.access_token && {
            Authorization: `Bearer ${session.user.access_token}`
          })
        },
        body: JSON.stringify({
          document_type: backendDocumentType,
          summary: summary,
          metadata: {
            // Có thể thêm metadata từ currentDocument nếu có
            ...(currentDocument?.title && { title: currentDocument.title }),
            ...(currentDocument?.type && { type: currentDocument.type })
          }
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData?.detail || errorData?.message || `API error: ${response.status}`)
      }

      const data = await response.json()

      // Cập nhật document với nội dung từ API
      const enhancedContent = data.content_preview || currentDocument?.content || ''
      
      const updatedDoc = currentDocument ? {
        ...currentDocument,
        content: enhancedContent,
        updatedAt: new Date()
      } : {
        id: Date.now().toString(),
        title: selectedTemplate ? `Bản thảo - ${selectedTemplate.name}` : 'Bản thảo văn bản',
        type: selectedTemplate?.category || 'Khác',
        content: enhancedContent,
        status: 'draft' as const,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      setCurrentDocument(updatedDoc)
      
      // Lưu lịch sử soạn thảo
      if (userId) {
        saveDraftingHistory(userId, updatedDoc)
      }

      // Hiển thị thông báo với risk report nếu có
      if (data.risk_report) {
        toast.success('Đã soạn thảo văn bản thành công!', { id: 'drafting' })
        // Có thể hiển thị risk_report trong một modal hoặc notification
        console.log('Risk Report:', data.risk_report)
      } else {
        toast.success('Đã soạn thảo văn bản thành công!', { id: 'drafting' })
      }

      // Nếu có download_url, có thể thông báo cho user
      if (data.download_url) {
        console.log('Download URL:', `${backendUrl}${data.download_url}`)
      }
    } catch (error: any) {
      console.error('Drafting Error:', error)
      toast.error(
        error?.message || 'Không thể soạn thảo văn bản. Vui lòng kiểm tra lại kết nối hoặc thử lại sau.',
        { id: 'drafting' }
      )
    } finally {
      setIsGenerating(false)
    }
  }

  

  const handleCopy = () => {
    if (!currentDocument?.content) return
    navigator.clipboard.writeText(currentDocument.content)
    toast.success('Đã sao chép vào clipboard!')
  }

  const handleDownload = () => {
    if (!currentDocument?.content) return
    
    const blob = new Blob([currentDocument.content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${currentDocument.title || 'van-ban'}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Đã tải xuống văn bản!')
  }

 

  // Hiển thị loading khi đang kiểm tra đăng nhập
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-accent-50 to-primary-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang kiểm tra đăng nhập...</p>
        </div>
      </div>
    )
  }

  // Không hiển thị nội dung nếu chưa đăng nhập (sẽ redirect)
  if (!user) {
    return null
  }

  const limit = DRAFTING_LIMITS[userLevel]
  const remainingDraftings = limit === Infinity ? '∞' : Math.max(0, limit - draftingCount)

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
              <h1 className="text-2xl font-bold text-gray-900">Soạn thảo Văn bản</h1>
              <p className="text-sm text-gray-500">AI-powered document drafting và legal templates</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Hiển thị số lần soạn thảo còn lại */}
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-200">
              {userLevel === 'pro' && <Crown className="w-4 h-4 text-yellow-600" />}
              {userLevel === 'admin' && <Award className="w-4 h-4 text-red-600" />}
              <span className="text-sm font-medium text-gray-700">
                {isLimitReached ? (
                  <span className="text-red-600">Đã hết lượt</span>
                ) : (
                  <span>Còn lại: <strong>{remainingDraftings}</strong> lần soạn thảo</span>
                )}
              </span>
            </div>

            
            <button
              onClick={handleDownload}
              className="btn-secondary"
              title="Xuất văn bản"
            >
              <Download className="w-4 h-4 mr-2" />
              Xuất
            </button>
          </div>
        </div>
      </header>

      {/* Thông báo khi đạt giới hạn */}
      {isLimitReached && (
        <div className="max-w-7xl mx-auto px-4 pt-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="font-medium text-gray-900">Bạn đã đạt giới hạn {limit} lần soạn thảo cho gói {userLevel}</p>
                <p className="text-sm text-gray-600">Nâng cấp lên Pro để được {DRAFTING_LIMITS.pro} lần soạn thảo/tháng</p>
              </div>
            </div>
            <Link
              href="/payment?pkg=Pro"
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Crown className="w-4 h-4" />
              <span>Nâng cấp ngay</span>
            </Link>
          </motion.div>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Templates Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Mẫu văn bản</h2>
              
              <div className="space-y-3">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-4 h-4 text-primary-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{template.name}</p>
                        <p className="text-xs text-gray-500">{template.category}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Thao tác nhanh</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => handleTemplateSelect({
                      id: 'new',
                      name: 'Văn bản mới',
                      category: 'Khác',
                      description: 'Tạo văn bản mới từ đầu',
                      content: ''
                    })}
                    className="w-full flex items-center space-x-2 p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm">Văn bản mới</span>
                  </button>
                  <button
                    onClick={() => alert('Chức năng nhập văn bản chưa được triển khai')}
                    className="w-full flex items-center space-x-2 p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                  >
                    <Upload className="w-4 h-4" />
                    <span className="text-sm">Nhập văn bản</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Document Editor */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="space-y-4">
                 

                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Loại văn bản
                      </label>
                      <select
                        value={currentDocument?.type || ''}
                        onChange={(e) => {
                          const docType = e.target.value
                          if (!currentDocument) {
                            // Tạo document mới nếu chưa có
                            setCurrentDocument({
                              id: Date.now().toString(),
                              title: `Bản thảo - ${docType}`,
                              type: docType,
                              content: '',
                              status: 'draft',
                              createdAt: new Date(),
                              updatedAt: new Date()
                            })
                          } else {
                            // Cập nhật type của document hiện tại
                            setCurrentDocument({
                              ...currentDocument,
                              type: docType,
                              updatedAt: new Date()
                            })
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        aria-label="Chọn loại văn bản"
                      >
                        <option value="">Chọn loại văn bản</option>
                        <option value="Khiếu nại">Khiếu nại</option>
                        <option value="Hợp đồng">Hợp đồng</option>
                        <option value="Đơn từ">Đơn từ</option>
                        <option value="Tố cáo">Tố cáo</option>
                        <option value="Khác">Khác</option>
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cơ quan ban hành
                      </label>
                      <input
                        type="text"
                        value={currentDocument?.title || ''}
                        onChange={(e) => setCurrentDocument(prev => prev ? {
                          ...prev,
                          title: e.target.value,
                          updatedAt: new Date()
                        } : null)}
                        placeholder="Nhập cơ quan ban hành..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Nội dung văn bản
                    </label>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleCopy}
                        className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                        title="Sao chép nội dung"
                        disabled={!currentDocument?.content}
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleDownload}
                        className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                        title="Tải xuống văn bản"
                        disabled={!currentDocument?.content}
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <textarea
                    value={currentDocument?.content || ''}
                    onChange={(e) => {
                      // Tạo document nếu chưa có khi user bắt đầu nhập
                      if (!currentDocument) {
                        setCurrentDocument({
                          id: Date.now().toString(),
                          title: 'Bản thảo văn bản',
                          type: '',
                          content: e.target.value,
                          status: 'draft',
                          createdAt: new Date(),
                          updatedAt: new Date()
                        })
                      } else {
                        setCurrentDocument({
                          ...currentDocument,
                          content: e.target.value,
                          updatedAt: new Date()
                        })
                      }
                    }}
                    placeholder="Nhập nội dung văn bản hoặc để trống để AI soạn thảo từ đầu..."
                    rows={12}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none font-mono text-sm"
                  />
                </div>

                {/* Nút Soạn thảo với AI */}
                <div className="mt-4">
                  <button
                    onClick={handleGenerateWithAI}
                    disabled={isGenerating || isLimitReached || (!currentDocument?.type && !currentDocument?.content?.trim())}
                    className="w-full flex items-center justify-center px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {isGenerating ? (
                      <>
                        <Wand2 className="w-5 h-5 mr-2 animate-pulse" />
                        AI đang soạn thảo văn bản...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-5 h-5 mr-2" />
                        Soạn thảo với AI
                      </>
                    )}
                  </button>
                  {!currentDocument?.type && (
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      💡 Chọn loại văn bản ở trên hoặc nhập nội dung để AI soạn thảo
                    </p>
                  )}
                </div>

                {/* Hiển thị trạng thái khi đang soạn thảo */}
                {isGenerating && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm font-medium text-blue-900">AI đang soạn thảo văn bản...</span>
                    </div>
                    <p className="text-xs text-blue-700">
                      Đang tạo văn bản pháp lý theo chuẩn Việt Nam và kiểm tra rủi ro
                    </p>
                  </div>
                )}

                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">
                      {currentDocument?.content?.length || 0} ký tự
                    </span>
                    <span className="text-sm text-gray-500">
                      {currentDocument?.content?.split('\n').length || 0} dòng
                    </span>
                  </div>
                  
                 
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 