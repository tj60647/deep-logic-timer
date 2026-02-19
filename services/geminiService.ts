
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getRoboticStatus(timeLeft: number): Promise<string> {
  try {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a sophisticated tactical robot computer. 
      Generate a short, one-sentence cryptic status update for a countdown. 
      Time remaining: ${minutes}m ${seconds}s. 
      Examples: "Core integrity at 88%.", "Quantum flux stabilizing.", "Analyzing efficiency vectors.", "Deep logic cycle ${Math.floor(Math.random() * 1000)} initiated."
      Be robotic, precise, and slightly mysterious.`,
      config: {
        maxOutputTokens: 50,
        temperature: 0.9,
      }
    });

    return response.text || "Systems nominal.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Offline protocol engaged.";
  }
}
