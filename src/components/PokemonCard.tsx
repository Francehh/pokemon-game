import React, { useState } from 'react';

interface PokemonCardProps {
  id: number;
  name: string;
  hp: number;
  attack: number;
  defense: number;
  spriteFront: string;
  spriteBack: string;
  audio: string;
  moves: string[];
  types: string[];
  isSelected: boolean;
  onSelect: (id: number) => void;
}

const PokemonCard: React.FC<PokemonCardProps> = ({
  id,
  name,
  hp,
  attack,
  defense,
  spriteFront,
  spriteBack,
  audio,
  moves,
  types,
  isSelected,
  onSelect,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<null | boolean>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const savePokemonData = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('http://localhost:3001/api/save-pokemon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          name,
          hp,
          attack,
          defense,
          spriteFront,
          spriteBack,
          audio,
          moves,
          types,
        }),
      });

      if (response.ok) {
        console.log(`Pokémon ${name} data saved successfully!`);
        setSaveSuccess(true);
      } else {
        console.error(`Failed to save data for Pokémon ${name}.`);
        setSaveSuccess(false);
      }
    } catch (error) {
      console.error(`Error saving data for Pokémon ${name}:`, error);
      setSaveSuccess(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCardClick = () => {
    onSelect(id);
    playPokemonCry();
    savePokemonData();
  };

  const playPokemonCry = () => {
    if (!isPlaying) {
      const audioElement = new Audio(audio);
      audioElement.volume = 0.1;
      audioElement.addEventListener('canplaythrough', () => {
        setIsPlaying(true);
        audioElement.play();
      });

      audioElement.addEventListener('ended', () => {
        setIsPlaying(false);
      });

      audioElement.addEventListener('error', () => {
        console.error(`Failed to load audio for ${name}`);
      });
    }
  };

  return (
    <div
      className={`pokemon-card shadow-lg rounded-lg p-6 m-5 w-80 sm:w-[400px] flex flex-col items-center text-white cursor-pointer transition-transform duration-500 ease-in-out ${
        isSelected
          ? 'scale-110 bg-gradient-to-b from-blue-600 to-blue-800'
          : 'bg-gray-800 hover:bg-gray-700'
      }`}
      onClick={handleCardClick}
    >
      {/* Pokémon Image */}
      <img
        src={spriteFront}
        alt={name}
        className="pokemon-sprite w-80 h-80 mb-4 object-contain"
      />
  
      {/* Pokémon Name */}
      <h2 className="text-2xl font-bold mb-2">
        {name.charAt(0).toUpperCase() + name.slice(1)}
      </h2>
  
      {/* Stats: HP, Attack, Defense */}
      <p className="text-lg mb-1">HP: {hp}</p>
      <p className="text-lg mb-1">Attack: {attack}</p>
      <p className="text-lg mb-1">Defense: {defense}</p>
  
      {/* Moves Section */}
      <div className="mt-4 w-full">
        <h3 className="font-bold text-lg mb-1">Moves:</h3>
        <ul className="list-disc list-inside space-y-1">
          {moves.map((move, index) => (
            <li key={index} className="text-md capitalize">
              {move}
            </li>
          ))}
        </ul>
  
        {/* Types Section */}
        <h3 className="font-bold text-lg mt-4 mb-1">Types:</h3>
        <ul className="list-disc list-inside space-y-1">
          {types.map((type, index) => (
            <li key={index} className="text-md capitalize">
              {type}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

};

export default PokemonCard;
