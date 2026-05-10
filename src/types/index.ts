// User Types
export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: 'USER' | 'ADMIN'
  isVerified: boolean
  collegeName?: string
  department?: string
  yearOfStudy?: number
  skills: string[]
  bio?: string
  rating: number
  totalReviews: number
  walletBalance: number
  createdAt: string
  updatedAt: string
}

export interface UserProfile extends User {
  badges: Badge[]
  totalEarnings: number
  completedOrders: number
  averageResponseTime: number
}

// Gig Types
export interface Gig {
  id: string
  title: string
  description: string
  category: string
  price: number
  deliveryTime: number
  revisions: number
  requirements: string[]
  tags: string[]
  images: string[]
  userId: string
  userName: string
  userAvatar?: string
  userRating: number
  userReviewsCount: number
  status: 'ACTIVE' | 'PAUSED' | 'DRAFT'
  views: number
  likes: number
  createdAt: string
  updatedAt: string
}

export interface GigApplication {
  id: string
  gigId: string
  userId: string
  userName: string
  userAvatar?: string
  coverLetter: string
  proposedPrice?: number
  proposedDeliveryTime?: number
  attachments: string[]
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
  createdAt: string
}

// Order Types
export interface Order {
  id: string
  gigId: string
  gigTitle: string
  clientId: string
  clientName: string
  clientAvatar?: string
  helperId: string
  helperName: string
  helperAvatar?: string
  price: number
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED'
  requirements: string
  deliveryTime: number
  actualDeliveryTime?: number
  revisions: number
  revisionsUsed: number
  attachments: string[]
  messages: Message[]
  review?: Review
  createdAt: string
  updatedAt: string
  completedAt?: string
}

// Message Types
export interface Message {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderAvatar?: string
  content: string
  type: 'text' | 'image' | 'file'
  attachmentUrl?: string
  attachmentName?: string
  read: boolean
  timestamp: string
}

export interface Conversation {
  id: string
  participantId: string
  participantName: string
  participantAvatar?: string
  lastMessage?: Message
  unreadCount: number
  isOnline: boolean
  createdAt: string
  updatedAt: string
}

// Review Types
export interface Review {
  id: string
  orderId: string
  clientId: string
  clientName: string
  clientAvatar?: string
  helperId: string
  helperName: string
  helperAvatar?: string
  rating: number
  comment: string
  response?: string
  createdAt: string
  updatedAt: string
}

// Badge Types
export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  color: string
  requirement: string
  earnedAt?: string
}

// Notification Types
export interface Notification {
  id: string
  userId: string
  type: 'NEW_ORDER' | 'ORDER_UPDATE' | 'MESSAGE' | 'REVIEW' | 'BADGE_EARNED' | 'SYSTEM'
  title: string
  message: string
  data?: Record<string, any>
  read: boolean
  createdAt: string
}

// Wallet Types
export interface WalletTransaction {
  id: string
  userId: string
  type: 'EARNING' | 'SPENDING' | 'REFUND' | 'BONUS' | 'WITHDRAWAL'
  amount: number
  description: string
  orderId?: string
  balance: number
  createdAt: string
}

// API Types
export interface ApiResponse<T = any> {
  success: boolean
  data: T
  message?: string
  errors?: string[]
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Form Types
export interface LoginFormData {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterFormData {
  email: string
  password: string
  confirmPassword: string
  name: string
  collegeName: string
  department?: string
  yearOfStudy?: number
}

export interface GigFormData {
  title: string
  description: string
  category: string
  price: number
  deliveryTime: number
  revisions: number
  requirements: string[]
  tags: string[]
  images: File[]
}

export interface ProfileFormData {
  name: string
  bio: string
  department: string
  yearOfStudy: number
  skills: string[]
}

// Filter Types
export interface GigFilters {
  category?: string
  priceRange?: [number, number]
  deliveryTime?: number
  rating?: number
  sortBy?: 'createdAt' | 'price' | 'rating' | 'reviews'
  sortOrder?: 'asc' | 'desc'
  search?: string
}

export interface UserFilters {
  department?: string
  yearOfStudy?: number
  skills?: string[]
  rating?: number
  search?: string
}

// Socket Types
export interface SocketEvents {
  // Client to Server
  join_room: (roomId: string) => void
  leave_room: (roomId: string) => void
  send_message: (data: {
    conversationId: string
    content: string
    type: 'text' | 'image' | 'file'
  }) => void
  typing: (data: {
    conversationId: string
    isTyping: boolean
    userId?: string
  }) => void
  mark_read: (data: { conversationId: string }) => void

  // Server to Client
  new_message: (message: Message) => void
  message_read: (data: {
    conversationId: string
    messageId: string
  }) => void
  user_online: (userId: string) => void
  user_offline: (userId: string) => void
  new_order: (order: Order) => void
  order_updated: (order: Order) => void
  notification: (notification: Notification) => void
}

// Component Props Types
export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
}

export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  onClick?: () => void
}

export interface InputProps extends BaseComponentProps {
  type?: string
  placeholder?: string
  value?: string
  defaultValue?: string
  error?: string
  label?: string
  required?: boolean
  disabled?: boolean
  prefix?: React.ReactNode
  suffix?: React.ReactNode
  onChange?: (value: string) => void
  onBlur?: () => void
  onFocus?: () => void
}

// Route Types
export interface RouteConfig {
  path: string
  component: React.ComponentType
  protected?: boolean
  adminOnly?: boolean
  layout?: React.ComponentType<{ children: React.ReactNode }>
}

// Error Types
export interface ApiError {
  message: string
  code?: string
  details?: Record<string, any>
}

export interface FormError {
  field: string
  message: string
}

// Theme Types
export type Theme = 'light' | 'dark'

// Constants
export const CATEGORIES = [
  'Academic Writing',
  'Programming',
  'Design',
  'Marketing',
  'Business',
  'Data Analysis',
  'Translation',
  'Video Editing',
  'Music & Audio',
  'Other',
] as const

export const DEPARTMENTS = [
  'Computer Science',
  'Engineering',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Business',
  'Economics',
  'Literature',
  'Psychology',
  'Other',
] as const

export const SKILLS = [
  'JavaScript',
  'Python',
  'Java',
  'React',
  'Node.js',
  'Machine Learning',
  'Data Science',
  'UI/UX Design',
  'Content Writing',
  'Digital Marketing',
  'Video Editing',
  'Translation',
  'Academic Research',
  'Tutoring',
  'Other',
] as const
