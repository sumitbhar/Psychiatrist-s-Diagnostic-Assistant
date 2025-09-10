
import React from 'react';
import { StethoscopeIcon } from './icons/StethoscopeIcon';
import { ClipboardListIcon } from './icons/ClipboardListIcon';
import { HistoryIcon } from './icons/HistoryIcon';

interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  prompt: string;
  onClick: (prompt: string) => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ icon, title, prompt, onClick }) => {
  return (
    <button
      onClick={() => onClick(prompt)}
      className="flex-1 min-w-[150px] bg-slate-800 p-3 rounded-lg text-left hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
    >
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
            {icon}
        </div>
        <p className="text-sm font-medium text-slate-200">{title}</p>
      </div>
    </button>
  );
};

interface ServiceCardsProps {
    onCardClick: (prompt: string) => void;
}

const cards = [
    {
        icon: <StethoscopeIcon className="w-5 h-5 text-cyan-400" />,
        title: "Analyze Symptoms",
        prompt: "Analyze the following symptoms for potential diagnoses: "
    },
    {
        icon: <ClipboardListIcon className="w-5 h-5 text-cyan-400" />,
        title: "Differential Diagnosis",
        prompt: "Provide a differential diagnosis for a patient presenting with: "
    },
    {
        icon: <HistoryIcon className="w-5 h-5 text-cyan-400" />,
        title: "Review Patient History",
        prompt: "Review the patient's history and provide clinical insights: "
    }
];

export const ServiceCards: React.FC<ServiceCardsProps> = ({ onCardClick }) => {
  return (
    <div className="mb-4">
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
        {cards.map((card) => (
          <ServiceCard 
            key={card.title} 
            icon={card.icon} 
            title={card.title}
            prompt={card.prompt}
            onClick={onCardClick}
            />
        ))}
      </div>
    </div>
  );
};
