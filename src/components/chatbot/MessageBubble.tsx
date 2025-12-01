/**
 * MessageBubble - Individual chat message component
 */

import { Bot, User, Volume2, AlertCircle } from 'lucide-react';
import { ChatMessage } from '../../types/chatbot';
import { useVoiceGuide } from '../../contexts/VoiceGuideContext';
import { Button } from '../ui/button';

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const { speak } = useVoiceGuide();
  const isUser = message.sender === 'user';
  const hasError = message.status === 'error';
  const isSending = message.status === 'sending';

  const handleSpeak = () => {
    speak(message.content);
  };

  return (
    <div
      className={`flex gap-3 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
        isUser ? 'flex-row-reverse' : ''
      }`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Message Content */}
      <div className={`flex flex-col gap-1 max-w-[75%] ${isUser ? 'items-end' : ''}`}>
        {/* Message Bubble */}
        <div
          className={`rounded-lg px-4 py-2 break-words ${
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground'
          } ${hasError ? 'bg-destructive/10 border border-destructive' : ''} ${
            isSending ? 'opacity-60' : ''
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>

          {/* Error Message */}
          {hasError && message.error && (
            <div className="flex items-center gap-1 mt-2 text-destructive">
              <AlertCircle className="w-3 h-3" />
              <span className="text-xs">{message.error}</span>
            </div>
          )}

          {/* Loading Indicator */}
          {isSending && (
            <div className="flex items-center gap-1 mt-2">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce"></div>
              </div>
              <span className="text-xs">전송 중...</span>
            </div>
          )}
        </div>

        {/* Timestamp and Actions */}
        <div className={`flex items-center gap-2 px-1 ${isUser ? 'flex-row-reverse' : ''}`}>
          <span className="text-xs text-muted-foreground">
            {message.timestamp.toLocaleTimeString('ko-KR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>

          {/* Voice Playback Button (bot messages only) */}
          {!isUser && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSpeak}
              className="h-6 w-6 p-0"
              aria-label="메시지 읽어주기"
            >
              <Volume2 className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
