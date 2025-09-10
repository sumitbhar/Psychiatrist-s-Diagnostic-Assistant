
// FIX: Import Content type to be used for chat history.
import { GoogleGenAI, Chat, type Content } from '@google/genai';
import { SYSTEM_INSTRUCTION } from '../constants';
import { type Message, Role } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// FIX: Update initializeChat to accept an optional history parameter.
// This allows restoring a previous chat session.
export const initializeChat = (history?: Content[]): Chat => {
  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    history,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.5,
      topP: 0.9,
    }
  });
  return chat;
};

const SOAP_NOTE_PROMPT = `
Based on the following clinical conversation, generate a concise and structured clinical note in the SOAP format.

**Conversation:**
---
{CONVERSATION_HISTORY}
---

**SOAP Note Structure:**

**S (Subjective):** The patient's subjective report of their symptoms, feelings, and history as described by the clinician. Use direct quotes from the clinician's input where impactful.

**O (Objective):** Objective, observable information. In this text-based context, this section might be limited. Note any observed patterns in language, speech (if described), or behavior mentioned in the conversation. If no objective data is available, state "N/A in this context."

**A (Assessment):** A summary of the key symptoms and the AI's diagnostic analysis based on the conversation. List the primary diagnosis and any differential diagnoses considered.

**P (Plan):** A brief, actionable plan. This should include recommendations for further evaluation, therapeutic interventions, and any medication considerations discussed.

Generate the note now.
`;

export const generateSoapNote = async (messages: Message[]): Promise<string> => {
    // Filter out the initial welcome message and format the history
    const conversationHistory = messages
        .slice(1)
        .map(msg => `${msg.role === Role.USER ? 'Clinician' : 'AI Assistant'}: ${msg.text}`)
        .join('\n\n');

    const prompt = SOAP_NOTE_PROMPT.replace('{CONVERSATION_HISTORY}', conversationHistory);
    
    // Using generateContent for a one-off request
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });

    return response.text;
};
