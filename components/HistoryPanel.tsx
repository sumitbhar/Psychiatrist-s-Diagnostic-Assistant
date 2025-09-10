import React from 'react';
import { type ChatRecord } from '../types';
import { FilePlusIcon } from './icons/FilePlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { XIcon } from './icons/XIcon';
import { DownloadIcon } from './icons/DownloadIcon';

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  records: ChatRecord[];
  activeChatId: string | null;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  isOpen,
  onClose,
  records,
  activeChatId,
  onNewChat,
  onSelectChat,
  onDeleteChat,
}) => {

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent onSelectChat from firing
    if (window.confirm('Are you sure you want to delete this record? This action cannot be undone.')) {
      onDeleteChat(id);
    }
  };

  const handleDownload = (e: React.MouseEvent, record: ChatRecord) => {
    e.stopPropagation();

    const formattedContent = record.messages
      .map(msg => {
        const prefix = msg.role === 'user' ? 'Clinician' : 'AI Assistant';
        return `${prefix}:\n${msg.text}\n\n--------------------\n\n`;
      })
      .join('');
    
    const blob = new Blob([formattedContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    // Sanitize title for filename
    const sanitizedTitle = record.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `session_${sanitizedTitle}_${record.timestamp}.txt`;
    
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      {/* Panel */}
      <div 
        className={`fixed top-0 left-0 h-full w-72 bg-slate-800 border-r border-slate-700 shadow-xl z-30 transform transition-transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-panel-title"
      >
        <div className="flex flex-col h-full">
          <header className="flex items-center justify-between p-4 border-b border-slate-700 flex-shrink-0">
            <h2 id="history-panel-title" className="text-lg font-semibold text-slate-100">Patient History</h2>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-full hover:bg-slate-700" aria-label="Close history panel">
                <XIcon className="w-5 h-5"/>
            </button>
          </header>

          <div className="p-2 flex-shrink-0">
            <button
              onClick={onNewChat}
              className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              <FilePlusIcon className="w-5 h-5" />
              <span>New Patient Record</span>
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-2">
            {records.length > 0 ? (
                <ul className="space-y-1">
                {records.map(record => (
                    <li key={record.id}>
                    <button
                        onClick={() => onSelectChat(record.id)}
                        className={`w-full text-left p-2 rounded-md group transition-colors ${activeChatId === record.id ? 'bg-slate-700' : 'hover:bg-slate-700/50'}`}
                    >
                        <div className="flex justify-between items-start">
                           <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-200 truncate">{record.title}</p>
                                <p className="text-xs text-slate-400">{formatDate(record.timestamp)}</p>
                           </div>
                            <div className="flex items-center flex-shrink-0 ml-2">
                                <button 
                                    onClick={(e) => handleDownload(e, record)}
                                    className="p-1 text-slate-500 hover:text-cyan-400 rounded-md opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                                    aria-label={`Download record: ${record.title}`}
                                >
                                    <DownloadIcon className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={(e) => handleDelete(e, record.id)}
                                    className="p-1 text-slate-500 hover:text-red-400 rounded-md opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                                    aria-label={`Delete record: ${record.title}`}
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </button>
                    </li>
                ))}
                </ul>
            ) : (
                <p className="text-center text-sm text-slate-500 p-4">No records found.</p>
            )}
          </nav>
        </div>
      </div>
    </>
  );
};