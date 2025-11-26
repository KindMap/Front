import {
  StartNavigationMessage,
  LocationUpdateMessage,
  SwitchRouteMessage,
  RecalculateRouteMessage,
  WebSocketMessageType,
  ClientMessage,
  ServerMessage,
  DisabilityType
} from '../types/navigation';
import { tokenManager } from './tokenManager';

export class WebSocketService {
  private ws: WebSocket | null = null;
  private userId: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private pingInterval: NodeJS.Timeout | null = null;
  private messageHandlers: Map<WebSocketMessageType, (data: any) => void> = new Map();
  private reconnectDelay = 1000;
  private isManualClose = false;
  private messageQueue: ClientMessage[] = []; // 연결 끊김 시 메시지 저장

  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * WebSocket 연결
   * @param userId 연결할 사용자 ID (선택적, 제공되지 않으면 기존 userId 사용)
   */
  connect(userId?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // userId가 제공되면 업데이트
      if (userId) {
        // userId가 변경되었으면 기존 연결 종료
        if (this.userId !== userId && this.isConnected()) {
          console.log('[WebSocket] userId 변경 감지, 기존 연결 종료:', this.userId, '->', userId);
          this.disconnect();
        }
        this.userId = userId;
      }

      // 이미 연결되어 있으면 바로 resolve
      if (this.isConnected()) {
        console.log('[WebSocket] 이미 연결됨');
        resolve();
        return;
      }

      // JWT 토큰 가져오기
      const token = tokenManager.getAccessToken();

      // 포트 번호 8001 추가, JWT 토큰을 query parameter로 전달
      let wsUrl = `${import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8001'}/api/v1/ws/${this.userId}`;
      if (token) {
        wsUrl += `?token=${token}`;
      }

      console.log('[WebSocket] 연결 시도:', wsUrl.replace(/token=[^&]+/, 'token=***'));

      try {
        this.ws = new WebSocket(wsUrl);
      } catch (error) {
        console.error('[WebSocket] 연결 생성 실패:', error);
        reject(error);
        return;
      }

      this.ws.onopen = () => {
        console.log('[WebSocket] 연결됨');
        this.reconnectAttempts = 0;
        this.isManualClose = false;
        this.startPingInterval();

        // 연결 성공 시 큐에 저장된 메시지 전송
        this.flushMessageQueue();

        resolve();
      };

      this.ws.onmessage = (event) => {
        try {
          const message: ServerMessage = JSON.parse(event.data);
          console.log('[WebSocket] 메시지 수신:', message.type);
          this.handleMessage(message);
        } catch (error) {
          console.error('[WebSocket] 메시지 파싱 에러:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('[WebSocket] 에러:', error);
        // 연결이 아직 열리지 않았을 때 에러 발생 시에만 reject
        if (this.ws?.readyState === WebSocket.CONNECTING) {
          reject(error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('[WebSocket] 연결 종료:', event.code, event.reason);
        this.stopPingInterval();

        // 수동으로 닫은 경우가 아니면 재연결 시도
        if (!this.isManualClose) {
          this.attemptReconnect();
        }
      };
    });
  }

  /**
   * 메시지 핸들러 등록
   */
  on(type: WebSocketMessageType, handler: (data: any) => void): void {
    this.messageHandlers.set(type, handler);
  }

  /**
   * 메시지 핸들러 제거
   */
  off(type: WebSocketMessageType): void {
    this.messageHandlers.delete(type);
  }

  /**
   * 모든 핸들러 제거
   */
  offAll(): void {
    this.messageHandlers.clear();
  }

  /**
   * 메시지 전송 (연결 끊김 시 큐에 저장)
   */
  private send(message: ClientMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
      console.log('[WebSocket] 메시지 전송:', message.type);
    } else {
      console.warn('[WebSocket] 연결되지 않음, 메시지 큐에 저장:', message.type);
      // ping 메시지는 큐에 저장하지 않음
      if (message.type !== 'ping') {
        this.messageQueue.push(message);
        // 큐 크기 제한 (최대 50개)
        if (this.messageQueue.length > 50) {
          this.messageQueue.shift();
        }
      }
    }
  }

  /**
   * 메시지 큐 비우기 (연결 성공 시)
   */
  private flushMessageQueue(): void {
    if (this.messageQueue.length > 0) {
      console.log('[WebSocket] 큐에 저장된 메시지 전송:', this.messageQueue.length);
      while (this.messageQueue.length > 0) {
        const message = this.messageQueue.shift();
        if (message && this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify(message));
        }
      }
    }
  }

  /**
   * 내비게이션 시작
   */
  startNavigation(origin: string, destination: string, disabilityType: DisabilityType = 'PHY'): void {
    const message: StartNavigationMessage = {
      type: 'start_navigation',
      origin,
      destination,
      disability_type: disabilityType,
    };
    this.send(message);
  }

  /**
   * 위치 업데이트
   */
  updateLocation(latitude: number, longitude: number, accuracy?: number): void {
    const message: LocationUpdateMessage = {
      type: 'location_update',
      latitude,
      longitude,
      accuracy,
    };
    this.send(message);
  }

  /**
   * 경로 전환
   */
  switchRoute(targetRank: 1 | 2 | 3): void {
    const message: SwitchRouteMessage = {
      type: 'switch_route',
      target_rank: targetRank,
    };
    this.send(message);
  }

  /**
   * 경로 재계산
   */
  recalculateRoute(latitude: number, longitude: number, disabilityType?: string): void {
    const message: RecalculateRouteMessage = {
      type: 'recalculate_route',
      latitude,
      longitude,
      disability_type: disabilityType,
    };
    this.send(message);
  }

  /**
   * 내비게이션 종료
   */
  endNavigation(): void {
    this.send({ type: 'end_navigation' });
  }

  /**
   * Ping 전송
   */
  private sendPing(): void {
    try {
      this.send({ type: 'ping' });
    } catch (error) {
      console.error('[WebSocket] Ping 전송 실패:', error);
    }
  }

  /**
   * 메시지 핸들링
   */
  private handleMessage(message: ServerMessage): void {
    const handler = this.messageHandlers.get(message.type);
    if (handler) {
      handler(message);
    } else {
      console.warn('[WebSocket] 핸들러 없음:', message.type);
    }
  }

  /**
   * Ping 인터벌 시작
   */
  private startPingInterval(): void {
    this.stopPingInterval(); // 기존 인터벌 제거
    this.pingInterval = setInterval(() => {
      this.sendPing();
    }, 15000); // 15초
  }

  /**
   * Ping 인터벌 중지
   */
  private stopPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  /**
   * 재연결 시도
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts), 30000);
      console.log(`[WebSocket] ${delay}ms 후 재연결 시도 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

      setTimeout(() => {
        this.connect().catch((error) => {
          console.error('[WebSocket] 재연결 실패:', error);
        });
      }, delay);
    } else {
      console.error('[WebSocket] 최대 재연결 시도 횟수 도달');
      // 재연결 실패 이벤트 발생
      const handler = this.messageHandlers.get('error');
      if (handler) {
        handler({
          type: 'error',
          message: '서버 연결에 실패했습니다. 네트워크 상태를 확인해주세요.',
          error_code: 'MAX_RECONNECT_ATTEMPTS',
        });
      }
    }
  }

  /**
   * 연결 해제
   */
  disconnect(): void {
    this.isManualClose = true;
    this.stopPingInterval();
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    this.reconnectAttempts = 0;
  }

  /**
   * 연결 상태 확인
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * 현재 연결 상태 가져오기
   */
  getReadyState(): number | null {
    return this.ws?.readyState ?? null;
  }
}
