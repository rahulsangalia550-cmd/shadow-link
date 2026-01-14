import { GoogleGenAI } from "@google/genai";

declare var process: {
  env: {
    API_KEY: string;
  }
};

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getSecureResponse = async (userMessage: string, contactName: string) => {
  try {
    const systemInstruction = `You are a contact in a secure messenger app named ${contactName}. 
         Respond in a concise, friendly, but privacy-conscious way. 
         Don't break character. If the user asks about security, assure them that this channel is routed through the Shadow Link secure node. 
         Never reveal your true identity as an AI unless directly forced to for diagnostic purposes.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userMessage,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The secure node encountered an error. Please re-encrypt and try again.";
  }
};