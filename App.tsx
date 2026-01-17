
import React, { useState, useRef } from 'react';
import { StepIndicator } from './components/StepIndicator';
import { StyleCard } from './components/StyleCard';
import { PromptState, StyleOption, AppMode } from './types';
import { analyzeIdea, generateFinalPrompt } from './services/geminiService';

const GlassIcon = ({ color }: { color: string }) => (
  <div className={`w-16 h-16 rounded-2xl relative overflow-hidden flex items-center justify-center shadow-inner`}>
    <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-20`}></div>
    <div className="absolute inset-0 backdrop-blur-sm border border-white/40 rounded-2xl"></div>
    <div className="relative z-10 w-8 h-8 rounded-full bg-white/60 blur-[1px] shadow-sm"></div>
    <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-white/80"></div>
  </div>
);

const Icons = {
  UI: () => (
    <div className="relative w-20 h-20">
      <div className="absolute inset-0 bg-indigo-500/20 rounded-3xl backdrop-blur-md border border-white/50 shadow-xl rotate-6 translate-x-2"></div>
      <div className="absolute inset-0 bg-white/40 rounded-3xl backdrop-blur-xl border border-white/60 shadow-2xl flex items-center justify-center">
        <div className="w-10 h-1 rounded-full bg-indigo-500/40 mb-6"></div>
        <div className="absolute bottom-4 left-4 right-4 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20"></div>
      </div>
    </div>
  ),
  INTERIOR: () => (
    <div className="relative w-16 h-16">
      <div className="absolute inset-0 bg-emerald-500/20 rounded-2xl rotate-45 shadow-lg"></div>
      <div className="absolute inset-1 bg-white/40 backdrop-blur-lg rounded-2xl border border-white/50 flex items-center justify-center">
        <div className="w-6 h-6 border-b-2 border-r-2 border-emerald-500/40 rounded-sm"></div>
      </div>
    </div>
  ),
  PHOTO: () => (
    <div className="relative w-16 h-16">
      <div className="absolute inset-0 bg-rose-500/20 rounded-full shadow-lg"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-white/60 backdrop-blur-xl bg-white/20"></div>
        <div className="absolute w-4 h-4 rounded-full bg-rose-500/40"></div>
      </div>
    </div>
  ),
  ASSET: () => (
    <div className="relative w-16 h-16">
       <div className="absolute inset-0 bg-amber-500/20 rounded-2xl shadow-lg -rotate-12"></div>
       <div className="absolute inset-0 bg-white/40 backdrop-blur-lg rounded-2xl border border-white/50 flex items-center justify-center">
          <div className="w-6 h-6 bg-amber-500/30 rounded-full filter blur-[2px]"></div>
          <div className="absolute w-4 h-4 bg-white/80 rounded-full"></div>
       </div>
    </div>
  )
};

const MODE_DEFS = [
  { id: 'UI_DESIGN', label: 'App UI Design', icon: <Icons.UI />, desc: 'Interfaces for Web & Mobile', gridClass: 'md:col-span-1 md:row-span-2' },
  { id: 'INTERIOR', label: 'Interior Design', icon: <Icons.INTERIOR />, desc: 'Decor & Architectural Vibes', gridClass: 'md:col-span-1 md:row-span-1' },
  { id: 'PHOTO_EDIT', label: 'Photography', icon: <Icons.PHOTO />, desc: 'Mood & Color Grade', gridClass: 'md:col-span-1 md:row-span-1' },
  { id: 'ASSET_GEN', label: 'Icon & Logo', icon: <Icons.ASSET />, desc: 'Symbols & Graphic Assets', gridClass: 'md:col-span-2 md:row-span-1' },
];

const App: React.FC = () => {
  const [state, setState] = useState<PromptState>({
    currentStep: 'MODE_SELECT',
    mode: 'UI_DESIGN',
    idea: '',
    refImage: null,
    styles: [],
    selectedStyle: null,
    customVibe: '',
    finalPrompt: '',
    codePrompt: '',
    isLoading: false,
    error: null,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleModeSelect = (mode: AppMode) => {
    setState(prev => ({ ...prev, mode, currentStep: 'INPUT' }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setState(prev => ({ ...prev, refImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStartAnalysis = async (e?: React.FormEvent, isReroll: boolean = false) => {
    if (e) e.preventDefault();
    if (!state.idea.trim() && !state.refImage) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const styles = await analyzeIdea(state.idea, state.mode, state.refImage, isReroll);
      setState(prev => ({
        ...prev,
        styles,
        currentStep: 'STYLE_SELECTION',
        isLoading: false,
        selectedStyle: null,
        customVibe: ''
      }));
    } catch (err) {
      setState(prev => ({ ...prev, error: 'Analysis failed. Please try again.', isLoading: false }));
    }
  };

  const handleConfirmStyle = async () => {
    const activeStyle = state.customVibe.trim() ? state.customVibe : state.selectedStyle;
    if (!activeStyle) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const { ui, code } = await generateFinalPrompt(state.idea, activeStyle, state.mode);
      setState(prev => ({
        ...prev,
        finalPrompt: ui,
        codePrompt: code,
        currentStep: 'FINAL_PROMPT',
        isLoading: false
      }));
    } catch (err) {
      setState(prev => ({ ...prev, error: 'Generation failed. Please try again.', isLoading: false }));
    }
  };

  const reset = () => {
    setState({
      currentStep: 'MODE_SELECT',
      mode: 'UI_DESIGN',
      idea: '',
      refImage: null,
      styles: [],
      selectedStyle: null,
      customVibe: '',
      finalPrompt: '',
      codePrompt: '',
      isLoading: false,
      error: null,
    });
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="min-h-screen pb-20 px-4">
      <nav className="max-w-6xl mx-auto py-10 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 text-white w-10 h-10 flex items-center justify-center rounded-xl font-black text-xl shadow-lg shadow-indigo-200">A</div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Prompt Architect</h1>
        </div>
        {state.currentStep !== 'MODE_SELECT' && (
          <button onClick={reset} className="text-gray-500 hover:text-indigo-600 font-bold text-sm bg-white/50 px-4 py-2 rounded-full backdrop-blur transition-all border border-white/50">Start Over</button>
        )}
      </nav>

      <main className="max-w-5xl mx-auto">
        {/* MODE SELECT */}
        {state.currentStep === 'MODE_SELECT' && (
          <div className="space-y-12 animate-in fade-in duration-700">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-5xl font-black text-gray-900 mb-4 tracking-tight">Select Design Domain</h2>
              <p className="text-gray-500 text-lg font-medium">Choose a specialized engine to begin your visual journey.</p>
            </div>

            <div className="bento-grid">
              {MODE_DEFS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleModeSelect(m.id as AppMode)}
                  className={`p-8 glass-panel glass-card-hover rounded-[2.5rem] text-left group flex flex-col justify-between ${m.gridClass}`}
                >
                  <div className="mb-8 transform group-hover:scale-110 transition-transform duration-500">
                    {m.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">{m.label}</h3>
                    <p className="text-gray-500 font-medium leading-relaxed">{m.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* INPUT STEP */}
        {state.currentStep === 'INPUT' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-500">
            <header className="text-center mb-8">
              <h2 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">Draft your {state.mode.replace('_', ' ')}</h2>
              <p className="text-gray-500 font-medium">Define the core vision or provide a reference image.</p>
            </header>

            <div className="glass-panel p-8 rounded-[2.5rem] shadow-sm">
              <label className="block text-xs font-black text-indigo-500 uppercase tracking-widest mb-4">Core Vision / Concept</label>
              <textarea
                value={state.idea}
                onChange={(e) => setState(prev => ({ ...prev, idea: e.target.value }))}
                placeholder="What are we building today? Describe the function, mood, and target audience..."
                className="w-full h-40 p-6 text-xl text-gray-800 border-none bg-white/30 rounded-2xl focus:ring-2 focus:ring-indigo-100 outline-none resize-none placeholder-gray-400 font-medium"
              />
              
              <div className="mt-6 pt-6 border-t border-white/40 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-3 bg-white/60 hover:bg-white text-gray-900 rounded-2xl text-sm font-bold transition-all flex items-center space-x-2 border border-white/50 shadow-sm"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                    <span>{state.refImage ? 'Change Image' : 'Visual Reference'}</span>
                  </button>
                  {state.refImage && <div className="text-sm text-emerald-600 font-bold">Ref. Loaded ✓</div>}
                </div>
              </div>
            </div>

            {state.refImage && (
              <div className="flex justify-center p-4">
                <div className="relative group">
                  <img src={state.refImage} className="max-h-56 rounded-3xl shadow-2xl border-4 border-white" alt="Ref" />
                  <button onClick={() => setState(prev => ({ ...prev, refImage: null }))} className="absolute -top-3 -right-3 bg-rose-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg hover:scale-110 transition-all font-bold">✕</button>
                </div>
              </div>
            )}

            <button
              onClick={() => handleStartAnalysis()}
              disabled={state.isLoading || (!state.idea.trim() && !state.refImage)}
              className="w-full py-6 bg-indigo-600 text-white rounded-[1.5rem] font-black text-xl hover:bg-indigo-700 shadow-2xl shadow-indigo-100 disabled:opacity-50 flex items-center justify-center space-x-3 transition-all"
            >
              {state.isLoading ? <span>Architecting...</span> : <span>Generate Proposals</span>}
            </button>
          </div>
        )}

        {/* STYLE SELECTION */}
        {state.currentStep === 'STYLE_SELECTION' && (
          <div className="space-y-8 animate-in fade-in duration-500">
             <header className="text-center">
              <h2 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">The Aesthetic Layer</h2>
              <p className="text-gray-500 font-medium">Select a curated visual direction or craft your own.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {state.styles.map((s) => (
                <StyleCard 
                  key={s.id}
                  style={s}
                  isSelected={state.selectedStyle?.id === s.id}
                  onSelect={(style) => setState(prev => ({ ...prev, selectedStyle: style, customVibe: '' }))}
                />
              ))}
            </div>
            
            <div className={`p-8 glass-panel rounded-[2.5rem] border-2 transition-all ${state.customVibe ? 'border-indigo-500' : 'border-dashed border-white/60'}`}>
              <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center space-x-2">
                <span className="bg-indigo-600 p-1 rounded-lg text-white">🪄</span>
                <span>Custom Refinement</span>
              </h3>
              <textarea 
                value={state.customVibe}
                onChange={(e) => setState(prev => ({ ...prev, customVibe: e.target.value, selectedStyle: null }))}
                placeholder="Describe your specific twist (e.g., 'Modernism with organic fluid textures' or 'Cyber-punk but minimal white')..."
                className="w-full h-24 p-5 bg-white/30 rounded-2xl border-none outline-none text-gray-800 font-medium placeholder-gray-400"
              />
            </div>

            <div className="flex gap-4">
              <button onClick={() => handleStartAnalysis(undefined, true)} className="flex-1 py-5 bg-white/60 text-gray-600 border border-white/60 rounded-[1.5rem] font-black hover:bg-white transition-all">New Proposals</button>
              <button 
                onClick={handleConfirmStyle} 
                className="flex-[2] py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-lg hover:bg-indigo-700 shadow-2xl shadow-indigo-100 disabled:opacity-50"
                disabled={state.isLoading || (!state.selectedStyle && !state.customVibe)}
              >
                {state.isLoading ? 'Processing...' : 'Build Full Prompt'}
              </button>
            </div>
          </div>
        )}

        {/* FINAL OUTPUT */}
        {state.currentStep === 'FINAL_PROMPT' && (
          <div className="space-y-8 animate-in zoom-in-95 duration-500">
             <header className="text-center">
              <h2 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">Final Blueprint</h2>
              <p className="text-gray-500 font-medium">Ready for high-fidelity generation.</p>
            </header>

            <div className="glass-panel p-8 md:p-12 rounded-[2.5rem] shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                <div className="space-y-1">
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-indigo-500 bg-indigo-50 px-3 py-1 rounded-lg">Midjourney / AI Prompt</span>
                  <h3 className="text-2xl font-black text-gray-900">5-Screen Consistent Flow</h3>
                </div>
                <button onClick={() => copyText(state.finalPrompt)} className="text-sm font-bold text-indigo-600 hover:text-indigo-800 px-6 py-3 rounded-2xl bg-indigo-50 transition-all border border-indigo-100 shadow-sm">Copy Blueprint</button>
              </div>
              <div className="bg-white/40 p-8 rounded-[2rem] border border-white/60 overflow-hidden">
                <pre className="whitespace-pre-wrap text-gray-900 text-lg md:text-xl font-medium leading-relaxed font-sans">{state.finalPrompt}</pre>
              </div>
            </div>

            {state.codePrompt && (
              <div className="bg-gray-900 p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-gray-800">
                <div className="flex justify-between items-center mb-8">
                  <div className="space-y-1">
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-lg">
                      {state.mode === 'UI_DESIGN' ? 'Developer Implementation Guide' : 'Domain Processing Logic'}
                    </span>
                    <h3 className="text-2xl font-black text-white">System Architecture</h3>
                  </div>
                  <button onClick={() => copyText(state.codePrompt)} className="text-sm font-bold text-emerald-400 hover:text-emerald-300 px-6 py-3 rounded-2xl bg-emerald-400/10 transition-all border border-emerald-400/20">Copy System Logic</button>
                </div>
                <div className="bg-black/20 p-8 rounded-[2rem] border border-white/5">
                  <pre className="whitespace-pre-wrap text-emerald-50 font-mono text-sm md:text-base leading-relaxed">{state.codePrompt}</pre>
                </div>
                <p className="mt-8 text-xs text-gray-500 font-medium italic text-center">Architectural bridge translating visual aesthetics into functional technical instructions.</p>
              </div>
            )}
            
            <button onClick={reset} className="w-full py-6 bg-white/50 text-gray-900 rounded-[1.5rem] font-black text-xl hover:bg-white transition-all border border-white shadow-xl">Architect Something New</button>
          </div>
        )}

        {state.isLoading && (
          <div className="fixed inset-0 bg-white/20 backdrop-blur-xl z-50 flex flex-col items-center justify-center space-y-6">
            <div className="w-20 h-20 relative">
               <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
               <div className="absolute inset-4 border-4 border-rose-400 border-b-transparent rounded-full animate-spin-slow"></div>
            </div>
            <p className="font-black text-2xl text-indigo-900 tracking-tight animate-pulse">Analyzing Visual Data...</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
