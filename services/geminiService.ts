
import { GoogleGenAI, Type } from "@google/genai";
import { StyleOption } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeIdea = async (idea: string): Promise<StyleOption[]> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze this app idea: "${idea}". 
    Propose 3 distinct visual styles suitable for this specific app. 
    Return the response as a JSON array of objects with 'name' and 'description' keys. 
    The 'description' should be a vivid text description that helps the user imagine the look.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
          },
          required: ["name", "description"],
        },
      },
    },
  });

  const text = response.text;
  const styles = JSON.parse(text);
  return styles.map((s: any, index: number) => ({
    ...s,
    id: `style-${index}`
  }));
};

export const generateFinalPrompt = async (idea: string, style: StyleOption): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `You are a Senior UI/UX Product Designer.
    App Idea: "${idea}"
    Selected Style: "${style.name}" (${style.description})
    
    Generate a structured UI design prompt in CHINESE strictly following this format:
    设计一款[App Name]的UI。
    风格: [Style Keywords, Colors, Shapes, Background].
    包含页面:
    1. [Page Name] ([Key UI element description]);
    2. [Page Name] ([Key UI element description]);
    3. [Page Name] ([Key UI element description]);
    4. [Page Name] ([Key UI element description]);
    5. [Page Name] ([Key UI element description]).
    氛围: [Atmosphere Keywords].`,
  });

  return response.text;
};
