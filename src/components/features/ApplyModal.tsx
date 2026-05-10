import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { DollarSign } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { useToast } from '@/hooks/useToast'
import { useAuth } from '@/hooks/useAuth'
import apiClient from '@/api/client'

const applySchema = z.object({
  message: z.string()
    .min(20, 'Message must be at least 20 characters')
    .max(1000, 'Message must be less than 1000 characters'),
  proposedBudget: z.number()
    .min(1, 'Budget must be at least ₹1')
    .max(100000, 'Budget must be less than ₹100,000'),
})

type ApplyFormData = z.infer<typeof applySchema>

interface ApplyModalProps {
  isOpen: boolean
  onClose: () => void
  gigId: string
  gigTitle: string
  minBudget: number
  maxBudget: number
  onSuccess?: () => void
}

const ApplyModal: React.FC<ApplyModalProps> = ({
  isOpen,
  onClose,
  gigId,
  gigTitle,
  minBudget,
  maxBudget,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const toast = useToast()
  const { isAuthenticated } = useAuth()

  const form = useForm<ApplyFormData>({
    resolver: zodResolver(applySchema),
    defaultValues: {
      message: '',
      proposedBudget: Math.round((minBudget + maxBudget) / 2),
    },
  })

  const onSubmit = async (data: ApplyFormData) => {
    if (!isAuthenticated) {
      toast.error('Please login to apply for gigs')
      onClose()
      return
    }

    setIsSubmitting(true)
    try {
      await apiClient.post(`/api/gigs/${gigId}/apply`, {
        message: data.message,
        proposedBudget: data.proposedBudget,
      })

      toast.success('Application submitted successfully!')
      onSuccess?.()
      onClose()
      form.reset()
    } catch (error: any) {
      toast.error('Failed to submit application', error.response?.data?.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Apply for Gig"
      size="md"
    >
      <div className="mb-4">
        <h3 className="font-medium text-text-primary mb-1">{gigTitle}</h3>
        <p className="text-sm text-text-secondary">
          Budget Range: ₹{minBudget.toLocaleString()} – ₹{maxBudget.toLocaleString()}
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Why are you perfect for this gig?
          </label>
          <textarea
            {...form.register('message')}
            placeholder="Explain your experience, skills, and how you'll complete this gig..."
            rows={6}
            className="w-full px-3 py-2 border border-border rounded-input focus:ring-2 focus:ring-primary focus:border-primary resize-none"
          />
          <div className="flex justify-between mt-1">
            {form.formState.errors.message && (
              <p className="text-sm text-danger">
                {form.formState.errors.message.message}
              </p>
            )}
            <p className="text-xs text-text-muted">
              {form.watch('message')?.length || 0}/1000
            </p>
          </div>
        </div>

        <Input
          label="Proposed Budget (₹)"
          type="number"
          placeholder="5000"
          {...form.register('proposedBudget', { valueAsNumber: true })}
          error={form.formState.errors.proposedBudget?.message}
          prefix={<DollarSign className="w-4 h-4" />}
          helper={`Suggested: ₹${Math.round((minBudget + maxBudget) / 2).toLocaleString()}`}
        />

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
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
            Submit Application
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default ApplyModal
