import React from 'react';
import ComingSoon from '@/components/ui/ComingSoon';
import { LayoutDashboard } from 'lucide-react';

const AdminPage: React.FC = () => {
  return (
    <ComingSoon 
      title="Admin Dashboard" 
      description="The central command for Campus Hub administrators is currently under construction. Soon you'll be able to manage the entire platform from here."
      icon={LayoutDashboard}
    />
  );
};

export default AdminPage;
