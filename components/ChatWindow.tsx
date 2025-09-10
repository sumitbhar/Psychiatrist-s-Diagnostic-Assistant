import React, { useEffect, useRef } from 'react';
import { type Message } from '../types';
import { MessageComponent } from './Message';
import { RiskAlertBanner } from './RiskAlertBanner';

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  speakingMessageIndex: number | null;
  onToggleSpeech: (index: number, text: string) => void;
  isRiskAlertVisible: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading, speakingMessageIndex, onToggleSpeech, isRiskAlertVisible }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div className="relative h-full">
      {isRiskAlertVisible && <RiskAlertBanner />}
      <div 
        ref={scrollRef} 
        className={`h-full overflow-y-auto p-4 md:p-6 transition-all duration-300 ${isRiskAlertVisible ? 'pt-24' : 'pt-4'}`}
      >
        <div className="container mx-auto max-w-4xl space-y-6">
            {messages.map((msg, index) => (
            <MessageComponent 
                key={index} 
                message={msg}
                isSpeaking={speakingMessageIndex === index}
                onToggleSpeech={() => onToggleSpeech(index, msg.text)}
                />
            ))}
            {isLoading && <MessageComponent isLoading={true} />}
        </div>
      </div>
    </div>
  );
};