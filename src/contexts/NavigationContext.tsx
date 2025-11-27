import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { WebSocketService } from '../services/websocketService';
import { GeolocationService } from '../services/geolocationService';
import { useAuth } from './AuthContext';
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
  RouteRecalculatedMessage,
  SessionData
} from '../types/navigation';

// 세션 스토리지 키
const SESSION_STORAGE_KEY = 'navigation_session';

// 세션 스토리지 함수
const saveToSession = (data: SessionData) => {
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(data));
    console.log('[Navigation] 세션 저장 완료:', data.routeId);
  } catch (error) {
    console.error('[Navigation] 세션 저장 실패:', error);
  }
};

const loadFromSession = (): SessionData | null => {
  try {
    const data = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      console.log('[Navigation] 세션 복원:', parsed.routeId);
      return parsed;
    }
    return null;
  } catch (error) {
    console.error('[Navigation] 세션 복원 실패:', error);
    return null;
  }
};

interface NavigationContextType {
  state: NavigationState;
  searchRoute: (origin: string, destination: string, disabilityType: DisabilityType) => Promise<void>;
  setRouteData: (origin: string, destination: string, disabilityType: DisabilityType, routes: NavigationRoute[]) => void;
  startGuidance: () => void;
  stopNavigation: () => void;
  switchRoute: (rank: 1 | 2 | 3) => void;
  recalculateRoute: () => void;
  clearError: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  // AuthContext에서 실제 user_id 가져오기
  const { user } = useAuth();

  // 게스트 사용자를 위한 임시 ID (한 번만 생성)
  const guestIdRef = useRef<string>(`guest_${Date.now()}`);

  // WebSocketService 인스턴스는 한 번만 생성 (이벤트 리스너 유지)
  const [wsService] = useState(() => new WebSocketService(guestIdRef.current));
  const [geoService] = useState(() => new GeolocationService());

  const [state, setState] = useState<NavigationState>({
    isConnected: false,
    isSearching: false,
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

  // 페이지 로드 시 세션 스토리지에서 데이터 복원
  useEffect(() => {
    const savedSession = loadFromSession();
    if (savedSession) {
      setState(prev => ({
        ...prev,
        routeId: savedSession.routeId,
        routes: savedSession.routes,
        selectedRouteRank: savedSession.selectedRouteRank,
        origin: savedSession.origin,
        destination: savedSession.destination,
        disabilityType: savedSession.disabilityType,
      }));
    }
  }, []);

  // WebSocket 메시지 핸들러 등록 (Lazy connection - 실제 사용 시에만 연결)
  useEffect(() => {
    let isMounted = true;

    // 연결 성공 핸들러
    wsService.on('connected', (data) => {
      console.log('[Navigation] WebSocket 연결됨:', data.message);
      if (isMounted) {
        setState((prev) => ({ ...prev, isConnected: true }));
      }
    });

    // 경로 계산 완료 핸들러
    wsService.on('route_calculated', (data: RouteCalculatedMessage) => {
      console.log('[Navigation] 경로 계산 완료:', data);
      if (isMounted) {
        // 세션 스토리지에 저장
        const sessionData: SessionData = {
          routeId: data.route_id,
          routes: data.routes,
          selectedRouteRank: data.selected_route_rank,
          origin: state.origin || data.origin,
          destination: state.destination || data.destination,
          disabilityType: state.disabilityType || 'PHY',
        };
        saveToSession(sessionData);

        setState((prev) => ({
          ...prev,
          routeId: data.route_id,
          routes: data.routes,
          selectedRouteRank: data.selected_route_rank,
          isSearching: false,  // 검색 완료
          // isNavigating은 여기서 true로 설정하지 않음!
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

          // GPS 정확도 필터링 (200m 임계값)
          const ACCURACY_THRESHOLD = 200; // meters

          if (position.accuracy > ACCURACY_THRESHOLD) {
            console.warn(
              `[Navigation] GPS 정확도 불량 (${position.accuracy.toFixed(1)}m > ${ACCURACY_THRESHOLD}m) - 전송 건너뜀`
            );
            // UI에는 표시하지 않음 (최소 안내 정책)
            return; // 백엔드로 전송하지 않음
          }

          // 정확도가 100m~200m 사이인 경우 경고 로그 (하지만 전송은 함)
          if (position.accuracy > 100) {
            console.warn(
              `[Navigation] GPS 정확도 주의 (${position.accuracy.toFixed(1)}m) - 전송은 계속`
            );
          }

          // WebSocket으로 위치 전송 (양호한 정확도만)
          console.log(
            `[Navigation] 위치 전송: lat=${position.latitude.toFixed(6)}, ` +
            `lng=${position.longitude.toFixed(6)}, accuracy=${position.accuracy.toFixed(1)}m`
          );
          wsService.updateLocation(position.latitude, position.longitude, position.accuracy);
        }, 2000); // 2초 간격
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

  // 경로 탐색 요청 (검색 페이지에서 호출)
  const searchRoute = useCallback(
    async (origin: string, destination: string, disabilityType: DisabilityType) => {
      try {
        console.log('[Navigation] 경로 탐색 시작:', origin, '→', destination);
        setState(prev => ({ ...prev, isSearching: true, error: null }));

        // 현재 사용할 userId 결정 (로그인 사용자 vs 게스트)
        const currentUserId = user?.user_id || guestIdRef.current;
        console.log('[Navigation] 사용자 ID:', currentUserId, user?.user_id ? '(로그인)' : '(게스트)');

        // WebSocket 연결 (이미 연결되어 있으면 무시됨)
        if (!wsService.isConnected()) {
          console.log('[Navigation] WebSocket 연결 시도...');
          await wsService.connect(currentUserId);
          console.log('[Navigation] WebSocket 연결 성공');
        }

        // 상태 업데이트
        setState((prev) => ({
          ...prev,
          origin,
          destination,
          disabilityType,
        }));

        // 세션 생성 및 경로 계산 요청
        wsService.startNavigation(origin, destination, disabilityType);
      } catch (error) {
        console.error('[Navigation] 경로 탐색 실패:', error);
        setState((prev) => ({
          ...prev,
          isSearching: false,
          error: error instanceof Error ? error.message : '경로 검색에 실패했습니다',
        }));
      }
    },
    [wsService, user]
  );

  // REST API 결과를 Context에 저장 (기존 검색 페이지용)
  const setRouteData = useCallback(
    (origin: string, destination: string, disabilityType: DisabilityType, routes: NavigationRoute[]) => {
      console.log('[Navigation] 경로 데이터 설정:', routes.length, '개 경로');

      // 임시 routeId 생성 (WebSocket 연결 시 실제 routeId로 교체됨)
      const tempRouteId = `temp_${Date.now()}`;

      const sessionData: SessionData = {
        routeId: tempRouteId,
        routes,
        selectedRouteRank: 1,
        origin,
        destination,
        disabilityType,
      };

      saveToSession(sessionData);

      setState(prev => ({
        ...prev,
        routeId: tempRouteId,
        routes,
        selectedRouteRank: 1,
        origin,
        destination,
        disabilityType,
        error: null,
      }));
    },
    []
  );

  // 안내 시작 (GPS 추적 시작)
  const startGuidance = useCallback(async () => {
    if (!state.routeId || state.routes.length === 0) {
      console.error('[Navigation] 경로 데이터가 없습니다.');
      setState(prev => ({
        ...prev,
        error: '경로를 먼저 검색해주세요.',
      }));
      return;
    }

    try {
      // WebSocket 연결 확인 (REST API로 경로를 검색했을 경우 연결되어 있지 않을 수 있음)
      if (!wsService.isConnected()) {
        const currentUserId = user?.user_id || guestIdRef.current;
        console.log('[Navigation] WebSocket 연결 시도...');
        await wsService.connect(currentUserId);

        // WebSocket으로 경로 정보 전송 (백엔드 세션 생성)
        if (state.origin && state.destination && state.disabilityType) {
          console.log('[Navigation] 백엔드에 경로 정보 전송');
          wsService.startNavigation(state.origin, state.destination, state.disabilityType);
        }
      }

      console.log('[Navigation] GPS 추적 시작');
      setState(prev => ({ ...prev, isNavigating: true, error: null }));
    } catch (error) {
      console.error('[Navigation] 안내 시작 실패:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : '안내를 시작할 수 없습니다.',
      }));
    }
  }, [state.routeId, state.routes, state.origin, state.destination, state.disabilityType, wsService, user, guestIdRef]);

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
  const stopNavigation = useCallback(() => {
    console.log('[Navigation] 내비게이션 종료');
    if (state.isNavigating) {
      wsService.endNavigation();
    }
    // 세션 스토리지 클리어
    sessionStorage.removeItem(SESSION_STORAGE_KEY);

    setState((prev) => ({
      ...prev,
      isNavigating: false,
      isSearching: false,
      routeId: null,
      routes: [],
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
        searchRoute,
        setRouteData,
        startGuidance,
        stopNavigation,
        switchRoute,
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
