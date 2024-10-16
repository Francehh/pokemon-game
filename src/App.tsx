import React, { useEffect, useState, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import PokemonSelection from './components/PokemonSelection';
import AdventureButton from './components/AdventureButton';
import { CSSTransition } from 'react-transition-group';
import Loading from './components/Loading';

const StartScreen = React.lazy(() => import('./homescreen'));
const SinnohRoute = React.lazy(() => import('./SinnohRoute'));
const Encounter = React.lazy(() => import('./encounter'));
const Captured = React.lazy(() => import('./components/captured'));
const DeathScreen = React.lazy(() => import('./components/DeathScreen'));

const App: React.FC = () => {
  return (
    <Router>
      <Main />
    </Router>
  );
};

const Main: React.FC = () => {
  const [pokemonData, setPokemonData] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [adventureStarted, setAdventureStarted] = useState(false);
  const [selectedPokemonId, setSelectedPokemonId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  const fetchRandomPokemon = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/random-pokemon');
      const data = await response.json();
      console.log('Fetched Pokémon data:', data);
      setPokemonData(data);
    } catch (error) {
      console.error('Error fetching Pokémon data:', error);
    } finally {
      setLoading(false);
    }
  };

  const themeMusic = `${process.env.PUBLIC_URL}/StartMusic.mp3`;

  const startGame = () => {
    setGameStarted(true);
    const newAudio = new Audio(themeMusic);
    newAudio.loop = true;
    newAudio.volume = 0.1;
    newAudio.play().catch((error) => {
      console.error('Error playing audio:', error);
    });
    setAudio(newAudio);
  };

  const navigate = useNavigate();

  const handleRestart = () => {
    navigate('/');
    window.location.reload()
  };
        
  const stopMusic = () => {
    if (audio) {
      audio.pause();
      audio.currentTime = 0; // Reset the audio to the beginning
    }
  };

  const startAdventure = () => {
    if (selectedPokemonId !== null) {
      setAdventureStarted(true);
    } else {
      alert('Please select a Pokémon before starting your adventure!');
    }
  };

  const location = useLocation();

  useEffect(() => {
    stopMusic(); // Stop music on navigation
  }, [location.pathname]); // Run when the path changes

  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-black text-white">
      {/* Show loading screen when loading */}
      {loading ? (
        <Loading />
      ) : (
        <>
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route
                path="/"
                element={
                  <CSSTransition
                    in={!gameStarted}
                    timeout={300}
                    classNames="fade"
                    unmountOnExit
                  >
                    <StartScreen onStart={startGame} fetchRandomPokemon={fetchRandomPokemon} />
                  </CSSTransition>
                }
              />
              <Route path="/sinnoh-route" element={<SinnohRoute />} />
              <Route path="/encounter" element={<Encounter />} />
              <Route path="/captured" element={<Captured />} />
              <Route path="/death" element={<DeathScreen onRestart={handleRestart} />} />
            </Routes>
          </Suspense>

          {/* Display game UI after game has started but adventure not yet started */}
          <CSSTransition
            in={gameStarted && !adventureStarted}
            timeout={300}
            classNames="fade"
            unmountOnExit
          >
            <div className="flex flex-col items-center justify-center w-full">
              <Header />
              <div className="flex flex-col items-center my-8 w-full max-w-screen-xl">
                <PokemonSelection
                  pokemonData={pokemonData}
                  onSelect={(id) => setSelectedPokemonId(id)}
                />
              </div>
              <div className="mb-4">
                <AdventureButton
                  onAdventure={startAdventure}
                  isDisabled={selectedPokemonId === null}
                />
              </div>
            </div>
          </CSSTransition>
        </>
      )}
    </div>
  );
};

export default App;
