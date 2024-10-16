import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface StartScreenProps {
  onStart: () => void;
  fetchRandomPokemon: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart, fetchRandomPokemon }) => {

  const themeMusic = `${process.env.PUBLIC_URL}/HomeScreenMusic.mp3`;
  const navigate = useNavigate();

  useEffect(() => {
    const audio = new Audio(themeMusic);
    audio.volume = 0.1;

    audio.play().catch((error) => {
      console.error('Error playing audio:', error);
    });

    const handleClick = () => {
      onStart();
      fetchRandomPokemon();
    };

    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('click', handleClick);
      audio.pause();
      audio.currentTime = 0;
    };
  }, [onStart, fetchRandomPokemon, themeMusic, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-black">
      {/* Dark Overlay Effect */}
      <div className="absolute inset-0 bg-black opacity-40"></div>

      {/* Content with pulse animation and fade-in effect */}
      <div className="relative text-center text-white animate-fade-in z-10">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">Welcome to the Pokémon Battle Game!</h1>
        <p className="text-lg md:text-xl animate-pulse">Click anywhere on the screen to start your adventure!</p>
      </div>
    </div>
  );
};

export default StartScreen;
