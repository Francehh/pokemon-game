import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './SinnohRoute.css';

const grid = 32;
const initialPosition = { x: 8, y: 7 };

const mapLayout = [
  ['T', 'T', 'T', 'T', 'T', 'T', 'T', 'T', 'T', 'T', 'T', 'T', 'T', 'T', 'T', 'T'],
  ['T', 'T', 'T', 'T', 'G', 'P', 'P', 'P', 'P', 'P', 'G', 'G', 'G', 'G', 'G', 'T'],
  ['T', 'G', 'T', 'T', 'G', 'G', 'G', 'P', 'P', 'P', 'P', 'G', 'G', 'G', 'G', 'T'],
  ['T', 'G', 'G', 'T', 'G', 'G', 'G', 'P', 'P', 'P', 'P', 'P', 'P', 'G', 'G', 'T'],
  ['T', 'G', 'G', 'G', 'T', 'T', 'G', 'G', 'P', 'P', 'P', 'T', 'P', 'G', 'G', 'T'],
  ['T', 'P', 'G', 'G', 'T', 'T', 'T', 'T', 'P', 'P', 'T', 'T', 'T', 'T', 'G', 'T'],
  ['T', 'P', 'G', 'G', 'G', 'T', 'G', 'T', 'T', 'P', 'T', 'T', 'T', 'T', 'G', 'T'],
  ['T', 'P', 'P', 'T', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'T', 'T', 'T', 'T', 'T'],
  ['T', 'P', 'P', 'T', 'G', 'P', 'P', 'P', 'T', 'T', 'P', 'G', 'G', 'T', 'T', 'T'],
  ['T', 'P', 'P', 'G', 'T', 'P', 'G', 'T', 'G', 'T', 'P', 'P', 'G', 'G', 'G', 'T'],
  ['T', 'P', 'P', 'G', 'T', 'G', 'T', 'G', 'G', 'T', 'T', 'P', 'P', 'G', 'G', 'T'],
  ['T', 'P', 'G', 'G', 'T', 'T', 'G', 'G', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'T'],
  ['T', 'G', 'G', 'T', 'T', 'T', 'T', 'G', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'T'],
  ['T', 'T', 'T', 'T', 'T', 'G', 'P', 'P', 'T', 'T', 'G', 'G', 'P', 'P', 'P', 'T'],
  ['T', 'T', 'T', 'P', 'P', 'P', 'T', 'T', 'G', 'T', 'T', 'T', 'T', 'G', 'P', 'T'],
  ['T', 'G', 'P', 'P', 'P', 'P', 'P', 'G', 'G', 'G', 'G', 'G', 'T', 'T', 'G', 'T'],
  ['T', 'G', 'G', 'P', 'P', 'P', 'P', 'P', 'P', 'G', 'G', 'G', 'T', 'T', 'G', 'T'],
  ['T', 'G', 'G', 'G', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'G', 'G', 'T', 'T', 'T'],
  ['T', 'T', 'T', 'T', 'T', 'T', 'T', 'T', 'T', 'T', 'T', 'T', 'T', 'T', 'T', 'T'],
];

const SinnohRoute: React.FC = () => {
    const [playerPosition, setPlayerPosition] = useState(initialPosition);
    const [playerDirection, setPlayerDirection] = useState('down');
    const [stepIndex, setStepIndex] = useState(0);
    const [encounterRate, setEncounterRate] = useState(0.1);
    const [capturedPokemonCount, setCapturedPokemonCount] = useState<number>(0);
    const [isEncountering, setIsEncountering] = useState<boolean>(false); // NEW STATE
    const navigate = useNavigate();
  
    const themeMusic = `${process.env.PUBLIC_URL}/RouteThemeMusic.mp3`;
  
    useEffect(() => {
      const fetchCapturedCount = async () => {
        try {
          const response = await axios.get('http://localhost:3001/api/get-caught-pokemon/count');
          setCapturedPokemonCount(response.data.count);
        } catch (error) {
          console.error('Error fetching captured Pokémon count:', error);
        }
      };
  
      fetchCapturedCount(); 
    }, []);
  
    useEffect(() => {
      const audio = new Audio(themeMusic);
      audio.loop = true;
      audio.volume = 0.03;
      audio.play().catch(error => {
        console.error('Error playing audio:', error);
      });
  
      return () => {
        audio.pause();
      };
    }, [themeMusic]);
  
    useEffect(() => {
      const fetchEncounterRate = async () => {
        try {
          const response = await axios.get('https://pokeapi.co/api/v2/location-area/168');
          const encounterRateFromAPI = response.data.pokemon_encounters[0].version_details[0].encounter_details[0].chance / 100;
          setEncounterRate(encounterRateFromAPI);
          console.log('Fetched Encounter Rate:', encounterRateFromAPI);
        } catch (error) {
          console.error('Error fetching encounter rate:', error);
        }
      };
  
      fetchEncounterRate();
    }, []);
  
    const triggerEncounter = useCallback(async () => {
      if (isEncountering) {
        return; // Prevent triggering multiple encounters
      }
      setIsEncountering(true); // Set the encounter state to true
  
      try {
        console.log('Triggering encounter...');
        const response = await axios.get('https://pokeapi.co/api/v2/location-area/168');
        const randomEncounter = response.data.pokemon_encounters[Math.floor(Math.random() * response.data.pokemon_encounters.length)];
  
        if (randomEncounter) {
          console.log('Encountered Pokémon:', randomEncounter.pokemon.name);
          const statsResponse = await axios.get(`http://localhost:3001/api/get-pokemon-stats`, {
            params: { name: randomEncounter.pokemon.name },
          });
  
          const fetchedOpponent = statsResponse.data;
          console.log('Fetched opponent:', fetchedOpponent);
  
          navigate('/encounter', {
            state: {
              pokemonName: fetchedOpponent.name,
              hp: fetchedOpponent.hp,
              attack: fetchedOpponent.attack,
              defense: fetchedOpponent.defense,
              moves: fetchedOpponent.moves,
              types: fetchedOpponent.types,
              spriteFrontGif: fetchedOpponent.spriteFrontGif,
              audio: fetchedOpponent.audio,
            },
          });
        } else {
          console.log('No random encounter found.');
          setIsEncountering(false); // Reset encounter state if no encounter is found
        }
      } catch (error) {
        console.error('Error fetching encounter data:', error);
        setIsEncountering(false); // Reset encounter state on error
      }
    }, [navigate, isEncountering]); // Added isEncountering as dependency
  
    const movePlayer = useCallback(
      (dx: number, dy: number, direction: string) => {
        const newX = Math.min(Math.max(playerPosition.x + dx, 0), grid - 1);
        const newY = Math.min(Math.max(playerPosition.y + dy, 0), grid - 1);
  
        console.log(`Player is moving to (${newX}, ${newY})`);
  
        if (mapLayout[newY][newX] === 'T') {
          console.log('Player tried to walk through a tree.');
          return;
        }
  
        setPlayerPosition({ x: newX, y: newY });
        setPlayerDirection(direction);
        setStepIndex((prevIndex) => (prevIndex + 1) % 3);
  
        if (mapLayout[newY][newX] === 'G') {
          console.log('Player is on grass.');
          const randomValue = Math.random();
          console.log('Generated random value:', randomValue);
          if (randomValue < encounterRate) {
            console.log('Encounter triggered!');
            triggerEncounter();
          } else {
            console.log('No encounter this time.');
          }
        }
      },
      [playerPosition, encounterRate, triggerEncounter]
    );
  
    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        switch (event.key) {
          case 'ArrowUp':
            movePlayer(0, -1, 'up');
            break;
          case 'ArrowDown':
            movePlayer(0, 1, 'down');
            break;
          case 'ArrowLeft':
            movePlayer(-1, 0, 'left');
            break;
          case 'ArrowRight':
            movePlayer(1, 0, 'right');
            break;
          default:
            break;
        }
      };
  
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }, [movePlayer]);
  
    return (
      <div className="sinnoh-route relative">
        <div className="route-grid">
          {mapLayout.map((row, rowIndex) =>
            row.map((tile, colIndex) => {
              const isPlayer = rowIndex === playerPosition.y && colIndex === playerPosition.x;
              let tileClass = '';
  
              switch (tile) {
                case 'G':
                  tileClass = 'grass';
                  break;
                case 'P':
                  tileClass = 'path';
                  break;
                case 'T':
                  tileClass = 'tree';
                  break;
                default:
                  break;
              }
  
              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`tile ${tileClass} ${isPlayer ? `player player-${playerDirection} step-${stepIndex}` : ''}`}
                ></div>
              );
            })
          )}
        </div>
        {/* Captured Pokémon Section */}
        <div className="captured-pokemon-info absolute bottom-10 left-10 bg-gray-800 bg-opacity-90 p-6 rounded-xl shadow-2xl border border-gray-700 min-w-[250px] max-w-[320px] box-border transition-transform hover:scale-105">
        <p className="text-white font-bold text-2xl mb-3">Captured Pokémon</p>
        <p className="text-white text-lg mb-5">Total: {capturedPokemonCount}</p>
        <button
            onClick={() => navigate('/captured')}
            className="bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg w-full hover:bg-blue-800 focus:ring-4 focus:ring-blue-500 transition-transform transform hover:scale-105"
        >
            View Captured Pokémon
        </button>
        </div>
      </div>
    );
  };
  
  export default SinnohRoute;