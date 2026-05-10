import React, { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Lock, ArrowRight } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useToast } from '@/hooks/useToast'
import { useAuth } from '@/hooks/useAuth'

// Form schema
const loginSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
  password: z.string()
    .min(1, 'Password is required'),
})

type LoginFormData = z.infer<typeof loginSchema>

const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()
  
  const { isAuthenticated, isLoading, login } = useAuth()
  
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      const from = location.state?.from?.pathname || '/dashboard'
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, isLoading, navigate, location.state])

  const onSubmit = async (data: LoginFormData) => {
    try {
      const res = await login(data.email, data.password);
      if (res.success) {
        toast.success('Login successful!');
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      } else {
        form.setError('root', { message: res.error || 'Login failed. Please try again.' });
        toast.error(res.error || 'Login failed. Please try again.');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      form.setError('root', { message: msg });
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-start justify-center p-4 pt-20">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-card border border-border p-6 shadow-card">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">
              Welcome Back
            </h1>
            <p className="text-text-secondary text-sm">
              Sign in to your Campus Hub account
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="your.name@college.edu"
              {...form.register('email')}
              error={form.formState.errors.email?.message}
              prefix={<Mail className="w-4 h-4" />}
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              {...form.register('password')}
              error={form.formState.errors.password?.message}
              prefix={<Lock className="w-4 h-4" />}
            />

            <div className="flex justify-center mt-4">
              <button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="w-full flex items-center justify-center p-4 bg-[#0C0E13] text-[#C8F53C] rounded-xl hover:bg-[#1C2030] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group shadow-lg hover:shadow-xl transform hover:scale-[1.02] font-semibold gap-2"
                title="Login"
                aria-label="Login"
              >
                <span>{form.formState.isSubmitting ? 'Signing in...' : 'Sign In'}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                />
                <span className="ml-2 text-sm text-text-secondary">Remember me</span>
              </label>
              
              <button
                type="button"
                onClick={() => toast.info('Password reset coming soon!')}
                className="text-sm text-primary hover:text-primary-dark font-medium cursor-pointer transition-colors"
              >
                Forgot password?
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-text-secondary text-sm">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/register')}
                className="text-primary hover:text-primary-dark font-medium cursor-pointer transition-colors"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
