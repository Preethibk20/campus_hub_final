import React from 'react'
import * as AvatarPrimitive from '@radix-ui/react-avatar'
import { cn } from '@/lib/utils'
import { getAvatarUrl, generateInitials } from '@/lib/utils'

interface AvatarProps extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> {
  src?: string
  alt?: string
  name?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  fallback?: string
}

const Avatar: React.FC<AvatarProps> = ({
  className,
  src,
  alt,
  name,
  size = 'md',
  fallback,
  ...props
}) => {
  const sizeStyles = {
    xs: 'h-6 w-6',
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  }

  const textSizes = {
    xs: 'text-[10px]',
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
  }

  const imageSrc = getAvatarUrl(src)
  const initials = fallback || generateInitials(name || '') || '?'

  return (
    <AvatarPrimitive.Root
      className={cn(
        'relative flex shrink-0 overflow-hidden rounded-full',
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {imageSrc ? (
        <AvatarPrimitive.Image
          src={imageSrc}
          alt={alt || name || 'Avatar'}
          className="aspect-square h-full w-full object-cover"
        />
      ) : null}
      <AvatarPrimitive.Fallback
        className={cn(
          'flex h-full w-full items-center justify-center rounded-full bg-surface-2 text-text-primary font-medium',
          textSizes[size]
        )}
      >
        {initials}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  )
}

const AvatarImage = AvatarPrimitive.Image
const AvatarFallback = AvatarPrimitive.Fallback

export { Avatar, AvatarImage, AvatarFallback }
export default Avatar
