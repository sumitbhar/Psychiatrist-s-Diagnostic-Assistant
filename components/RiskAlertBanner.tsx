import React from 'react';
import { AlertOctagonIcon } from './icons/AlertOctagonIcon';

export const RiskAlertBanner: React.FC = () => {
  return (
    <div 
      className="absolute top-0 left-0 right-0 z-10 bg-red-800/90 backdrop-blur-sm border-b-2 border-red-600 p-3 shadow-lg"
      role="alert"
    >
      <div className="container mx-auto max-w-4xl flex items-center space-x-3">
        <AlertOctagonIcon className="w-8 h-8 text-red-200 flex-shrink-0" />
        <div>
          <h3 className="font-bold text-base text-white">Potential Risk Identified</h3>
          <p className="text-sm text-red-200">The AI has detected language that may indicate a risk of harm. Please follow all standard clinical safety protocols immediately.</p>
        </div>
      </div>
    </div>
  );
};
