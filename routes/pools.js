import express from "express";
import Pool from "../schema/pool.js";
import UserState from "../schema/userstate.js";

const router = express.Router();

// Helper: fetch 20 random pokemons for a generation
async function fetchRandomPokemonForGeneration(genId) {
  const genRes = await fetch(`https://pokeapi.co/api/v2/generation/${genId}/`);
  const genData = await genRes.json();
  const species = genData.pokemon_species || [];
  const shuffled = [...species].sort(() => Math.random() - 0.5).slice(0, 20);
  const details = await Promise.all(
    shuffled.map(async (s) => {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${s.name}/`);
      const d = await res.json();
      return {
        id: d.id,
        name: d.name.charAt(0).toUpperCase() + d.name.slice(1),
        image: d.sprites.other["official-artwork"].front_default,
        types: d.types.map((t) => t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1)),
        stats: {
          hp: d.stats[0].base_stat,
          attack: d.stats[1].base_stat,
          defense: d.stats[2].base_stat,
          spAtk: d.stats[3].base_stat,
          spDef: d.stats[4].base_stat,
          speed: d.stats[5].base_stat,
        },
        height: d.height / 10,
        weight: d.weight / 10,
      };
    })
  );
  return details;
}

/**
 * GET /api/pools/:userId/:generationId
 * Returns existing pool for user+generation or creates one (without consuming a roll)
 */
router.get("/:userId/:generationId", async (req, res) => {
  try {
    const { userId, generationId } = req.params;
    let pool = await Pool.findOne({ userId: parseInt(userId), generationId: parseInt(generationId) });
    if (!pool) {
      const pokemonPool = await fetchRandomPokemonForGeneration(parseInt(generationId));
      pool = new Pool({ userId: parseInt(userId), generationId: parseInt(generationId), pokemonPool });
      await pool.save();
    }

    // ensure user state exists
    let userState = await UserState.findOne({ userId: parseInt(userId) });
    if (!userState) {
      userState = new UserState({ userId: parseInt(userId), rollsLeft: 2 });
      await userState.save();
    }

    res.status(200).json({ pokemonPool: pool.pokemonPool, rollsLeft: userState.rollsLeft, poolId: pool._id });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

/**
 * POST /api/pools/:userId/:generationId/roll
 * Consume one roll and generate a new pool if rollsLeft>0
 */
router.post("/:userId/:generationId/roll", async (req, res) => {
  try {
    const { userId, generationId } = req.params;
    let userState = await UserState.findOne({ userId: parseInt(userId) });
    if (!userState) {
      userState = new UserState({ userId: parseInt(userId), rollsLeft: 2 });
      await userState.save();
    }

    if (userState.rollsLeft <= 0) {
      return res.status(400).json({ message: 'No rolls left' });
    }

    // consume roll
    userState.rollsLeft -= 1;
    await userState.save();

    // generate new pool and upsert
    const pokemonPool = await fetchRandomPokemonForGeneration(parseInt(generationId));
    const pool = await Pool.findOneAndUpdate(
      { userId: parseInt(userId), generationId: parseInt(generationId) },
      { pokemonPool },
      { upsert: true, new: true },
    );

    res.status(200).json({ pokemonPool: pool.pokemonPool, rollsLeft: userState.rollsLeft });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

export default router;
