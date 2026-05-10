
import { User, Gig, Badge } from './types';

export const MOCK_BADGES: Badge[] = [
  { id: '1', name: 'Top Rated', description: 'Highly rated by peers', icon: '⭐', color: 'bg-yellow-100 text-yellow-700' },
  { id: '2', name: 'Fast Deliverer', description: 'Quick turnaround', icon: '⚡', color: 'bg-blue-100 text-blue-700' },
  { id: '3', name: 'Coding Wizard', description: 'Strong technical skills', icon: '🧙‍♂️', color: 'bg-purple-100 text-purple-700' },
];

export const MOCK_USER: User = {
  id: 'u1',
  email: 'alex@example.edu',
  name: 'Alex Johnson',
  isVerified: true,
  course: 'Computer Science',
  year: '3rd Year',
  avatar: 'https://picsum.photos/seed/alex/200',
  skills: ['React', 'TypeScript', 'Tailwind CSS', 'Java'],
  bio: 'Full-stack enthusiast looking to help peers with coding assignments and UI designs.',
  rating: 4.8,
  reviewsCount: 12,
  hourlyRate: 15,
  badges: [MOCK_BADGES[0], MOCK_BADGES[2]],
  verified: true,
  walletBalance: 450,
};

export const MOCK_GIGS: Gig[] = [
  {
    id: 'g1',
    title: 'Python Tutoring for Data Structures',
    description: 'Help with basic DS concepts like linked lists and binary trees. 1 hour session.',
    category: 'Tutoring',
    price: 20,
    type: 'service',
    userId: 'u2',
    userName: 'Sarah Chen',
    userAvatar: 'https://picsum.photos/seed/sarah/200',
    postedAt: '2023-10-25T10:00:00Z',
  },
  {
    id: 'g2',
    title: 'Need a Flyer for Tech Fest',
    description: 'Looking for a clean, futuristic flyer design for our upcoming hackathon.',
    category: 'Design',
    price: 35,
    type: 'request',
    userId: 'u3',
    userName: 'Mike Ross',
    userAvatar: 'https://picsum.photos/seed/mike/200',
    postedAt: '2023-10-26T14:30:00Z',
  },
  {
    id: 'g3',
    title: 'Resume Proofreading & Formatting',
    description: 'I will optimize your resume for ATS and fix all grammatical issues.',
    category: 'Writing',
    price: 10,
    type: 'service',
    userId: 'u1',
    userName: 'Alex Johnson',
    userAvatar: 'https://picsum.photos/seed/alex/200',
    postedAt: '2023-10-27T09:15:00Z',
  }
];
