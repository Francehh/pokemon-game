import React, { useEffect } from 'react';
import axios from 'axios';

interface DeathScreenProps {
  onRestart: () => void;
}

const DeathScreen: React.FC<DeathScreenProps> = ({ onRestart }) => {
  const defeatGif = `${process.env.PUBLIC_URL}/DefeatScreen.gif`;
  const loseSound = `${process.env.PUBLIC_URL}/defeat.mp3`;

  useEffect(() => {
    const audio = new Audio(loseSound);
    audio.volume = 0.1;
    audio.play().catch((error) => {
      console.error('Error playing defeat sound:', error);
    });

    const deleteCaughtPokemon = async () => {
      try {
        await axios.delete('http://localhost:3001/api/get-caught-pokemon');
        console.log('All caught Pokémon deleted successfully.');
      } catch (error) {
        console.error('Error deleting caught Pokémon:', error);
      }
    };

    deleteCaughtPokemon();
  }, [loseSound]);

  return (
    <div className="death-screen">
      {/* Full-screen background GIF */}
      <img src={defeatGif} alt="Defeat" />
      
      {/* Dark overlay */}
      <div className="overlay"></div>
      
      {/* Defeat message and restart button */}
      <div className="z-10 text-center">
        <h1>You Have Been Defeated!</h1>
        
        <button onClick={onRestart}>
          Restart
        </button>
      </div>
    </div>
  );
};

export default DeathScreen;
