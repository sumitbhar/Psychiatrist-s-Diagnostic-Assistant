
export enum Role {
  USER = 'user',
  AI = 'ai',
}

export interface Message {
  role: Role;
  text: string;
}

export interface ChatRecord {
  id: string;
  title: string;
  timestamp: number;
  messages: Message[];
}
