import React, { useState, useEffect } from 'react';
import { XIcon } from './icons/XIcon';
import { CopyIcon } from './icons/CopyIcon';

interface SoapNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: string;
  isLoading: boolean;
}

const LoadingSkeleton: React.FC = () => (
    <div className="space-y-4 animate-pulse">
        <div className="h-4 bg-slate-700 rounded w-1/4"></div>
        <div className="h-12 bg-slate-700 rounded w-full"></div>
        <div className="h-4 bg-slate-700 rounded w-1/4"></div>
        <div className="h-8 bg-slate-700 rounded w-3/4"></div>
        <div className="h-4 bg-slate-700 rounded w-1/4"></div>
        <div className="h-16 bg-slate-700 rounded w-full"></div>
         <div className="h-4 bg-slate-700 rounded w-1/4"></div>
        <div className="h-12 bg-slate-700 rounded w-full"></div>
    </div>
);


export const SoapNoteModal: React.FC<SoapNoteModalProps> = ({ isOpen, onClose, note, isLoading }) => {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      // Reset copied state when modal closes
      setTimeout(() => setIsCopied(false), 300);
    }
  }, [isOpen]);

  // Reset copy status when the note content changes
  useEffect(() => {
    setIsCopied(false);
  }, [note]);

  const handleCopy = () => {
    if (note) {
      navigator.clipboard.writeText(note);
      setIsCopied(true);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-slate-100">Generated SOAP Note</h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-full hover:bg-slate-700" aria-label="Close modal">
            <XIcon className="w-5 h-5" />
          </button>
        </header>
        
        <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
                <LoadingSkeleton />
            ) : (
                <pre className="whitespace-pre-wrap font-sans text-slate-300 text-sm leading-relaxed">
                    {note}
                </pre>
            )}
        </div>

        <footer className="p-4 border-t border-slate-700 bg-slate-800/50 flex justify-end">
            <button
                type="button"
                onClick={handleCopy}
                disabled={isLoading || !note || isCopied}
                className="flex items-center space-x-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold px-4 py-2 rounded-lg transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
            >
                <CopyIcon className="w-5 h-5" />
                <span>{isCopied ? 'Copied!' : 'Copy to Clipboard'}</span>
            </button>
        </footer>
      </div>
    </div>
  );
};