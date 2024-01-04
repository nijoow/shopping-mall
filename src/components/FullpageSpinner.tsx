import Spinner from '@/components/Spinner';
import React from 'react';

const FullpageSpinner = () => {
  return (
    <div className="fixed left-0 top-0 w-screen h-screen bg-black/40">
      <Spinner fill="white" width={24} className="m-auto" />
    </div>
  );
};

export default FullpageSpinner;
