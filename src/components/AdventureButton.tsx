import React from 'react';
import { useNavigate } from 'react-router-dom';

interface AdventureButtonProps {
  onAdventure: () => void;
  isDisabled: boolean;
}

const AdventureButton: React.FC<AdventureButtonProps> = ({ onAdventure, isDisabled }) => {
  const navigate = useNavigate();

  const handleAdventureClick = () => {
    if (!isDisabled) {
      onAdventure();
      navigate('/sinnoh-route');
    }
  };

  return (
    <button
      onClick={handleAdventureClick}
      disabled={isDisabled}
      className={`px-6 py-3 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-600 transition duration-300 ease-in-out ${
        isDisabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      Start Adventure
    </button>
  );
};

export default AdventureButton;
