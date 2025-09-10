
import { type ChatRecord } from '../types';

const HISTORY_KEY = 'psychiatrist_chat_history';

/**
 * Loads all chat records from localStorage.
 * @returns {ChatRecord[]} An array of chat records, sorted by most recent first.
 */
export const loadHistory = (): ChatRecord[] => {
  try {
    const storedHistory = localStorage.getItem(HISTORY_KEY);
    if (storedHistory) {
      const records: ChatRecord[] = JSON.parse(storedHistory);
      // Sort by timestamp descending (newest first)
      return records.sort((a, b) => b.timestamp - a.timestamp);
    }
  } catch (error) {
    console.error("Failed to load or parse chat history:", error);
  }
  return [];
};

/**
 * Saves the entire history of chat records to localStorage.
 * @param {ChatRecord[]} records The array of records to save.
 */
const saveHistory = (records: ChatRecord[]): void => {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(records));
  } catch (error) {
    console.error("Failed to save chat history:", error);
  }
};

/**
 * Creates or updates a single chat record.
 * @param {{ id: string, title: string, messages: any[] }} recordData The data for the record.
 * @returns {ChatRecord} The newly created or updated record.
 */
export const saveRecord = (recordData: { id: string; title: string; messages: any[] }): ChatRecord => {
  const history = loadHistory();
  const existingIndex = history.findIndex(r => r.id === recordData.id);
  
  const title = recordData.title.split(' ').slice(0, 5).join(' ') + (recordData.title.split(' ').length > 5 ? '...' : '');

  const newRecord: ChatRecord = {
    ...recordData,
    title,
    timestamp: Date.now(),
  };

  if (existingIndex !== -1) {
    history[existingIndex] = newRecord;
  } else {
    history.push(newRecord);
  }

  saveHistory(history);
  return newRecord;
};

/**
 * Retrieves a single record by its ID.
 * @param {string} id The ID of the record to retrieve.
 * @returns {ChatRecord | undefined} The found record or undefined.
 */
export const getRecord = (id: string): ChatRecord | undefined => {
  const history = loadHistory();
  return history.find(r => r.id === id);
};

/**
 * Deletes a record from history by its ID.
 * @param {string} id The ID of the record to delete.
 * @returns {ChatRecord[]} The updated history after deletion.
 */
export const deleteRecordFromHistory = (id: string): ChatRecord[] => {
    let history = loadHistory();
    history = history.filter(record => record.id !== id);
    saveHistory(history);
    return history;
};

/**
 * Generates a unique ID for a new chat session.
 * @returns {string} A unique identifier string.
 */
export const generateChatId = (): string => {
    return `chat_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};
