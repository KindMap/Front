import { useState, useEffect, useCallback, useRef } from 'react';
import { AudioRecorder } from '../services/audioRecorder';
import { WebSocketService } from '../services/websocketService';
import {
  DisabilityType,
  TranscriptionStartedMessage,
  TranscriptionCompleteMessage,
  StationsRecognizedMessage,
  ErrorMessage,
  NavigationRoute
} from '../types/navigation';

export type VoiceInputState =
  | 'idle'
  | 'requesting'
  | 'recording'
  | 'processing'
  | 'transcribing'
  | 'recognizing'
  | 'success'
  | 'error';

export interface UseVoiceInputReturn {
  state: VoiceInputState;
  errorMessage: string | null;
  transcribedText: string | null;
  confidence: number | null;
  recognizedStations: { origin: string; destination: string } | null;
  recordingDuration: number;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  cancelRecording: () => void;
  resetState: () => void;
}

export interface UseVoiceInputOptions {
  userId: string;
  disabilityType: DisabilityType;
  onStationsRecognized?: (origin: string, destination: string) => void;
  onRouteCalculated?: (routes: NavigationRoute[]) => void;
}

export function useVoiceInput(options: UseVoiceInputOptions): UseVoiceInputReturn {
  const { userId, disabilityType, onStationsRecognized, onRouteCalculated } = options;

  const [state, setState] = useState<VoiceInputState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [transcribedText, setTranscribedText] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [recognizedStations, setRecognizedStations] = useState<{ origin: string; destination: string } | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const wsServiceRef = useRef<WebSocketService | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // WebSocket 서비스 초기화
  useEffect(() => {
    wsServiceRef.current = new WebSocketService(userId);

    // WebSocket 연결
    wsServiceRef.current.connect(userId).catch((error) => {
      console.error('[useVoiceInput] WebSocket 연결 실패:', error);
    });

    return () => {
      if (wsServiceRef.current) {
        wsServiceRef.current.offAll();
      }
    };
  }, [userId]);

  // WebSocket 메시지 핸들러 등록
  useEffect(() => {
    const wsService = wsServiceRef.current;
    if (!wsService) return;

    // 음성 인식 시작
    wsService.on('transcription_started', (msg: TranscriptionStartedMessage) => {
      console.log('[useVoiceInput] 음성 인식 시작:', msg.message);
      setState('transcribing');
    });

    // 음성 인식 완료
    wsService.on('transcription_complete', (msg: TranscriptionCompleteMessage) => {
      console.log('[useVoiceInput] 음성 인식 완료:', msg.transcribed_text);
      setTranscribedText(msg.transcribed_text);
      setConfidence(msg.confidence);
      setState('recognizing');
    });

    // 역 인식 완료
    wsService.on('stations_recognized', (msg: StationsRecognizedMessage) => {
      console.log('[useVoiceInput] 역 인식 완료:', msg.origin, '->', msg.destination);
      const stations = {
        origin: msg.origin,
        destination: msg.destination
      };
      setRecognizedStations(stations);
      setState('success');

      // 콜백 호출
      if (onStationsRecognized) {
        onStationsRecognized(msg.origin, msg.destination);
      }

      // 3초 후 상태 초기화
      setTimeout(() => {
        resetState();
      }, 3000);
    });

    // 경로 계산 완료 (백엔드가 자동으로 계산한 경우)
    wsService.on('route_calculated', (msg: any) => {
      console.log('[useVoiceInput] 경로 계산 완료:', msg.routes?.length);
      if (onRouteCalculated && msg.routes) {
        onRouteCalculated(msg.routes);
      }
    });

    // 에러 처리
    wsService.on('error', (msg: ErrorMessage) => {
      console.error('[useVoiceInput] 에러:', msg.message);
      setErrorMessage(msg.message);
      setState('error');

      // 5초 후 상태 초기화
      setTimeout(() => {
        resetState();
      }, 5000);
    });

    return () => {
      wsService.offAll();
    };
  }, [onStationsRecognized, onRouteCalculated]);

  // 녹음 시간 업데이트
  useEffect(() => {
    if (state === 'recording') {
      durationIntervalRef.current = setInterval(() => {
        if (audioRecorderRef.current) {
          setRecordingDuration(audioRecorderRef.current.getRecordingDuration());
        }
      }, 100);
    } else {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
      setRecordingDuration(0);
    }

    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, [state]);

  // 녹음 시작
  const startRecording = useCallback(async () => {
    try {
      // 브라우저 지원 체크
      if (!AudioRecorder.checkSupport()) {
        setErrorMessage('음성 인식은 Chrome, Edge, Safari 브라우저에서만 지원됩니다');
        setState('error');
        return;
      }

      // WebSocket 연결 확인
      if (!wsServiceRef.current?.isConnected()) {
        setErrorMessage('서버 연결에 실패했습니다. 네트워크를 확인해주세요');
        setState('error');
        return;
      }

      setState('requesting');

      // AudioRecorder 생성
      audioRecorderRef.current = new AudioRecorder({
        maxDuration: 10000, // 10초
        sampleRate: 16000
      });

      // 마이크 권한 요청
      const hasPermission = await audioRecorderRef.current.requestPermission();
      if (!hasPermission) {
        setErrorMessage('마이크 권한이 필요합니다. 브라우저 설정에서 권한을 허용해주세요');
        setState('error');
        return;
      }

      // 녹음 시작
      setState('recording');
      await audioRecorderRef.current.startRecording();

      console.log('[useVoiceInput] 녹음 시작됨');

      // 10초 후 자동 정지 (또는 사용자가 수동으로 정지할 때까지)
      // AudioRecorder 내부에서 자동으로 처리되므로 여기서는 별도 타이머 불필요

    } catch (error: any) {
      console.error('[useVoiceInput] 녹음 시작 실패:', error);
      setErrorMessage(error.message || '녹음을 시작할 수 없습니다');
      setState('error');
    }
  }, []);

  // 녹음 정지 및 전송
  const stopRecordingAndSend = useCallback(async () => {
    if (!audioRecorderRef.current || state !== 'recording') {
      return;
    }

    try {
      setState('processing');

      // 녹음 정지 및 Base64 데이터 가져오기
      const audioData = await audioRecorderRef.current.stopRecording();

      console.log('[useVoiceInput] 녹음 완료, 서버로 전송 중...');

      // WebSocket으로 전송
      if (wsServiceRef.current) {
        const format = AudioRecorder.getSupportedMimeType()?.split(';')[0].split('/')[1] || 'webm';
        wsServiceRef.current.sendVoiceInput(audioData, format, 16000);
      } else {
        throw new Error('WebSocket 연결이 없습니다');
      }

      // 음성 인식 대기 상태로 전환 (서버 응답 대기)
      // setState는 서버 메시지 핸들러에서 처리됨

    } catch (error: any) {
      console.error('[useVoiceInput] 녹음 정지 실패:', error);
      setErrorMessage(error.message || '음성 전송에 실패했습니다');
      setState('error');
    }
  }, [state]);

  // 녹음 취소
  const cancelRecording = useCallback(() => {
    console.log('[useVoiceInput] 녹음 취소됨');

    if (audioRecorderRef.current) {
      audioRecorderRef.current.cancelRecording();
      audioRecorderRef.current = null;
    }

    resetState();
  }, []);

  // 상태 초기화
  const resetState = useCallback(() => {
    setState('idle');
    setErrorMessage(null);
    setTranscribedText(null);
    setConfidence(null);
    setRecognizedStations(null);
    setRecordingDuration(0);

    if (audioRecorderRef.current) {
      audioRecorderRef.current.cancelRecording();
      audioRecorderRef.current = null;
    }
  }, []);

  // 녹음 중일 때 자동으로 정지 처리 (사용자가 버튼을 다시 클릭하는 방식)
  // 실제로는 버튼 컴포넌트에서 state가 'recording'일 때 stopRecordingAndSend를 호출하도록 구현

  return {
    state,
    errorMessage,
    transcribedText,
    confidence,
    recognizedStations,
    recordingDuration,
    startRecording,
    stopRecording: stopRecordingAndSend,
    cancelRecording,
    resetState,
  };
}