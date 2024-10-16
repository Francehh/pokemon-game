import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface Pokemon {
  name: string;
  hp: number;
  attack: number;
  defense: number;
  moves: string[];
  types: string[];
  spriteFront: string;
}

const Captured: React.FC = () => {
  const [capturedPokemon, setCapturedPokemon] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch captured Pokémon data
    const fetchCapturedPokemon = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/get-caught-pokemon');
        setCapturedPokemon(response.data);
      } catch (error) {
        console.error('Error fetching captured Pokémon:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCapturedPokemon();

    // Play background music
    const audio = new Audio(`${process.env.PUBLIC_URL}/HomeScreemMusicOST.mp3`);
    audio.loop = true;
    audio.volume = 0.1; // Set the volume to a lower level
    audio.play().catch((error) => console.error('Error playing music:', error));

    return () => {
      // Stop the music when the component is unmounted
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  if (loading) {
    return <div className="text-center text-white">Loading captured Pokémon...</div>;
  }

  return (
    <div className="captured-page min-h-screen w-full flex flex-col items-center justify-center bg-cover relative">
      <div className="absolute inset-0 bg-black bg-opacity-60"></div>

      {/* Title */}
      <h1 className="captured-title text-4xl md:text-5xl text-white font-bold z-10 mb-10">Captured Pokémon</h1>

      {/* Grid display of captured Pokémon */}
      <div className="captured-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 z-10">
        {capturedPokemon.length > 0 ? (
          capturedPokemon.map((pokemon, index) => (
            <div key={index} className="captured-card bg-gray-900 bg-opacity-80 p-6 rounded-lg shadow-lg flex flex-col items-center transition-transform hover:scale-105">
              <img src={pokemon.spriteFront} alt={pokemon.name} className="w-32 h-32 object-contain mb-4" />
              <h2 className="text-xl font-bold">{pokemon.name}</h2>
              <p>HP: {pokemon.hp}</p>
              <p>Attack: {pokemon.attack}</p>
              <p>Defense: {pokemon.defense}</p>
              <div>
                <strong>Moves:</strong> {pokemon.moves.join(', ')}
              </div>
              <div>
                <strong>Types:</strong> {pokemon.types.join(', ')}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center col-span-full text-white">No captured Pokémon found.</div>
        )}
      </div>

      {/* Back button */}
      <button
        onClick={() => navigate('/sinnoh-route')}
        className="back-button mt-10 text-lg text-white bg-red-600 hover:bg-red-700 transition-colors px-6 py-3 rounded-lg shadow-lg transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-400 focus:ring-opacity-50 z-10"
      >
        Back to Sinnoh Route
      </button>
    </div>
  );
};

export default Captured;
