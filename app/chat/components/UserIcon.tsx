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

interface SessionResponse {
  user: UserData
}

interface UserData {
  id: string
  name: string
  email: string
  level: 'normal' | 'pro' | 'admin'
  avatar?: string
  phone?: string
  createdAt?: string
}

type UserIconMode = 'inline' | 'floating'

interface UserIconProps {
  mode?: UserIconMode
}

export default function UserIcon({ mode = 'floating' }: UserIconProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [user, setUser] = useState<UserData | null>(null)
  const [isClicked, setIsClicked] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const popupRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let isMounted = true

    const fetchSession = async () => {
      try {
        const response = await fetch('/api/auth/session', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        })

        if (!isMounted) return

        if (response.ok) {
          const data: SessionResponse = await response.json()
          setUser(data.user)
          setIsLoggedIn(true)
        } else {
          setUser(null)
          setIsLoggedIn(false)
        }
      } catch (error) {
        console.error('Unable to fetch session', error)
        if (isMounted) {
          setUser(null)
          setIsLoggedIn(false)
        }
      }
    }

    fetchSession()

    return () => {
      isMounted = false
    }
  }, [])

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
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
      if (!response.ok) {
        throw new Error('Không thể đăng xuất')
      }
      setUser(null)
      setIsLoggedIn(false)
      setShowPopup(false)
      toast.success('Đã đăng xuất thành công!')
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

  // Demo function to test different user levels (remove in production)
  const demoUserLevels = () => {
    if (!user) return
    
    const levels = ['normal', 'pro', 'admin']
    const currentIndex = levels.indexOf(user.level)
    const nextLevel = levels[(currentIndex + 1) % levels.length]
    
    const updatedUser: UserData = {
      ...user,
      level: nextLevel as 'normal' | 'pro' | 'admin'
    }
    setUser(updatedUser)
    toast.success(`Đã chuyển sang ${getLevelText(nextLevel)}`)
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

  if (!isLoggedIn || !user) {
    return null
  }

  const displayName = deriveNameFromEmail(user.email)

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
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
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
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full" />
                  ) : (
                    <User className="w-6 h-6 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{displayName}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                  <div className="flex items-center space-x-1 mt-1">
                    {getLevelIcon(user.level)}
                    <span className={`text-xs px-2 py-1 rounded-full ${getLevelColor(user.level)}`}>
                      {getLevelText(user.level)}
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
              
              {user.level === 'normal' && (
                <a
                  href="/upgrade"
                  className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-all duration-200 hover:translate-x-1 animate-in slide-in-from-right-2 fade-in-0 animation-delay-250"
                >
                  <Crown className="w-4 h-4 text-yellow-600" />
                  <span>Nâng cấp lên Pro</span>
                </a>
              )}
              
              {user.level === 'pro' && (
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
              
              {/* Demo button - remove in production */}
              <button
                onClick={demoUserLevels}
                className="flex items-center space-x-3 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 w-full transition-all duration-200 hover:translate-x-1 animate-in slide-in-from-right-2 fade-in-0 animation-delay-350"
              >
                <Crown className="w-4 h-4" />
                <span>Demo: Chuyển level</span>
              </button>
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

      {/* Backdrop to close popup */}
      {showPopup && (
        <div
          className={`fixed inset-0 z-40 transition-opacity duration-300 ${
            isAnimating ? 'animate-in fade-in-0' : 'opacity-100'
          }`}
          onClick={() => {
            setIsAnimating(true)
            setTimeout(() => {
              setShowPopup(false)
              setIsAnimating(false)
            }, 200)
          }}
        />
      )}
    </div>
  )
}
