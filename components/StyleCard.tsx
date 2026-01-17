
import React from 'react';
import { StyleOption } from '../types';

interface StyleCardProps {
  style: StyleOption;
  isSelected: boolean;
  onSelect: (style: StyleOption) => void;
}

export const StyleCard: React.FC<StyleCardProps> = ({ style, isSelected, onSelect }) => {
  return (
    <div 
      onClick={() => onSelect(style)}
      className={`cursor-pointer p-8 rounded-[2rem] border-2 transition-all duration-500 transform backdrop-blur-md ${
        isSelected 
        ? 'border-indigo-600 bg-white/70 shadow-2xl scale-[1.02]' 
        : 'border-white/40 bg-white/30 hover:bg-white/50 shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between mb-6">
        <h3 className={`text-xl font-black tracking-tight ${isSelected ? 'text-indigo-700' : 'text-gray-900'}`}>
          {style.name}
        </h3>
        {isSelected && (
          <div className="bg-indigo-600 rounded-full p-2 shadow-lg shadow-indigo-200">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>
      <p className={`leading-relaxed text-sm font-medium ${isSelected ? 'text-indigo-900/70' : 'text-gray-500'}`}>
        {style.description}
      </p>
    </div>
  );
};
