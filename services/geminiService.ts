
import { GoogleGenAI } from "@google/genai";
import { CELESTIAL_BODIES, NOTABLE_COMETS, NASA_SPACECRAFT, formatOrbitalPeriod } from './celestialData';

export async function getRoboticStatus(timeLeft: number): Promise<string> {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY is not defined in process.env");
    return "Core connection lost.";
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    // Build real celestial context for the prompt
    const moonData = CELESTIAL_BODIES
      .filter(b => b.type === 'moon')
      .map(b => `${b.name} (${b.parent}) T=${formatOrbitalPeriod(b.orbitalPeriodHours)} via ${b.nasaMission}`)
      .join('; ');

    const cometData = NOTABLE_COMETS
      .map(c => `${c.name} period=${c.periodYears}yr next perihelion=${c.nextPerihelion}`)
      .join('; ');

    const voyager = NASA_SPACECRAFT[0];

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an advanced NASA mission control computer using real JPL Horizons ephemeris data.
      Generate a short, one-sentence cryptic status update for a countdown timer, grounded in real celestial mechanics.
      Time remaining: ${minutes}m ${seconds}s.
      Real moon orbital periods (NASA data): ${moonData}.
      Notable comets: ${cometData}.
      ${voyager.name} is currently ${voyager.distanceAU} AU from the Sun at ${voyager.speedKmS} km/s.
      Reference real bodies (Phobos, Io, Europa, Halley's Comet, Voyager, Parker Solar Probe, etc.).
      Examples: "Phobos completes 0.011 orbits in this interval.", "Halley's Comet last reached perihelion in 1986.", "Voyager 1 is ${voyager.distanceAU} AU distant, moving at ${voyager.speedKmS} km/s."
      Be precise, robotic, and reference real NASA mission data.`,
      config: {
        maxOutputTokens: 60,
        temperature: 0.8,
      }
    });

    return response.text || "Systems nominal.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Offline protocol engaged.";
  }
}
