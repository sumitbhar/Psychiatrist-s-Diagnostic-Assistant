
import React from 'react';

export const StethoscopeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M4.8 2.3A.3.3 0 1 0 5.4 2a.3.3 0 0 0-.6.3z"></path>
    <path d="M18.8 2.3a.2.2 0 1 0 .4.2.2.2 0 0 0-.4-.2z"></path>
    <path d="M5.1 2.6V5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V2.6"></path>
    <path d="M5.1 2.6h-1a.5.5 0 0 0-.5.5v2"></path><path d="M19.1 2.6h1a.5.5 0 0 1 .5.5v2"></path>
    <path d="M5.1 5V2.6"></path><path d="M19.1 5V2.6"></path>
    <path d="M12 7v13a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2v-3"></path>
    <circle cx="12" cy="20" r="2"></circle>
  </svg>
);
