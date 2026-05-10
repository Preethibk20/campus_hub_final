import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, ChevronDown, LogOut, User, Briefcase, ShoppingBag, Wallet, MessageSquare } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useChatStore } from '@/stores/chatStore'
import NotificationBell from '@/components/features/NotificationBell'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import { cn } from '@/lib/utils'

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth()
  const { unreadCount } = useChatStore()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
    setIsMobileMenuOpen(false)
    setIsProfileDropdownOpen(false)
  }

  const navLinks = [
    { to: '/explore', label: 'Explore' },
    { to: '/leaderboard', label: 'Leaderboard' },
  ]

  const dropdownLinks = [
    { to: '/dashboard/my-gigs', label: 'My Gigs', icon: Briefcase },
    { to: '/dashboard/orders', label: 'Orders', icon: ShoppingBag },
    { to: '/dashboard/wallet', label: 'Wallet', icon: Wallet },
    { to: '/dashboard/inbox', label: 'Messages', icon: MessageSquare, badge: unreadCount },
  ]

  return (
    <nav className="bg-white border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CH</span>
            </div>
            <span className="font-semibold text-text-primary hidden sm:block">Campus Hub</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-text-secondary hover:text-primary transition-colors font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                {/* Notification Bell */}
                <NotificationBell />

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center gap-2 hover:bg-surface-2 rounded-lg p-2 transition-colors"
                  >
                    <Avatar src={user?.avatar} name={user?.name || 'User'} size="sm" />
                    <ChevronDown className={cn(
                      'w-4 h-4 text-text-muted transition-transform',
                      isProfileDropdownOpen && 'rotate-180'
                    )} />
                  </button>

                  <AnimatePresence>
                    {isProfileDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-56 bg-white rounded-card border border-border shadow-xl z-50"
                      >
                        <div className="p-4 border-b border-border">
                          <p className="font-medium text-text-primary">{user?.name}</p>
                          <p className="text-sm text-text-secondary">{user?.email}</p>
                        </div>

                        <div className="p-2">
                          {dropdownLinks.map((link) => {
                            const Icon = link.icon
                            return (
                              <Link
                                key={link.to}
                                to={link.to}
                                onClick={() => setIsProfileDropdownOpen(false)}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-2 transition-colors"
                              >
                                <Icon className="w-4 h-4 text-text-muted" />
                                <span className="text-text-primary flex-1">{link.label}</span>
                                {link.badge ? (
                                  <span className="px-2 py-0.5 bg-primary text-white text-xs rounded-full">
                                    {link.badge}
                                  </span>
                                ) : null}
                              </Link>
                            )
                          })}

                          <div className="border-t border-border mt-2 pt-2">
                            <Link
                              to="/dashboard"
                              onClick={() => setIsProfileDropdownOpen(false)}
                              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-2 transition-colors"
                            >
                              <User className="w-4 h-4 text-text-muted" />
                              <span className="text-text-primary">Dashboard</span>
                            </Link>
                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-danger/10 transition-colors text-danger"
                            >
                              <LogOut className="w-4 h-4" />
                              <span>Logout</span>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link to="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link to="/register">
                  <Button>Register</Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-surface-2 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-text-primary" />
              ) : (
                <Menu className="w-6 h-6 text-text-primary" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-border"
          >
            <div className="px-4 py-4 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-2 text-text-secondary hover:text-primary transition-colors font-medium"
                >
                  {link.label}
                </Link>
              ))}

              {isAuthenticated ? (
                <>
                  <div className="border-t border-border pt-4">
                    <p className="text-sm text-text-muted mb-2">Account</p>
                    {dropdownLinks.map((link) => {
                      const Icon = link.icon
                      return (
                        <Link
                          key={link.to}
                          to={link.to}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-3 py-2 text-text-secondary hover:text-primary transition-colors"
                        >
                          <Icon className="w-4 h-4" />
                          {link.label}
                          {link.badge ? (
                            <span className="px-2 py-0.5 bg-primary text-white text-xs rounded-full">
                              {link.badge}
                            </span>
                          ) : null}
                        </Link>
                      )
                    })}
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 py-2 text-danger w-full"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <div className="border-t border-border pt-4 flex gap-3">
                  <Link to="/login" className="flex-1" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="secondary" className="w-full">Login</Button>
                  </Link>
                  <Link to="/register" className="flex-1" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full">Register</Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default Navbar
