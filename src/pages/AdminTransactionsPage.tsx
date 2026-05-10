import React from 'react';
import ComingSoon from '@/components/ui/ComingSoon';
import { Landmark } from 'lucide-react';

const AdminTransactionsPage: React.FC = () => {
  return (
    <ComingSoon 
      title="Global Transactions" 
      description="The master finance dashboard for tracking campus-wide earnings and payments is being integrated into the admin center."
      icon={Landmark}
    />
  );
};

export default AdminTransactionsPage;
