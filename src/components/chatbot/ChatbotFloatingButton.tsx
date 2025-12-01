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
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useChatbot } from '../../contexts/ChatbotContext';

export function ChatbotFloatingButton() {
  const { toggleChatbot, hasUnread, isOpen } = useChatbot();

  console.log('[ChatbotFloatingButton] Rendering:', { isOpen, hasUnread });

  return (
    <div className="fixed bottom-20 right-4 z-[100]" style={{ position: 'fixed', bottom: '5rem', right: '1rem', zIndex: 100 }}>
      <div className="relative">
        <Button
          size="icon"
          variant="outline"
          onClick={toggleChatbot}
          className="shadow-lg bg-white hover:bg-gray-100"
          aria-label="챗봇 열기"
          aria-expanded={isOpen}
        >
          <MessageCircle className="w-5 h-5 text-blue-600" />
        </Button>
        {hasUnread && !isOpen && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white">
            <span className="sr-only">새 메시지</span>
          </div>
        )}
      </div>
    </div>
  );
}
