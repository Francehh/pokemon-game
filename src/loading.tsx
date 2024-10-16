import React from 'react';
import loadingLogo from './assets/LoadingLogo.gif';

const Loading: React.FC = () => {
  return (
    <div className="loading flex flex-col items-center justify-center h-screen w-screen">
      <img 
        src={loadingLogo}
        alt="Loading Pokémon"
        className="w-32 h-32"
      />
      <div className="mt-4 text-yellow-300 text-2xl font-bold">Catching Pokémon...</div>
    </div>
  );
};

export default Loading;
