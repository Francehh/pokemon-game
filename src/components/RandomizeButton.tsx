import React from 'react';

interface RandomizeButtonProps {
  fetchRandomPokemon: () => void;
}

const RandomizeButton: React.FC<RandomizeButtonProps> = ({ fetchRandomPokemon }) => {
  return (
    <button
      onClick={fetchRandomPokemon}
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
    >
      [ DEV ] New Pokémon [ DEV ]
    </button>
  );
};

export default RandomizeButton;
