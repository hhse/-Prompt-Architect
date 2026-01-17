
export type AppMode = 'UI_DESIGN' | 'INTERIOR' | 'PHOTO_EDIT' | 'ASSET_GEN';

export interface StyleOption {
  id: string;
  name: string;
  description: string;
}

export type Step = 'MODE_SELECT' | 'INPUT' | 'STYLE_SELECTION' | 'FINAL_PROMPT';

export interface PromptState {
  currentStep: Step;
  mode: AppMode;
  idea: string;
  refImage: string | null; // base64
  styles: StyleOption[];
  selectedStyle: StyleOption | null;
  customVibe: string;
  finalPrompt: string;
  codePrompt: string;
  isLoading: boolean;
  error: string | null;
}
