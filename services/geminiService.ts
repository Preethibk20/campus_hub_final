
import { GoogleGenAI, Type } from "@google/genai";
import { Gig, User } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const geminiService = {
  async getRecommendedGigs(userProfile: User, allGigs: Gig[]): Promise<string[]> {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Given a user with skills: ${userProfile.skills.join(', ')} and bio: "${userProfile.bio}", 
        analyze the following gig listings and return a JSON list of IDs for the top 3 most relevant gigs.
        
        Gigs:
        ${JSON.stringify(allGigs.map(g => ({ id: g.id, title: g.title, description: g.description, category: g.category })))}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });
      
      return JSON.parse(response.text || '[]');
    } catch (error) {
      console.error("AI Recommendation Error:", error);
      return [];
    }
  },

  async optimizeGigDescription(title: string, currentDesc: string): Promise<string> {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `I am writing a micro-gig listing for a college marketplace. 
        Title: "${title}"
        Draft: "${currentDesc}"
        
        Please rewrite this to be professional, engaging for college students, and include 3 key selling points. Keep it concise.`,
      });
      return response.text || currentDesc;
    } catch (error) {
      return currentDesc;
    }
  }
};
