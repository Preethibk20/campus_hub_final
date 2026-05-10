// Demo Data for Campus Hub
window.demoData = {
  // Test Account Credentials
  credentials: {
    email: 'john.doe@gmail.com',
    password: 'password123',
    name: 'John Doe',
    collegeName: 'Demo University'
  },

  // Sample Users
  users: [
    {
      id: '1',
      email: 'john.doe@gmail.com',
      name: 'John Doe',
      department: 'Computer Science',
      yearOfStudy: 3,
      bio: 'Passionate about web development and helping others learn programming.',
      skills: ['JavaScript', 'React', 'Node.js', 'Python', 'Machine Learning'],
      points: 250,
      rating: 4.8,
      totalReviews: 12,
      isVerified: true,
      collegeName: 'Demo University',
      avatar: 'https://picsum.photos/seed/john/100'
    },
    {
      id: '2',
      email: 'jane.smith@gmail.com',
      name: 'Jane Smith',
      department: 'Electrical Engineering',
      yearOfStudy: 2,
      bio: 'Love teaching math and physics. Always happy to help with circuit problems!',
      skills: ['Mathematics', 'Physics', 'Circuit Design', 'MATLAB'],
      points: 180,
      rating: 4.9,
      totalReviews: 8,
      isVerified: true,
      collegeName: 'Demo University',
      avatar: 'https://picsum.photos/seed/jane/100'
    },
    {
      id: '3',
      email: 'mike.wilson@gmail.com',
      name: 'Mike Wilson',
      department: 'Mechanical Engineering',
      yearOfStudy: 4,
      bio: 'CAD expert and robotics enthusiast. Senior project help available.',
      skills: ['AutoCAD', 'SolidWorks', 'Robotics', 'Python', 'C++'],
      points: 320,
      rating: 4.7,
      totalReviews: 15,
      isVerified: true,
      collegeName: 'Demo University',
      avatar: 'https://picsum.photos/seed/mike/100'
    }
  ],

  // Sample Sessions
  sessions: [
    {
      id: '1',
      helperId: '1',
      helpeeId: '',
      title: 'React Hooks Deep Dive',
      description: 'Let\'s explore advanced React Hooks patterns and best practices. Bring your questions!',
      subject: 'Web Development',
      startTime: '2024-03-16T14:00:00',
      endTime: '2024-03-16T16:00:00',
      pointsOffered: 25,
      isRecurring: true,
      recurringDays: ['Monday', 'Wednesday'],
      status: 'pending',
      createdAt: '2024-03-15T10:00:00'
    },
    {
      id: '2',
      helperId: '2',
      helpeeId: '',
      title: 'Calculus Study Group',
      description: 'Weekly calculus problem-solving session. All levels welcome!',
      subject: 'Mathematics',
      startTime: '2024-03-17T16:00:00',
      endTime: '2024-03-17T18:00:00',
      pointsOffered: 15,
      isRecurring: true,
      recurringDays: ['Tuesday', 'Thursday'],
      status: 'pending',
      createdAt: '2024-03-15T11:00:00'
    }
  ],

  // Sample Reviews
  reviews: [
    {
      id: '1',
      reviewerId: '2',
      reviewerName: 'Jane Smith',
      revieweeId: '1',
      rating: 5,
      comment: 'John was amazing! Helped me understand React Hooks in just one session. Very patient and knowledgeable.',
      sessionId: '1',
      createdAt: '2024-03-14T15:00:00'
    },
    {
      id: '2',
      reviewerId: '3',
      reviewerName: 'Mike Wilson',
      revieweeId: '1',
      rating: 4,
      comment: 'Great explanation of complex topics. John knows his stuff well.',
      sessionId: '1',
      createdAt: '2024-03-13T14:00:00'
    }
  ],

  // Sample Portfolio Items
  portfolioItems: [
    {
      id: '1',
      userId: '1',
      title: 'E-Learning Platform',
      description: 'Built a full-stack e-learning platform with React, Node.js, and MongoDB. Features include video streaming, quizzes, and progress tracking.',
      category: 'Web Development',
      link: 'https://github.com/johndoe/e-learning',
      tags: ['React', 'Node.js', 'MongoDB', 'Express', 'JWT'],
      createdAt: '2024-03-10T10:00:00'
    },
    {
      id: '2',
      userId: '1',
      title: 'ML Prediction Model',
      description: 'Developed a machine learning model to predict student performance based on various factors. Achieved 85% accuracy.',
      category: 'Machine Learning',
      link: 'https://github.com/johndoe/ml-prediction',
      tags: ['Python', 'TensorFlow', 'Scikit-learn', 'Pandas'],
      createdAt: '2024-03-08T15:00:00'
    }
  ],

  // Sample Team Posts
  teamPosts: [
    {
      id: '1',
      creatorId: '1',
      title: 'HackMIT 2024 Team',
      description: 'Looking for team members for HackMIT 2024! We\'re building an educational app for underprivileged students.',
      hackathonName: 'HackMIT 2024',
      hackathonDate: '2024-04-15',
      requiredSkills: ['React', 'Node.js', 'UI/UX Design', 'Machine Learning'],
      currentMembers: [
        { userId: '1', name: 'John Doe', skills: ['React', 'Node.js'], avatar: 'https://picsum.photos/seed/john/100' }
      ],
      maxMembers: 4,
      status: 'open',
      createdAt: '2024-03-15T09:00:00'
    }
  ],

  // Sample Leaderboard
  leaderboard: [
    {
      userId: '1',
      name: 'John Doe',
      avatar: 'https://picsum.photos/seed/john/100',
      points: 250,
      rating: 4.8,
      sessionsCompleted: 12,
      badges: 5
    },
    {
      userId: '2',
      name: 'Jane Smith',
      avatar: 'https://picsum.photos/seed/jane/100',
      points: 180,
      rating: 4.9,
      sessionsCompleted: 8,
      badges: 3
    },
    {
      userId: '3',
      name: 'Mike Wilson',
      avatar: 'https://picsum.photos/seed/mike/100',
      points: 320,
      rating: 4.7,
      sessionsCompleted: 15,
      badges: 6
    }
  ]
};

// Auto-fill demo function
window.fillDemoForm = function() {
  const credentials = window.demoData.credentials;
  
  // Wait for the auth form to be available
  setTimeout(() => {
    const emailInput = document.querySelector('input[type="email"]');
    const passwordInput = document.querySelector('input[type="password"]');
    const nameInput = document.querySelector('input[placeholder*="John Doe"]');
    const collegeInput = document.querySelector('input[placeholder*="University"]');
    
    if (emailInput) emailInput.value = credentials.email;
    if (passwordInput) passwordInput.value = credentials.password;
    if (nameInput) nameInput.value = credentials.name;
    if (collegeInput) collegeInput.value = credentials.collegeName;
    
    console.log('Demo form filled with:', credentials);
  }, 1000);
};

console.log('Campus Hub Demo Data loaded!');
console.log('Demo credentials:', window.demoData.credentials);
console.log('Run fillDemoForm() to auto-fill the login form');
