import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DeathScreen from './components/DeathScreen';
import { Progress, MantineProvider } from '@mantine/core';

interface Pokemon {
  [x: string]: any;
  pokemonName: string;
  hp: number;
  moves: string[];
  spriteFrontGif: string;
  audio: string;
  attack: number;
  defense: number;
}

const Encounter: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [showDeathScreen, setShowDeathScreen] = useState(false);

  const level = 50;  
  const encounteredPokemonData: Pokemon | null = location.state || null;

  const [playerPokemon, setPlayerPokemon] = useState<any>(null);
  const [opponentPokemon, setOpponentPokemon] = useState<Pokemon | null>(null);
  const [opponentHP, setOpponentHP] = useState<number>(100);
  const [playerHP, setPlayerHP] = useState<number>(100);
  const [playerMaxHP, setPlayerMaxHP] = useState<number>(100);
  const [opponentMaxHP, setOpponentMaxHP] = useState<number>(100);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [battleMessage, setBattleMessage] = useState<string>('A wild Pokémon appeared!');
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [showAbilities, setShowAbilities] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const [playerAttacking, setPlayerAttacking] = useState(false);
  const [opponentAttacking, setOpponentAttacking] = useState(false);

  const [playerDamaged, setPlayerDamaged] = useState(false);
  const [opponentDamaged, setOpponentDamaged] = useState(false);

  const [isCatching, setIsCatching] = useState(false);
  const [isCaptured, setIsCaptured] = useState(false);

  const victorySound = `${process.env.PUBLIC_URL}/VictorySoundEffect.mp3`;
  const themeMusic = `${process.env.PUBLIC_URL}/WildPokemonBattle.mp3`;

  useEffect(() => {
    const audio = new Audio(themeMusic);
    audio.loop = true;
    audio.volume = 0.1;
    audio.play().catch(error => {
      console.error('Error playing audio:', error);
    });

    if (gameOver) {
      audio.pause();
    }

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [themeMusic, gameOver]);

  const calculateIncreasedHP = (baseHP: number, level: number) => {
    const increasePercentage = 0.03;
    return Math.floor(baseHP * (1 + increasePercentage * level));
  };

  const addLog = (message: string) => {
    setBattleLog((prevLog) => [...prevLog, message]);
  };

  const playPokemonCry = (audioUrl: string) => {
    const audio = new Audio(audioUrl);
    audio.volume = 0.1;
    audio.play().catch(error => {
      console.error('Error playing Pokémon cry:', error);
    });
    return new Promise<void>((resolve) => {
      audio.onended = () => resolve();
    });
  };

  const calculateDamage = (
    level: number,
    movePower: number,
    attackerAttack: number,
    defenderDefense: number,
    isCriticalHit: number,
    typeEffectiveness: number,
    randomMultiplier: number
  ) => {
    return Math.floor(
      (((2 * level * isCriticalHit) / 5 + 2) * movePower * (attackerAttack / defenderDefense)) / 50 + 2 *
      1.5 * // STAB (Same Type Attack Bonus)
      typeEffectiveness *
      (randomMultiplier / 255) // Random factor
    );
  };

  useEffect(() => {
    const fetchPlayerPokemon = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/get-player-pokemon');
        const playerData = response.data;

        const totalHP = calculateIncreasedHP(playerData.hp, level);
        setPlayerMaxHP(totalHP);
        setPlayerHP(totalHP);
        setPlayerPokemon(playerData);
      } catch (error) {
        console.error('Error fetching player Pokémon:', error);
      }
    };

    fetchPlayerPokemon();

    if (encounteredPokemonData) {
      const totalOpponentHP = calculateIncreasedHP(encounteredPokemonData.hp, level);
      setOpponentMaxHP(totalOpponentHP);
      setOpponentHP(totalOpponentHP);
      setOpponentPokemon(encounteredPokemonData);
    }
  }, [encounteredPokemonData]);

  const handleFight = async (move: string) => {
    if (isPlayerTurn && !gameOver && opponentPokemon) {
      setShowAbilities(false);
      setPlayerAttacking(true);

      if (playerPokemon?.audio) {
        playPokemonCry(playerPokemon.audio);
      }

      try {
        const response = await axios.get('http://localhost:3001/api/get-move-power', {
          params: { moveName: move },
        });

        let movePower = response.data.power;
        if (movePower === null) movePower = 10;

        const damage = calculateDamage(
          level,
          movePower,
          playerPokemon.attack,
          opponentPokemon.defense,
          Math.random() < 0.1 ? 2 : 1,
          1,
          Math.floor(Math.random() * (255 - 217 + 1)) + 217
        );

        const newOpponentHP = Math.max(opponentHP - damage, 0);
        setOpponentHP(newOpponentHP);

        if (damage > 0) {
          setOpponentDamaged(true);
          setTimeout(() => setOpponentDamaged(false), 500);
        }

        const isCriticalHit = Math.random() < 0.1;
        addLog(`Player's Pokémon used ${move} and dealt ${damage} damage!${damage === 0 ? '' : isCriticalHit ? ' (Critical Hit!)' : ''}`);
        setBattleMessage(`Player's Pokémon used ${move}!`);

        setTimeout(() => setPlayerAttacking(false), 300);

        if (newOpponentHP === 0) {
          addLog(`${opponentPokemon.pokemonName} fainted!`);
          setBattleMessage(`${opponentPokemon.pokemonName} fainted!`);
          setGameOver(true);
          const audio = new Audio(victorySound);
          audio.volume = 0.1;
          await audio.play();
          setTimeout(() => {
            navigate('/sinnoh-route');
          }, 3000);
          return;
        }

        setIsPlayerTurn(false);
        setTimeout(() => handleOpponentAttack(), 1000);
      } catch (error) {
        console.error('Error fetching move power:', error);
      }
    }
  };

  const handleOpponentAttack = async () => {
    if (!gameOver && opponentPokemon) {
      setOpponentAttacking(true);
      const opponentMove = opponentPokemon.moves[Math.floor(Math.random() * opponentPokemon.moves.length)] || 'Tackle';

      if (opponentPokemon.audio) {
        playPokemonCry(opponentPokemon.audio);
      }

      try {
        const response = await axios.get('http://localhost:3001/api/get-move-power', {
          params: { moveName: opponentMove },
        });

        let movePower = response.data.power;
        if (movePower === null) movePower = 10;

        const damage = calculateDamage(
          level,
          movePower,
          opponentPokemon.attack,
          playerPokemon.defense,
          Math.random() < 0.1 ? 2 : 1,
          1,
          Math.floor(Math.random() * (255 - 217 + 1)) + 217
        );

        const newPlayerHP = Math.max(playerHP - damage, 0);
        setPlayerHP(newPlayerHP);

        if (damage > 0) {
          setPlayerDamaged(true);
          setTimeout(() => setPlayerDamaged(false), 500);
        }

        const isCriticalHit = Math.random() < 0.1;
        addLog(`Wild ${opponentPokemon.pokemonName} used ${opponentMove} and dealt ${damage} damage!${damage === 0 ? '' : isCriticalHit ? ' (Critical Hit!)' : ''}`);
        setBattleMessage(`Wild ${opponentPokemon.pokemonName} used ${opponentMove}!`);

        setTimeout(() => setOpponentAttacking(false), 500);

        if (newPlayerHP === 0) {
          addLog('Your Pokémon fainted!');
          setBattleMessage('Your Pokémon fainted!');
          setGameOver(true);
          await handleDefeat();
          return;
        }

        setTimeout(() => setIsPlayerTurn(true), 500);
      } catch (error) {
        console.error('Error fetching move power:', error);
      }
    }
  };

  const handleRun = () => {
    if (!opponentPokemon) {
      console.error('No opponent Pokémon available to run from.');
      return;
    }

    const runChance = Math.max(0, 100 - (50 * (opponentHP / opponentPokemon.hp)));
    const randomValue = Math.random() * 100;

    const success = randomValue <= runChance;

    const message = success ? 'You successfully ran away!' : 'Failed to escape!';
    setBattleMessage(message);
    addLog(message);
    setIsPlayerTurn(false);

    setTimeout(() => {
      if (success) {
        navigate('/sinnoh-route');
      } else {
        handleOpponentAttack();
      }
    }, success ? 1500 : 1000);
  };

const handleCapture = async () => {
  if (!opponentPokemon) {
    console.error('No opponent Pokémon to capture.');
    return;
  }

  const captureChance = Math.max(0, 100 - (50 * (opponentHP / opponentMaxHP)));
  const randomValue = Math.random() * opponentMaxHP;
  const success = randomValue <= captureChance;

  setBattleMessage('Attempting to capture...');
  setIsCatching(true);

  setTimeout(async () => {
    const message = success
      ? `You successfully captured ${opponentPokemon.pokemonName}!`
      : 'Capture failed!';
    
    setBattleMessage(message);
    addLog(message);

    if (success) {
      const caughtPokemon = {
        name: opponentPokemon.pokemonName,
        hp: opponentMaxHP,
        moves: opponentPokemon.moves,
        spriteFront: opponentPokemon.spriteFrontGif,
        audio: opponentPokemon.audio,
        types: opponentPokemon.types,
        attack: opponentPokemon.attack,
        defense: opponentPokemon.defense,
      };

      try {
        await axios.post('http://localhost:3001/api/caught-pokemon', caughtPokemon);
        console.log('Caught Pokémon saved successfully');
        setIsCaptured(true);
      } catch (error) {
        console.error('Error saving caught Pokémon:', error);
      }

      const audio = new Audio(victorySound);
      audio.volume = 0.1;
      await audio.play();
      setTimeout(() => {
        navigate('/sinnoh-route');
      }, 3000);
    } else {
      setIsPlayerTurn(false);
      handleOpponentAttack();
    }

    setIsCatching(false);
  }, 5000);
};

  const handleDefeat = async () => {
    try {
      await axios.delete('http://localhost:3001/api/caught-pokemon');
      console.log('Deleted all caught Pokémon.');
    } catch (error) {
      console.error('Error deleting caught Pokémon:', error);
    }
    setShowDeathScreen(true);
  };

  if (showDeathScreen) {
    return <DeathScreen onRestart={() => navigate('/')} />;
  }

  if (!opponentPokemon || !playerPokemon) {
    return <div>Loading...</div>;
  }

  return (
<MantineProvider>
  <div className="encounter-container flex flex-col items-center justify-between h-screen w-screen p-5 box-border">
    <div className="encounter-arena relative flex flex-col justify-between items-center w-full max-w-6xl h-[90vh] bg-center bg-contain bg-no-repeat rounded-lg shadow-lg overflow-hidden p-5">

      {/* Show Pokéball animation when capturing */}
      {isCatching && (
        <div className="absolute top-[40%] right-[20%] md:right-[28%] flex justify-end items-center z-50 transform -translate-y-1/2">
          <img src={'/pokeball.gif'} alt="Pokéball capturing" className="w-24 h-24" />
        </div>
      )}

      {/* Opponent's Pokémon Status */}
      <div className="pokemon-status absolute top-5 left-5 backdrop-blur-lg md:min-w-[200px] min-w-[150px]">
        <span>{opponentPokemon?.pokemonName}</span>
        <Progress
          value={(opponentHP / opponentMaxHP) * 100}
          size="lg"
          radius="sm"
          transitionDuration={600}
          color={opponentHP / opponentMaxHP > 0.5 ? 'green' : opponentHP / opponentMaxHP > 0.2 ? 'yellow' : 'red'}
        />
        <span className="hp-label">HP: {opponentHP}/{opponentMaxHP}</span>
      </div>

      {/* Opponent Pokémon Sprite */}
      <div
        className={`encounter-opponent-sprite absolute top-[30%] right-[15%] md:right-[25%] sm:top-[30%] flex justify-end items-center transition-transform duration-300 ease-in-out ${opponentAttacking ? 'translate-x-[-20px]' : ''} ${opponentDamaged ? 'filter brightness-50 saturate-200' : ''}`}
      >
        {/* Conditionally render opponent's Pokémon sprite only if not captured */}
        {!isCatching && !isCaptured && (
          <img
            src={opponentPokemon?.spriteFrontGif || 'fallback_image_url.gif'}
            alt={opponentPokemon?.pokemonName}
            className="encounter-pokemon-sprite"
          />
        )}
      </div>

      {/* Player's Pokémon */}
      <div
        className={`encounter-player-sprite absolute bottom-[20%] left-[10%] md:left-[25%] flex items-center transition-transform duration-300 ease-in-out ${playerAttacking ? 'translate-x-[20px]' : ''} ${playerDamaged ? 'filter brightness-50 saturate-200' : ''}`}
      >
        <img
          src={playerPokemon?.spriteBack}
          alt={playerPokemon?.name}
          className="encounter-pokemon-sprite"
        />
      </div>

      <div className="pokemon-status absolute bottom-10 right-5 md:right-10 backdrop-blur-lg md:min-w-[200px] min-w-[150px]">
        <span>{playerPokemon?.name}</span>
        <Progress
          value={(playerHP / playerMaxHP) * 100}
          size="lg"
          radius="sm"
          transitionDuration={600}
          color={playerHP / playerMaxHP > 0.5 ? 'green' : playerHP / playerMaxHP > 0.2 ? 'yellow' : 'red'}
        />
        <span className="hp-label">HP: {playerHP}/{playerMaxHP}</span>
      </div>
    </div>

    {/* Battle Log and Menu */}
    <div className="battle-log flex flex-col md:flex-row items-center gap-5 w-full bg-black bg-opacity-85 text-white p-4">
      <div className="w-full md:w-[85%]">
        <div className="log-message mb-4 text-lg">{battleMessage}</div>
        <div className="h-[15vh] overflow-y-auto p-2 border-t border-white">
          {battleLog.map((log, index) => (
            <p key={index} className="text-sm">{log}</p>
          ))}
        </div>
      </div>

      <div className="battle-menu flex flex-wrap items-center justify-center gap-3 w-full md:w-[40%]">
        {!showAbilities ? (
          <div className="battle-options flex flex-wrap gap-4 justify-center w-full">
            <button
              onClick={() => setShowAbilities(true)}
              className="menu-button flex-1 min-w-[120px] px-4 py-2"
              disabled={!isPlayerTurn || gameOver}
            >
              Fight
            </button>
            <button
              onClick={handleRun}
              className="menu-button flex-1 min-w-[120px] px-4 py-2"
              disabled={!isPlayerTurn || gameOver}
            >
              Run
            </button>
            <button
              onClick={handleCapture}
              className="menu-button flex-1 min-w-[120px] px-4 py-2"
              disabled={!isPlayerTurn || gameOver}
            >
              Capture
            </button>

            {/* Instant Death Button for Debugging */}
            <button
              onClick={() => {
                setPlayerHP(0); // Simulate instant player defeat
                setBattleMessage('Your Pokémon fainted! Instant defeat activated.');
                setGameOver(true);
                setTimeout(() => {
                  handleDefeat();
                }, 3000);
              }}
              className="menu-button flex-1 min-w-[120px] px-4 py-2 bg-red-600 hover:bg-red-700 transition duration-300"
            >
              Instant Death
            </button>
          </div>
        ) : (
          <div className="w-full">
            <div className="flex flex-wrap justify-center mt-4">
              {playerPokemon.moves.map((move: string, index: number) => (
                <button
                  key={index}
                  onClick={() => handleFight(move)}
                  className="menu-button py-1 text-sm bg-gray-700 hover:bg-gray-600 transition duration-300"
                  disabled={!isPlayerTurn || gameOver}
                >
                  {move}
                </button>
              ))}
            </div>
            <div className="flex justify-center mt-4">
              <button
                onClick={() => setShowAbilities(false)}
                className="menu-button w-auto px-4 py-1 text-sm bg-gray-700 hover:bg-gray-600 transition duration-300"
              >
                Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
</MantineProvider>
  );
};

export default Encounter;
