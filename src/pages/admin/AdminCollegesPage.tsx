import React, { useState, useEffect } from 'react'
import { Plus, Trash2, School, Users, Loader2, X, AlertTriangle } from 'lucide-react'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import apiClient from '@/api/client'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/lib/utils'

interface College {
  id: string
  name: string
  emailDomain: string
  userCount: number
  createdAt: string
}

const AdminCollegesPage: React.FC = () => {
  const [colleges, setColleges] = useState<College[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [collegeToDelete, setCollegeToDelete] = useState<College | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form state
  const [collegeName, setCollegeName] = useState('')
  const [emailDomain, setEmailDomain] = useState('')
  
  const toast = useToast()

  const fetchColleges = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.get('/api/admin/colleges')
      setColleges(response.data)
    } catch (error) {
      console.error('Failed to fetch colleges:', error)
      toast.error('Failed to load colleges')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchColleges()
  }, [])

  const handleAddCollege = async () => {
    if (!collegeName.trim() || !emailDomain.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    // Validate email domain format
    if (!emailDomain.includes('.')) {
      toast.error('Please enter a valid email domain (e.g., college.edu)')
      return
    }

    try {
      setIsSubmitting(true)
      await apiClient.post('/api/admin/colleges', {
        name: collegeName.trim(),
        emailDomain: emailDomain.trim().toLowerCase(),
      })

      toast.success('College added successfully')
      setIsAddModalOpen(false)
      setCollegeName('')
      setEmailDomain('')
      fetchColleges()
    } catch (error: any) {
      toast.error('Failed to add college', error.response?.data?.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteCollege = async () => {
    if (!collegeToDelete) return

    try {
      setIsSubmitting(true)
      await apiClient.delete(`/api/admin/colleges/${collegeToDelete.id}`)

      toast.success('College deleted successfully')
      setIsDeleteModalOpen(false)
      setCollegeToDelete(null)
      fetchColleges()
    } catch (error: any) {
      toast.error('Failed to delete college', error.response?.data?.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const openDeleteModal = (college: College) => {
    setCollegeToDelete(college)
    setIsDeleteModalOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">College Management</h1>
          <p className="text-text-secondary">Manage registered colleges and their domains</p>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add College
        </Button>
      </div>

      {/* Colleges Table */}
      <div className="bg-white rounded-card border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-2 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">
                  College Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">
                  Email Domain
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">
                  Registered Users
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-text-secondary">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                  </td>
                </tr>
              ) : colleges.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-text-secondary">
                    <School className="w-12 h-12 mx-auto mb-3 text-text-muted" />
                    <p>No colleges registered yet</p>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setIsAddModalOpen(true)}
                      className="mt-4"
                    >
                      Add your first college
                    </Button>
                  </td>
                </tr>
              ) : (
                colleges.map((college) => (
                  <tr key={college.id} className="hover:bg-surface-2">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <School className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-medium text-text-primary">{college.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <code className="px-2 py-1 bg-surface-2 rounded text-sm text-text-secondary">
                        @{college.emailDomain}
                      </code>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-text-muted" />
                        <span className="text-sm text-text-secondary">
                          {college.userCount} users
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteModal(college)}
                        className="text-danger hover:text-danger hover:bg-danger/10"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add College Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          setCollegeName('')
          setEmailDomain('')
        }}
        title="Add New College"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              College Name *
            </label>
            <input
              type="text"
              value={collegeName}
              onChange={(e) => setCollegeName(e.target.value)}
              placeholder="e.g., University of Technology"
              className="w-full px-3 py-2 border border-border rounded-input focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Email Domain *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">@</span>
              <input
                type="text"
                value={emailDomain}
                onChange={(e) => setEmailDomain(e.target.value.replace(/^@/, ''))}
                placeholder="college.edu"
                className="w-full pl-8 pr-3 py-2 border border-border rounded-input focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            <p className="text-xs text-text-muted mt-1">
              Users with email addresses ending in this domain will be verified as students of this college.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="ghost"
              onClick={() => {
                setIsAddModalOpen(false)
                setCollegeName('')
                setEmailDomain('')
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddCollege}
              loading={isSubmitting}
              disabled={!collegeName.trim() || !emailDomain.trim()}
              className="flex-1"
            >
              Add College
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setCollegeToDelete(null)
        }}
        title="Delete College"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-danger" />
            </div>
            <div>
              <p className="text-text-primary font-medium">
                Are you sure you want to delete {collegeToDelete?.name}?
              </p>
              <p className="text-text-secondary text-sm mt-1">
                This action cannot be undone. {collegeToDelete?.userCount || 0} registered users will be affected.
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="ghost"
              onClick={() => {
                setIsDeleteModalOpen(false)
                setCollegeToDelete(null)
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteCollege}
              loading={isSubmitting}
              className="flex-1 bg-danger hover:bg-danger-dark"
            >
              Delete College
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default AdminCollegesPage
