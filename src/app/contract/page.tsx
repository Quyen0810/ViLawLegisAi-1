'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Upload,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Download,
  Copy,
  Camera,
  Image,
  X,
  RotateCcw,
  Search,
  Crown,
  Award,
  Lock,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { useSession } from 'next-auth/react'
import { IUser } from '@/types/next-auth'


// Giới hạn số lần phân tích hợp đồng theo gói user
const ANALYSIS_LIMITS = {
  normal: 15,
  pro: 50,
  admin: Infinity,
} as const

// Lưu trữ lịch sử phân tích trong localStorage
const getAnalysisHistoryKey = (userId: string) => `vilaw_contract_analysis_${userId}`
const getAnalysisCountKey = (userId: string) => `vilaw_contract_analysis_count_${userId}`

// Lấy user level từ email hoặc metadata
const getUserLevel = (email?: string): 'normal' | 'pro' | 'admin' => {
  if (!email) return 'normal'
  if (email.includes('admin') || email.includes('@vilaw.com')) return 'admin'
  if (email.includes('pro')) return 'pro'
  return 'normal'
}

export default function ContractPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const user = session?.user as IUser | undefined
  const userId = user?._id
  const [contractText, setContractText] = useState('')
  const [contractType, setContractType] = useState('')
  const [contractContent, setContractContent] = useState('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)
  const [analysisCount, setAnalysisCount] = useState(0)
  const [userLevel, setUserLevel] = useState<'normal' | 'pro' | 'admin'>('normal')
  const [isLimitReached, setIsLimitReached] = useState(false)

  // Yêu cầu đăng nhập theo NextAuth mới để sử dụng Phân tích Hợp đồng

  // Redirect nếu chưa đăng nhập
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace(`/auth/login?redirect=${encodeURIComponent('/contract')}`)
    }
  }, [status, router])

  // Lấy user level khi user đăng nhập
  useEffect(() => {
    if (user?.email) {
      const level = getUserLevel(user.email)
      setUserLevel(level)
    }
  }, [user])

  // Tải số lượng phân tích đã sử dụng khi user đăng nhập
  useEffect(() => {
    if (user && status === 'authenticated' && userId) {
      const countKey = getAnalysisCountKey(userId)

      try {
        const savedCount = localStorage.getItem(countKey)
        if (savedCount) {
          const count = parseInt(savedCount, 10)
          if (!isNaN(count)) {
            setAnalysisCount(count)
            checkLimitReached(count, getUserLevel(user.email))
          }
        }
      } catch (error) {
        console.error('Error loading analysis count:', error)
      }
    }
  }, [user, status, userId])

  // Kiểm tra giới hạn
  const checkLimitReached = (count: number, level: 'normal' | 'pro' | 'admin') => {
    const limit = ANALYSIS_LIMITS[level]
    if (limit !== Infinity && count >= limit) {
      setIsLimitReached(true)
      return true
    }
    setIsLimitReached(false)
    return false
  }

  // Lưu số lượng phân tích
  const saveAnalysisCount = (userId: string, count: number) => {
    try {
      const countKey = getAnalysisCountKey(userId)
      localStorage.setItem(countKey, count.toString())
    } catch (error) {
      console.error('Error saving analysis count:', error)
    }
  }

  // Lưu lịch sử phân tích vào localStorage
  const saveAnalysisHistory = (userId: string, analysisData: any, contractText: string) => {
    try {
      const historyKey = getAnalysisHistoryKey(userId)
      const existingHistory = localStorage.getItem(historyKey)
      const history = existingHistory ? JSON.parse(existingHistory) : []

      const newEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        contractText: contractText.substring(0, 200), // Lưu preview
        analysis: analysisData,
      }

      history.unshift(newEntry) // Thêm vào đầu
      // Giữ tối đa 50 bản ghi
      if (history.length > 50) {
        history.pop()
      }

      localStorage.setItem(historyKey, JSON.stringify(history))
    } catch (error) {
      console.error('Error saving analysis history:', error)
    }
  }

  // const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = event.target.files?.[0]
  //   // const  FileImage = file?.type.includes('image')
  //   if (file) {
  //     setUploadedFile(file)
  //     // Read file content and set to contractContent
  //     const reader = new FileReader()
  //     reader.onload = (e) => {
  //       const content = e.target?.result as string
  //       setContractContent(content)
  //     }
  //     reader.readAsText(file)
  //   }
  // }

  const handleAnalyze = async () => {
    // Kiểm tra đăng nhập
    if (!user) {
      toast.error('Vui lòng đăng nhập để sử dụng Phân tích Hợp đồng')
      router.push(`/auth/login?redirect=${encodeURIComponent('/contract')}`)
      return
    }

    if (!contractContent.trim() && !uploadedFile) {
      toast.error('Vui lòng nhập nội dung hợp đồng hoặc tải lên file')
      return
    }

    // Kiểm tra giới hạn số lần phân tích
    const limit = ANALYSIS_LIMITS[userLevel]
    if (limit !== Infinity && analysisCount >= limit) {
      toast.error(`Bạn đã đạt giới hạn ${limit} lần phân tích cho gói ${userLevel}. Vui lòng nâng cấp để tiếp tục sử dụng.`)
      setIsLimitReached(true)
      return
    }

    setIsAnalyzing(true)

    // Tăng số lượng phân tích và lưu
    const newAnalysisCount = analysisCount + 1
    setAnalysisCount(newAnalysisCount)
    if (userId) {
      saveAnalysisCount(userId, newAnalysisCount)
    }
    checkLimitReached(newAnalysisCount, userLevel)

    try {
      // Gọi API phân tích rủi ro từ backend
      const contentToAnalyze = contractContent.trim() || contractText.trim()

      if (!contentToAnalyze) {
        toast.error('Nội dung hợp đồng không được để trống')
        setIsAnalyzing(false)
        return
      }

      // Map contract type từ UI sang format backend
      const contractTypeMap: Record<string, string> = {
        'labor': 'Hợp đồng lao động',
        'business': 'Hợp đồng thương mại',
        'property': 'Hợp đồng mua bán tài sản',
        'service': 'Hợp đồng dịch vụ',
        'lease': 'Hợp đồng thuê',
        'other': 'Hợp đồng khác'
      }
      const backendContractType = contractType ? contractTypeMap[contractType] || 'Hợp đồng khác' : 'Hợp đồng khác'
      
      
      const response = await fetch(`https://vilawbot.onrender.com/api/v1/contracts/check-risk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.user?.access_token && {
            Authorization: `Bearer ${session.user.access_token}`
          })
        },
        body: JSON.stringify({
          content: contentToAnalyze,
          contract_type: backendContractType
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData?.detail || errorData?.message || `API error: ${response.status}`)
      }

      const data = await response.json()

      // Map response từ backend sang format UI
      const mappedAnalysis = {
        overallRisk: data.overall_score >= 80 ? 'low' :
          data.overall_score >= 60 ? 'medium' :
            data.overall_score >= 40 ? 'high' : 'critical',
        riskScore: data.overall_score || 0,
        risks: (data.risks || []).map((risk: any) => ({
          title: risk.issue || 'Rủi ro phát hiện',
          description: risk.suggestion || risk.issue || '',
          clause: risk.clause || 'Không xác định',
          severity: risk.severity || 'Medium',
          legalBasis: risk.legal_basis || ''
        })),
        summary: data.completeness_status || 'Đã phân tích hợp đồng',
        recommendations: (data.risks || [])
          .filter((r: any) => r.suggestion)
          .map((r: any) => ({
            title: r.issue || 'Khuyến nghị',
            description: r.suggestion || ''
          })),
        complianceScore: data.overall_score || 0,
        missingFields: data.missing_fields || [],
        keyTerms: (data.risks || [])
          .filter((r: any) => r.severity === 'Low' || !r.severity)
          .map((r: any) => ({
            title: r.clause || 'Điều khoản',
            description: r.issue || '',
            location: r.clause || ''
          })),
        compliance: [
          {
            requirement: 'Độ đầy đủ thông tin',
            law: data.completeness_status || 'Đang kiểm tra',
            compliant: !data.missing_fields || data.missing_fields.length === 0
          },
          {
            requirement: 'Điểm an toàn pháp lý',
            law: `Điểm số: ${data.overall_score || 0}/100`,
            compliant: (data.overall_score || 0) >= 60
          },
          ...(data.missing_fields || []).map((field: string) => ({
            requirement: `Thiếu: ${field}`,
            law: 'Cần bổ sung',
            compliant: false
          }))
        ]
      }

      setAnalysis(mappedAnalysis)

      // Lưu lịch sử phân tích
      if (userId) {
        saveAnalysisHistory(userId, mappedAnalysis, contentToAnalyze)
      }

      toast.success('Phân tích hợp đồng thành công!')
    } catch (error: any) {
      console.error('Analysis Error:', error)
      toast.error(
        error?.message || 'Không thể kết nối với backend. Vui lòng kiểm tra lại kết nối hoặc thử lại sau.'
      )
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSampleContract = (contract: { name: string; content: string }) => {
    setContractText(contract.content)
    toast.success(`Đã tải mẫu hợp đồng: ${contract.name}`)
  }

  const handleScanImage = () => {
    // Tạo input file ẩn để chọn hình ảnh
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      // Kiểm tra loại file
      if (!file.type.startsWith('image/')) {
        toast.error('Vui lòng chọn file hình ảnh hợp lệ (JPG, PNG)')
        return
      }

      // Kiểm tra đăng nhập
      if (!user) {
        toast.error('Vui lòng đăng nhập để sử dụng chức năng quét hình ảnh')
        router.push(`/auth/login?redirect=${encodeURIComponent('/contract')}`)
        return
      }

      toast.loading('Đang quét và phân tích hình ảnh...', { id: 'scanning' })

      try {
        // Tạo FormData để gửi file
        const formData = new FormData()
        formData.append('file', file)

        // Gọi API OCR từ backend
        const response = await fetch(`https://vilawbot.onrender.com/api/v1/documents/analyze`, {
          method: 'POST',
          body: formData
          // Không set headers, browser sẽ tự động set Content-Type với boundary cho FormData
          // API này không yêu cầu authentication
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData?.message || `API error: ${response.status}`)
        }

        const data = await response.json()
        console.log('OCR Response:', data)

        // Kiểm tra lỗi từ backend
        if (data.document_type === 'Lỗi hệ thống') {
          // Nếu có thông tin lỗi chi tiết từ backend, hiển thị nó
          const errorDetail = data.error ? ` Chi tiết: ${data.error}` : ''
          throw new Error(`Backend gặp lỗi khi xử lý hình ảnh.${errorDetail} Có thể do: file ảnh không hợp lệ, thiếu GOOGLE_API_KEY, hoặc lỗi kết nối với Gemini API. Vui lòng kiểm tra backend logs và thử lại.`)
        }
        
        // Nếu document_type là "Không xác định" nhưng vẫn có dữ liệu, vẫn tiếp tục xử lý
        // Chỉ báo lỗi nếu không có dữ liệu nào

        // Trích xuất văn bản từ response
        let extractedText = ''

        // Thêm thông tin document type nếu có
        // if (data.document_type) {
        //   extractedText += `Loại tài liệu: ${data.document_type}\n\n`
        // }

        // Thêm thông tin entities (các bên)
        if (data.entities && data.entities.length > 0) {
          extractedText += 'Các bên tham gia:\n'
          data.entities.forEach((entity: any) => {
            extractedText += `- ${entity.role}: ${entity.name}\n`
          })
          extractedText += '\n'
        }

        // Thêm clauses (các điều khoản)
        if (data.clauses && data.clauses.length > 0) {
          data.clauses.forEach((clause: any) => {
            if (clause.number && clause.text) {
              extractedText += `${clause.number}\n${clause.text}\n\n`
            }
          })
        }

        // Thêm ghi chú viết tay nếu có
        if (data.handwritten_notes) {
          extractedText += `\nGhi chú: ${data.handwritten_notes}\n`
        }

        
    

        // Đưa văn bản đã scan vào contractContent
        setContractContent(extractedText.trim())
        setUploadedFile(file)

        // Tự động set contract type nếu có
        if (data.document_type && !contractType && data.document_type !== 'Không xác định') {
          const docType = data.document_type.toLowerCase()
          if (docType.includes('lao động')) setContractType('labor')
          else if (docType.includes('thương mại')) setContractType('business')
          else if (docType.includes('mua bán') || docType.includes('tài sản')) setContractType('property')
          else if (docType.includes('thuê')) setContractType('lease')
          else if (docType.includes('dịch vụ')) setContractType('service')
        }

        toast.success('Quét và phân tích hình ảnh thành công!', { id: 'scanning' })
      } catch (error: any) {
        console.error('OCR Error:', error)
        const errorMessage = error?.message || 'Không thể quét hình ảnh. Vui lòng thử lại hoặc nhập văn bản thủ công.'
        toast.error(errorMessage, { 
          id: 'scanning',
          duration: 5000 // Hiển thị lâu hơn để user đọc được
        })
      }
    }
    input.click()
  }

  const handleClear = () => {
    setContractText('')
    setContractContent('')
    setContractType('')
    setUploadedFile(null)
    setAnalysis(null)
  }

  const handleDownload = () => {
    if (!analysis) return

    const report = `Báo cáo phân tích hợp đồng\n\n` +
      `Mức độ rủi ro: ${getRiskText(analysis.overallRisk)}\n\n` +
      `Rủi ro phát hiện:\n${analysis.risks.map((r: any) => `- ${r.title}: ${r.description}`).join('\n')}\n\n` +
      `Khuyến nghị:\n${analysis.recommendations.map((r: any) => `- ${r.title}: ${r.description}`).join('\n')}`

    const blob = new Blob([report], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'contract-analysis-report.txt'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Đã tải xuống báo cáo')
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'critical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRiskText = (risk: string) => {
    switch (risk) {
      case 'low': return 'Thấp'
      case 'medium': return 'Trung bình'
      case 'high': return 'Cao'
      case 'critical': return 'Rất cao'
      default: return 'Không xác định'
    }
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

  const limit = ANALYSIS_LIMITS[userLevel]
  const remainingAnalyses = limit === Infinity ? '∞' : Math.max(0, limit - analysisCount)

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
              <h1 className="text-2xl font-bold text-gray-900">Phân tích Hợp đồng</h1>
              <p className="text-sm text-gray-500">AI-powered contract analysis và risk assessment</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Hiển thị số lần phân tích còn lại */}
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-200">
              {userLevel === 'pro' && <Crown className="w-4 h-4 text-yellow-600" />}
              {userLevel === 'admin' && <Award className="w-4 h-4 text-red-600" />}
              <span className="text-sm font-medium text-gray-700">
                {isLimitReached ? (
                  <span className="text-red-600">Đã hết lượt</span>
                ) : (
                  <span>Còn lại: <strong>{remainingAnalyses}</strong> lần phân tích</span>
                )}
              </span>
            </div>

            <button
              onClick={handleClear}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              title="Xóa tất cả"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownload}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              title="Xuất báo cáo"
            >
              <Download className="w-4 h-4" />
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
                <p className="font-medium text-gray-900">Bạn đã đạt giới hạn {limit} lần phân tích cho gói {userLevel}</p>
                <p className="text-sm text-gray-600">Nâng cấp lên Pro để được {ANALYSIS_LIMITS.pro} lần phân tích/tháng</p>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-6">
            {/* File Upload */}
            

            {/* Manual Input - Hiển thị nội dung sau khi scan */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Nội dung hợp đồng</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loại hợp đồng
                  </label>
                  <select
                    value={contractType}
                    onChange={(e) => setContractType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    aria-label="Chọn loại hợp đồng"
                  >
                    <option value="">Chọn loại hợp đồng</option>
                    <option value="labor">Hợp đồng lao động</option>
                    <option value="business">Hợp đồng thương mại</option>
                    <option value="property">Hợp đồng mua bán tài sản</option>
                    <option value="service">Hợp đồng dịch vụ</option>
                    <option value="lease">Hợp đồng thuê</option>
                    <option value="other">Khác</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nội dung hợp đồng
                  </label>
                  <textarea
                    value={contractContent}
                    onChange={(e) => setContractContent(e.target.value)}
                    placeholder="Nhập hoặc paste nội dung hợp đồng vào đây... Hoặc sử dụng nút Quét ảnh để trích xuất từ hình ảnh"
                    rows={12}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  />
                  {contractContent && (
                    <p className="text-xs text-gray-500 mt-1">
                      {contractContent.length} ký tự
                    </p>
                  )}
                </div>

                {isLimitReached && (
                  <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center space-x-2">
                    <Lock className="w-4 h-4 text-yellow-600" />
                    <p className="text-sm text-yellow-800">
                      Bạn đã đạt giới hạn. Vui lòng nâng cấp để tiếp tục sử dụng.
                    </p>
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    onClick={handleScanImage}
                    disabled={isLimitReached}
                    className="flex items-center justify-center px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Quét hình ảnh để trích xuất văn bản"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Quét ảnh
                  </button>
                  <button
                    onClick={handleAnalyze}
                    disabled={(!contractContent.trim() && !uploadedFile) || isLimitReached || isAnalyzing}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isAnalyzing ? (
                      <>
                        <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                        Đang phân tích...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        Phân tích
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Analysis Results */}
          <div className="space-y-6">
            {isAnalyzing ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang phân tích hợp đồng...</p>
                  </div>
                </div>
              </div>
            ) : analysis ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col max-h-[600px]">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex-shrink-0">Đánh giá rủi ro</h2>

                <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                  {/* Overall Risk */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Mức độ rủi ro tổng thể</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(analysis.overallRisk)}`}>
                      {getRiskText(analysis.overallRisk)}
                    </span>
                  </div>

                  {/* Risks List */}
                  <div>
                    <h3 className="text-md font-semibold text-gray-900 mb-3">Các rủi ro phát hiện</h3>
                    <div className="space-y-2">
                      {analysis.risks.map((risk: any, index: number) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{risk.title}</p>
                            <p className="text-sm text-gray-600">{risk.description}</p>
                            <p className="text-xs text-gray-500 mt-1">Điều khoản: {risk.clause}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Key Terms */}
                  <div>
                    <h3 className="text-md font-semibold text-gray-900 mb-3">Điều khoản quan trọng</h3>
                    <div className="space-y-2">
                      {analysis.keyTerms.map((term: any, index: number) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                          <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{term.title}</p>
                            <p className="text-sm text-gray-600">{term.description}</p>
                            <p className="text-xs text-gray-500 mt-1">Vị trí: {term.location}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div>
                    <h3 className="text-md font-semibold text-gray-900 mb-3">Khuyến nghị</h3>
                    <div className="space-y-2">
                      {analysis.recommendations.map((rec: any, index: number) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{rec.title}</p>
                            <p className="text-sm text-gray-600">{rec.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Compliance Check */}
                  <div>
                    <h3 className="text-md font-semibold text-gray-900 mb-3">Kiểm tra tuân thủ</h3>
                    <div className="space-y-2">
                      {analysis.compliance.map((item: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3 min-w-0 flex-1">
                            {item.compliant ? (
                              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900">{item.requirement}</p>
                              <p className="text-xs text-gray-500">{item.law}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${item.compliant ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                            {item.compliant ? 'Tuân thủ' : 'Không tuân thủ'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có phân tích</h3>
                  <p className="text-gray-500">Tải lên hợp đồng hoặc nhập nội dung để bắt đầu phân tích</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 