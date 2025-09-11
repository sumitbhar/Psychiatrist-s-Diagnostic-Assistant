
import React from 'react';
import { type Message, Role } from '../types';
import { UserIcon } from './icons/UserIcon';
import { AIIcon } from './icons/AIIcon';
import { SpeakerIcon } from './icons/SpeakerIcon';

interface MessageComponentProps {
  message?: Message;
  isLoading?: boolean;
  isSpeaking?: boolean;
  onToggleSpeech?: () => void;
}

const LoadingDots: React.FC = () => (
  <div className="flex items-center space-x-1">
    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
  </div>
);

// A markdown-like renderer to handle headings, lists, bold, and italic text.
const renderInlines = (text: string) => {
  // Handles **bold** and *italic* text.
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  return parts.filter(Boolean).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-semibold text-slate-100">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      const content = part.slice(1, -1);
      const confidenceRegex = /Confidence Level: (High|Medium|Low)/i;
      const match = content.match(confidenceRegex);

      if (match) {
        const confidence = match[1];
        let confidenceColor = 'text-slate-300';
        if (confidence.toLowerCase() === 'high') confidenceColor = 'text-green-400';
        if (confidence.toLowerCase() === 'medium') confidenceColor = 'text-yellow-400';
        if (confidence.toLowerCase() === 'low') confidenceColor = 'text-orange-400';
        
        const [pre, post] = content.split(match[0]);
        
        return (
          <span key={index} className="italic text-slate-400">
            {pre}
            <span className="not-italic">
              <span className="font-semibold">Confidence Level: </span>
              <span className={`font-semibold ${confidenceColor}`}>{confidence}</span>
            </span>
            {post}
          </span>
        );
      }
      return <em key={index} className="italic text-slate-300">{content}</em>;
    }
    return <span key={index}>{part}</span>;
  });
};

const FormattedText: React.FC<{ text: string }> = ({ text }) => {
  // Split the text into blocks separated by one or more empty lines.
  const blocks = text.split(/\n\s*\n/);

  return (
    <>
      {blocks.map((block, index) => {
        const trimmedBlock = block.trim();
        if (!trimmedBlock) return null;

        // Code block ```...```
        if (trimmedBlock.startsWith('```') && trimmedBlock.endsWith('```')) {
          const code = trimmedBlock.substring(3, trimmedBlock.length - 3).trim();
          return (
            <pre key={index} className="bg-slate-900/70 p-3 rounded-md my-2 overflow-x-auto">
              <code className="text-sm text-slate-300 font-mono">{code}</code>
            </pre>
          );
        }

        const lines = trimmedBlock.split('\n');
        const firstLine = lines[0].trim();

        // ### Heading
        if (firstLine.startsWith('### ')) {
          return <h3 key={index} className="text-lg font-semibold text-cyan-400 mt-4 mb-2">{renderInlines(firstLine.substring(4))}</h3>;
        }

        // * Unordered list items
        if (lines.every(line => line.trim().startsWith('* '))) {
          return (
            <ul key={index} className="list-disc list-outside pl-5 my-2 space-y-1">
              {lines.map((item, i) => (
                <li key={i}>{renderInlines(item.trim().substring(2))}</li>
              ))}
            </ul>
          );
        }
        
        // 1. Ordered list items
        if (lines.every(line => /^\d+\.\s/.test(line.trim()))) {
          return (
            <ol key={index} className="list-decimal list-outside pl-5 my-2 space-y-1">
              {lines.map((item, i) => (
                <li key={i}>{renderInlines(item.trim().replace(/^\d+\.\s/, ''))}</li>
              ))}
            </ol>
          );
        }

        // --- Horizontal Rule
        if (firstLine === '---') {
          return <hr key={index} className="my-4 border-slate-600" />;
        }

        // Disclaimer
        if (firstLine.includes('Disclaimer:')) {
            const content = firstLine.replace(/\*+/g, '').replace('Disclaimer:', '').trim();
            return (
              <p key={index} className="text-xs text-slate-400 mt-4 pt-4 border-t border-slate-600">
                <strong className="font-bold text-slate-300">Disclaimer:</strong>{' '}
                <em className="italic">{content}</em>
              </p>
            );
        }

        // Default to a paragraph.
        return (
          <p key={index} className="my-2">
            {lines.map((line, i) => (
              <React.Fragment key={i}>
                {renderInlines(line)}
                {i < lines.length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </>
  );
};


export const MessageComponent: React.FC<MessageComponentProps> = ({ message, isLoading = false, isSpeaking = false, onToggleSpeech }) => {
  if (isLoading) {
    return (
      <div className="flex items-start space-x-4 max-w-full">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
          <AIIcon className="w-5 h-5 text-cyan-400" />
        </div>
        <div className="bg-slate-800 rounded-lg p-3 text-slate-300">
          <LoadingDots />
        </div>
      </div>
    );
  }

  if (!message) return null;

  const isUser = message.role === Role.USER;

  return (
    <div className={`flex items-start space-x-4 max-w-full group ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
          <AIIcon className="w-5 h-5 text-cyan-400" />
        </div>
      )}
      <div
        className={`relative flex-1 rounded-lg px-4 py-3 max-w-[85%] prose-p:my-0 ${
          isUser
            ? 'bg-blue-600 text-white order-1'
            : 'bg-slate-800 text-slate-300 order-2'
        }`}
      >
        <FormattedText text={message.text} />
         {!isUser && onToggleSpeech && (
            <button 
                onClick={onToggleSpeech}
                className={`absolute -bottom-3 -right-3 p-1 rounded-full bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-cyan-300 transition-opacity opacity-0 group-hover:opacity-100 focus:opacity-100 ${isSpeaking ? '!opacity-100 text-cyan-400' : ''}`}
                aria-label={isSpeaking ? 'Stop speech' : 'Read message aloud'}
            >
                <SpeakerIcon className="w-4 h-4" />
            </button>
        )}
      </div>
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center order-2">
          <UserIcon className="w-5 h-5 text-slate-400" />
        </div>
      )}
    </div>
  );
};