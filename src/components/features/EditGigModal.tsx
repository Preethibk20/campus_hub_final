import React, { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useDropzone } from 'react-dropzone'
import { 
  X, 
  Upload, 
  FileText, 
  Image,
  Archive,
  DollarSign,
  Clock,
  Briefcase,
  HelpCircle
} from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useToast } from '@/hooks/useToast'
import apiClient from '@/api/client'
import { cn } from '@/lib/utils'

// Form schemas
const editGigSchema = z.object({
  title: z.string()
    .min(10, 'Title must be at least 10 characters')
    .max(200, 'Title must be less than 200 characters'),
  description: z.string()
    .min(50, 'Description must be at least 50 characters')
    .max(2000, 'Description must be less than 2000 characters'),
  category: z.string().min(1, 'Category is required'),
  type: z.enum(['SERVICE', 'REQUEST']),
  timeline: z.number()
    .min(1, 'Timeline must be at least 1 day')
    .max(365, 'Timeline must be less than 365 days'),
  minBudget: z.number()
    .min(1, 'Minimum budget must be at least ₹1')
    .max(1000000, 'Minimum budget must be less than ₹10,00,000'),
  maxBudget: z.number()
    .min(1, 'Maximum budget must be at least ₹1')
    .max(1000000, 'Maximum budget must be less than ₹10,00,000'),
}).refine(
  (data) => data.maxBudget >= data.minBudget,
  {
    message: 'Maximum budget must be greater than or equal to minimum budget',
    path: ['maxBudget'],
  }
)

type EditGigFormData = z.infer<typeof editGigSchema>

interface Category {
  id: string
  name: string
}

interface GigAttachment {
  id: string
  filename: string
  url: string
  type: string
}

interface Gig {
  id: string
  title: string
  description: string
  category: string
  type: 'SERVICE' | 'REQUEST'
  minBudget: number
  maxBudget: number
  timeline: number
  attachments: GigAttachment[]
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED'
  poster: {
    id: string
    name: string
    avatar?: string
    rating: number
    reviewCount: number
  }
  createdAt: string
  updatedAt: string
}

interface UploadedFile {
  file: File
  preview: string
  type: string
}

interface EditGigModalProps {
  gig: Gig
  isOpen: boolean
  onClose: () => void
  onSuccess: (updatedGig: Gig) => void
}

const EditGigModal: React.FC<EditGigModalProps> = ({
  gig,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [categories, setCategories] = useState<Category[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [removedAttachmentIds, setRemovedAttachmentIds] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const toast = useToast()

  const form = useForm<EditGigFormData>({
    resolver: zodResolver(editGigSchema),
    defaultValues: {
      title: gig.title,
      description: gig.description,
      category: gig.category,
      type: gig.type,
      timeline: gig.timeline,
      minBudget: gig.minBudget,
      maxBudget: gig.maxBudget,
    },
  })

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiClient.get('/api/categories')
        setCategories(response.data)
      } catch (error) {
        toast.error('Failed to load categories')
      }
    }
    fetchCategories()
  }, [toast])

  // File upload with dropzone
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      type: file.type,
    }))
    setUploadedFiles(prev => [...prev, ...newFiles].slice(0, 5)) // Max 5 files
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'application/pdf': ['.pdf'],
      'application/zip': ['.zip'],
      'application/x-rar-compressed': ['.rar'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5,
  })

  const removeFile = (index: number) => {
    setUploadedFiles(prev => {
      const newFiles = [...prev]
      URL.revokeObjectURL(newFiles[index].preview)
      newFiles.splice(index, 1)
      return newFiles
    })
  }

  const removeExistingAttachment = (attachmentId: string) => {
    setRemovedAttachmentIds(prev => [...prev, attachmentId])
  }

  // Get file icon
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-4 h-4" />
    if (type === 'application/pdf') return <FileText className="w-4 h-4" />
    return <Archive className="w-4 h-4" />
  }

  const onSubmit = async (data: EditGigFormData) => {
    try {
      setIsSubmitting(true)

      // Create FormData for file upload
      const formData = new FormData()
      formData.append('title', data.title)
      formData.append('description', data.description)
      formData.append('category', data.category)
      formData.append('type', data.type)
      formData.append('timeline', data.timeline.toString())
      formData.append('minBudget', data.minBudget.toString())
      formData.append('maxBudget', data.maxBudget.toString())

      // Add new files
      uploadedFiles.forEach(({ file }) => {
        formData.append('files', file)
      })

      // Add removed attachment IDs
      if (removedAttachmentIds.length > 0) {
        formData.append('removedAttachments', JSON.stringify(removedAttachmentIds))
      }

      const response = await apiClient.put(`/api/gigs/${gig.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      onSuccess(response.data)
      onClose()
    } catch (error: any) {
      toast.error('Failed to update gig', error.response?.data?.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    // Clean up preview URLs
    uploadedFiles.forEach(file => URL.revokeObjectURL(file.preview))
    setUploadedFiles([])
    setRemovedAttachmentIds([])
    form.reset()
    onClose()
  }

  // Filter out removed attachments
  const remainingAttachments = gig.attachments.filter(
    attachment => !removedAttachmentIds.includes(attachment.id)
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Gig"
      size="lg"
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Title */}
        <Input
          label="Gig Title"
          placeholder="e.g., I will design a professional logo for your business"
          {...form.register('title')}
          error={form.formState.errors.title?.message}
          helper="10-200 characters"
        />

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Description
          </label>
          <textarea
            {...form.register('description')}
            placeholder="Describe what you'll do, what's included, your process, and any requirements..."
            rows={6}
            className="w-full px-3 py-2 border border-border rounded-input focus:ring-2 focus:ring-primary focus:border-primary resize-none"
          />
          <div className="flex justify-between mt-1">
            {form.formState.errors.description && (
              <p className="text-sm text-danger">
                {form.formState.errors.description.message}
              </p>
            )}
            <p className="text-xs text-text-muted">
              {form.watch('description')?.length || 0}/2000
            </p>
          </div>
        </div>

        {/* Category and Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Category
            </label>
            <select
              {...form.register('category')}
              className="w-full px-3 py-2 border border-border rounded-input focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {form.formState.errors.category && (
              <p className="mt-1 text-sm text-danger">
                {form.formState.errors.category.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Type
            </label>
            <div className="space-y-2">
              {[
                { value: 'SERVICE', label: 'Service', icon: <Briefcase className="w-4 h-4" /> },
                { value: 'REQUEST', label: 'Request', icon: <HelpCircle className="w-4 h-4" /> },
              ].map((type) => (
                <label
                  key={type.value}
                  className={cn(
                    'flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors',
                    form.watch('type') === type.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <input
                    type="radio"
                    {...form.register('type')}
                    value={type.value}
                    className="sr-only"
                  />
                  {type.icon}
                  <span className="font-medium">{type.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Timeline and Budget */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Timeline (days)"
            type="number"
            placeholder="7"
            {...form.register('timeline', { valueAsNumber: true })}
            error={form.formState.errors.timeline?.message}
            prefix={<Clock className="w-4 h-4" />}
          />
          <Input
            label="Min Budget (₹)"
            type="number"
            placeholder="500"
            {...form.register('minBudget', { valueAsNumber: true })}
            error={form.formState.errors.minBudget?.message}
            prefix={<DollarSign className="w-4 h-4" />}
          />
          <Input
            label="Max Budget (₹)"
            type="number"
            placeholder="1000"
            {...form.register('maxBudget', { valueAsNumber: true })}
            error={form.formState.errors.maxBudget?.message}
            prefix={<DollarSign className="w-4 h-4" />}
          />
        </div>

        {/* Attachments */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Attachments
          </label>
          
          {/* Existing attachments */}
          {remainingAttachments.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-text-primary mb-2">
                Current Files
              </h4>
              <div className="space-y-2">
                {remainingAttachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center justify-between p-3 bg-surface-2 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getFileIcon(attachment.type)}
                      <div>
                        <p className="font-medium text-text-primary text-sm">
                          {attachment.filename}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {attachment.type.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeExistingAttachment(attachment.id)}
                      className="text-danger hover:text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New file upload */}
          <div
            {...getRootProps()}
            className={cn(
              'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
              isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            )}
          >
            <input {...getInputProps()} />
            <Upload className="w-6 h-6 text-text-muted mx-auto mb-2" />
            <p className="text-text-primary font-medium text-sm">
              {isDragActive ? 'Drop files here' : 'Click to upload or drag and drop'}
            </p>
            <p className="text-text-secondary text-xs mt-1">
              Images, PDFs, or ZIP files (Max 5 files, 10MB each)
            </p>
          </div>

          {/* New file preview */}
          {uploadedFiles.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-text-primary mb-2">
                New Files
              </h4>
              <div className="space-y-2">
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-surface-2 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getFileIcon(file.type)}
                      <div>
                        <p className="font-medium text-text-primary text-sm">
                          {file.file.name}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {(file.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-danger hover:text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={isSubmitting}
            className="flex-1"
          >
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default EditGigModal
