import { Pokemon } from "@/types/pokemon";

const POKEAPI_BASE = "https://pokeapi.co/api/v2";

// Generation ranges based on National Dex
const GENERATION_RANGES = {
  1: { start: 1, end: 151 },
  2: { start: 152, end: 251 },
  3: { start: 252, end: 386 },
  4: { start: 387, end: 493 },
  5: { start: 494, end: 649 },
  6: { start: 650, end: 721 },
  7: { start: 722, end: 809 },
  8: { start: 810, end: 905 },
  9: { start: 906, end: 1010 },
};

const getGeneration = (id: number): number => {
  for (const [gen, range] of Object.entries(GENERATION_RANGES)) {
    if (id >= range.start && id <= range.end) {
      return parseInt(gen);
    }
  }
  return 1;
};

export const fetchRandomPokemon = async (
  generation?: number,
  minBST?: number
): Promise<Pokemon> => {
  let id: number;
  let attempts = 0;
  const maxAttempts = 50;

  do {
    if (generation) {
      const range = GENERATION_RANGES[generation as keyof typeof GENERATION_RANGES];
      id = Math.floor(Math.random() * (range.end - range.start + 1)) + range.start;
    } else {
      id = Math.floor(Math.random() * 1010) + 1;
    }

    const response = await fetch(`${POKEAPI_BASE}/pokemon/${id}`);
    const data = await response.json();

    const stats = data.stats.map((stat: any) => ({
      name: stat.stat.name,
      value: stat.base_stat,
    }));

    const bst = stats.reduce((sum: number, stat: any) => sum + stat.value, 0);

    if (!minBST || bst >= minBST) {
      const abilities = data.abilities.map((a: any) => 
        a.ability.name.replace(/-/g, ' ')
      );
      
      const types = data.types.map((t: any) => 
        t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1)
      );

      return {
        id: data.id,
        name: data.name,
        sprite: data.sprites.other["official-artwork"].front_default,
        stats,
        generation: getGeneration(data.id),
        bst,
        abilities,
        types,
      };
    }

    attempts++;
  } while (attempts < maxAttempts);

  // Fallback if no valid Pokemon found
  const response = await fetch(`${POKEAPI_BASE}/pokemon/${id}`);
  const data = await response.json();
  const stats = data.stats.map((stat: any) => ({
    name: stat.stat.name,
    value: stat.base_stat,
  }));
  const bst = stats.reduce((sum: number, stat: any) => sum + stat.value, 0);

  const abilities = data.abilities.map((a: any) => 
    a.ability.name.replace(/-/g, ' ')
  );
  
  const types = data.types.map((t: any) => 
    t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1)
  );

  return {
    id: data.id,
    name: data.name,
    sprite: data.sprites.other["official-artwork"].front_default,
    stats,
    generation: getGeneration(data.id),
    bst,
    abilities,
    types,
  };
};

export const fetchPokemonByName = async (name: string): Promise<Pokemon> => {
  const response = await fetch(`${POKEAPI_BASE}/pokemon/${name.toLowerCase()}`);
  const data = await response.json();

  const stats = data.stats.map((stat: any) => ({
    name: stat.stat.name,
    value: stat.base_stat,
  }));

  const bst = stats.reduce((sum: number, stat: any) => sum + stat.value, 0);

  const abilities = data.abilities.map((a: any) => 
    a.ability.name.replace(/-/g, ' ')
  );
  
  const types = data.types.map((t: any) => 
    t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1)
  );

  return {
    id: data.id,
    name: data.name,
    sprite: data.sprites.other["official-artwork"].front_default,
    stats,
    generation: getGeneration(data.id),
    bst,
    abilities,
    types,
  };
};
