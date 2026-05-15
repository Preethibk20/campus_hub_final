import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowRight, Lock, Mail, User, Upload, X, Code, Users, Briefcase, GraduationCap, BookOpen, ShoppingBag, Zap } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useToast } from '@/hooks/useToast'
import { useAuth } from '@/hooks/useAuth'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/lib/utils'

// Form schemas — matches backend RegisterRequest (name, email, password ≥ 8)
const accountSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(120, 'Name is too long'),
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters'),
})

const otpSchema = z.object({
  otp: z.string()
    .length(6, 'OTP must be 6 digits')
    .regex(/^\d+$/, 'OTP must contain only numbers'),
})

const profileSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  department: z.string()
    .min(1, 'Department is required'),
  yearOfStudy: z.number()
    .min(1, 'Year must be between 1 and 4')
    .max(4, 'Year must be between 1 and 4'),
  bio: z.string()
    .max(200, 'Bio must be less than 200 characters')
    .optional(),
})

type AccountFormData = z.infer<typeof accountSchema>
type OTPFormData = z.infer<typeof otpSchema>
type ProfileFormData = z.infer<typeof profileSchema>

const RegisterPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [registeredEmail, setRegisteredEmail] = useState('')
  const [registeredPassword, setRegisteredPassword] = useState('')
  const [otpError, setOtpError] = useState('')
  const [otpCountdown, setOtpCountdown] = useState(300) // 5 minutes
  const [avatarUrl, setAvatarUrl] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()
  const { register: registerAccount, verifyOTP, resendOtp, updateProfile } = useAuth()
  const { setUser, setTokens } = useAuthStore()

  // Forms
  const accountForm = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: { name: '', email: '', password: '' },
  })

  const otpForm = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' },
  })

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  })

  // OTP input refs
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])
  
  // Track OTP value for rendering
  const currentOTP = otpForm.watch('otp') || ''

  // Countdown timer
  useEffect(() => {
    if (currentStep === 2 && otpCountdown > 0) {
      const timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [currentStep, otpCountdown])

  // Step 1: create account on server — triggers OTP email (e.g. Mailpit in dev)
  const onAccountSubmit = async (data: AccountFormData) => {
    setOtpError('') // Clear any previous OTP errors
    const result = await registerAccount({
      name: data.name,
      email: data.email,
      password: data.password,
    })
    if (result.success) {
      setRegisteredEmail(data.email)
      setRegisteredPassword(data.password) // Save password for resend
      setCurrentStep(2)
      toast.success('Check your inbox for the 6-digit code (or open Mailpit at :8025 in dev).')
    } else {
      // Show the exact error message from the response body
      toast.error(result.error || 'Registration failed')
    }
  }

  // Handle OTP input
  const handleOTPInput = (value: string, index: number) => {
    // Only allow numbers
    const numValue = value.replace(/\D/g, '')
    
    // Handle pasting multiple digits (e.g. 6-digit OTP)
    if (numValue.length > 1) {
      const pasted = numValue.substring(0, 6)
      otpForm.setValue('otp', pasted)
      
      if (pasted.length === 6) {
        setTimeout(() => onOTPSubmit({ otp: pasted }), 100)
        otpRefs.current[5]?.focus()
      } else {
        otpRefs.current[Math.min(pasted.length, 5)]?.focus()
      }
      return
    }

    if (numValue.length <= 1) {
      const cur = otpForm.getValues('otp') ?? ''
      otpForm.setValue(
        `otp`,
        cur.substring(0, index) + numValue + cur.substring(index + 1)
      )
      
      // Auto-focus next input
      if (numValue && index < 5) {
        otpRefs.current[index + 1]?.focus()
      }
      
      // Auto-submit when all 6 digits are filled
      if (index === 5 && numValue) {
        const cur = otpForm.getValues('otp') ?? ''
        const fullOTP = cur.substring(0, 5) + numValue
        otpForm.setValue('otp', fullOTP)
        setTimeout(() => onOTPSubmit({ otp: fullOTP }), 100)
      }
    }
  }

  // Handle backspace in OTP
  const handleOTPBackspace = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !e.currentTarget.value && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  // Handle OTP submission
  const onOTPSubmit = async (data: OTPFormData) => {
    setOtpError('') // Clear previous errors
    try {
      const result = await verifyOTP(registeredEmail, data.otp)
      if (result.success) {
        toast.success('Email verified! Welcome to Campus Hub! 🚀')
        // Automatically log in and go to dashboard
        navigate('/dashboard', { replace: true })
      } else {
        setOtpError(result.error || 'Verification failed')
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Verification failed'
      setOtpError(errorMsg)
    }
  }

  // Handle profile submission - No longer used in main register flow
  const onProfileSubmit = async (data: ProfileFormData) => {
    const profileData = {
      ...data,
      ...(avatarUrl ? { avatar: avatarUrl } : {}),
    }
    
    const result = await updateProfile(profileData)
    if (result.success) {
      toast.success('Profile completed! Redirecting to dashboard...')
      setTimeout(() => navigate('/dashboard'), 2000)
    } else {
      toast.error('Profile update failed', result.error)
    }
  }

  // Handle resend OTP
  const handleResendOtp = async () => {
    setOtpError('') // Clear previous errors
    try {
      const result = await resendOtp(registeredEmail)
      if (result.success) {
        setOtpCountdown(300) // Reset countdown
        toast.success('New OTP sent to your email!')
      } else {
        setOtpError(result.error || 'Failed to resend OTP')
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Failed to resend OTP'
      setOtpError(errorMsg)
    }
  }

  // Handle direct Cloudinary upload (Fix for tracking prevention)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const { uploadToCloudinary } = await import('@/lib/cloudinary')
      const url = await uploadToCloudinary(file)
      setAvatarUrl(url)
      toast.success('Avatar uploaded successfully! ✨')
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.message || 'Upload failed')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const triggerUpload = () => {
    fileInputRef.current?.click()
  }

  // Format countdown
  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-surface flex items-start justify-center p-4 pt-10 overflow-y-auto">
      <div className="w-full max-w-4xl">
        {/* Header with Campus Hub branding */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 bg-[#0C0E13] rounded-xl flex items-center justify-center shadow-lg shadow-black/10">
              <GraduationCap className="w-7 h-7 text-[#C8F53C]" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter">
              Campus Hub
            </h1>
          </div>
          <p className="text-gray-500 font-bold max-w-md mx-auto">
            Your gateway to hackathons, mentorship, and campus opportunities
          </p>
          
          {/* Platform Features */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100/50">
              <Code className="w-6 h-6 text-[#0C0E13] mx-auto mb-2" />
              <p className="text-xs font-black text-gray-900 uppercase tracking-widest">Hackathons</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100/50">
              <Users className="w-6 h-6 text-[#0C0E13] mx-auto mb-2" />
              <p className="text-xs font-black text-gray-900 uppercase tracking-widest">Alumni</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100/50">
              <Briefcase className="w-6 h-6 text-[#0C0E13] mx-auto mb-2" />
              <p className="text-xs font-black text-gray-900 uppercase tracking-widest">Projects</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100/50">
              <Users className="w-6 h-6 text-[#0C0E13] mx-auto mb-2" />
              <p className="text-xs font-black text-gray-900 uppercase tracking-widest">Mentorship</p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Registration Form */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-card overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#C8F53C]/20">
                <div 
                  className="h-full bg-[#C8F53C] transition-all duration-500"
                  style={{ width: `${(currentStep / 2) * 100}%` }}
                />
              </div>

              {/* Step 1: Account Creation */}
              {currentStep === 1 && (
                <div className="animate-fade-in">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-[#C8F53C]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Mail className="w-8 h-8 text-[#0C0E13]" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                      Join Campus Hub
                    </h2>
                    <p className="text-gray-500 text-sm font-bold">
                      Start your journey with your college email
                    </p>
                  </div>

                  <form onSubmit={accountForm.handleSubmit(onAccountSubmit)} className="space-y-5">
                    <Input
                      label="Full Name"
                      placeholder="Enter your full name"
                      {...accountForm.register('name')}
                      error={accountForm.formState.errors.name?.message}
                      prefix={<User className="w-4 h-4" />}
                    />

                    <Input
                      label="College Email"
                      type="email"
                      placeholder="name@college.edu"
                      {...accountForm.register('email')}
                      error={accountForm.formState.errors.email?.message}
                      prefix={<Mail className="w-4 h-4" />}
                    />

                    <Input
                      label="Password"
                      type="password"
                      placeholder="Min 8 characters"
                      {...accountForm.register('password')}
                      error={accountForm.formState.errors.password?.message}
                      prefix={<Lock className="w-4 h-4" />}
                    />

                    <button
                      type="submit"
                      disabled={accountForm.formState.isSubmitting}
                      className="w-full py-4 px-4 bg-[#0C0E13] text-[#C8F53C] font-black rounded-xl hover:bg-[#1C2030] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-black/10 group"
                    >
                      {accountForm.formState.isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-[#C8F53C] border-t-transparent rounded-full animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        <>
                          Create account
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>

                    <div className="text-center pt-2">
                       <p className="text-sm text-gray-500 font-bold">
                        Already have an account?{' '}
                        <button
                          type="button"
                          onClick={() => navigate('/login')}
                          className="text-[#0C0E13] hover:underline"
                        >
                          Sign in
                        </button>
                      </p>
                    </div>
                  </form>
                </div>
              )}
              
              {/* Step 2: OTP Verification */}
              {currentStep === 2 && (
                <div className="animate-fade-in">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-[#C8F53C]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Lock className="w-8 h-8 text-[#0C0E13]" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                      Verify Your Email
                    </h2>
                    <p className="text-gray-500 text-sm font-bold">
                      Sent to <span className="text-[#0C0E13]">{registeredEmail}</span>
                    </p>
                  </div>

                  <form onSubmit={otpForm.handleSubmit(onOTPSubmit)} className="space-y-8">
                    <div>
                      <div className="flex justify-center gap-3">
                        {[0, 1, 2, 3, 4, 5].map((index) => (
                          <input
                            key={index}
                            ref={(el) => otpRefs.current[index] = el}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            className="w-12 h-14 text-center text-xl font-black border-2 border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C8F53C] focus:border-[#C8F53C] transition-all bg-gray-50"
                            value={currentOTP[index] || ''}
                            onChange={(e) => handleOTPInput(e.target.value, index)}
                            onKeyDown={(e) => handleOTPBackspace(e, index)}
                          />
                        ))}
                      </div>
                      {otpError && (
                        <p className="mt-4 text-xs font-bold text-red-500 text-center">
                          {otpError}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={currentOTP.length !== 6 || otpForm.formState.isSubmitting}
                      className="w-full py-4 px-4 bg-[#0C0E13] text-[#C8F53C] font-black rounded-xl hover:bg-[#1C2030] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-black/10"
                    >
                      {otpForm.formState.isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-[#C8F53C] border-t-transparent rounded-full animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          Verify Email
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={otpCountdown > 0}
                        className="font-black text-xs text-gray-400 hover:text-[#0C0E13] disabled:opacity-50 transition-colors uppercase tracking-widest"
                      >
                        {otpCountdown > 0
                          ? `Resend in ${formatCountdown(otpCountdown)}`
                          : 'Resend code'
                        }
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
          
          {/* Right Sidebar - Platform Benefits */}
          <div className="lg:w-80">
            <div className="bg-[#0C0E13] rounded-2xl p-8 shadow-xl text-white">
              <h3 className="text-lg font-black mb-6 tracking-tight">Why Join?</h3>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Code className="w-5 h-5 text-[#C8F53C]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm mb-1 uppercase tracking-wider">Teammates</h4>
                    <p className="text-xs text-gray-400 font-medium">Find partners for hackathons and campus projects</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-[#C8F53C]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm mb-1 uppercase tracking-wider">Network</h4>
                    <p className="text-xs text-gray-400 font-medium">Connect with graduates and alumni for mentorship</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5 text-[#C8F53C]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm mb-1 uppercase tracking-wider">Recognition</h4>
                    <p className="text-xs text-gray-400 font-medium">Build your profile with verified reviews and badges</p>
                  </div>
                </div>
              </div>

              <div className="mt-10 p-4 bg-white/5 rounded-xl border border-white/10">
                <p className="text-[10px] font-black text-[#C8F53C] text-center uppercase tracking-widest leading-loose">
                  🎯 join the students already building their future on campus hub
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
