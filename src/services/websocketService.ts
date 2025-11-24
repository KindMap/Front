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

export class WebSocketService {
  private ws: WebSocket | null = null;
  private userId: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private pingInterval: NodeJS.Timeout | null = null;
  private messageHandlers: Map<WebSocketMessageType, (data: any) => void> = new Map();
  private reconnectDelay = 1000;
  private isManualClose = false;

  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * WebSocket 연결
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      // 포트 번호 8001 추가
      const wsUrl = `${import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8001'}/api/v1/ws/${this.userId}`;

      console.log('[WebSocket] 연결 시도:', wsUrl);

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
   * 메시지 전송
   */
  private send(message: ClientMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
      console.log('[WebSocket] 메시지 전송:', message.type);
    } else {
      console.error('[WebSocket] 연결되지 않음 - 현재 상태:', this.ws?.readyState);
      throw new Error('WebSocket not connected');
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
