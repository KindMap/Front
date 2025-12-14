import React, { useEffect } from 'react';
import { Mic, MicOff, Loader2, Check, X } from 'lucide-react';
import { Button } from './ui/button';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { useVoiceGuide } from '../contexts/VoiceGuideContext';
import { DisabilityType, NavigationRoute } from '../types/navigation';
import { cn } from '../lib/utils';

export interface VoiceInputButtonProps {
  userId: string;
  onStationsRecognized: (origin: string, destination: string) => void;
  onRouteCalculated?: (routes: NavigationRoute[]) => void;
  disabled?: boolean;
  className?: string;
  disabilityType: DisabilityType;
}

export function VoiceInputButton({
  userId,
  onStationsRecognized,
  onRouteCalculated,
  disabled = false,
  className,
  disabilityType
}: VoiceInputButtonProps) {
  const { speak } = useVoiceGuide();

  const {
    state,
    errorMessage,
    transcribedText,
    recordingDuration,
    recognizedStations,
    startRecording,
    stopRecording,
    cancelRecording,
    resetState
  } = useVoiceInput({
    userId,
    disabilityType,
    onStationsRecognized,
    onRouteCalculated
  });

  // TTS 음성 안내
  useEffect(() => {
    if (state === 'recording') {
      speak('음성 인식을 시작합니다. 출발역과 도착역을 말씀하세요.');
    } else if (state === 'success' && recognizedStations) {
      speak(`출발지 ${recognizedStations.origin}, 도착지 ${recognizedStations.destination}이 입력되었습니다.`);
    } else if (state === 'error' && errorMessage) {
      speak(errorMessage);
    }
  }, [state, recognizedStations, errorMessage, speak]);

  // 버튼 클릭 핸들러
  const handleClick = async () => {
    if (disabled) return;

    try {
      if (state === 'idle') {
        // 녹음 시작
        await startRecording();
      } else if (state === 'recording') {
        // 녹음 정지
        await stopRecording();
      } else if (state === 'error') {
        // 에러 상태에서는 초기화
        resetState();
      }
    } catch (error) {
      console.error('[VoiceInputButton] 버튼 클릭 에러:', error);
    }
  };

  // 키보드 핸들러
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    } else if (e.key === 'Escape' && state === 'recording') {
      e.preventDefault();
      cancelRecording();
      speak('녹음이 취소되었습니다.');
    }
  };

  // 상태별 UI 설정
  const getStateConfig = () => {
    switch (state) {
      case 'idle':
        return {
          icon: <Mic className="w-5 h-5" />,
          text: '음성으로 입력',
          variant: 'default' as const,
          className: 'bg-blue-500 hover:bg-blue-600 text-white',
          animation: ''
        };
      case 'requesting':
        return {
          icon: <Loader2 className="w-5 h-5 animate-spin" />,
          text: '권한 요청 중...',
          variant: 'default' as const,
          className: 'bg-blue-500 text-white',
          animation: ''
        };
      case 'recording':
        const seconds = Math.floor(recordingDuration / 1000);
        const ms = Math.floor((recordingDuration % 1000) / 100);
        return {
          icon: <Mic className="w-5 h-5" />,
          text: `녹음 중... ${seconds}:${ms}`,
          variant: 'destructive' as const,
          className: 'bg-red-500 hover:bg-red-600 text-white',
          animation: 'animate-pulse'
        };
      case 'processing':
        return {
          icon: <Loader2 className="w-5 h-5 animate-spin" />,
          text: '처리 중...',
          variant: 'default' as const,
          className: 'bg-blue-500 text-white',
          animation: ''
        };
      case 'transcribing':
        return {
          icon: <Loader2 className="w-5 h-5 animate-spin" />,
          text: '음성 인식 중...',
          variant: 'default' as const,
          className: 'bg-blue-500 text-white',
          animation: ''
        };
      case 'recognizing':
        return {
          icon: <Loader2 className="w-5 h-5 animate-spin" />,
          text: '역 검색 중...',
          variant: 'default' as const,
          className: 'bg-blue-500 text-white',
          animation: ''
        };
      case 'success':
        return {
          icon: <Check className="w-5 h-5" />,
          text: '완료!',
          variant: 'default' as const,
          className: 'bg-green-500 hover:bg-green-600 text-white',
          animation: ''
        };
      case 'error':
        return {
          icon: <X className="w-5 h-5" />,
          text: '실패',
          variant: 'destructive' as const,
          className: 'bg-red-500 hover:bg-red-600 text-white',
          animation: ''
        };
      default:
        return {
          icon: <Mic className="w-5 h-5" />,
          text: '음성으로 입력',
          variant: 'default' as const,
          className: 'bg-blue-500 hover:bg-blue-600 text-white',
          animation: ''
        };
    }
  };

  const stateConfig = getStateConfig();
  const isLoading = ['requesting', 'processing', 'transcribing', 'recognizing'].includes(state);
  const isButtonDisabled = disabled || isLoading;

  // 상태 메시지
  const getStatusMessage = () => {
    if (errorMessage) {
      return errorMessage;
    }
    if (transcribedText && state === 'recognizing') {
      return `인식된 내용: "${transcribedText}"`;
    }
    if (state === 'success' && recognizedStations) {
      return `${recognizedStations.origin} → ${recognizedStations.destination}`;
    }
    return '';
  };

  const statusMessage = getStatusMessage();

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <Button
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        disabled={isButtonDisabled}
        className={cn(
          'flex items-center gap-2 justify-center transition-all',
          stateConfig.className,
          stateConfig.animation
        )}
        aria-label="음성으로 출발지와 도착지 입력"
        aria-pressed={state === 'recording'}
        aria-busy={isLoading}
        type="button"
      >
        {stateConfig.icon}
        <span className="text-sm sm:text-base font-medium">{stateConfig.text}</span>
      </Button>

      {/* 상태 메시지 표시 */}
      {statusMessage && (
        <div
          role="status"
          aria-live="polite"
          className={cn(
            'text-xs sm:text-sm text-center px-2 py-1 rounded',
            errorMessage
              ? 'text-red-600 bg-red-50 border border-red-200'
              : 'text-blue-600 bg-blue-50 border border-blue-200'
          )}
        >
          {statusMessage}
        </div>
      )}
    </div>
  );
}
