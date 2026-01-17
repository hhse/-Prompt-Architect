
import { GoogleGenAI, Type } from "@google/genai";
import { StyleOption, AppMode } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const MODE_CONTEXTS: Record<AppMode, string> = {
  UI_DESIGN: "UX/UI Design for mobile or web apps. Focus on layouts, accessibility, and interactive elements.",
  INTERIOR: "Interior Design and architecture. Focus on lighting, textures, materials, and furniture placement.",
  PHOTO_EDIT: "Professional photography and post-processing. Focus on color grading, exposure, mood, and lens effects.",
  ASSET_GEN: "Graphic assets like logos, app icons, and vector symbols. Focus on scalability, symbolic clarity, and brand consistency."
};

export const analyzeIdea = async (idea: string, mode: AppMode, refImage: string | null, isReroll: boolean = false): Promise<StyleOption[]> => {
  const parts: any[] = [
    { text: `Current Mode: ${MODE_CONTEXTS[mode]}` },
    { text: `Analyze this idea: "${idea}". ${isReroll ? "Propose 3 COMPLETELY DIFFERENT and unique visual styles than usual." : "Propose 3 distinct visual styles."}` }
  ];

  if (refImage) {
    parts.push({
      inlineData: {
        data: refImage.split(',')[1],
        mimeType: "image/jpeg"
      }
    });
    parts.push({ text: "Use the provided image to extract key visual elements and include its vibe as one of the style proposals." });
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts },
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

  const styles = JSON.parse(response.text || "[]");
  return styles.map((s: any, index: number) => ({
    ...s,
    id: `style-${Date.now()}-${index}`
  }));
};

export const generateFinalPrompt = async (idea: string, style: StyleOption | string, mode: AppMode): Promise<{ ui: string; code: string }> => {
  const styleDescription = typeof style === 'string' ? style : `${style.name}: ${style.description}`;
  
  const uiResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `You are a Senior UI/UX Product Designer and Prompt Engineer.
    Mode: ${mode}
    Idea: "${idea}"
    Chosen Style: "${styleDescription}"
    
    Task: Determine the optimal number of screens (N) based on complexity:
    - Simple Utilities (Flashlight, Calculator): N=3
    - Standard Apps (News, Todo, Weather): N=4
    - Complex Platforms (Social Media, E-commerce, Finance): N=5
    
    Generate a structured AI design prompt in CHINESE strictly following this format:
    
    设计一款[App Name]的UI界面设计图，包含 [N] 个关键页面。

    1. 设计规范 (Design System):
    * 风格核心: [Selected Style Keywords].
    * 配色: [Detailed Color Palette].
    * 组件规范: [Global constraints like TabBar consistency, specific corner radius, frosted glass effects, typography].

    2. 页面流 (Screen Flow):
    (From Left to Right, generate exactly [N] screens)
    1. [Screen 1 Name]: [Detailed UI description of primary function];
    2. [Screen 2 Name]: [Description of the next logical step];
    3. [Screen 3 Name]: [Description of tertiary function or settings];
    ... (continue until [N])

    3. 提示词参数:
    --ar 3:2 --v 6.0 --style raw`,
  });

  let codePrompt = "";
  if (mode === 'UI_DESIGN') {
    const codeResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an expert Senior SwiftUI/iOS Developer. Based on the UI design prompt generated above, create a specialized meta-prompt for a Coding AI (like Claude or v0) to generate the functional SwiftUI code.
      
      Focus on architectural details:
      - Specific SwiftUI components (Material background, ZStack layouts, Glassmorphism modifiers).
      - Design system variables (Color constants, Spacing).
      - Transition logic and view hierarchy for the screens described.
      
      Output ONLY the meta-prompt in English.`,
    });
    codePrompt = codeResponse.text || "";
  } else {
    codePrompt = `Implementation reference for ${mode} based on the selected visual language. Focus on technical parameters relevant to this domain.`;
  }

  return { ui: uiResponse.text || "", code: codePrompt };
};
