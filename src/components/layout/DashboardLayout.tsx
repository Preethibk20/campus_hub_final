import React, { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { 
  Home, 
  Search, 
  FileText, 
  Package, 
  MessageSquare, 
  Bell, 
  Wallet, 
  User, 
  Settings, 
  LogOut,
  Menu,
  X,
  Users
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import Button from '@/components/ui/Button'

interface NavItem {
  icon: React.ElementType
  label: string
  path: string
  badge?: number
}

const DashboardLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const navItems: NavItem[] = [
    { icon: Home, label: 'Home', path: '/dashboard' },
    { icon: Search, label: 'Explore Gigs', path: '/explore' },
    { icon: Users, label: 'Find Hackathon Partners', path: '/find-partners' },
    { icon: FileText, label: 'My Gigs', path: '/dashboard/gigs' },
    { icon: Users, label: 'My Requests', path: '/dashboard/requests' },
    { icon: Package, label: 'My Orders', path: '/dashboard/orders' },
    { icon: MessageSquare, label: 'Messages', path: '/dashboard/inbox', badge: 0 },
    { icon: Bell, label: 'Notifications', path: '/dashboard/notifications', badge: 0 },
    { icon: Wallet, label: 'Wallet', path: '/dashboard/wallet' },
    { icon: User, label: 'My Profile', path: '/dashboard/profile' },
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const NavItem: React.FC<{ item: NavItem }> = ({ item }) => {
    const isActive = location.pathname === item.path
    return (
      <button
        onClick={() => {
          navigate(item.path)
          setIsSidebarOpen(false)
        }}
        className={`w-full flex items-center px-4 py-3 text-sm font-bold rounded-lg transition-all ${
          isActive
            ? 'bg-[#0C0E13] text-[#C8F53C] shadow-lg shadow-black/10'
            : 'text-gray-500 hover:bg-gray-100 hover:text-black'
        }`}
      >
        <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-[#C8F53C]' : ''}`} />
        <span className="flex-1 text-left">{item.label}</span>
        {item.badge && item.badge > 0 && (
          <span className="bg-[#C8F53C] text-[#0C0E13] text-[10px] font-black rounded-full px-2 py-0.5">
            {item.badge}
          </span>
        )}
      </button>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F3EE] flex">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center px-6 py-4 border-b border-gray-100">
            <div className="w-9 h-9 bg-[#0C0E13] rounded-xl flex items-center justify-center mr-3 shadow-lg shadow-black/10">
              <span className="text-[#C8F53C] font-black text-lg">C</span>
            </div>
            <h1 className="text-xl font-black text-gray-900 tracking-tighter">CampusHub</h1>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="ml-auto lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>


          {/* User info */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                <User className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  Hey, {user?.name || 'User'} 👋
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navItems.map((item) => (
              <NavItem key={item.path} item={item} />
            ))}
          </nav>

          {/* Bottom actions */}
          <div className="px-4 py-4 border-t border-gray-200 space-y-1">
            <button
              onClick={() => navigate('/dashboard/settings')}
              className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900"
            >
              <Settings className="w-5 h-5 mr-3" />
              Settings
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-0 overflow-hidden">
        {/* Mobile header */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">CampusHub</h1>
            <div className="w-8" />
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
