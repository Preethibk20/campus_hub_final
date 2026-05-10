import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowRight, User, BookOpen, GraduationCap, Briefcase } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useToast } from '@/hooks/useToast'
import { useAuthStore } from '@/stores/authStore'

const onboardingSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  course: z.string().min(1, 'Course is required'),
  year: z.string().min(1, 'Year is required'),
  bio: z.string().optional(),
  skills: z.string().optional(),
})

type OnboardingFormData = z.infer<typeof onboardingSchema>

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate()
  const toast = useToast()
  const { user } = useAuthStore()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: user?.name || '',
      course: '',
      year: '',
      bio: '',
      skills: '',
    },
  })

  const onSubmit = async (data: OnboardingFormData) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          name: data.name,
          bio: data.bio,
          branch: data.course,
          academicYear: data.year ? (data.year === '5' ? 'Postgrad' : `${data.year}${data.year === '1' ? 'st' : data.year === '2' ? 'nd' : data.year === '3' ? 'rd' : 'th'} Year`) : undefined,
          skills: data.skills ? data.skills.split(',').map(s => s.trim()).filter(s => s) : [],
        }),

      })

      if (response.ok) {
        toast.success('Profile completed successfully!')
        navigate('/dashboard', { replace: true })
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to update profile')
      }
    } catch (error) {
      toast.error('An error occurred while updating your profile')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to CampusHub! 🎓
          </h1>
          <p className="text-gray-600">
            Complete your profile to get started with the platform
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <Input
                placeholder="Enter your full name"
                {...form.register('name')}
                error={form.formState.errors.name?.message}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <BookOpen className="w-4 h-4 inline mr-1" />
                  Course
                </label>
                <Input
                  placeholder="e.g. Computer Science"
                  {...form.register('course')}
                  error={form.formState.errors.course?.message}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <GraduationCap className="w-4 h-4 inline mr-1" />
                  Year
                </label>
                <select
                  {...form.register('year')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select year</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                  <option value="5">5th Year</option>
                </select>
                {form.formState.errors.year && (
                  <p className="mt-1 text-sm text-red-500">{form.formState.errors.year.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                placeholder="Tell us about yourself..."
                rows={3}
                {...form.register('bio')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Briefcase className="w-4 h-4 inline mr-1" />
                Skills (optional)
              </label>
              <Input
                placeholder="e.g. JavaScript, Design, Writing (comma-separated)"
                {...form.register('skills')}
                error={form.formState.errors.skills?.message}
              />
              <p className="mt-1 text-sm text-gray-500">
                Separate multiple skills with commas
              </p>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  Complete Profile
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default OnboardingPage
