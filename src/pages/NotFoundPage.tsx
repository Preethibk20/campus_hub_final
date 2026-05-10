import React from 'react'
import { Link } from 'react-router-dom'
import { Ghost, Home, ArrowLeft } from 'lucide-react'
import Button from '@/components/ui/Button'

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="text-center">
        <div className="relative mb-8">
          <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Ghost className="w-16 h-16 text-primary" />
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white px-4 py-1 rounded-full shadow-card">
            <span className="text-4xl font-bold text-text-primary">404</span>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-text-primary mb-3">
          Page not found
        </h1>

        <p className="text-text-secondary mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved. 
          Let's get you back on track.
        </p>

        <div className="flex flex-wrap gap-3 justify-center">
          <Button onClick={() => window.history.back()} variant="secondary" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
          
          <Link to="/">
            <Button className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Decorative elements */}
        <div className="mt-12 flex justify-center gap-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-primary/20 animate-bounce"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage
