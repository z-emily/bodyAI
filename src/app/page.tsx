import React from 'react';
import dynamic from 'next/dynamic';

const WebcamComponent = dynamic(() => import('../components/WebcamComponent'), { ssr: false });

const Home: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Live Webcam Stream</h1>
      <WebcamComponent />
    </div>
  );
};

export default Home;