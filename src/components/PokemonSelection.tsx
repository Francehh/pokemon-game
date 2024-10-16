import React, { useState } from 'react';
import PokemonCard from './PokemonCard';

interface PokemonData {
  id: number;
  name: string;
  hp: number;
  attack: number;
  defense: number;
  moves: string[];
  types: string[];
}

interface PokemonSelectionProps {
  pokemonData: PokemonData[];
  onSelect: (id: number) => void;
}

const PokemonSelection: React.FC<PokemonSelectionProps> = ({ pokemonData, onSelect }) => {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const handleSelect = (id: number) => {
    setSelectedId(id);
    onSelect(id);
  };

  return (
    <div className="flex flex-wrap justify-center">
      {pokemonData.map((pokemon) => {
        const spriteFront = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${pokemon.id}.gif`;
        const spriteBack = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/back/${pokemon.id}.gif`;
        const audio = `https://play.pokemonshowdown.com/audio/cries/${pokemon.name.toLowerCase()}.mp3`;

        return (
          <PokemonCard
            key={pokemon.id}
            id={pokemon.id}
            name={pokemon.name}
            hp={pokemon.hp}
            attack={pokemon.attack}
            defense={pokemon.defense}
            spriteFront={spriteFront}
            spriteBack={spriteBack}
            audio={audio}
            moves={pokemon.moves}
            types={pokemon.types}
            isSelected={selectedId === pokemon.id}
            onSelect={handleSelect}
          />
        );
      })}
    </div>
  );
};

export default PokemonSelection;