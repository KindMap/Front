/**
 * ChatbotPanel - Main chat panel using Sheet component
 */

import { useEffect, useRef } from 'react';
import { Trash2, MessageCircle } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '../ui/sheet';
import { ScrollArea } from '../ui/scroll-area';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { useChatbot } from '../../contexts/ChatbotContext';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';

export function ChatbotPanel() {
  const {
    isOpen,
    messages,
    isLoading,
    error,
    sendMessage,
    clearHistory,
    closeChatbot,
    markAsRead,
  } = useChatbot();

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Mark as read when panel opens
  useEffect(() => {
    if (isOpen) {
      markAsRead();
    }
  }, [isOpen, markAsRead]);

  const handleClearHistory = () => {
    if (window.confirm('대화 기록을 모두 삭제하시겠습니까?')) {
      clearHistory();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={closeChatbot}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        {/* Header */}
        <SheetHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg font-semibold">
              AI 도우미
            </SheetTitle>

            <div className="flex items-center gap-2">
              {/* Clear History Button */}
              {messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClearHistory}
                  aria-label="대화 기록 삭제"
                  className="h-8 w-8"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </SheetHeader>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mx-4 mt-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Messages Area */}
        <ScrollArea className="flex-1 px-4" ref={scrollRef}>
          <div className="py-4">
            {messages.length === 0 ? (
              // Empty State
              <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <MessageCircle className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  무엇을 도와드릴까요?
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  궁금하신 점을 물어보세요. 친절하게 답변해드리겠습니다.
                </p>
              </div>
            ) : (
              // Message List
              messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))
            )}

            {/* Loading Indicator */}
            {isLoading && messages[messages.length - 1]?.sender === 'user' && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                </div>
                <span className="text-sm">AI가 답변을 작성 중입니다...</span>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <ChatInput
          onSend={sendMessage}
          isLoading={isLoading}
          placeholder="메시지를 입력하세요..."
        />
      </SheetContent>
    </Sheet>
  );
}
