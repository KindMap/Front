import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { WebSocketService } from '../services/websocketService';
import { GeolocationService } from '../services/geolocationService';
import {
  NavigationState,
  NavigationRoute,
  NavigationUpdateMessage,
  RouteCalculatedMessage,
  RouteDeviationMessage,
  ArrivalMessage,
  ErrorMessage,
  DisabilityType,
  RouteSwitchedMessage,
  RouteRecalculatedMessage
} from '../types/navigation';

interface NavigationContextType {
  state: NavigationState;
  startNavigation: (origin: string, destination: string, disabilityType: DisabilityType) => void;
  switchRoute: (rank: 1 | 2 | 3) => void;
  endNavigation: () => void;
  recalculateRoute: () => void;
  clearError: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  // userId를 로컬스토리지나 AuthContext에서 가져올 수 있습니다
  // 현재는 임시로 타임스탬프 기반 ID 사용
  const [wsService] = useState(() => new WebSocketService(`user_${Date.now()}`));
  const [geoService] = useState(() => new GeolocationService());

  const [state, setState] = useState<NavigationState>({
    isConnected: false,
    isNavigating: false,
    routeId: null,
    routes: [],
    selectedRouteRank: 1,
    currentUpdate: null,
    error: null,
    origin: null,
    destination: null,
    disabilityType: null,
  });

  // WebSocket 연결 및 메시지 핸들러 등록
  useEffect(() => {
    let isMounted = true;

    // WebSocket 연결
    wsService
      .connect()
      .then(() => {
        if (isMounted) {
          setState((prev) => ({ ...prev, isConnected: true }));
        }
      })
      .catch((error) => {
        if (isMounted) {
          setState((prev) => ({
            ...prev,
            error: `서버 연결 실패: ${error.message}`,
          }));
        }
      });

    // 연결 성공 핸들러
    wsService.on('connected', (data) => {
      console.log('[Navigation] WebSocket 연결됨:', data.message);
    });

    // 경로 계산 완료 핸들러
    wsService.on('route_calculated', (data: RouteCalculatedMessage) => {
      console.log('[Navigation] 경로 계산 완료:', data);
      if (isMounted) {
        setState((prev) => ({
          ...prev,
          routeId: data.route_id,
          routes: data.routes,
          selectedRouteRank: data.selected_route_rank,
          isNavigating: true,
          error: null,
        }));
      }
    });

    // 내비게이션 업데이트 핸들러
    wsService.on('navigation_update', (data: NavigationUpdateMessage) => {
      console.log('[Navigation] 내비게이션 업데이트:', data);
      if (isMounted) {
        setState((prev) => ({
          ...prev,
          currentUpdate: data,
        }));
      }
    });

    // 경로 이탈 핸들러
    wsService.on('route_deviation', (data: RouteDeviationMessage) => {
      console.warn('[Navigation] 경로 이탈:', data.message);
      if (isMounted) {
        setState((prev) => ({
          ...prev,
          error: `경로 이탈: ${data.message}`,
        }));
      }
      // 필요시 자동 재계산 로직 추가 가능
    });

    // 도착 핸들러
    wsService.on('arrival', (data: ArrivalMessage) => {
      console.log('[Navigation] 도착:', data.message);
      if (isMounted) {
        setState((prev) => ({
          ...prev,
          isNavigating: false,
        }));
        geoService.stopWatching();
      }
    });

    // 경로 전환 완료 핸들러
    wsService.on('route_switched', (data: RouteSwitchedMessage) => {
      console.log('[Navigation] 경로 전환:', data.message);
      if (isMounted) {
        setState((prev) => ({
          ...prev,
          selectedRouteRank: data.new_rank,
        }));
      }
    });

    // 경로 재계산 완료 핸들러
    wsService.on('route_recalculated', (data: RouteRecalculatedMessage) => {
      console.log('[Navigation] 경로 재계산:', data.message);
      if (isMounted) {
        setState((prev) => ({
          ...prev,
          routeId: data.route_id,
          routes: data.routes,
        }));
      }
    });

    // 내비게이션 종료 핸들러
    wsService.on('navigation_ended', (data) => {
      console.log('[Navigation] 내비게이션 종료:', data.message);
      if (isMounted) {
        setState((prev) => ({
          ...prev,
          isNavigating: false,
          routeId: null,
          currentUpdate: null,
        }));
        geoService.stopWatching();
      }
    });

    // 에러 핸들러
    wsService.on('error', (data: ErrorMessage) => {
      console.error('[Navigation] 에러:', data.message);
      if (isMounted) {
        setState((prev) => ({
          ...prev,
          error: data.message,
        }));
      }
    });

    // Pong 핸들러 (선택적)
    wsService.on('pong', () => {
      console.log('[Navigation] Pong 수신');
    });

    // 컴포넌트 언마운트 시 정리
    return () => {
      isMounted = false;
      wsService.disconnect();
      geoService.stopWatching();
    };
  }, [wsService, geoService]);

  // GPS 위치 업데이트 (내비게이션 중일 때만)
  useEffect(() => {
    if (state.isNavigating && wsService.isConnected()) {
      try {
        geoService.startWatching((position) => {
          // 서울 수도권 범위 확인
          if (!GeolocationService.isInSeoulMetroArea(position.latitude, position.longitude)) {
            console.warn('[Navigation] 서울 수도권 범위를 벗어났습니다');
            setState((prev) => ({
              ...prev,
              error: '서울 수도권 범위를 벗어났습니다',
            }));
            return;
          }

          // GPS 정확도 확인
          if (!GeolocationService.isAccuracyGood(position.accuracy, 100)) {
            console.warn('[Navigation] GPS 정확도가 낮습니다:', position.accuracy, 'm');
          }

          // WebSocket으로 위치 전송
          wsService.updateLocation(position.latitude, position.longitude, position.accuracy);
        }, 5000); // 5초 간격
      } catch (error) {
        console.error('[Navigation] Geolocation 시작 실패:', error);
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : '위치 추적을 시작할 수 없습니다',
        }));
      }
    } else {
      geoService.stopWatching();
    }
  }, [state.isNavigating, wsService, geoService]);

  // 내비게이션 시작
  const startNavigation = useCallback(
    (origin: string, destination: string, disabilityType: DisabilityType) => {
      if (!wsService.isConnected()) {
        setState((prev) => ({
          ...prev,
          error: '서버에 연결되지 않았습니다',
        }));
        return;
      }

      setState((prev) => ({
        ...prev,
        origin,
        destination,
        disabilityType,
        error: null,
      }));

      wsService.startNavigation(origin, destination, disabilityType);
    },
    [wsService]
  );

  // 경로 전환
  const switchRoute = useCallback(
    (rank: 1 | 2 | 3) => {
      if (!state.isNavigating) {
        console.warn('[Navigation] 내비게이션이 시작되지 않았습니다');
        return;
      }
      wsService.switchRoute(rank);
    },
    [wsService, state.isNavigating]
  );

  // 내비게이션 종료
  const endNavigation = useCallback(() => {
    if (state.isNavigating) {
      wsService.endNavigation();
    }
    setState((prev) => ({
      ...prev,
      isNavigating: false,
      routeId: null,
      currentUpdate: null,
      origin: null,
      destination: null,
      disabilityType: null,
    }));
    geoService.stopWatching();
  }, [wsService, geoService, state.isNavigating]);

  // 경로 재계산
  const recalculateRoute = useCallback(async () => {
    try {
      const position = await geoService.getCurrentPosition();

      // 서울 수도권 범위 확인
      if (!GeolocationService.isInSeoulMetroArea(position.latitude, position.longitude)) {
        setState((prev) => ({
          ...prev,
          error: '서울 수도권 범위를 벗어났습니다',
        }));
        return;
      }

      wsService.recalculateRoute(
        position.latitude,
        position.longitude,
        state.disabilityType || undefined
      );
    } catch (error) {
      console.error('[Navigation] 경로 재계산 실패:', error);
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : '경로 재계산에 실패했습니다',
      }));
    }
  }, [wsService, geoService, state.disabilityType]);

  // 에러 메시지 제거
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return (
    <NavigationContext.Provider
      value={{
        state,
        startNavigation,
        switchRoute,
        endNavigation,
        recalculateRoute,
        clearError,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
}
