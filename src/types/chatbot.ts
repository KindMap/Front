/**
 * Chatbot-related TypeScript type definitions
 */

/**
 * Message sender type
 */
export type MessageSender = 'user' | 'bot';

/**
 * Message status
 */
export type MessageStatus = 'sending' | 'sent' | 'error';

/**
 * Individual chat message
 */
export interface ChatMessage {
  id: string;                    // Unique message ID
  sender: MessageSender;         // 'user' or 'bot'
  content: string;               // Message text
  timestamp: Date;               // When message was sent
  status?: MessageStatus;        // Only for user messages
  error?: string;                // Error message if status is 'error'
}

/**
 * AWS Lambda response payload
 * Since Lambda returns only the answer text, we simplify the response
 */
export interface LambdaResponse {
  answer: string;                // Bot's answer (direct text response)
}

/**
 * Chatbot state
 */
export interface ChatbotState {
  isOpen: boolean;               // Panel open/closed
  isLoading: boolean;            // Loading state for API calls
  messages: ChatMessage[];       // Current conversation messages
  error: string | null;          // Error message
  hasUnread: boolean;            // Badge indicator
}
