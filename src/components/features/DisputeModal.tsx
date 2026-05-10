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
  AlertTriangle
} from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { useToast } from '@/hooks/useToast'
import apiClient from '@/api/client'
import { cn } from '@/lib/utils'

const disputeSchema = z.object({
  reason: z.enum(['quality', 'no_delivery', 'other'], {
    required_error: 'Please select a dispute reason',
  }),
  description: z.string()
    .min(20, 'Description must be at least 20 characters')
    .max(1000, 'Description must be less than 1000 characters'),
})

type DisputeFormData = z.infer<typeof disputeSchema>

interface UploadedFile {
  file: File
  preview: string
  type: string
}

interface DisputeModalProps {
  orderId: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const DisputeModal: React.FC<DisputeModalProps> = ({
  orderId,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const toast = useToast()

  const form = useForm<DisputeFormData>({
    resolver: zodResolver(disputeSchema),
    defaultValues: {
      reason: 'quality',
      description: '',
    },
  })

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

  // Get file icon
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-4 h-4" />
    if (type === 'application/pdf') return <FileText className="w-4 h-4" />
    return <Archive className="w-4 h-4" />
  }

  const onSubmit = async (data: DisputeFormData) => {
    try {
      setIsSubmitting(true)

      // Create FormData for file upload
      const formData = new FormData()
      formData.append('reason', data.reason)
      formData.append('description', data.description)

      // Add files
      uploadedFiles.forEach(({ file }) => {
        formData.append('files', file)
      })

      await apiClient.post(`/api/orders/${orderId}/dispute`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      toast.success('Dispute submitted successfully')
      onSuccess()
      onClose()
      form.reset()
      setUploadedFiles([])
    } catch (error: any) {
      toast.error('Failed to submit dispute', error.response?.data?.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    // Clean up preview URLs
    uploadedFiles.forEach(file => URL.revokeObjectURL(file.preview))
    setUploadedFiles([])
    form.reset()
    onClose()
  }

  const reasonOptions = [
    { value: 'quality', label: 'Quality Issues', description: 'Work does not meet expected quality standards' },
    { value: 'no_delivery', label: 'No Delivery', description: 'Seller has not delivered the work' },
    { value: 'other', label: 'Other Issues', description: 'Any other dispute reason' },
  ]

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Raise Dispute"
      size="lg"
    >
      <div className="mb-4">
        <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-orange-600" />
          <div>
            <h4 className="font-medium text-orange-800">Dispute Notice</h4>
            <p className="text-sm text-orange-600">
              Raising a dispute will pause the order and our team will review the case.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Dispute Reason */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Dispute Reason
          </label>
          <div className="space-y-3">
            {reasonOptions.map((option) => (
              <label
                key={option.value}
                className={cn(
                  'flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors',
                  form.watch('reason') === option.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <input
                  type="radio"
                  {...form.register('reason')}
                  value={option.value}
                  className="mt-1"
                />
                <div>
                  <p className="font-medium text-text-primary">{option.label}</p>
                  <p className="text-sm text-text-secondary">{option.description}</p>
                </div>
              </label>
            ))}
          </div>
          {form.formState.errors.reason && (
            <p className="mt-1 text-sm text-danger">
              {form.formState.errors.reason.message}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Detailed Description
          </label>
          <textarea
            {...form.register('description')}
            placeholder="Please provide detailed information about the issue, including specific problems and what you expect as a resolution..."
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
              {form.watch('description')?.length || 0}/1000
            </p>
          </div>
        </div>

        {/* Evidence Files */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Evidence Files (Optional)
          </label>
          <p className="text-sm text-text-secondary mb-3">
            Upload screenshots, documents, or other evidence to support your dispute
          </p>
          
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

          {/* File Preview */}
          {uploadedFiles.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-text-primary mb-3">
                Uploaded Files
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
            Submit Dispute
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default DisputeModal
