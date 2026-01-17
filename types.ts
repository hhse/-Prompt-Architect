
export interface StyleOption {
  id: string;
  name: string;
  description: string;
}

export interface AppIdea {
  text: string;
  analyzedStyles: StyleOption[];
}

export type Step = 'INPUT' | 'STYLE_SELECTION' | 'FINAL_PROMPT';

export interface PromptState {
  currentStep: Step;
  idea: string;
  styles: StyleOption[];
  selectedStyle: StyleOption | null;
  customVibe: string;
  finalPrompt: string;
  isLoading: boolean;
  error: string | null;
}
