'use client'

// Newsletter Service - Quản lý Email Newsletter preferences và campaigns

export interface NewsletterPreferences {
    enabled: boolean
    frequency: 'daily' | 'weekly' | 'monthly'
    sendTime: string // HH:mm format
    documentTypes: string[]
    authorities: string[]
    lastUpdated: string
}

export interface EmailCampaign {
    id: string
    title: string
    status: 'draft' | 'scheduled' | 'sent'
    scheduledAt?: string
    sentAt?: string
    recipientCount: number
    openRate?: number
    clickRate?: number
    documentIds: string[]
    createdAt: string
}

export interface SubscriberStats {
    totalSubscribers: number
    activeSubscribers: number
    weeklyDigest: number
    dailyDigest: number
    monthlyDigest: number
    avgOpenRate: number
    avgClickRate: number
}

// Storage keys
const PREFS_STORAGE_KEY = 'vilaw_newsletter_prefs'
const CAMPAIGNS_STORAGE_KEY = 'vilaw_newsletter_campaigns'

// Default preferences
const DEFAULT_PREFERENCES: NewsletterPreferences = {
    enabled: false,
    frequency: 'weekly',
    sendTime: '09:00',
    documentTypes: ['Luật', 'Nghị định'],
    authorities: ['Quốc hội', 'Chính phủ'],
    lastUpdated: new Date().toISOString()
}

// Document types available
export const DOCUMENT_TYPES = [
    { value: 'Luật', label: 'Luật' },
    { value: 'Nghị định', label: 'Nghị định' },
    { value: 'Thông tư', label: 'Thông tư' },
    { value: 'Quyết định', label: 'Quyết định' },
    { value: 'Nghị quyết', label: 'Nghị quyết' },
    { value: 'Công văn', label: 'Công văn' },
    { value: 'Chỉ thị', label: 'Chỉ thị' },
    { value: 'Pháp lệnh', label: 'Pháp lệnh' }
]

// Authorities available
export const AUTHORITIES = [
    { value: 'Quốc hội', label: 'Quốc hội' },
    { value: 'Chính phủ', label: 'Chính phủ' },
    { value: 'Thủ tướng Chính phủ', label: 'Thủ tướng Chính phủ' },
    { value: 'Bộ Tư pháp', label: 'Bộ Tư pháp' },
    { value: 'Bộ Tài chính', label: 'Bộ Tài chính' },
    { value: 'Bộ Lao động - TBXH', label: 'Bộ Lao động - TBXH' },
    { value: 'Tòa án Tối cao', label: 'Tòa án Tối cao' },
    { value: 'Viện Kiểm sát Tối cao', label: 'Viện Kiểm sát Tối cao' }
]

// Frequency options
export const FREQUENCY_OPTIONS = [
    { value: 'daily', label: 'Hàng ngày' },
    { value: 'weekly', label: 'Hàng tuần' },
    { value: 'monthly', label: 'Hàng tháng' }
]

// Time options
export const TIME_OPTIONS = [
    { value: '07:00', label: '07:00 sáng' },
    { value: '09:00', label: '09:00 sáng' },
    { value: '12:00', label: '12:00 trưa' },
    { value: '17:00', label: '17:00 chiều' },
    { value: '20:00', label: '20:00 tối' }
]

// Get user preferences
export function getUserPreferences(userId?: string): NewsletterPreferences {
    if (typeof window === 'undefined') return DEFAULT_PREFERENCES

    const key = userId ? `${PREFS_STORAGE_KEY}_${userId}` : PREFS_STORAGE_KEY
    const stored = localStorage.getItem(key)

    if (stored) {
        try {
            return JSON.parse(stored)
        } catch {
            return DEFAULT_PREFERENCES
        }
    }

    return DEFAULT_PREFERENCES
}

// Save user preferences
export function saveUserPreferences(
    prefs: NewsletterPreferences,
    userId?: string
): boolean {
    if (typeof window === 'undefined') return false

    try {
        const key = userId ? `${PREFS_STORAGE_KEY}_${userId}` : PREFS_STORAGE_KEY
        const updatedPrefs = {
            ...prefs,
            lastUpdated: new Date().toISOString()
        }
        localStorage.setItem(key, JSON.stringify(updatedPrefs))
        return true
    } catch {
        return false
    }
}

// Get subscriber statistics (mock data for demo)
export function getSubscriberStats(): SubscriberStats {
    return {
        totalSubscribers: 1256,
        activeSubscribers: 1102,
        weeklyDigest: 856,
        dailyDigest: 234,
        monthlyDigest: 166,
        avgOpenRate: 42.5,
        avgClickRate: 18.2
    }
}

// Get campaign history
export function getCampaignHistory(): EmailCampaign[] {
    if (typeof window === 'undefined') return []

    const stored = localStorage.getItem(CAMPAIGNS_STORAGE_KEY)
    if (stored) {
        try {
            return JSON.parse(stored)
        } catch {
            return getMockCampaigns()
        }
    }

    return getMockCampaigns()
}

// Get mock campaigns for demo
function getMockCampaigns(): EmailCampaign[] {
    return [
        {
            id: 'camp-001',
            title: 'Cập nhật văn bản tuần 02/01/2026',
            status: 'sent',
            sentAt: '2026-01-06T09:00:00Z',
            recipientCount: 1089,
            openRate: 45.2,
            clickRate: 21.3,
            documentIds: ['doc1', 'doc2', 'doc3'],
            createdAt: '2026-01-05T14:30:00Z'
        },
        {
            id: 'camp-002',
            title: 'Cập nhật văn bản tuần 09/01/2026',
            status: 'scheduled',
            scheduledAt: '2026-01-13T09:00:00Z',
            recipientCount: 1102,
            documentIds: ['doc4', 'doc5'],
            createdAt: '2026-01-09T10:00:00Z'
        },
        {
            id: 'camp-003',
            title: 'Thông báo Luật mới 2026',
            status: 'draft',
            recipientCount: 0,
            documentIds: [],
            createdAt: '2026-01-09T15:00:00Z'
        }
    ]
}

// Create new campaign
export function createCampaign(data: Partial<EmailCampaign>): EmailCampaign {
    const newCampaign: EmailCampaign = {
        id: `camp-${Date.now()}`,
        title: data.title || 'Campaign mới',
        status: data.status || 'draft',
        scheduledAt: data.scheduledAt,
        recipientCount: data.recipientCount || 0,
        documentIds: data.documentIds || [],
        createdAt: new Date().toISOString()
    }

    // Save to storage
    const campaigns = getCampaignHistory()
    campaigns.unshift(newCampaign)

    if (typeof window !== 'undefined') {
        localStorage.setItem(CAMPAIGNS_STORAGE_KEY, JSON.stringify(campaigns))
    }

    return newCampaign
}

// Update campaign status
export function updateCampaignStatus(
    campaignId: string,
    status: EmailCampaign['status']
): boolean {
    if (typeof window === 'undefined') return false

    try {
        const campaigns = getCampaignHistory()
        const index = campaigns.findIndex(c => c.id === campaignId)

        if (index !== -1) {
            campaigns[index].status = status
            if (status === 'sent') {
                campaigns[index].sentAt = new Date().toISOString()
                campaigns[index].openRate = Math.random() * 30 + 30 // 30-60%
                campaigns[index].clickRate = Math.random() * 15 + 10 // 10-25%
            }
            localStorage.setItem(CAMPAIGNS_STORAGE_KEY, JSON.stringify(campaigns))
            return true
        }
        return false
    } catch {
        return false
    }
}

// Generate email content preview
export function generateEmailPreview(
    preferences: NewsletterPreferences,
    documents: Array<{ title: string; type: string; url: string }>
): string {
    const groupedDocs = documents.reduce((acc, doc) => {
        if (!acc[doc.type]) acc[doc.type] = []
        acc[doc.type].push(doc)
        return acc
    }, {} as Record<string, typeof documents>)

    let content = `
    <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px; border-radius: 16px 16px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">📬 ViLaw Newsletter</h1>
        <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0 0;">Cập nhật văn bản pháp luật mới nhất</p>
      </div>
      
      <div style="background: white; padding: 30px; border-radius: 0 0 16px 16px;">
        <p style="color: #334155;">Xin chào,</p>
        <p style="color: #334155;">Dưới đây là các văn bản pháp luật mới cập nhật theo đăng ký của bạn:</p>
  `

    for (const [type, docs] of Object.entries(groupedDocs)) {
        content += `
        <div style="margin: 20px 0; padding: 20px; background: #f1f5f9; border-radius: 12px;">
          <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 16px;">
            📋 ${type.toUpperCase()} (${docs.length} văn bản)
          </h3>
          <ul style="margin: 0; padding: 0; list-style: none;">
    `

        docs.forEach(doc => {
            content += `
            <li style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
              <a href="${doc.url}" style="color: #3b82f6; text-decoration: none; font-weight: 500;">
                ${doc.title}
              </a>
            </li>
      `
        })

        content += `
          </ul>
        </div>
    `
    }

    content += `
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
          <a href="#" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Xem tất cả văn bản mới
          </a>
        </div>
        
        <div style="margin-top: 30px; text-align: center; color: #64748b; font-size: 12px;">
          <p>Bạn nhận được email này vì đã đăng ký nhận thông báo từ ViLaw.</p>
          <a href="#" style="color: #64748b;">Quản lý đăng ký</a> | 
          <a href="#" style="color: #64748b;">Hủy đăng ký</a>
        </div>
      </div>
    </div>
  `

    return content
}

// Export service
export const newsletterService = {
    getUserPreferences,
    saveUserPreferences,
    getSubscriberStats,
    getCampaignHistory,
    createCampaign,
    updateCampaignStatus,
    generateEmailPreview,
    DOCUMENT_TYPES,
    AUTHORITIES,
    FREQUENCY_OPTIONS,
    TIME_OPTIONS
}

export default newsletterService
