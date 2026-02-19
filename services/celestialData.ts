
/**
 * Real celestial orbital data sourced from NASA JPL Horizons System and
 * NASA Solar System Exploration (https://solarsystem.nasa.gov).
 * Orbital periods are sidereal periods.
 */

export interface CelestialBody {
  name: string;
  type: 'moon' | 'planet' | 'comet';
  parent?: string;
  /** Sidereal orbital period in hours */
  orbitalPeriodHours: number;
  /** Compressed visual animation duration in seconds for ring display */
  visualDurationSeconds: number;
  color: string;
  tilt: string;
  size: number;
  description: string;
  nasaMission: string;
}

/**
 * Selected celestial bodies ordered by orbital speed (fastest first).
 * Fast-orbiting moons are featured prominently as the problem statement notes
 * "some moons orbit very fast". Animation durations are proportional to real
 * orbital periods (normalised so Phobos = 8 s).
 */
export const CELESTIAL_BODIES: CelestialBody[] = [
  {
    name: 'Phobos',
    type: 'moon',
    parent: 'Mars',
    orbitalPeriodHours: 7.654,       // 7 h 39 m — Mars Reconnaissance Orbiter
    visualDurationSeconds: 8,
    color: 'border-cyan-500/20',
    tilt: 'rotateX(70deg)',
    size: 300,
    description: "Mars' inner moon — fastest natural satellite in the solar system",
    nasaMission: 'Mars Reconnaissance Orbiter',
  },
  {
    name: 'Amalthea',
    type: 'moon',
    parent: 'Jupiter',
    orbitalPeriodHours: 11.957,      // Juno mission / Galileo data
    visualDurationSeconds: 13,
    color: 'border-purple-500/20',
    tilt: 'rotateY(45deg)',
    size: 450,
    description: "Jupiter's innermost large moon",
    nasaMission: 'Juno',
  },
  {
    name: 'Io',
    type: 'moon',
    parent: 'Jupiter',
    orbitalPeriodHours: 42.459,      // Voyager / Galileo / Juno
    visualDurationSeconds: 44,
    color: 'border-cyan-400/10',
    tilt: 'rotateX(20deg)',
    size: 600,
    description: "Most volcanically active body in the solar system",
    nasaMission: 'Galileo / Juno',
  },
  {
    name: 'Europa',
    type: 'moon',
    parent: 'Jupiter',
    orbitalPeriodHours: 85.228,      // Europa Clipper baseline data
    visualDurationSeconds: 89,
    color: 'border-pink-500/10',
    tilt: 'rotateY(-60deg)',
    size: 750,
    description: "Subsurface ocean world — Europa Clipper mission target (2030)",
    nasaMission: 'Europa Clipper',
  },
  {
    name: 'Moon',
    type: 'moon',
    parent: 'Earth',
    orbitalPeriodHours: 655.72,      // 27.32 days — LRO / well-established
    visualDurationSeconds: 120,
    color: 'border-blue-500/5',
    tilt: 'rotateZ(10deg)',
    size: 900,
    description: "Earth's natural satellite — Lunar Reconnaissance Orbiter",
    nasaMission: 'Lunar Reconnaissance Orbiter',
  },
  {
    name: 'Mercury',
    type: 'planet',
    orbitalPeriodHours: 2111.28,     // 87.97 days — MESSENGER mission
    visualDurationSeconds: 150,
    color: 'border-white/5',
    tilt: 'rotateX(-45deg)',
    size: 1100,
    description: "Fastest-orbiting planet — MESSENGER mission",
    nasaMission: 'MESSENGER',
  },
];

/** Real data for notable NASA deep-space spacecraft (approximate values, ~early 2025 epoch; see NASA Eyes on the Solar System for live tracking). */
export const NASA_SPACECRAFT = [
  { name: 'Voyager 1', distanceAU: 163.7, speedKmS: 17.0, launched: 1977 },
  { name: 'Voyager 2', distanceAU: 136.5, speedKmS: 15.3, launched: 1977 },
  { name: 'New Horizons', distanceAU: 58.1, speedKmS: 14.0, launched: 2006 },
  { name: 'Parker Solar Probe', distanceAU: 0.05, speedKmS: 195.0, launched: 2018 },
];

/** Notable comets with JPL/NASA ephemeris data. */
export const NOTABLE_COMETS = [
  { name: "Halley's Comet",  periodYears: 75.3,  lastPerihelion: 1986, nextPerihelion: 2061 },
  { name: 'Comet Encke',     periodYears: 3.3,   lastPerihelion: 2023, nextPerihelion: 2026 },
  { name: 'Wild 2',          periodYears: 6.41,  lastPerihelion: 2022, nextPerihelion: 2028 },
];

/** Format an orbital period in hours as a human-readable string. */
export function formatOrbitalPeriod(hours: number): string {
  if (hours < 24) return `${hours.toFixed(2)}h`;
  if (hours < 24 * 365) return `${(hours / 24).toFixed(2)}d`;
  return `${(hours / (24 * 365.25)).toFixed(2)}yr`;
}

/**
 * Calculate how many complete orbits a body finishes in a given number of seconds
 * of countdown time.
 */
export function orbitsCompleted(body: CelestialBody, elapsedSeconds: number): number {
  return elapsedSeconds / (body.orbitalPeriodHours * 3600);
}
