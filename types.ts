
export type Category = 'Coding' | 'Design' | 'Tutoring' | 'Writing' | 'Video Editing' | 'Music' | 'Other';

export interface User {
  id: string;
  email: string;
  name: string;
  isVerified: boolean;
  collegeName?: string;
  avatar?: string;
  department?: string;
  yearOfStudy?: number;
  bio?: string;
  skills?: string[];
  points?: number;
  rating?: number;
  totalReviews?: number;
  badges?: Badge[];
  course?: string;
  year?: string;
  reviewsCount?: number;
  hourlyRate?: number;
  verified?: boolean;
  walletBalance?: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  earnedAt?: string;
}

export interface Review {
  id: string;
  reviewerId: string;
  reviewerName: string;
  revieweeId: string;
  rating: number;
  comment: string;
  sessionId?: string;
  createdAt: string;
}

export interface Session {
  id: string;
  helperId: string;
  helpeeId: string;
  title: string;
  description: string;
  subject: string;
  isRecurring: boolean;
  recurringDays?: string[];
  startTime: string;
  endTime: string;
  pointsOffered: number;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface PortfolioItem {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  images?: string[];
  link?: string;
  tags: string[];
  createdAt: string;
}

export interface TeamFinderPost {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  hackathonName: string;
  hackathonDate: string;
  requiredSkills: string[];
  currentMembers: TeamMember[];
  maxMembers: number;
  status: 'open' | 'closed';
  createdAt: string;
}

export interface TeamMember {
  userId: string;
  name: string;
  skills: string[];
  avatar?: string;
}

export interface Complaint {
  id: string;
  complainantId: string;
  respondentId: string;
  sessionId?: string;
  reason: string;
  description: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  createdAt: string;
  resolvedAt?: string;
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  avatar?: string;
  points: number;
  rating: number;
  sessionsCompleted: number;
  badges: number;
}

export interface Gig {
  id: string;
  title: string;
  description: string;
  category: Category;
  price: number;
  type: 'service' | 'request';
  userId: string;
  userName: string;
  userAvatar: string;
  postedAt: string;
  deadline?: string;
  points?: number;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  participants: string[];
  lastMessage: string;
  updatedAt: string;
}
