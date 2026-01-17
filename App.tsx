
import React, { useState } from 'react';
import { StepIndicator } from './components/StepIndicator';
import { StyleCard } from './components/StyleCard';
import { PromptState, StyleOption } from './types';
import { analyzeIdea, generateFinalPrompt } from './services/geminiService';

const App: React.FC = () => {
  const [state, setState] = useState<PromptState>({
    currentStep: 'INPUT',
    idea: '',
    styles: [],
    selectedStyle: null,
    customVibe: '',
    finalPrompt: '',
    isLoading: false,
    error: null,
  });

  const handleStartAnalysis = async (e?: React.FormEvent, isReroll: boolean = false) => {
    if (e) e.preventDefault();
    if (!state.idea.trim()) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const styles = await analyzeIdea(state.idea, isReroll);
      setState(prev => ({
        ...prev,
        styles,
        currentStep: 'STYLE_SELECTION',
        isLoading: false,
        selectedStyle: null,
        customVibe: ''
      }));
    } catch (err) {
      setState(prev => ({ 
        ...prev, 
        error: 'Analysis failed. Please try again.', 
        isLoading: false 
      }));
    }
  };

  const handleStyleSelect = (style: StyleOption) => {
    setState(prev => ({ ...prev, selectedStyle: style, customVibe: '' }));
  };

  const handleConfirmStyle = async () => {
    const activeStyle = state.customVibe.trim() ? state.customVibe : state.selectedStyle;
    if (!activeStyle) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const prompt = await generateFinalPrompt(state.idea, activeStyle);
      setState(prev => ({
        ...prev,
        finalPrompt: prompt,
        currentStep: 'FINAL_PROMPT',
        isLoading: false
      }));
    } catch (err) {
      setState(prev => ({ 
        ...prev, 
        error: 'Prompt generation failed. Please try again.', 
        isLoading: false 
      }));
    }
  };

  const reset = () => {
    setState({
      currentStep: 'INPUT',
      idea: '',
      styles: [],
      selectedStyle: null,
      customVibe: '',
      finalPrompt: '',
      isLoading: false,
      error: null,
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(state.finalPrompt);
    alert('Copied to clipboard!');
  };

  return (
    <div className="min-h-screen pb-20 px-4">
      {/* Navigation Header */}
      <nav className="max-w-5xl mx-auto py-8 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="bg-indigo-600 text-white p-2 rounded-lg font-bold">UX</div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Prompt Architect</h1>
        </div>
        {state.currentStep !== 'INPUT' && (
          <button 
            onClick={reset}
            className="text-gray-500 hover:text-indigo-600 font-medium text-sm transition-colors"
          >
            Start Over
          </button>
        )}
      </nav>

      <main className="max-w-4xl mx-auto mt-10">
        <header className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
            {state.currentStep === 'INPUT' && "What's your next big app idea?"}
            {state.currentStep === 'STYLE_SELECTION' && "Choose a Visual Direction"}
            {state.currentStep === 'FINAL_PROMPT' && "Your Professional UI Design Prompt"}
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            {state.currentStep === 'INPUT' && "I'll analyze your concept and propose professional visual styles to bring it to life."}
            {state.currentStep === 'STYLE_SELECTION' && "Select a suggested style or describe your own unique vibe."}
            {state.currentStep === 'FINAL_PROMPT' && "Use this structured prompt with AI tools like Midjourney or Stable Diffusion."}
          </p>
        </header>

        <StepIndicator currentStep={state.currentStep} />

        {/* Step 1: Input */}
        {state.currentStep === 'INPUT' && (
          <form onSubmit={handleStartAnalysis} className="space-y-6">
            <div className="relative">
              <textarea
                value={state.idea}
                onChange={(e) => setState(prev => ({ ...prev, idea: e.target.value }))}
                placeholder="e.g., A minimalist meditation app focusing on breathing exercises..."
                className="w-full h-48 p-6 text-lg border border-gray-200 rounded-3xl shadow-sm focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all resize-none bg-white"
                required
              />
              <div className="absolute bottom-4 right-6 text-sm text-gray-400">
                {state.idea.length} characters
              </div>
            </div>
            
            <button
              type="submit"
              disabled={state.isLoading || !state.idea.trim()}
              className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 shadow-xl shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95 flex items-center justify-center space-x-3"
            >
              {state.isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Analyzing Idea...</span>
                </>
              ) : (
                <>
                  <span>Propose Visual Styles</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </form>
        )}

        {/* Step 2: Style Selection */}
        {state.currentStep === 'STYLE_SELECTION' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {state.styles.map((style) => (
                <StyleCard 
                  key={style.id}
                  style={style}
                  isSelected={state.selectedStyle?.id === style.id}
                  onSelect={handleStyleSelect}
                />
              ))}
            </div>

            {/* Option D: Custom Vibe */}
            <div className={`p-8 rounded-3xl border-2 transition-all duration-300 bg-white ${state.customVibe.trim() ? 'border-indigo-600 ring-4 ring-indigo-50 shadow-lg' : 'border-dashed border-gray-300'}`}>
              <div className="flex items-center space-x-3 mb-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${state.customVibe.trim() ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                   D
                </div>
                <h3 className="text-xl font-bold text-gray-800">Option D: Custom Vibe</h3>
              </div>
              <textarea
                value={state.customVibe}
                onChange={(e) => setState(prev => ({ ...prev, customVibe: e.target.value, selectedStyle: null }))}
                placeholder="Describe your own style preference here... (e.g., 'A dark mode neon glassmorphism interface with organic shapes')"
                className="w-full h-24 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none resize-none text-sm"
              />
              <p className="mt-2 text-xs text-gray-400">None of these? Tell me your preferred vibe, or ask for new styles below.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <button
                onClick={() => handleStartAnalysis(undefined, true)}
                disabled={state.isLoading}
                className="flex-1 py-4 bg-white text-gray-600 border border-gray-200 rounded-2xl font-bold hover:bg-gray-50 transition-all flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Re-roll Styles</span>
              </button>
              
              <button
                onClick={handleConfirmStyle}
                disabled={state.isLoading || (!state.selectedStyle && !state.customVibe.trim())}
                className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 shadow-xl shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95 flex items-center justify-center space-x-3"
              >
                {state.isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Architecting UI Prompt...</span>
                  </>
                ) : (
                  <>
                    <span>Generate Final Prompt</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Final Prompt */}
        {state.currentStep === 'FINAL_PROMPT' && (
          <div className="space-y-6 animate-in zoom-in-95 duration-500">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 relative group">
              <pre className="whitespace-pre-wrap font-sans text-gray-800 text-lg leading-relaxed">
                {state.finalPrompt}
              </pre>
              <button 
                onClick={copyToClipboard}
                className="absolute top-6 right-6 p-3 bg-gray-50 hover:bg-indigo-600 hover:text-white rounded-xl transition-all shadow-sm"
                title="Copy to Clipboard"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
              </button>
            </div>

            <div className="flex gap-4">
               <button
                onClick={reset}
                className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all"
              >
                Create New Prompt
              </button>
              <button
                onClick={copyToClipboard}
                className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
              >
                Copy Prompt
              </button>
            </div>
          </div>
        )}

        {state.error && (
          <div className="mt-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center justify-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{state.error}</span>
          </div>
        )}
      </main>

      {/* Persistent Call to Action (Floating Progress) */}
      {state.isLoading && (
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-white px-6 py-3 rounded-full shadow-2xl border border-indigo-100 flex items-center space-x-4 z-50">
           <div className="w-4 h-4 rounded-full bg-indigo-600 animate-ping"></div>
           <span className="font-medium text-indigo-900">Gemini is thinking...</span>
        </div>
      )}
    </div>
  );
};

export default App;
