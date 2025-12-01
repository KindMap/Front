/**
 * ChatInput - Message input area with send button
 */

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
}

export function ChatInput({
  onSend,
  isLoading,
  disabled = false,
  placeholder = "메시지를 입력하세요...",
  maxLength = 500,
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleSend = () => {
    if (message.trim() && !isLoading && !disabled) {
      onSend(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter to send (Shift+Enter for new line)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isDisabled = disabled || isLoading;
  const canSend = message.trim().length > 0 && !isDisabled;

  return (
    <div className="border-t bg-background p-3 sm:p-4">
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, maxLength))}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isDisabled}
            className="min-h-[44px] max-h-[120px] resize-none pr-12 focus-visible:ring-2"
            aria-label="메시지 입력"
          />

          {/* Character Count */}
          {message.length > maxLength * 0.8 && (
            <span
              className={`absolute bottom-2 right-2 text-xs ${
                message.length >= maxLength ? 'text-destructive' : 'text-muted-foreground'
              }`}
            >
              {message.length}/{maxLength}
            </span>
          )}
        </div>

        <Button
          onClick={handleSend}
          disabled={!canSend}
          size="icon"
          className="h-11 w-11 flex-shrink-0"
          aria-label="메시지 전송"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {/* Helper Text */}
      <p className="text-xs text-muted-foreground mt-2 hidden sm:block">
        <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Enter</kbd>로 전송,{' '}
        <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Shift+Enter</kbd>로 줄바꿈
      </p>
    </div>
  );
}
