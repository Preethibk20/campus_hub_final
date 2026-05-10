import React from 'react';
import ComingSoon from '@/components/ui/ComingSoon';
import { Gavel } from 'lucide-react';

const AdminDisputesPage: React.FC = () => {
  return (
    <ComingSoon 
      title="Dispute Resolution" 
      description="The platform's security and dispute center is currently being implemented to protect both gig creators and freelancers."
      icon={Gavel}
    />
  );
};

export default AdminDisputesPage;
