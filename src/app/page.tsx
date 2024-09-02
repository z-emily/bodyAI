import React from 'react';
import dynamic from 'next/dynamic';

const WebcamComponent = dynamic(() => import('../components/WebcamComponent'), { ssr: false });

const Home: React.FC = () => {
  return (
    <div style={{ padding: '0px' }}>
      <WebcamComponent />
    </div>
  );
};

export default Home;