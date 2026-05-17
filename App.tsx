
import React from 'react';
import SimplifiedApp from './components/SimplifiedApp';
import { Analytics } from '@vercel/analytics/react';

const App: React.FC = () => {
  return (
    <>
      <SimplifiedApp />
      <Analytics />
    </>
  );
};

export default App;