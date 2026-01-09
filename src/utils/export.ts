/**
 * Excel Export Utility
 * Creates proper Excel-compatible CSV files with Vietnamese encoding
 */

interface ExportColumn {
    key: string
    header: string
    format?: (value: any) => string
}

interface ExportOptions {
    filename: string
    sheetName?: string
    columns: ExportColumn[]
    data: any[]
}

/**
 * Export data to Excel-compatible CSV format
 * Uses proper BOM for UTF-8 and handles Vietnamese characters
 */
export function exportToExcel({ filename, columns, data }: ExportOptions): void {
    try {
        if (!data || data.length === 0) {
            console.warn('No data to export')
            return
        }

        // Build headers
        const headers = columns.map(col => col.header)

        // Build rows
        const rows = data.map(item => {
            return columns.map(col => {
                let value = item[col.key]

                // Apply formatter if provided
                if (col.format && value !== undefined && value !== null) {
                    value = col.format(value)
                }

                // Handle null/undefined
                if (value === null || value === undefined) {
                    value = ''
                }

                // Convert to string and escape for CSV
                const strValue = String(value)
                // Escape quotes by doubling them and wrap in quotes
                return `"${strValue.replace(/"/g, '""')}"`
            }).join(',')
        })

        // Combine headers and rows
        const csv = [headers.map(h => `"${h}"`).join(','), ...rows].join('\n')

        // Add BOM for UTF-8 Excel compatibility
        const bom = '\uFEFF'
        const blob = new Blob([bom + csv], {
            type: 'application/vnd.ms-excel;charset=utf-8'
        })

        // Create proper filename with .csv extension
        const dateStr = new Date().toISOString().split('T')[0]
        const fullFilename = `${filename}-${dateStr}.csv`

        // Download file
        downloadBlob(blob, fullFilename)

        return
    } catch (error) {
        console.error('Export failed:', error)
        throw error
    }
}

/**
 * Export data to JSON format
 */
export function exportToJSON(data: any[], filename: string): void {
    try {
        const json = JSON.stringify(data, null, 2)
        const blob = new Blob([json], { type: 'application/json' })
        const dateStr = new Date().toISOString().split('T')[0]
        downloadBlob(blob, `${filename}-${dateStr}.json`)
    } catch (error) {
        console.error('Export failed:', error)
        throw error
    }
}

/**
 * Helper function to download blob as file
 * Uses multiple methods for browser compatibility
 */
function downloadBlob(blob: Blob, filename: string): void {
    // Method 1: Use msSaveOrOpenBlob for older IE/Edge
    if ('msSaveOrOpenBlob' in navigator) {
        (navigator as any).msSaveOrOpenBlob(blob, filename)
        return
    }

    // Method 2: Create temporary link element
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.style.visibility = 'hidden'

    // Append to body (required for some browsers)
    document.body.appendChild(link)

    // Click to trigger download
    link.click()

    // Cleanup
    setTimeout(() => {
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }, 100)
}

/**
 * Format date for export
 */
export function formatDateForExport(dateString: string | Date): string {
    if (!dateString) return ''
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString
    return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    })
}

/**
 * Format boolean for export
 */
export function formatBooleanForExport(value: boolean, trueText = 'Có', falseText = 'Không'): string {
    return value ? trueText : falseText
}
