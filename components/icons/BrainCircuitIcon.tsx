
import React from 'react';

export const BrainCircuit: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        {...props}
    >
        <path d="M12 2a4.5 4.5 0 0 0-4.5 4.5c0 1.25.48 2.37 1.25 3.25" />
        <path d="M12 2a4.5 4.5 0 0 1 4.5 4.5c0 1.25-.48 2.37-1.25 3.25" />
        <path d="M12 13.5a4.5 4.5 0 0 1 4.5-4.5" />
        <path d="M12 13.5a4.5 4.5 0 0 0-4.5-4.5" />
        <path d="M12 13.5V22" />
        <path d="M12 13.5a4.5 4.5 0 0 0 4.5 4.5" />
        <path d="M12 13.5a4.5 4.5 0 0 1-4.5 4.5" />
        <path d="M2.5 10.5c0-1.25.48-2.37 1.25-3.25" />
        <path d="M21.5 10.5c0-1.25-.48-2.37-1.25-3.25" />
        <path d="M17.75 18a4.5 4.5 0 0 0-4.5-4.5" />
        <path d="M6.25 18a4.5 4.5 0 0 1 4.5-4.5" />
        <circle cx="12" cy="13.5" r="1.5" />
        <circle cx="6.25" cy="18" r="1.5" />
        <circle cx="17.75" cy="18" r="1.5" />
        <circle cx="3.75" cy="7.25" r="1.5" />
        <circle cx="20.25" cy="7.25" r="1.5" />
        <circle cx="12" cy="2" r="1.5" />
        <circle cx="12" cy="22" r="1.5" />
    </svg>
);
