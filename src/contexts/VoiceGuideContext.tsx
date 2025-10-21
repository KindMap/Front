import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface VoiceGuideContextType {
  isVoiceGuideEnabled: boolean;
  toggleVoiceGuide: () => void;
  speak: (text: string) => void;
}

const VoiceGuideContext = createContext<VoiceGuideContextType | undefined>(undefined);

export function VoiceGuideProvider({ children }: { children: ReactNode }) {
  const [isVoiceGuideEnabled, setIsVoiceGuideEnabled] = useState<boolean>(false);

  // localStorage 제거 - 항상 디폴트 false로 시작

  const toggleVoiceGuide = () => {
    setIsVoiceGuideEnabled(prev => !prev);
  };

  /**
   * 음성으로 텍스트를 읽어주는 함수
   * TODO: AWS Polly와 연동
   */
  const speak = (text: string) => {
    if (!isVoiceGuideEnabled) return;
    
    // 현재는 Web Speech API 사용 (임시)
    // 추후 AWS Polly로 교체 예정
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <VoiceGuideContext.Provider value={{ isVoiceGuideEnabled, toggleVoiceGuide, speak }}>
      {children}
    </VoiceGuideContext.Provider>
  );
}

export function useVoiceGuide() {
  const context = useContext(VoiceGuideContext);
  if (context === undefined) {
    throw new Error('useVoiceGuide must be used within a VoiceGuideProvider');
  }
  return context;
}
