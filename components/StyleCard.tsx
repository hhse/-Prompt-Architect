
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
      className={`cursor-pointer p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-102 ${
        isSelected 
        ? 'border-indigo-600 bg-indigo-50 shadow-lg' 
        : 'border-transparent bg-white hover:bg-gray-50 shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className={`text-xl font-bold ${isSelected ? 'text-indigo-700' : 'text-gray-800'}`}>
          {style.name}
        </h3>
        {isSelected && (
          <div className="bg-indigo-600 rounded-full p-1">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>
      <p className="text-gray-600 leading-relaxed text-sm">
        {style.description}
      </p>
    </div>
  );
};
