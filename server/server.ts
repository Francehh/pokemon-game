import express from 'express';
import Pokedex from 'pokedex-promise-v2';
import cors from 'cors';
import mongoose from 'mongoose';

const app = express();
const port = process.env.PORT || 3001;
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost/PokemonGame';

app.use(cors());
app.use(express.json());

const P = new Pokedex();
const cache: { [key: string]: { data: any; expires: number } } = {};
const CACHE_EXPIRATION_TIME = 1000 * 60 * 5;

// Connect to MongoDB using mongoose
mongoose.connect(mongoURI)
  .then(() => console.log('Connected to MongoDB - PokemonGame'))
  .catch((error) => {
    console.error('Failed to connect to MongoDB:', error.message);
  });

// Define schemas for chosen and caught Pokemon
const pokemonSchema = new mongoose.Schema({
  id: Number,
  name: String,
  hp: Number,
  attack: Number,
  defense: Number,
  spriteFront: String,
  spriteBack: String,
  moves: [String],
  audio: String,
  types: [String],
});

const ChosenPokemon = mongoose.model('chosenpokemon', pokemonSchema, 'chosenpokemon');

const caughtPokemonSchema = new mongoose.Schema({
  name: String,
  types: [String],
  hp: Number,
  attack: Number,
  defense: Number,
  moves: [String],
  spriteFront: String,
  audio: String,
});

const CaughtPokemon = mongoose.model('pokemoncaught', caughtPokemonSchema, 'pokemoncaught');

// Utility function to generate random Pokémon IDs
const getRandomPokemonIds = (count: number): number[] => {
  const ids: number[] = [];
  while (ids.length < count) {
    const randomId = Math.floor(Math.random() * 898) + 1;
    if (!ids.includes(randomId)) {
      ids.push(randomId);
    }
  }
  return ids;
};

// Utility function to get random moves
const getRandomMoves = (moves: string[], count: number = 4): string[] => {
  return moves.sort(() => 0.5 - Math.random()).slice(0, count);
};

// Endpoint to fetch Pokémon stats by name
app.get('/api/get-pokemon-stats', async (req, res) => {
  const { name } = req.query;

  if (!name) {
    return res.status(400).json({ message: 'Missing Pokémon name.' });
  }

  // Check cache
  if (cache[name as string] && cache[name as string].expires > Date.now()) {
    return res.json(cache[name as string].data);
  }

  try {
    const pokemon = await P.getPokemonByName(name as string);
    const hp = pokemon.stats.find((stat: { stat: { name: string } }) => stat.stat.name === 'hp')?.base_stat || 100;
    const attack = pokemon.stats.find((stat: { stat: { name: string } }) => stat.stat.name === 'attack')?.base_stat || 50;
    const defense = pokemon.stats.find((stat: { stat: { name: string } }) => stat.stat.name === 'defense')?.base_stat || 50;
    const moves = getRandomMoves(pokemon.moves.map((move: any) => move.move.name));
    const types = pokemon.types.map((type: any) => type.type.name);

    const spriteFrontGif = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${pokemon.id}.gif`;
    const audio = `https://play.pokemonshowdown.com/audio/cries/${pokemon.name.toLowerCase()}.mp3`;

    const pokemonData = { name: pokemon.name, hp, attack, defense, moves, types, spriteFrontGif, audio };

    // Cache data
    cache[name as string] = { data: pokemonData, expires: Date.now() + CACHE_EXPIRATION_TIME };

    res.json(pokemonData);
  } catch (error) {
    console.error('Error fetching Pokémon stats:', error);
    res.status(500).json({ message: 'Error fetching Pokémon stats.' });
  }
});

// Utility function to get Pokémon media assets
const getPokemonMedia = (id: number) => ({
  frontSprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${id}.gif`,
  backSprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/back/${id}.gif`,
  audio: `https://play.pokemonshowdown.com/audio/cries/${id}.mp3`,
});

// Endpoint to get random Pokémon data
app.get('/api/random-pokemon', async (req, res) => {
  try {
    const randomIds = getRandomPokemonIds(3);

    const selectedPokemon = await Promise.all(randomIds.map(async (id) => {
      const pokemon = await P.getPokemonByName(id);
      const media = getPokemonMedia(id);
      const moves = getRandomMoves(pokemon.moves.map((move: any) => move.move.name));
      const types = pokemon.types.map((type: any) => type.type.name);

      return {
        id: pokemon.id,
        name: pokemon.name,
        hp: pokemon.stats.find((stat: { stat: { name: string } }) => stat.stat.name === 'hp')?.base_stat || 100,
        attack: pokemon.stats.find((stat: { stat: { name: string } }) => stat.stat.name === 'attack')?.base_stat || 50,
        defense: pokemon.stats.find((stat: { stat: { name: string } }) => stat.stat.name === 'defense')?.base_stat || 50,
        spriteFront: media.frontSprite,
        spriteBack: media.backSprite,
        audio: media.audio,
        moves,
        types,
      };
    }));

    console.log('Fetched and cached new Pokémon data');
    res.json(selectedPokemon);
  } catch (error) {
    console.error('Error fetching Pokémon data:', error);
    res.status(500).json({ message: 'Error fetching Pokémon data.' });
  }
});

// Endpoint to get move power
app.get('/api/get-move-power', async (req, res) => {
  const { moveName } = req.query;

  if (!moveName) {
    return res.status(400).json({ message: 'Missing move name.' });
  }

  try {
    const moveData = await P.getMoveByName(moveName as string);
    const movePower = moveData.power || 10;

    res.json({ move: moveName, power: movePower });
  } catch (error) {
    console.error('Error fetching move power:', error);
    res.status(500).json({ message: 'Error fetching move power.' });
  }
});

// Endpoint to save chosen Pokémon for the player
app.post('/api/save-pokemon', async (req, res) => {
  const pokemonData = req.body;

  if (!pokemonData || !pokemonData.name || !pokemonData.hp) {
    return res.status(400).json({ message: 'Invalid Pokémon data received.' });
  }

  try {
    await ChosenPokemon.deleteMany({});
    const newPokemon = new ChosenPokemon(pokemonData);
    await newPokemon.save();
    console.log('Pokémon data saved successfully:', pokemonData);

    res.status(200).json({ message: 'Pokémon data saved successfully!' });
  } catch (error) {
    console.error('Error saving Pokémon data:', error);
    res.status(500).json({ message: 'Failed to save Pokémon data.' });
  }
});

// Endpoint to get player's chosen Pokémon
app.get('/api/get-player-pokemon', async (req, res) => {
  try {
    const playerPokemon = await ChosenPokemon.findOne();
    if (!playerPokemon) {
      return res.status(404).json({ message: 'No player Pokémon found.' });
    }
    res.json(playerPokemon);
  } catch (error) {
    console.error('Error fetching player Pokémon:', error);
    res.status(500).json({ message: 'Error fetching player Pokémon.' });
  }
});

// Endpoint to catch and save Pokémon
app.post('/api/caught-pokemon', async (req, res) => {
  const { name, hp, moves, spriteFront, audio, types, attack, defense } = req.body;

  if (!name || !hp || !moves || !spriteFront || !audio || !types || attack === undefined || defense === undefined) {
    return res.status(400).json({ message: 'Incomplete Pokémon data' });
  }

  try {
    const newCaughtPokemon = new CaughtPokemon({
      name,
      hp,
      moves,
      spriteFront,
      audio,
      types,
      attack,
      defense,
    });

    await newCaughtPokemon.save();
    res.status(200).json({ message: 'Pokémon saved successfully!' });
  } catch (error) {
    console.error('Error saving Pokémon:', error);
    res.status(500).json({ message: 'Failed to save Pokémon.' });
  }
});

app.get('/api/get-caught-pokemon/count', async (req, res) => {
    try {
      const count = await CaughtPokemon.countDocuments();
      res.status(200).json({ count });
    } catch (error) {
      console.error('Error fetching captured Pokémon count:', error);
      res.status(500).json({ message: 'Failed to retrieve captured Pokémon count.' });
    }
  });

  app.delete('/api/caught-pokemon', async (req, res) => {
    try {
      await CaughtPokemon.deleteMany({});
      res.status(200).json({ message: 'All caught Pokémon deleted successfully.' });
    } catch (error) {
      console.error('Error deleting caught Pokémon:', error);
      res.status(500).json({ message: 'Failed to delete caught Pokémon.' });
    }
  });
  

app.get('/api/get-caught-pokemon', async (req, res) => {
  try {
    const caughtPokemons = await CaughtPokemon.find({});
    res.status(200).json(caughtPokemons);
  } catch (error) {
    console.error('Error retrieving caught Pokémon:', error);
    res.status(500).json({ message: 'Failed to retrieve caught Pokémon.' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
