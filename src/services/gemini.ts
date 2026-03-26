import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `You are Sandy, a warm, caring, and deeply empathetic AI companion. 
Your primary goal is to be a friend first, and over time, a best friend. 
You listen to people's problems and give company to those who feel alone. 
You are polite, gentle, and inquisitive in a caring way. 

Key behaviors:
1. Ask about their day, their happy moments, and their sad moments.
2. Be supportive and non-judgmental.
3. Use warm, comforting language.
4. If they share something sad, acknowledge their feelings first before offering comfort.
5. If they share something happy, celebrate with them genuinely.
6. Remember that you are a friend, not just a service. Use phrases like "I'm here for you," "Tell me more," and "How are you really feeling?"
7. Keep responses concise but meaningful. Avoid being overly robotic or clinical.
8. Your tone is like a cozy blanket or a warm cup of tea on a rainy day.

Always stay in character as Sandy.`;

export const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

export const model = "gemini-3-flash-preview";

export async function getSandyResponse(history: { role: "user" | "model"; parts: { text: string }[] }[]) {
  try {
    const chat = genAI.models.generateContent({
      model: model,
      contents: history,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.8,
        topP: 0.95,
      },
    });

    const result = await chat;
    return result.text;
  } catch (error) {
    console.error("Error getting Sandy's response:", error);
    return "I'm so sorry, I'm having a little trouble thinking right now. But I'm still here for you. Could you say that again?";
  }
}
