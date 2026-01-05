'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import logoImg from '../../1.png'
import {
  Search,
  MessageSquare,
  FileText,
  Users,
  Settings,
  BarChart3,
  BookOpen,
  Shield,
  Zap,
  Globe,
  Database,
  Bot,
  TrendingUp,
  Award,
  CheckCircle,
  Star,
  ArrowRight,
  Play,
  Share2,
  Scale,
  Search as SearchIcon,
  Download as DownloadIcon,
  Share2 as ShareIcon,
} from 'lucide-react'

const features = [
  {
    icon: <Search className="w-6 h-6" />,
    title: 'Tìm kiếm Thông minh',
    description: 'AI-powered search với semantic understanding và context awareness',
    badge: 'Semantic AI',
  },
  {
    icon: <MessageSquare className="w-6 h-6" />,
    title: 'Chatbot Pháp lý',
    description: 'Trợ lý AI 24/7, trả lời câu hỏi pháp lý bằng tiếng Việt',
    badge: '24/7',
  },
  {
    icon: <FileText className="w-6 h-6" />,
    title: 'Soạn thảo Văn bản',
    description: 'Tự động tạo hợp đồng, đơn từ với AI assistance',
    badge: 'AI Drafting',
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: 'Quản lý Hồ sơ',
    description: 'Digital case management với workflow automation',
    badge: 'Workflow',
  },
  {
    icon: <Settings className="w-6 h-6" />,
    title: 'Tích hợp API',
    description: 'RESTful APIs cho third-party integrations',
    badge: 'Open APIs',
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: 'Analytics & Reports',
    description: 'Real-time insights và predictive analytics',
    badge: 'Realtime',
  }
]

const heroHighlights = [
  {
    icon: <Shield className="w-5 h-5" />,
    title: 'Bảo mật cấp chính phủ',
    description: 'Tuân thủ tiêu chuẩn bảo mật dữ liệu & quyền riêng tư.'
  },
  {
    icon: <Database className="w-5 h-5" />,
    title: 'Kho dữ liệu 50K+ văn bản',
    description: 'Được cập nhật liên tục từ nguồn chính thống.'
  },
  {
    icon: <Bot className="w-5 h-5" />,
    title: 'AI hiểu ngữ cảnh Việt Nam',
    description: 'Đào tạo trên dữ liệu pháp luật chuyên sâu.'
  }
]

const useCases = [
  {
    name: 'Công dân',
    description:
      'Tìm kiếm nhanh các quy định liên quan đến đời sống thường ngày và nhận giải đáp tin cậy chỉ với vài câu hỏi.',
    highlights: ['Gợi ý thủ tục hành chính', 'Theo dõi thay đổi pháp luật', 'Kho câu hỏi thường gặp'],
    icon: <Users className="w-5 h-5" />,
  },
  {
    name: 'Doanh nghiệp',
    description:
      'Quản trị rủi ro pháp lý, cập nhật quy định chuyên ngành và tự động hóa soạn thảo hợp đồng theo chuẩn nội bộ.',
    highlights: ['Checklist tuân thủ', 'Quản lý hợp đồng tập trung', 'Cảnh báo thay đổi luật'],
    icon: <TrendingUp className="w-5 h-5" />,
  },
  {
    name: 'Cơ quan nhà nước',
    description:
      'Chia sẻ dữ liệu pháp luật mở, điều phối phản hồi của người dân và xây dựng hệ tri thức dùng chung.',
    highlights: ['Kho dữ liệu mở', 'Đồng bộ văn bản địa phương', 'Báo cáo vận hành realtime'],
    icon: <Scale className="w-5 h-5" />,
  }
]

const journeySteps = [
  {
    title: 'Kết nối & đồng bộ dữ liệu',
    description: 'Tự động thu thập, phân loại và chuẩn hóa văn bản từ nguồn chính thống.',
    icon: <Database className="w-5 h-5 text-blue-600" />,
  },
  {
    title: 'Phân tích bởi AI chuyên ngành',
    description: 'AI pháp lý phân tích, tóm tắt và liên kết điều khoản liên quan.',
    icon: <Bot className="w-5 h-5 text-blue-600" />,
  },
  {
    title: 'Tùy biến theo nhu cầu',
    description: 'Thiết lập workflow, phân quyền người dùng và tích hợp API vào hệ thống sẵn có.',
    icon: <Settings className="w-5 h-5 text-blue-600" />,
  },
  {
    title: 'Triển khai & mở rộng',
    description: 'Giám sát hiệu quả, đo lường mức độ tuân thủ và tối ưu trải nghiệm người dùng cuối.',
    icon: <TrendingUp className="w-5 h-5 text-blue-600" />,
  }
]

const testimonials = [
  {
    quote:
      'ViLaw giúp đội pháp chế của chúng tôi giảm hơn 60% thời gian tra cứu và soạn thảo văn bản nội bộ.',
    name: 'Nguyễn Thu Hà',
    role: 'Trưởng phòng Pháp chế - Fintech Việt',
  },
  {
    quote:
      'Người dân truy cập trung tâm dịch vụ công đã có thể tự tìm hiểu thủ tục với chatbot thông minh, giảm tải cho cán bộ.',
    name: 'Lê Quốc Cường',
    role: 'Giám đốc Trung tâm Dịch vụ công TP. Huế',
  },
  {
    quote:
      'Chúng tôi kết hợp API của ViLaw để xây dựng ứng dụng hướng dẫn pháp lý cho sinh viên luật và luật sư trẻ.',
    name: 'Trần Minh Phong',
    role: 'Giảng viên Trường ĐH Luật TP.HCM',
  }
]

const resourceHighlights = [
  {
    title: 'Bộ tài liệu triển khai nhanh',
    description: 'Checklist, biểu mẫu và hướng dẫn tích hợp dành cho đội CNTT & pháp chế.',
    icon: <DownloadIcon className="w-5 h-5" />,
    action: 'Tải xuống bộ kit',
  },
  {
    title: 'API mẫu & SDK',
    description: 'Thử nghiệm API tìm kiếm, soạn thảo và quản lý văn bản với sandbox miễn phí.',
    icon: <ShareIcon className="w-5 h-5" />,
    action: 'Khám phá API',
  },
  {
    title: 'Trung tâm học liệu pháp luật',
    description: 'Chuỗi webinar, hướng dẫn thực hành và câu chuyện chuyển đổi số pháp lý.',
    icon: <BookOpen className="w-5 h-5" />,
    action: 'Xem sự kiện',
  }
]

const packages = [
  {
    name: 'Gov',
    badge: 'Chính phủ',
    price: 'Miễn phí',
    features: [
      'Truy cập cơ bản',
      'Tìm kiếm văn bản',
      'Chatbot hỗ trợ',
      'API cơ bản'
    ],
    color: 'legal-500',
    popular: false
  },
  {
    name: 'Edu',
    badge: 'Giáo dục',
    price: 'Liên hệ',
    features: [
      'Tất cả tính năng Gov',
      'Tích hợp LMS',
      'Custom branding',
      'Priority support'
    ],
    color: 'accent-500',
    popular: false
  },
  {
    name: 'Pro',
    badge: 'Doanh nghiệp',
    price: 'Liên hệ',
    features: [
      'Tất cả tính năng Edu',
      'Advanced AI models',
      'Custom development',
      'Dedicated support'
    ],
    color: 'primary-600',
    popular: true
  }
]

const stats = [
  { label: 'Văn bản pháp luật', value: '50K+', icon: <FileText className="w-5 h-5" /> },
  { label: 'Người dùng', value: '10K+', icon: <Users className="w-5 h-5" /> },
  { label: 'Tỉnh thành', value: '63/63', icon: <Globe className="w-5 h-5" /> },
  { label: 'Uptime', value: '99.9%', icon: <Zap className="w-5 h-5" /> }
]

export default function HomePage() {
  const [activeUseCase, setActiveUseCase] = useState(useCases[0])
  const { data: session, status } = useSession()
  const user = (session?.user as { name?: string; email?: string } | null) || null
  const isLoggedIn = status === 'authenticated' || !!session
  const userInitial =
    user?.name?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() ||
    'U'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 relative">
      {/* Supabase User Icon */}
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-sm bg-white/90 border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-white shadow-sm">
                <Image src={logoImg} alt="ViLaw" width={64} height={64} className="object-contain w-full h-full" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">ViLaw</h1>
                <p className="text-sm text-slate-600">Nền tảng Pháp lý Số</p>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/chat" className="nav-link">Chat AI</Link>
              <Link href="/contract" className="nav-link">Hợp đồng</Link>
              <Link href="/documents" className="nav-link">Soạn thảo</Link>
              <Link href="/legal" className="nav-link">Văn bản</Link>
              <Link href="/payment" className="nav-link">nâng cấp </Link>
            </nav>

            <div className="flex items-center space-x-4">
              {isLoggedIn ? (
                <div className="flex items-center space-x-3">
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-sm font-semibold text-slate-900">
                      {user?.name || user?.email || 'Người dùng'}
                    </span>
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="text-xs text-slate-500 hover:text-slate-700"
                    >
                      Đăng xuất
                    </button>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold shadow-md">
                    {userInitial}
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link href="/auth/login" className="text-sm font-medium text-slate-700 hover:text-slate-900">
                    Đăng nhập
                  </Link>
                  <Link
                    href="/auth/register"
                    className="px-3 py-1.5 rounded-full text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                  >
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 md:py-16">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-grid opacity-40"></div>
          <div className="absolute -top-32 -left-20 w-96 h-96 rounded-full bg-blue-200/40 blur-3xl"></div>
          <div className="absolute top-48 -right-20 w-[30rem] h-[30rem] rounded-full bg-slate-200/40 blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-16 lg:grid-cols-[1.1fr_0.9fr] items-center">
            <motion.div
              className="space-y-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="section-badge">
                <Star className="w-4 h-4 text-blue-600" />
                Nền tảng pháp lý số toàn diện
              </span>

              <div className="space-y-6">
                <h1 className="text-4xl md:text-6xl font-bold text-slate-900 text-balance">
                  Mỗi công dân một <span className="text-gradient">trợ lý pháp lý AI</span>
                </h1>
                <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl">
                  ViLaw kết hợp dữ liệu pháp luật chính thống, AI chuyên sâu và quy trình vận hành để giúp bạn ra quyết định
                  chính xác, minh bạch và nhanh chóng hơn.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="https://vilawbot.onrender.com/api/v1/chat/stream" className="btn-primary inline-flex items-center justify-center">
                  <Play className="w-5 h-5 mr-2" />
                  Dùng thử trợ lý AI
                </Link>
                <Link href="/legal" className="btn-outline inline-flex items-center justify-center">
                  <Search className="w-5 h-5 mr-2" />
                  Khám phá kho văn bản
                </Link>
              </div>

              <div className="grid gap-6 sm:grid-cols-3">
                {heroHighlights.map((item) => (
                  <div key={item.title} className="highlight-card">
                    <div className="highlight-icon">{item.icon}</div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">{item.title}</h3>
                      <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="hero-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Trạng thái hệ thống</p>
                    <p className="text-2xl font-semibold text-slate-900">Hoạt động ổn định</p>
                  </div>
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-sm font-medium">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    99.9% uptime
                  </div>
                </div>

                <div className="mt-8 space-y-6">
                  <div className="journey-card">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">Mới cập nhật</p>
                      <h3 className="text-lg font-semibold text-slate-900">Kho pháp luật quốc gia</h3>
                    </div>
                    <div className="inline-flex items-center text-sm text-blue-600">
                      <ArrowRight className="w-4 h-4 mr-1" />
                      180 văn bản mới
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="stat-card">
                      <div className="stat-value">12K</div>
                      <p className="stat-label">Phiên chat trong tháng</p>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">4.8/5</div>
                      <p className="stat-label">Mức độ hài lòng</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="floating-card">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">Chứng nhận</p>
                    <p className="font-semibold text-slate-900">Đối tác chuyển đổi số 2024</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center card-soft"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="flex items-center justify-center w-16 h-16 bg-blue-50 rounded-2xl mx-auto mb-4 shadow-inner">
                  <div className="text-blue-600">{stat.icon}</div>
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-2">{stat.value}</div>
                <div className="text-slate-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <span className="section-badge">Năng lực cốt lõi</span>
            <h2 className="text-4xl font-bold text-slate-900">Tính năng nổi bật</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              ViLaw kết nối dữ liệu pháp luật toàn diện với trải nghiệm người dùng hiện đại, hỗ trợ mọi vai trò trong hệ sinh thái pháp lý.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="feature-card group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="feature-icon">
                  <div className="text-white">{feature.icon}</div>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-blue-600 mb-3">
                  <span className="badge-soft">{feature.badge}</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[0.6fr_1.4fr] items-center">
            <div className="space-y-6">
              <span className="section-badge">Trải nghiệm phù hợp từng đối tượng</span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                Thiết kế để phục vụ nhiều nhu cầu pháp lý khác nhau
              </h2>
              <p className="text-lg text-slate-600">
                Lựa chọn vai trò của bạn để xem ViLaw hỗ trợ thế nào. Từng gói giải pháp được cá nhân hóa quy trình, tài nguyên
                và công cụ cộng tác phù hợp.
              </p>
            </div>

            <div className="usecase-panel">
              <div className="flex flex-wrap gap-3">
                {useCases.map((useCase) => (
                  <button
                    key={useCase.name}
                    onClick={() => setActiveUseCase(useCase)}
                    className={`usecase-tab ${activeUseCase.name === useCase.name ? 'usecase-tab-active' : ''}`}
                  >
                    <span className="mr-2">{useCase.icon}</span>
                    {useCase.name}
                  </button>
                ))}
              </div>

              <motion.div
                key={activeUseCase.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="usecase-content"
              >
                <h3 className="text-2xl font-semibold text-slate-900 mb-3">{activeUseCase.name}</h3>
                <p className="text-slate-600 text-lg mb-6">{activeUseCase.description}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {activeUseCase.highlights.map((item) => (
                    <div key={item} className="usecase-highlight">
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Test System Card */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="card-elevated bg-gradient-to-r from-blue-50 to-slate-50"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Test hệ thống ngay
              </h2>
              <p className="text-lg text-slate-600 mb-12 max-w-2xl mx-auto">
                Trải nghiệm các tính năng AI-powered của ViLaw với dữ liệu mẫu
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Link href="/legal" className="card hover:shadow-medium transition-all duration-300 group">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <SearchIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">Duyệt văn bản</h3>
                  </div>
                  <p className="text-slate-600 mb-6">Tìm kiếm và lọc văn bản pháp luật với AI</p>
                  <div className="flex items-center text-blue-600 group-hover:text-blue-700 font-medium">
                    <span>Thử ngay</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                </Link>

                <Link href="/chat" className="card hover:shadow-medium transition-all duration-300 group">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-slate-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">Chat AI</h3>
                  </div>
                  <p className="text-slate-600 mb-6">Trò chuyện với trợ lý pháp lý AI</p>
                  <div className="flex items-center text-slate-600 group-hover:text-slate-700 font-medium">
                    <span>Thử ngay</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                </Link>

                <Link href="/documents" className="card hover:shadow-medium transition-all duration-300 group">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">Soạn thảo</h3>
                  </div>
                  <p className="text-slate-600 mb-6">Tạo văn bản pháp lý với AI assistance</p>
                  <div className="flex items-center text-blue-600 group-hover:text-blue-700 font-medium">
                    <span>Thử ngay</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Journey */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <span className="section-badge">Lộ trình chuyển đổi</span>
            <h2 className="text-4xl font-bold text-slate-900">Triển khai ViLaw trong 4 bước</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Từ thiết lập dữ liệu đến vận hành, đội ngũ ViLaw đồng hành cùng bạn trong từng giai đoạn để đảm bảo hệ thống hoạt động
              hiệu quả và bền vững.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {journeySteps.map((step, index) => (
              <motion.div
                key={step.title}
                className="journey-step"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <div className="journey-icon">{step.icon}</div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Gói Dịch vụ
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Lựa chọn gói phù hợp với nhu cầu của bạn
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packages.map((pkg, index) => (
              <motion.div
                key={pkg.name}
                className={`relative card-elevated ${
                  pkg.popular 
                    ? 'border-blue-200 shadow-medium' 
                    : ''
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                      Phổ biến
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-50 text-blue-600 mb-6">
                    {pkg.badge}
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{pkg.name}</h3>
                  <div className="text-4xl font-bold text-slate-900 mb-1">{pkg.price}</div>
                  <p className="text-slate-600">/ tháng</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {pkg.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {pkg.price === 'Miễn phí' ? (
                  <Link 
                    href="/chat" 
                    className={`w-full py-3 px-6 rounded-lg font-medium text-center transition-all duration-200 ${
                      pkg.popular
                        ? 'btn-primary'
                        : 'btn-secondary'
                    }`}
                  >
                    Bắt đầu sử dụng
                  </Link>
                ) : (
                  <Link
                    href={`/payment?pkg=${pkg.name}`}
                    className={`w-full py-3 px-6 rounded-lg font-medium text-center transition-all duration-200 ${
                      pkg.popular
                        ? 'btn-primary'
                        : 'btn-secondary'
                    }`}
                  >
                    Thanh toán bằng ví
                  </Link>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <span className="section-badge">Tin tưởng từ hệ sinh thái pháp lý</span>
            <h2 className="text-4xl font-bold text-slate-900">Khách hàng nói gì về ViLaw</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Các tổ chức, doanh nghiệp và cơ quan nhà nước đang sử dụng ViLaw để xây dựng trải nghiệm pháp lý số minh bạch.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((item, index) => (
              <motion.div
                key={item.name}
                className="testimonial-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <div className="flex gap-1 text-amber-400 mb-4">
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <Star key={starIndex} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-slate-700 leading-relaxed mb-6">“{item.quote}”</p>
                <div>
                  <p className="font-semibold text-slate-900">{item.name}</p>
                  <p className="text-sm text-slate-500">{item.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Resources */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <span className="section-badge">Nguồn lực đồng hành</span>
            <h2 className="text-4xl font-bold text-slate-900">Tăng tốc triển khai cùng đội ngũ ViLaw</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Bộ tài nguyên được chọn lọc dành cho nhóm triển khai, giúp bạn nhanh chóng làm chủ nền tảng và lan tỏa tới cộng đồng.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {resourceHighlights.map((resource, index) => (
              <motion.div
                key={resource.title}
                className="resource-card group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <div className="resource-icon">{resource.icon}</div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{resource.title}</h3>
                <p className="text-slate-600 leading-relaxed mb-6">{resource.description}</p>
                <Link href="/documents" className="inline-flex items-center text-blue-600 font-medium group-hover:text-blue-700">
                  {resource.action}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="cta-card">
            <div className="space-y-4">
              <span className="section-badge">Sẵn sàng chuyển đổi số?</span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                Khởi động cùng ViLaw và mang trải nghiệm pháp lý số đến với mọi người dân
              </h2>
              <p className="text-lg text-slate-600 max-w-3xl">
                Liên hệ đội ngũ chuyên gia để được tư vấn hành trình phù hợp, demo chuyên sâu và kế hoạch triển khai tối ưu chi phí.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/payment" className="btn-primary inline-flex items-center justify-center">
                <ArrowRight className="w-5 h-5 mr-2" />
                Đặt lịch tư vấn
              </Link>
              <Link href="/chat" className="btn-outline inline-flex items-center justify-center">
                <Play className="w-5 h-5 mr-2" />
                Thử demo tương tác
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                  <Scale className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">ViLaw</h3>
                  <p className="text-sm text-slate-400">Nền tảng Pháp lý Số</p>
                </div>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Mỗi công dân – Một trợ lý pháp lý AI
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">Sản phẩm</h4>
              <ul className="space-y-3 text-slate-400">
                <li><Link href="/legal" className="hover:text-white transition-colors">Văn bản pháp luật</Link></li>
                <li><Link href="/chat" className="hover:text-white transition-colors">Chat AI</Link></li>
                <li><Link href="/documents" className="hover:text-white transition-colors">Soạn thảo</Link></li>
                <li><Link href="/admin" className="hover:text-white transition-colors">Admin</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">Hỗ trợ</h4>
              <ul className="space-y-3 text-slate-400">
                <li><Link href="#" className="hover:text-white transition-colors">Tài liệu</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">API</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Liên hệ</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">FAQ</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">Công ty</h4>
              <ul className="space-y-3 text-slate-400">
                <li><Link href="#" className="hover:text-white transition-colors">Về chúng tôi</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Tuyển dụng</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Bảo mật</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Điều khoản</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-400">
            <p>&copy; 2024 ViLaw. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </footer>
    </div>
  )
} 