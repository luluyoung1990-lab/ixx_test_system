
export interface LogEntry {
  id: string;
  index: number;
  userName: string;
  userAccount: string;
  department: string;
  content: string;
  source: string;
  isOnline: number; // 0 or 1
  isKnowledgeBase: number; // 0 or 1
  isFileQA: number; // 0 or 1
  isDeepThinking?: number; // 0 or 1
  intentType: string;
  thinkingProcess: string;
  answerContent: string;
  chatId: string;
  questionId: string;
  answerId: string;
  isAddedToEval?: boolean;
  userType: 'normal' | 'test';
}

export interface EvaluationEntry {
  id: string;
  userName: string;
  content: string;
  answerContent: string;
  source: string;
  isOnline: number;
  isFileQA: number;
  isKnowledgeBase: number;
  isDeepThinking: number;
  joinedDate: string;
  batchDate?: string;
  status: 'pending' | 'completed';
  modelScore: number; // 0-5
  humanScore: number; // 0-5
  remark?: string; // New field for user notes
  isReAdded?: boolean;
}
