/**
 * ChatbotFloatingButton - Floating action button (FAB)
 *
 * Features:
 * - Fixed position at bottom-right corner
 * - Badge for unread messages
 * - Smooth animations
 * - Accessible
 */

import { MessageCircle } from 'lucide-react';
import { useChatbot } from '../../contexts/ChatbotContext';

export function ChatbotFloatingButton() {
  const { toggleChatbot, hasUnread, isOpen } = useChatbot();

  console.log('[ChatbotFloatingButton] Rendering:', { isOpen, hasUnread });

  return (
    <button
      onClick={toggleChatbot}
      className="fixed bottom-20 sm:bottom-24 right-3 sm:right-4 z-[9999] h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-xl hover:shadow-2xl transition-all duration-200 flex items-center justify-center"
      style={{ 
        position: 'fixed', 
        zIndex: 9999,
        bottom: '80px',
        right: '12px',
        width: '48px',
        height: '48px',
        backgroundColor: '#2563eb',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer'
      }}
      aria-label="챗봇 열기"
      aria-expanded={isOpen}
      type="button"
    >
      <MessageCircle className="w-6 h-6 text-white" />
      <span style={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}>💬</span>
      {hasUnread && !isOpen && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse">
          <span className="sr-only">새 메시지</span>
        </div>
      )}
    </button>
  );
}
