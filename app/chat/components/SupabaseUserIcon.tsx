'use client'

import { useEffect, useRef, useState } from 'react'
import { 
  User, 
  Settings, 
  LogOut, 
  Crown, 
  Shield, 
  ChevronDown,
  UserCheck,
  Bell,
  HelpCircle,
  CreditCard
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/lib/auth/AuthProvider'

type UserIconMode = 'inline' | 'floating'

interface SupabaseUserIconProps {
  mode?: UserIconMode
}

export default function SupabaseUserIcon({ mode = 'floating' }: SupabaseUserIconProps) {
  const { user: authUser, loading, signOut } = useAuth()
  const [showPopup, setShowPopup] = useState(false)
  const [isClicked, setIsClicked] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const popupRef = useRef<HTMLDivElement>(null)

  // Determine user level based on email or user metadata
  const getUserLevel = (): 'normal' | 'pro' | 'admin' => {
    if (!authUser) return 'normal'
    
    const email = authUser.email || ''
    if (email.includes('admin')) return 'admin'
    if (email.includes('pro')) return 'pro'
    return 'normal'
  }

  const userLevel = getUserLevel()
  const isLoggedIn = !!authUser

  const deriveNameFromEmail = (email?: string) => {
    if (!email) return 'User'
    const local = email.split('@')[0]
    return local
      .replace(/[._-]+/g, ' ')
      .split(' ')
      .filter(Boolean)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')
  }

  const handleLogout = async () => {
    try {
      await signOut()
      toast.success('Đã đăng xuất thành công')
      setShowPopup(false)
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Không thể đăng xuất. Vui lòng thử lại.')
    }
  }

  const handleClick = () => {
    setIsClicked(true)
    
    if (showPopup) {
      // Closing animation
      setIsAnimating(true)
      setTimeout(() => {
        setShowPopup(false)
        setIsAnimating(false)
      }, 200)
    } else {
      // Opening animation
      setShowPopup(true)
      setIsAnimating(true)
      setTimeout(() => {
        setIsAnimating(false)
      }, 300)
    }
    
    // Reset click animation after a short delay
    setTimeout(() => {
      setIsClicked(false)
    }, 150)
  }

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'pro':
        return <Crown className="w-4 h-4 text-yellow-600" />
      case 'admin':
        return <Shield className="w-4 h-4 text-red-600" />
      default:
        return <User className="w-4 h-4 text-gray-600" />
    }
  }

  const getLevelText = (level: string) => {
    switch (level) {
      case 'pro':
        return 'Pro User'
      case 'admin':
        return 'Administrator'
      default:
        return 'Normal User'
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'pro':
        return 'bg-yellow-100 text-yellow-800'
      case 'admin':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setShowPopup(false)
      }
    }

    if (showPopup) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showPopup])

  if (loading) {
    return (
      <div className={mode === 'floating' ? 'fixed top-4 right-4 z-50' : ''}>
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
      </div>
    )
  }

  if (!isLoggedIn || !authUser) {
    return null
  }

  const displayName = deriveNameFromEmail(authUser.email)

  return (
    <div className={mode === 'floating' ? 'fixed top-4 right-4 z-50' : ''}>
      <div className="relative">
        <button
          onClick={handleClick}
          className={`flex items-center space-x-2 bg-white rounded-full shadow-lg border border-gray-200 px-3 py-2 hover:shadow-xl transition-all duration-200 ${
            isClicked ? 'scale-95 shadow-md' : 'scale-100'
          } hover:scale-105 active:scale-95`}
        >
          <div className={`w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center transition-all duration-200 ${
            isClicked ? 'ring-2 ring-primary-300 ring-opacity-50' : ''
          }`}>
            {authUser.user_metadata?.avatar_url ? (
              <img src={authUser.user_metadata.avatar_url} alt={displayName} className="w-8 h-8 rounded-full" />
            ) : (
              <User className="w-4 h-4 text-white" />
            )}
          </div>
          <span className="text-sm font-medium text-gray-700 hidden md:block">
            {displayName}
          </span>
          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-300 ease-in-out ${showPopup ? 'rotate-180' : 'rotate-0'}`} />
        </button>

        {showPopup && (
          <div 
            ref={popupRef}
            className={`absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 py-2 transform transition-all duration-300 ease-out popup-container ${
              isAnimating 
                ? (showPopup ? 'animate-in slide-in-from-top-2 fade-in-0 zoom-in-95' : 'animate-out slide-out-to-top-2 fade-out-0 zoom-out-95')
                : 'opacity-100 scale-100 translate-y-0'
            }`}
          >
            {/* User Info Header */}
            <div className="px-4 py-3 border-b border-gray-100 animate-in slide-in-from-top-1 fade-in-0 duration-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
                  {authUser.user_metadata?.avatar_url ? (
                    <img src={authUser.user_metadata.avatar_url} alt={displayName} className="w-12 h-12 rounded-full" />
                  ) : (
                    <User className="w-6 h-6 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{displayName}</p>
                  <p className="text-xs text-gray-500">{authUser.email}</p>
                  <div className="flex items-center space-x-1 mt-1">
                    {getLevelIcon(userLevel)}
                    <span className={`text-xs px-2 py-1 rounded-full ${getLevelColor(userLevel)}`}>
                      {getLevelText(userLevel)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <a
                href="/profile"
                className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-all duration-200 hover:translate-x-1 animate-in slide-in-from-right-2 fade-in-0 animation-delay-100"
              >
                <UserCheck className="w-4 h-4" />
                <span>Hồ sơ cá nhân</span>
              </a>
              
              <a
                href="/settings"
                className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-all duration-200 hover:translate-x-1 animate-in slide-in-from-right-2 fade-in-0 animation-delay-150"
              >
                <Settings className="w-4 h-4" />
                <span>Cài đặt</span>
              </a>
              
              <a
                href="/notifications"
                className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-all duration-200 hover:translate-x-1 animate-in slide-in-from-right-2 fade-in-0 animation-delay-200"
              >
                <Bell className="w-4 h-4" />
                <span>Thông báo</span>
              </a>
              
              {userLevel === 'normal' && (
                <a
                  href="/upgrade"
                  className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-all duration-200 hover:translate-x-1 animate-in slide-in-from-right-2 fade-in-0 animation-delay-250"
                >
                  <Crown className="w-4 h-4 text-yellow-600" />
                  <span>Nâng cấp lên Pro</span>
                </a>
              )}
              
              {userLevel === 'pro' && (
                <a
                  href="/billing"
                  className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-all duration-200 hover:translate-x-1 animate-in slide-in-from-right-2 fade-in-0 animation-delay-250"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Thanh toán</span>
                </a>
              )}
              
              <a
                href="/help"
                className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-all duration-200 hover:translate-x-1 animate-in slide-in-from-right-2 fade-in-0 animation-delay-300"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Trợ giúp</span>
              </a>
            </div>

            {/* Logout */}
            <div className="border-t border-gray-100 pt-2">
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full transition-all duration-200 hover:translate-x-1 animate-in slide-in-from-right-2 fade-in-0 animation-delay-400"
              >
                <LogOut className="w-4 h-4" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
