/**
 * ChatbotContext - Global chatbot state management
 *
 * Provides:
 * - Message state management
 * - AWS Lambda integration
 * - Voice guide integration
 */

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useVoiceGuide } from './VoiceGuideContext';
import { ChatMessage, ChatbotState } from '../types/chatbot';
import { sendMessageToLambda } from '../services/chatbotApi';

interface ChatbotContextType extends ChatbotState {
  sendMessage: (message: string) => Promise<void>;
  clearHistory: () => void;
  toggleChatbot: () => void;
  markAsRead: () => void;
  closeChatbot: () => void;
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

export function ChatbotProvider({ children }: { children: ReactNode }) {
  const { speak } = useVoiceGuide();

  const [state, setState] = useState<ChatbotState>({
    isOpen: false,
    isLoading: false,
    messages: [],
    error: null,
    hasUnread: false,
  });

  console.log('[ChatbotProvider] Initialized');

  /**
   * Generate unique message ID
   */
  const generateMessageId = useCallback(() => {
    return `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }, []);

  /**
   * Send a message to AWS Lambda and get response
   */
  const sendMessage = useCallback(
    async (messageContent: string) => {
      if (!messageContent.trim()) return;

      const userMessage: ChatMessage = {
        id: generateMessageId(),
        sender: 'user',
        content: messageContent.trim(),
        timestamp: new Date(),
        status: 'sending',
      };

      // Add user message to state
      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, userMessage],
        isLoading: true,
        error: null,
      }));

      try {
        // Call AWS Lambda
        const responseText = await sendMessageToLambda(messageContent.trim());

        // Update user message status
        setState((prev) => ({
          ...prev,
          messages: prev.messages.map((msg) =>
            msg.id === userMessage.id
              ? { ...msg, status: 'sent' as const }
              : msg
          ),
        }));

        // Add bot response
        const botMessage: ChatMessage = {
          id: generateMessageId(),
          sender: 'bot',
          content: responseText,
          timestamp: new Date(),
        };

        console.log('[Chatbot] Bot message created:', {
          id: botMessage.id,
          contentLength: botMessage.content.length,
          hasNewlines: botMessage.content.includes('\n'),
          preview: botMessage.content.substring(0, 100),
        });

        setState((prev) => ({
          ...prev,
          messages: [...prev.messages, botMessage],
          isLoading: false,
          hasUnread: !prev.isOpen, // Set unread if panel is closed
        }));

        // Voice guide: Speak bot response
        speak(responseText);
      } catch (error) {
        console.error('[Chatbot] sendMessage failed:', error);

        // Update user message with error status
        setState((prev) => ({
          ...prev,
          messages: prev.messages.map((msg) =>
            msg.id === userMessage.id
              ? {
                  ...msg,
                  status: 'error' as const,
                  error: error instanceof Error ? error.message : '메시지 전송에 실패했습니다',
                }
              : msg
          ),
          isLoading: false,
          error: error instanceof Error ? error.message : '챗봇 응답을 받아오는데 실패했습니다',
        }));
      }
    },
    [generateMessageId, speak]
  );

  /**
   * Clear current conversation
   */
  const clearHistory = useCallback(() => {
    setState((prev) => ({
      ...prev,
      messages: [],
      error: null,
    }));
    console.log('[Chatbot] History cleared');
  }, []);

  /**
   * Toggle chatbot panel
   */
  const toggleChatbot = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isOpen: !prev.isOpen,
      hasUnread: prev.isOpen ? prev.hasUnread : false, // Clear unread when opening
    }));
  }, []);

  /**
   * Close chatbot panel
   */
  const closeChatbot = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isOpen: false,
    }));
  }, []);

  /**
   * Mark messages as read
   */
  const markAsRead = useCallback(() => {
    setState((prev) => ({
      ...prev,
      hasUnread: false,
    }));
  }, []);

  return (
    <ChatbotContext.Provider
      value={{
        ...state,
        sendMessage,
        clearHistory,
        toggleChatbot,
        markAsRead,
        closeChatbot,
      }}
    >
      {children}
    </ChatbotContext.Provider>
  );
}

/**
 * useChatbot hook
 *
 * @example
 * const { messages, sendMessage, isLoading, toggleChatbot } = useChatbot();
 */
export function useChatbot() {
  const context = useContext(ChatbotContext);
  if (!context) {
    throw new Error('useChatbot must be used within ChatbotProvider');
  }
  return context;
}
