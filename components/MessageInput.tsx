
import React, { useState, useRef, useEffect } from 'react';
import { SendIcon } from './icons/SendIcon';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { PaperclipIcon } from './icons/PaperclipIcon';
import { XIcon } from './icons/XIcon';

interface MessageInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  file: File | null;
  onFileChange: (file: File | null) => void;
  value: string;
  onValueChange: (value: string) => void;
}

// Check for SpeechRecognition API
// FIX: Cast window to any to access browser-specific SpeechRecognition APIs without TypeScript errors.
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;
if (recognition) {
    recognition.continuous = true;
    recognition.interimResults = true;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, isLoading, file, onFileChange, value, onValueChange }) => {
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (!recognition) return;

    // FIX: Use 'any' type for the event parameter as SpeechRecognitionEvent is not defined in standard TS libs.
    recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }
        onValueChange(value + finalTranscript + interimTranscript);
    };

    // FIX: Use 'any' type for the event parameter as SpeechRecognitionErrorEvent is not defined in standard TS libs.
    recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
    };

    recognition.onend = () => {
        if (isRecording) { // Prevents stopping if it ends unexpectedly
            setIsRecording(false);
        }
    };
  }, [value, onValueChange, isRecording]);
  
  const handleToggleRecording = () => {
    if (!recognition) {
        alert("Speech recognition is not supported in your browser.");
        return;
    }
    if (isRecording) {
        recognition.stop();
        setIsRecording(false);
    } else {
        recognition.start();
        setIsRecording(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onValueChange(e.target.value);
  };
  
  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((value.trim() || file) && !isLoading) {
      onSendMessage(value);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        onFileChange(selectedFile);
      }
  };

  return (
    <div>
        {file && (
            <div className="mb-2 p-2 bg-slate-700/50 border border-slate-600 rounded-lg flex items-center space-x-3">
                <p className="flex-1 text-sm text-slate-300 truncate">
                    Attached: <span className="font-medium text-slate-100">{file.name}</span>
                </p>
                <button onClick={() => onFileChange(null)} className="p-1 text-slate-400 hover:text-white">
                    <XIcon className="w-4 h-4"/>
                </button>
            </div>
        )}
        <form onSubmit={handleSubmit} className="flex items-end space-x-2 bg-slate-800 border border-slate-700 rounded-xl p-2">
            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="flex-shrink-0 w-10 h-10 rounded-lg text-slate-400 hover:bg-slate-700 hover:text-slate-200 disabled:opacity-50 transition-colors flex items-center justify-center"
                aria-label="Attach file"
            >
                <PaperclipIcon className="w-5 h-5" />
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*,application/pdf" />
             <button
                type="button"
                onClick={handleToggleRecording}
                disabled={isLoading}
                className={`flex-shrink-0 w-10 h-10 rounded-lg hover:bg-slate-700 transition-colors flex items-center justify-center ${isRecording ? 'text-red-500 animate-pulse' : 'text-slate-400'}`}
                aria-label={isRecording ? 'Stop recording' : 'Start recording'}
            >
                <MicrophoneIcon className="w-5 h-5" />
            </button>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Enter patient details here..."
            className="flex-1 bg-transparent text-slate-200 placeholder-slate-500 focus:outline-none resize-none max-h-48 p-2"
            rows={1}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || (!value.trim() && !file)}
            className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            aria-label="Send message"
          >
            <SendIcon className="w-5 h-5 text-white" />
          </button>
        </form>
    </div>
  );
};
