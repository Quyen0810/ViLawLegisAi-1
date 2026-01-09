'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Search, Check, X, User } from 'lucide-react'

interface SelectOption {
    value: string
    label: string
    sublabel?: string
    avatar?: string
}

interface CustomSelectProps {
    options: SelectOption[]
    value: string
    onChange: (value: string) => void
    placeholder?: string
    searchable?: boolean
    disabled?: boolean
    loading?: boolean
    emptyMessage?: string
    maxHeight?: number
    showAvatar?: boolean
    className?: string
}

export function CustomSelect({
    options,
    value,
    onChange,
    placeholder = 'Chọn...',
    searchable = false,
    disabled = false,
    loading = false,
    emptyMessage = 'Không có dữ liệu',
    maxHeight = 280,
    showAvatar = false,
    className = ''
}: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const containerRef = useRef<HTMLDivElement>(null)
    const searchInputRef = useRef<HTMLInputElement>(null)

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
                setSearchTerm('')
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Focus search input when dropdown opens
    useEffect(() => {
        if (isOpen && searchable && searchInputRef.current) {
            setTimeout(() => searchInputRef.current?.focus(), 100)
        }
    }, [isOpen, searchable])

    const selectedOption = options.find(opt => opt.value === value)

    const filteredOptions = searchTerm
        ? options.filter(opt =>
            opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (opt.sublabel && opt.sublabel.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        : options

    const handleSelect = (optionValue: string) => {
        onChange(optionValue)
        setIsOpen(false)
        setSearchTerm('')
    }

    const handleToggle = () => {
        if (!disabled && !loading) {
            setIsOpen(!isOpen)
        }
    }

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation()
        onChange('')
        setSearchTerm('')
    }

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={handleToggle}
                disabled={disabled || loading}
                className={`
          w-full flex items-center justify-between gap-2 px-4 py-3 
          bg-gray-100 border border-gray-300 rounded-xl text-left
          transition-all duration-200
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-slate-500 cursor-pointer'}
          ${isOpen ? 'border-blue-500 ring-2 ring-blue-500/20' : ''}
        `}
            >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    {loading ? (
                        <div className="flex items-center gap-2 text-slate-500">
                            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            <span>Đang tải...</span>
                        </div>
                    ) : selectedOption ? (
                        <>
                            {showAvatar && (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-slate-900 text-sm font-medium flex-shrink-0">
                                    {selectedOption.avatar || selectedOption.label.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className="min-w-0 flex-1">
                                <p className="text-slate-900 truncate">{selectedOption.label}</p>
                                {selectedOption.sublabel && (
                                    <p className="text-xs text-slate-500 truncate">{selectedOption.sublabel}</p>
                                )}
                            </div>
                        </>
                    ) : (
                        <span className="text-slate-500">{placeholder}</span>
                    )}
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                    {value && !disabled && (
                        <span
                            role="button"
                            tabIndex={0}
                            onClick={handleClear}
                            onKeyDown={(e) => e.key === 'Enter' && handleClear(e as any)}
                            className="p-1 text-slate-500 hover:text-slate-900 hover:bg-gray-200 rounded transition-colors cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </span>
                    )}
                    <ChevronDown
                        className={`w-5 h-5 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    />
                </div>
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-xl shadow-xl overflow-hidden"
                    >
                        {/* Search Input */}
                        {searchable && (
                            <div className="p-3 border-b border-gray-200">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Tìm kiếm..."
                                        className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-slate-900 placeholder-slate-400 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Options List */}
                        <div
                            className="overflow-y-auto scrollbar-hide"
                            style={{ maxHeight: `${maxHeight}px` }}
                        >
                            {filteredOptions.length === 0 ? (
                                <div className="px-4 py-8 text-center text-slate-500">
                                    <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">{emptyMessage}</p>
                                </div>
                            ) : (
                                <div className="py-2">
                                    {filteredOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => handleSelect(option.value)}
                                            className={`
                        w-full flex items-center gap-3 px-4 py-3 text-left
                        transition-colors duration-150
                        ${option.value === value
                                                    ? 'bg-blue-600/20 text-blue-400'
                                                    : 'text-slate-900 hover:bg-gray-100'
                                                }
                      `}
                                        >
                                            {showAvatar && (
                                                <div className={`
                          w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0
                          ${option.value === value
                                                        ? 'bg-blue-600 text-slate-900'
                                                        : 'bg-slate-600 text-slate-300'
                                                    }
                        `}>
                                                    {option.avatar || option.label.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="truncate font-medium">{option.label}</p>
                                                {option.sublabel && (
                                                    <p className="text-xs text-slate-500 truncate">{option.sublabel}</p>
                                                )}
                                            </div>
                                            {option.value === value && (
                                                <Check className="w-5 h-5 text-blue-400 flex-shrink-0" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer with count */}
                        {filteredOptions.length > 0 && (
                            <div className="px-4 py-2 border-t border-gray-200 bg-white/50">
                                <p className="text-xs text-slate-500">
                                    {searchTerm ? `${filteredOptions.length} kết quả` : `${options.length} mục`}
                                </p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

// Simple Select for filter dropdowns (no avatar, smaller)
interface SimpleSelectProps {
    options: Array<{ value: string; label: string }>
    value: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
}

export function SimpleSelect({
    options,
    value,
    onChange,
    placeholder = 'Chọn...',
    className = ''
}: SimpleSelectProps) {
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const selectedOption = options.find(opt => opt.value === value)

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`
          flex items-center justify-between gap-2 px-4 py-3 min-w-[140px]
          bg-gray-100 border border-gray-300 rounded-xl text-left
          transition-all duration-200 hover:border-slate-500
          ${isOpen ? 'border-blue-500 ring-2 ring-blue-500/20' : ''}
        `}
            >
                <span className={selectedOption ? 'text-slate-900' : 'text-slate-500'}>
                    {selectedOption?.label || placeholder}
                </span>
                <ChevronDown
                    className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-xl shadow-xl overflow-hidden"
                    >
                        <div className="py-1 max-h-[240px] overflow-y-auto scrollbar-hide">
                            {options.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                        onChange(option.value)
                                        setIsOpen(false)
                                    }}
                                    className={`
                    w-full flex items-center justify-between px-4 py-2.5 text-left text-sm
                    transition-colors duration-150
                    ${option.value === value
                                            ? 'bg-blue-600/20 text-blue-400'
                                            : 'text-slate-900 hover:bg-gray-100'
                                        }
                  `}
                                >
                                    <span>{option.label}</span>
                                    {option.value === value && (
                                        <Check className="w-4 h-4 text-blue-400" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default CustomSelect
