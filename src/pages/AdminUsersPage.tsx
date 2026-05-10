import React from 'react';
import ComingSoon from '@/components/ui/ComingSoon';
import { Users } from 'lucide-react';

const AdminUsersPage: React.FC = () => {
  return (
    <ComingSoon 
      title="User Management" 
      description="The administrator's toolkit for managing student accounts and verified roles is being developed to ensure a safe and collaborative community."
      icon={Users}
    />
  );
};

export default AdminUsersPage;
