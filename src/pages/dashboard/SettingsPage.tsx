import React from 'react';
import ComingSoon from '@/components/ui/ComingSoon';
import { Settings } from 'lucide-react';

const SettingsPage: React.FC = () => {
  return (
    <ComingSoon 
      title="Settings & Privacy" 
      description="Customize your campus experience. We're building new account preferences, privacy controls, and theme settings just for you."
      icon={Settings}
    />
  );
};

export default SettingsPage;
