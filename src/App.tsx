
import React, { useState, useEffect, useCallback } from 'react';
// FIX: Import Content type for chat history
import { type Chat, type Part, type Content } from '@google/genai';
import { ChatWindow } from './components/ChatWindow';
import { MessageInput } from './components/MessageInput';
import * as geminiService from './services/geminiService';
import * as historyService from './services/historyService';
import { type Message, Role, type ChatRecord } from './types';
import { BrainCircuit } from './components/icons/BrainCircuitIcon';
import { ServiceCards } from './components/ServiceCards';
import { PatientIntakeModal } from './components/PatientIntakeModal';
import { FilePlusIcon } from './components/icons/FilePlusIcon';
import { HistoryIcon } from './components/icons/HistoryIcon';
import { HistoryPanel } from './components/HistoryPanel';
import { SoapNoteModal } from './components/SoapNoteModal';
import { ClipboardDocIcon } from './components/icons/ClipboardDocIcon';

// Helper to convert file to base64
const fileToGenerativePart = async (file: File): Promise<Part> => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      // The result includes the Data URL prefix, so we need to remove it.
      const dataUrl = reader.result as string;
      const base64Data = dataUrl.split(',')[1];
      resolve(base64Data);
    };
    reader.readAsDataURL(file);
  });
  return {
    inlineData: {
      data: await base64EncodedDataPromise,
      mimeType: file.type,
    },
  };
};

const WELCOME_MESSAGE: Message = {
    role: Role.AI,
    text: "Welcome, Doctor. I am your AI Diagnostic Assistant. You can now upload relevant documents or images. Please provide patient symptoms, history, and observations to begin the analysis. All information is processed in-session and not stored. Please do not enter any personally identifiable information.",
};


const App: React.FC = () => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [speakingMessageIndex, setSpeakingMessageIndex] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);
  const [history, setHistory] = useState<ChatRecord[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isSoapModalOpen, setIsSoapModalOpen] = useState(false);
  const [soapNote, setSoapNote] = useState('');
  const [isGeneratingSoapNote, setIsGeneratingSoapNote] = useState(false);


  useEffect(() => {
    try {
      const newChat = geminiService.initializeChat();
      setChat(newChat);
      setHistory(historyService.loadHistory());
    } catch (e) {
      console.error(e);
      setError("Failed to initialize the AI model. Please check your API key and refresh the page.");
    }

    // Cleanup speech synthesis on component unmount
    return () => {
        window.speechSynthesis.cancel();
    }
  }, []);
  
  // Effect to select a clear female voice for text-to-speech
  useEffect(() => {
    const loadAndSetVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length === 0) return; // Voices not loaded yet

        const preferredVoices = ['Google US English', 'Microsoft Zira - English (United States)', 'Samantha'];
        let bestVoice = voices.find(v => preferredVoices.includes(v.name) && v.lang.startsWith('en'));
        if (!bestVoice) bestVoice = voices.find(v => v.lang.startsWith('en-US') && v.name.includes('Female'));
        if (!bestVoice) bestVoice = voices.find(v => v.lang.startsWith('en-US') && !v.name.includes('Male'));
        if (!bestVoice) bestVoice = voices.find(v => v.lang.startsWith('en'));

        setSelectedVoice(bestVoice || null);
    };

    window.speechSynthesis.onvoiceschanged = loadAndSetVoice;
    loadAndSetVoice();
  }, []);
  
  // FIX: Removed incorrect useEffect that was re-initializing the chat on activeChatId change.
  // The chat object should be stateful and hold history. It is now correctly initialized in `handleSelectChat`.

  const handleSendMessage = useCallback(async (text: string) => {
    if (!chat || isLoading || (!text.trim() && !file)) return;

    const userMessage: Message = { role: Role.USER, text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);
    setError(null);
    setInputValue(''); 
    const currentFile = file;
    setFile(null);

    try {
      // FIX: The `history` parameter is not valid for `sendMessageStream`.
      // The chat object maintains its own history.
      const parts: Part[] = [{ text }];
      if (currentFile) {
          const filePart = await fileToGenerativePart(currentFile);
          parts.push(filePart);
      }
      
      const responseStream = await chat.sendMessageStream({
          message: parts
      });
      
      let aiResponseText = '';
      setMessages(prev => [...prev, { role: Role.AI, text: '...' }]);

      for await (const chunk of responseStream) {
        aiResponseText += chunk.text;
        setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: Role.AI, text: aiResponseText };
            return updated;
        });
      }

      const finalMessages = [...newMessages, { role: Role.AI, text: aiResponseText }];

      // Save to history
      let currentChatId = activeChatId;
      if (!currentChatId) {
          currentChatId = historyService.generateChatId();
          setActiveChatId(currentChatId);
      }
      
      const updatedRecord = historyService.saveRecord({
        id: currentChatId,
        title: text, // The service will truncate this
        messages: finalMessages,
      });

      setHistory(prev => {
          const existing = prev.find(r => r.id === updatedRecord.id);
          if (existing) {
              return prev.map(r => r.id === updatedRecord.id ? updatedRecord : r);
          }
          return [updatedRecord, ...prev];
      });

    } catch (e) {
      console.error(e);
      const errorMessage = "Sorry, I encountered an error while processing your request. Please try again.";
      setError(errorMessage);
       setMessages(prev => [...prev, { role: Role.AI, text: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  }, [chat, isLoading, file, messages, activeChatId]);
  
  const handleToggleSpeech = useCallback((index: number, text: string) => {
    if (speakingMessageIndex === index) {
        window.speechSynthesis.cancel();
        setSpeakingMessageIndex(null);
    } else {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }
        utterance.onend = () => setSpeakingMessageIndex(null);
        setSpeakingMessageIndex(index);
        window.speechSynthesis.speak(utterance);
    }
  }, [speakingMessageIndex, selectedVoice]);

  const handleCardClick = (prompt: string) => {
    setInputValue(prompt);
  };
  
  const handleFormSubmit = (formattedText: string) => {
    setInputValue(formattedText);
    setIsModalOpen(false);
  };
  
  const handleNewChat = () => {
    setActiveChatId(null);
    setMessages([WELCOME_MESSAGE]);
    setChat(geminiService.initializeChat()); // Get a fresh chat instance
    setIsHistoryPanelOpen(false);
  };
  
  const handleSelectChat = (id: string) => {
    const record = historyService.getRecord(id);
    if (record) {
      setActiveChatId(id);
      setMessages(record.messages);
      
      // FIX: When loading a chat, re-initialize the chat object with its history.
      const historyForChat: Content[] = record.messages
        .slice(1) // Exclude the initial AI welcome message
        .map((msg) => ({
            role: msg.role === Role.AI ? 'model' : 'user',
            parts: [{ text: msg.text }],
        }));

      setChat(geminiService.initializeChat(historyForChat));
      setIsHistoryPanelOpen(false);
    }
  };
  
  const handleDeleteChat = (id: string) => {
    const updatedHistory = historyService.deleteRecordFromHistory(id);
    setHistory(updatedHistory);
    if (activeChatId === id) {
      handleNewChat();
    }
  };

  const handleGenerateSoapNote = async () => {
    if (messages.length < 3) return; // Need at least one user/AI exchange
    
    setIsSoapModalOpen(true);
    setIsGeneratingSoapNote(true);
    setSoapNote('');

    try {
        const note = await geminiService.generateSoapNote(messages);
        setSoapNote(note);
    } catch (e) {
        console.error("Failed to generate SOAP note:", e);
        setSoapNote("Error: Could not generate the note. Please try again.");
    } finally {
        setIsGeneratingSoapNote(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-200 font-sans">
      <HistoryPanel
        isOpen={isHistoryPanelOpen}
        onClose={() => setIsHistoryPanelOpen(false)}
        records={history}
        activeChatId={activeChatId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
      />
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 p-4 shadow-md sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-between">
           <div className="flex items-center space-x-3">
             <button
                onClick={() => setIsHistoryPanelOpen(true)}
                className="p-2 rounded-md hover:bg-slate-700 transition-colors"
                aria-label="Open patient history"
             >
                <HistoryIcon className="w-6 h-6 text-slate-400" />
             </button>
             <div className="flex items-center space-x-3">
                <BrainCircuit className="w-8 h-8 text-cyan-400" />
                <h1 className="text-xl font-bold text-slate-100 tracking-wide">Psychiatrist's Diagnostic Assistant</h1>
            </div>
           </div>
            <div className="flex items-center space-x-2">
                 <button 
                    onClick={handleGenerateSoapNote}
                    disabled={messages.length < 3 || isGeneratingSoapNote}
                    className="flex items-center space-x-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold px-4 py-2 rounded-lg transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
                    aria-label="Generate SOAP note for the current session"
                >
                    <ClipboardDocIcon className="w-5 h-5" />
                    <span>Generate SOAP Note</span>
                </button>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
                    aria-label="Create new patient record"
                >
                    <FilePlusIcon className="w-5 h-5" />
                    <span>New Patient Record</span>
                </button>
            </div>
        </div>
      </header>
      
      <main className="flex-1 overflow-hidden">
        <ChatWindow 
            messages={messages} 
            isLoading={isLoading}
            speakingMessageIndex={speakingMessageIndex}
            onToggleSpeech={handleToggleSpeech}
        />
      </main>

      <footer className="p-4 bg-slate-900 border-t border-slate-700">
        <div className="container mx-auto max-w-4xl">
           {error && <p className="text-red-400 text-center mb-2 text-sm">{error}</p>}
           {messages.length <= 1 && !inputValue && <ServiceCards onCardClick={handleCardClick} />}
          <MessageInput 
            onSendMessage={handleSendMessage} 
            isLoading={isLoading}
            file={file}
            onFileChange={setFile}
            value={inputValue}
            onValueChange={setInputValue}
            />
          <p className="text-xs text-slate-500 mt-3 text-center">
            This AI tool is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of a qualified health provider.
          </p>
        </div>
      </footer>

      <PatientIntakeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
      />
      <SoapNoteModal
        isOpen={isSoapModalOpen}
        onClose={() => setIsSoapModalOpen(false)}
        note={soapNote}
        isLoading={isGeneratingSoapNote}
      />
    </div>
  );
};

export default App;
