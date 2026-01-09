'use client'

// Legal Crawler Service - Tích hợp với frontend
// Dựa trên logic từ legal-crawler.js

export interface CrawledDocument {
    id: string
    title: string
    type: string
    authority: string
    dateIssued: string
    url: string
    status: 'active' | 'draft' | 'archived'
    source: string
    content?: string
    lastCrawled: string
}

export interface CrawlStats {
    total: number
    thisWeek: number
    thisMonth: number
    byType: Record<string, number>
    lastUpdate: string
}

export interface CrawlResult {
    newDocuments: number
    updatedDocuments: number
    documents: CrawledDocument[]
    timestamp: string
}

const STORAGE_KEY = 'vilaw_legal_documents'
const STATS_KEY = 'vilaw_crawl_stats'
const LAST_UPDATE_KEY = 'vilaw_last_update'

// Document types
const DOCUMENT_TYPES = [
    'Hiến pháp', 'Luật', 'Bộ luật', 'Pháp lệnh',
    'Nghị quyết', 'Nghị định', 'Quyết định',
    'Thông tư', 'Chỉ thị', 'Quy chế',
    'Hướng dẫn', 'Công văn'
]

// Sources configuration
const SOURCES = {
    government: {
        name: 'Cổng thông tin Chính phủ',
        url: 'https://vanban.chinhphu.vn',
    },
    library: {
        name: 'Thư viện Pháp luật',
        url: 'https://thuvienphapluat.vn',
    },
    assembly: {
        name: 'Quốc hội',
        url: 'https://quochoi.vn',
    },
    court: {
        name: 'Tòa án Tối cao',
        url: 'https://toaan.gov.vn',
    }
}

// Detect document type from title
function detectDocumentType(title: string): string {
    const lowerTitle = title.toLowerCase()

    for (const type of DOCUMENT_TYPES) {
        if (lowerTitle.includes(type.toLowerCase())) {
            return type
        }
    }

    return 'Văn bản khác'
}

// Generate unique document ID
function generateDocumentId(url: string): string {
    return btoa(url).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16)
}

// Get documents from localStorage
export function getStoredDocuments(): CrawledDocument[] {
    if (typeof window === 'undefined') return []

    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
        try {
            return JSON.parse(stored)
        } catch {
            return []
        }
    }
    return []
}

// Save documents to localStorage
function saveDocuments(documents: CrawledDocument[]) {
    if (typeof window === 'undefined') return

    localStorage.setItem(STORAGE_KEY, JSON.stringify(documents))
    localStorage.setItem(LAST_UPDATE_KEY, new Date().toISOString())
}

// Get crawl stats
export function getCrawlStats(): CrawlStats {
    const documents = getStoredDocuments()
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const byType: Record<string, number> = {}
    DOCUMENT_TYPES.forEach(type => {
        const count = documents.filter(doc => doc.type === type).length
        if (count > 0) byType[type] = count
    })

    return {
        total: documents.length,
        thisWeek: documents.filter(doc => new Date(doc.lastCrawled) > oneWeekAgo).length,
        thisMonth: documents.filter(doc => new Date(doc.lastCrawled) > oneMonthAgo).length,
        byType,
        lastUpdate: localStorage.getItem(LAST_UPDATE_KEY) || new Date().toISOString()
    }
}

// Simulate crawling government portal
async function crawlGovernmentSite(): Promise<CrawledDocument[]> {
    console.log('🏛️ Crawling Government Portal...')

    // Simulated data - in production, this would fetch from actual APIs
    const documents: CrawledDocument[] = [
        {
            id: generateDocumentId('gov-nd-01-2024'),
            title: 'Nghị định 01/2024/NĐ-CP về đầu tư công',
            type: 'Nghị định',
            authority: 'Chính phủ',
            dateIssued: '2024-01-10',
            url: 'https://vanban.chinhphu.vn/default.aspx?pageid=27160&docid=209856',
            status: 'active',
            source: 'government',
            content: 'Quy định chi tiết về quản lý đầu tư công, nguồn vốn đầu tư công...',
            lastCrawled: new Date().toISOString()
        },
        {
            id: generateDocumentId('gov-nd-02-2024'),
            title: 'Nghị định 02/2024/NĐ-CP về quản lý tài sản công',
            type: 'Nghị định',
            authority: 'Chính phủ',
            dateIssued: '2024-01-15',
            url: 'https://vanban.chinhphu.vn/default.aspx?pageid=27160&docid=209857',
            status: 'active',
            source: 'government',
            content: 'Quy định về quản lý, sử dụng tài sản công...',
            lastCrawled: new Date().toISOString()
        }
    ]

    return documents
}

// Simulate crawling law library
async function crawlLawLibrary(): Promise<CrawledDocument[]> {
    console.log('📚 Crawling Law Library...')

    const documents: CrawledDocument[] = [
        {
            id: generateDocumentId('lib-luat-mtruong-2020'),
            title: 'Luật Bảo vệ môi trường 2020 (sửa đổi)',
            type: 'Luật',
            authority: 'Quốc hội',
            dateIssued: '2024-01-15',
            url: 'https://thuvienphapluat.vn/van-ban/Tai-nguyen-Moi-truong/Luat-Bao-ve-moi-truong-2020-so-72-2020-QH14-431147.aspx',
            status: 'active',
            source: 'library',
            content: 'Sửa đổi, bổ sung một số điều của Luật Bảo vệ môi trường...',
            lastCrawled: new Date().toISOString()
        },
        {
            id: generateDocumentId('lib-luat-lao-dong-2024'),
            title: 'Bộ luật Lao động 2019 (cập nhật 2024)',
            type: 'Bộ luật',
            authority: 'Quốc hội',
            dateIssued: '2024-01-20',
            url: 'https://thuvienphapluat.vn/van-ban/Lao-dong-Tien-luong/Bo-luat-Lao-dong-2019-so-45-2019-QH14-428119.aspx',
            status: 'active',
            source: 'library',
            content: 'Quy định tiêu chuẩn lao động, quyền và nghĩa vụ của người lao động...',
            lastCrawled: new Date().toISOString()
        }
    ]

    return documents
}

// Simulate crawling National Assembly
async function crawlNationalAssembly(): Promise<CrawledDocument[]> {
    console.log('🏛️ Crawling National Assembly...')

    const documents: CrawledDocument[] = [
        {
            id: generateDocumentId('qh-nq-15-2024'),
            title: 'Nghị quyết 15/2024/QH15 về kế hoạch phát triển KT-XH',
            type: 'Nghị quyết',
            authority: 'Quốc hội',
            dateIssued: '2024-01-25',
            url: 'https://quochoi.vn/UserControls/Publishing/News/BinhLuan/ptte/2024/1/nghiquyet-15-2024.aspx',
            status: 'active',
            source: 'assembly',
            content: 'Về kế hoạch phát triển kinh tế-xã hội năm 2024...',
            lastCrawled: new Date().toISOString()
        }
    ]

    return documents
}

// Simulate crawling Supreme Court
async function crawlSupremeCourt(): Promise<CrawledDocument[]> {
    console.log('⚖️ Crawling Supreme Court...')

    const documents: CrawledDocument[] = [
        {
            id: generateDocumentId('court-ttlt-01-2024'),
            title: 'Thông tư liên tịch 01/2024/TTLT về thi hành án dân sự',
            type: 'Thông tư',
            authority: 'Tòa án Tối cao',
            dateIssued: '2024-01-12',
            url: 'https://toaan.gov.vn/webcenter/portal/tatc/chitiet-vanban?dDocName=TOACAN161586',
            status: 'active',
            source: 'court',
            content: 'Hướng dẫn một số vấn đề về thi hành án dân sự...',
            lastCrawled: new Date().toISOString()
        }
    ]

    return documents
}

// Main crawl function
export async function performCrawl(
    onProgress?: (message: string, percent: number) => void
): Promise<CrawlResult> {
    const existingDocs = getStoredDocuments()
    const existingIds = new Set(existingDocs.map(d => d.id))

    let newDocuments = 0
    let updatedDocuments = 0
    const allNewDocs: CrawledDocument[] = []

    try {
        // Crawl from all sources with progress updates
        onProgress?.('🏛️ Đang crawl từ Cổng thông tin Chính phủ...', 10)
        const govDocs = await crawlGovernmentSite()
        await new Promise(r => setTimeout(r, 500))

        onProgress?.('📚 Đang crawl từ Thư viện Pháp luật...', 30)
        const libDocs = await crawlLawLibrary()
        await new Promise(r => setTimeout(r, 500))

        onProgress?.('🏛️ Đang crawl từ Quốc hội...', 50)
        const assemblyDocs = await crawlNationalAssembly()
        await new Promise(r => setTimeout(r, 500))

        onProgress?.('⚖️ Đang crawl từ Tòa án Tối cao...', 70)
        const courtDocs = await crawlSupremeCourt()
        await new Promise(r => setTimeout(r, 500))

        onProgress?.('💾 Đang lưu dữ liệu...', 90)

        // Combine all crawled documents
        const allCrawledDocs = [...govDocs, ...libDocs, ...assemblyDocs, ...courtDocs]

        // Check for new and updated documents
        allCrawledDocs.forEach(doc => {
            if (!existingIds.has(doc.id)) {
                allNewDocs.push(doc)
                newDocuments++
            } else {
                // Check if document was updated
                const existingDoc = existingDocs.find(d => d.id === doc.id)
                if (existingDoc && existingDoc.lastCrawled !== doc.lastCrawled) {
                    updatedDocuments++
                }
            }
        })

        // Merge with existing documents
        const mergedDocs = [...existingDocs]
        allNewDocs.forEach(newDoc => {
            if (!mergedDocs.find(d => d.id === newDoc.id)) {
                mergedDocs.push(newDoc)
            }
        })

        // Update existing documents with new crawl time
        mergedDocs.forEach(doc => {
            const crawled = allCrawledDocs.find(d => d.id === doc.id)
            if (crawled) {
                doc.lastCrawled = crawled.lastCrawled
            }
        })

        // Save to localStorage
        saveDocuments(mergedDocs)

        onProgress?.('✅ Hoàn tất cập nhật!', 100)

        return {
            newDocuments,
            updatedDocuments,
            documents: mergedDocs,
            timestamp: new Date().toISOString()
        }

    } catch (error) {
        console.error('Crawl error:', error)
        throw error
    }
}

// Initialize with sample data if empty
export function initializeWithSampleData(): CrawledDocument[] {
    const existing = getStoredDocuments()
    if (existing.length > 0) return existing

    const sampleDocs: CrawledDocument[] = [
        {
            id: 'MOV1',
            title: 'Luật Bảo vệ môi trường 2020 (sửa đổi)',
            type: 'Luật',
            authority: 'Quốc hội',
            dateIssued: '2024-01-15',
            url: 'https://thuvienphapluat.vn/van-ban/Tai-nguyen-Moi-truong/Luat-Bao-ve-moi-truong-2020',
            status: 'active',
            source: 'library',
            lastCrawled: new Date().toISOString()
        },
        {
            id: 'MOV2',
            title: 'Nghị định 01/2024/NĐ-CP về đầu tư công',
            type: 'Nghị định',
            authority: 'Chính phủ',
            dateIssued: '2024-01-10',
            url: 'https://vanban.chinhphu.vn/default.aspx?pageid=27160&docid=209856',
            status: 'active',
            source: 'government',
            lastCrawled: new Date().toISOString()
        },
        {
            id: 'MOV3',
            title: 'Thông tư 02/2024/TT-BTC hướng dẫn Luật Thuế',
            type: 'Thông tư',
            authority: 'Bộ Tài chính',
            dateIssued: '2024-01-08',
            url: 'https://vanban.chinhphu.vn/default.aspx?pageid=27160&docid=209858',
            status: 'active',
            source: 'government',
            lastCrawled: new Date().toISOString()
        }
    ]

    saveDocuments(sampleDocs)
    return sampleDocs
}

// Get source display name
export function getSourceDisplayName(source: string): string {
    return SOURCES[source as keyof typeof SOURCES]?.name || source
}

// Export for use in components
export const legalCrawlerService = {
    getStoredDocuments,
    getCrawlStats,
    performCrawl,
    initializeWithSampleData,
    getSourceDisplayName
}

export default legalCrawlerService
