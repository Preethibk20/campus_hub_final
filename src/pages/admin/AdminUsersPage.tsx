import React, { useState, useEffect } from 'react'
import { Search, Filter, Ban, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import apiClient from '@/api/client'
import { useToast } from '@/hooks/useToast'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface User {
  id: string
  name: string
  email: string
  role: 'student' | 'seller' | 'admin'
  isVerified: boolean
  isBanned: boolean
  createdAt: string
  averageRating: number
  totalOrders: number
}

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [verifiedFilter, setVerifiedFilter] = useState<boolean | null>(null)
  const [sortBy, setSortBy] = useState<string>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  
  const [banModalOpen, setBanModalOpen] = useState(false)
  const [banReason, setBanReason] = useState('')
  const [userToBan, setUserToBan] = useState<User | null>(null)
  const [isBanning, setIsBanning] = useState(false)
  
  const toast = useToast()
  const pageSize = 20

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        size: pageSize.toString(),
        sort: sortBy,
        order: sortOrder,
      })
      
      if (searchQuery) params.append('search', searchQuery)
      if (roleFilter !== 'all') params.append('role', roleFilter)
      if (verifiedFilter !== null) params.append('verified', verifiedFilter.toString())

      const response = await apiClient.get(`/api/admin/users?${params}`)
      setUsers(response.data.content)
      setTotalPages(response.data.totalPages)
    } catch (error) {
      console.error('Failed to fetch users:', error)
      toast.error('Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [currentPage, sortBy, sortOrder, roleFilter, verifiedFilter])

  const handleSearch = () => {
    setCurrentPage(0)
    fetchUsers()
  }

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
  }

  const openBanModal = (user: User) => {
    setUserToBan(user)
    setBanReason('')
    setBanModalOpen(true)
  }

  const handleBanUser = async () => {
    if (!userToBan || !banReason.trim()) return

    try {
      setIsBanning(true)
      await apiClient.put(`/api/admin/users/${userToBan.id}/ban`, {
        reason: banReason,
        banned: !userToBan.isBanned,
      })

      toast.success(userToBan.isBanned ? 'User unbanned successfully' : 'User banned successfully')
      setBanModalOpen(false)
      fetchUsers()
    } catch (error: any) {
      toast.error('Failed to ban user', error.response?.data?.message)
    } finally {
      setIsBanning(false)
    }
  }

  const SortHeader = ({ column, label }: { column: string; label: string }) => (
    <button
      onClick={() => handleSort(column)}
      className="flex items-center gap-1 hover:text-primary"
    >
      {label}
      {sortBy === column && (
        <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>
      )}
    </button>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">User Management</h1>
          <p className="text-text-secondary">Manage platform users and their permissions</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 bg-white rounded-card border border-border p-4 shadow-card">
        {/* Search */}
        <div className="flex-1 min-w-64">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-input focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
        </div>

        {/* Role Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-text-muted" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border border-border rounded-input px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="all">All Roles</option>
            <option value="student">Student</option>
            <option value="seller">Seller</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Verified Filter */}
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={verifiedFilter === true}
              onChange={(e) => setVerifiedFilter(e.target.checked ? true : null)}
              className="rounded border-border text-primary focus:ring-primary"
            />
            Verified only
          </label>
        </div>

        <Button onClick={handleSearch}>Search</Button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-card border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-2 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">
                  <SortHeader column="name" label="Name" />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">
                  <SortHeader column="email" label="Email" />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">
                  <SortHeader column="role" label="Role" />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">
                  <SortHeader column="createdAt" label="Joined" />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Rating</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-text-secondary">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className={cn(
                      'hover:bg-surface-2',
                      user.isBanned && 'bg-red-50'
                    )}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className={cn(
                          'font-medium',
                          user.isBanned ? 'text-danger' : 'text-text-primary'
                        )}>
                          {user.name}
                        </span>
                        {user.isBanned && (
                          <span className="px-2 py-0.5 bg-danger/10 text-danger text-xs rounded-full">
                            Banned
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'px-2 py-1 rounded-full text-xs font-medium',
                        user.role === 'admin' && 'bg-purple-100 text-purple-600',
                        user.role === 'seller' && 'bg-blue-100 text-blue-600',
                        user.role === 'student' && 'bg-green-100 text-green-600'
                      )}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {user.isVerified ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-success" />
                            <span className="text-xs text-success">Verified</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-4 h-4 text-warning" />
                            <span className="text-xs text-warning">Pending</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-400">★</span>
                        <span className="text-sm font-medium">{user.averageRating.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant={user.isBanned ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => openBanModal(user)}
                        className={cn(
                          user.isBanned && 'text-success hover:text-success'
                        )}
                      >
                        {user.isBanned ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Unban
                          </>
                        ) : (
                          <>
                            <Ban className="w-4 h-4 mr-1" />
                            Ban
                          </>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <p className="text-sm text-text-secondary">
            Page {currentPage + 1} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
            >
              Previous
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage >= totalPages - 1}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Ban Modal */}
      <Modal
        isOpen={banModalOpen}
        onClose={() => setBanModalOpen(false)}
        title={userToBan?.isBanned ? 'Unban User' : 'Ban User'}
        size="md"
      >
        <div className="space-y-4">
          <p className="text-text-secondary">
          {userToBan?.isBanned
            ? `Are you sure you want to unban ${userToBan?.name}?`
            : `Are you sure you want to ban ${userToBan?.name}? They will lose access to the platform.`}
          </p>
          
          {!userToBan?.isBanned && (
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Reason for ban *
              </label>
              <textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Enter the reason for banning this user..."
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-input focus:ring-2 focus:ring-primary focus:border-primary resize-none"
              />
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button variant="ghost" onClick={() => setBanModalOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleBanUser}
              loading={isBanning}
              disabled={!userToBan?.isBanned && !banReason.trim()}
              className={cn('flex-1', !userToBan?.isBanned && 'bg-danger hover:bg-danger-dark')}
            >
              {userToBan?.isBanned ? 'Unban User' : 'Ban User'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default AdminUsersPage
