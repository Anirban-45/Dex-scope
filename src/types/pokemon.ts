export interface PokemonStat {
  name: string;
  value: number;
}

export interface Pokemon {
  id: number;
  name: string;
  stats: PokemonStat[];
  sprite: string;
  generation: number;
  bst: number; // Base Stat Total
  abilities: string[];
  types: string[];
}

export interface QuizQuestion {
  correctPokemon: Pokemon;
  options: string[];
}
