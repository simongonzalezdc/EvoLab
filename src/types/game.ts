// Shared game setup types for configuring competing species

export type CompetitorType = 'herbivore' | 'carnivore' | 'omnivore';

export interface SpeciesSetupOption {
  id: string;
  type: CompetitorType;
  population: number;
  name?: string;
}

export interface GameSetupOptions {
  species: SpeciesSetupOption[];
}
