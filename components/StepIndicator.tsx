
import React from 'react';
import { Step } from '../types';

interface StepIndicatorProps {
  currentStep: Step;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  const steps = [
    { id: 'INPUT', label: 'Idea Input' },
    { id: 'STYLE_SELECTION', label: 'Style Proposal' },
    { id: 'FINAL_PROMPT', label: 'Final Prompt' },
  ];

  return (
    <div className="flex items-center justify-center space-x-4 mb-8">
      {steps.map((s, idx) => {
        const isActive = s.id === currentStep;
        const isPast = steps.findIndex(st => st.id === currentStep) > idx;
        
        return (
          <React.Fragment key={s.id}>
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                isActive ? 'bg-indigo-600 text-white ring-4 ring-indigo-100' : 
                isPast ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {isPast ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="5 13l4 4L19 7" />
                  </svg>
                ) : idx + 1}
              </div>
              <span className={`text-xs mt-2 font-medium ${isActive ? 'text-indigo-600' : 'text-gray-400'}`}>
                {s.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`w-12 h-0.5 ${isPast ? 'bg-emerald-500' : 'bg-gray-200'} -mt-4`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
