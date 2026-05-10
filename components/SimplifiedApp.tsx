import React, { useState } from 'react';
import Layout from './Layout';
import QuickHelp from './QuickHelp';
import StudyBuddy from './StudyBuddy';
import SkillBadges from './SkillBadges';
import ResearchPapers from './ResearchPapers';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import Auth from '../pages/Auth';

const SimplifiedApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState('help');

  const renderContent = () => {
    switch (activeTab) {
      case 'help':
        return <QuickHelp onRequestHelp={(topic, major, isAcademic) => {
          console.log('Help requested:', { topic, major, isAcademic });
        }} />;
      case 'buddy':
        return <StudyBuddy 
          onCreateBuddy={(topic, schedule, maxMembers) => {
            console.log('Study buddy created:', { topic, schedule, maxMembers });
          }}
          onJoinBuddy={(buddyId) => {
            console.log('Joining study buddy:', buddyId);
          }}
        />;
      case 'badges':
        return <SkillBadges 
          badges={[
            {
              id: '1',
              skill: 'React',
              level: 'Advanced',
              verified: true,
              verifiedBy: 'Prof. Smith',
              projects: 5,
              earnedAt: '2024-03-01'
            },
            {
              id: '2',
              skill: 'Python',
              level: 'Intermediate',
              verified: false,
              projects: 3,
              earnedAt: '2024-02-15'
            }
          ]}
          onVerifySkill={(skill) => console.log('Verifying skill:', skill)}
          onExportToLinkedIn={() => console.log('Exporting to LinkedIn')}
          isOwnProfile={true}
        />;
      case 'research':
        return <ResearchPapers 
          papers={[
            {
              id: '1',
              title: 'Machine Learning in Education',
              abstract: 'This paper explores the application of machine learning techniques in educational settings...',
              authors: ['John Doe', 'Jane Smith'],
              subject: 'Computer Science',
              year: 2024,
              tags: ['machine learning', 'education', 'AI'],
              collaborators: 3,
              createdAt: '2024-03-10'
            }
          ]}
          onUploadPaper={(paper) => console.log('Paper uploaded:', paper)}
          onJoinCollaboration={(paperId) => console.log('Joining collaboration:', paperId)}
        />;
      default:
        return <QuickHelp onRequestHelp={() => {}} />;
    }
  };

  return (
    <AuthProvider>
      <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
        <div key={activeTab} className="animate-fade-in">
          <ProtectedRoute requireVerification={false}>
            {renderContent()}
          </ProtectedRoute>
        </div>
      </Layout>
    </AuthProvider>
  );
};

export default SimplifiedApp;
