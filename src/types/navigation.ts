// WebSocket 메시지 타입
export type WebSocketMessageType =
  | 'start_navigation'
  | 'location_update'
  | 'switch_route'
  | 'recalculate_route'
  | 'end_navigation'
  | 'ping'
  | 'pong'
  | 'connected'
  | 'route_calculated'
  | 'navigation_update'
  | 'route_deviation'
  | 'arrival'
  | 'route_switched'
  | 'route_recalculated'
  | 'navigation_ended'
  | 'error'
  | 'disconnected';

// 장애 유형
export type DisabilityType = 'PHY' | 'VIS' | 'AUD' | 'ELD';

// 클라이언트 → 서버 메시지
export interface StartNavigationMessage {
  type: 'start_navigation';
  origin: string;
  destination: string;
  disability_type: DisabilityType;
}

export interface LocationUpdateMessage {
  type: 'location_update';
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface SwitchRouteMessage {
  type: 'switch_route';
  target_rank: 1 | 2 | 3;
}

export interface RecalculateRouteMessage {
  type: 'recalculate_route';
  latitude: number;
  longitude: number;
  disability_type?: string;
}

export interface EndNavigationMessage {
  type: 'end_navigation';
}

export interface PingMessage {
  type: 'ping';
}

// 서버 → 클라이언트 메시지
export interface ConnectedMessage {
  type: 'connected';
  message: string;
  user_id: string;
}

export interface RouteCalculatedMessage {
  type: 'route_calculated';
  route_id: string;
  origin: string;
  destination: string;
  routes: NavigationRoute[];
  total_routes_found: number;
  routes_returned: number;
  selected_route_rank: number;
}

export interface NavigationUpdateMessage {
  type: 'navigation_update';
  current_station: string;
  current_station_name: string;
  next_station: string | null;
  next_station_name: string | null;
  distance_to_next: number | null;
  remaining_stations: number;
  is_transfer: boolean;
  transfer_from_line: string | null;
  transfer_to_line: string | null;
  message: string;
  progress_percent: number;
}

export interface RouteDeviationMessage {
  type: 'route_deviation';
  message: string;
  current_location: string;
  nearest_station: string;
  suggested_action: string;
}

export interface ArrivalMessage {
  type: 'arrival';
  message: string;
  destination: string;
  destination_cd: string;
}

export interface RouteSwitchedMessage {
  type: 'route_switched';
  message: string;
  new_rank: number;
  route: NavigationRoute;
}

export interface RouteRecalculatedMessage {
  type: 'route_recalculated';
  message: string;
  route_id: string;
  routes: NavigationRoute[];
}

export interface NavigationEndedMessage {
  type: 'navigation_ended';
  message: string;
}

export interface ErrorMessage {
  type: 'error';
  message: string;
  error_code?: string;
}

export interface PongMessage {
  type: 'pong';
}

export interface DisconnectedMessage {
  type: 'disconnected';
  message: string;
}

// 경로 정보
export interface NavigationRoute {
  rank: number;
  route_sequence: string[];
  route_lines: string[];
  total_time: number;
  transfers: number;
  transfer_stations: string[];
  transfer_info: [string, string, string][]; // [역코드, 출발선, 도착선]
  score: number;
  avg_convenience: number;
  avg_congestion: number;
  max_transfer_difficulty: number;
}

// 내비게이션 상태
export interface NavigationState {
  isConnected: boolean;
  isSearching: boolean;  // 경로 계산 중 (검색 페이지)
  isNavigating: boolean;  // GPS 추적 중 (안내 페이지)
  routeId: string | null;
  routes: NavigationRoute[];
  selectedRouteRank: number;
  currentUpdate: NavigationUpdateMessage | null;
  error: string | null;
  origin: string | null;
  destination: string | null;
  disabilityType: DisabilityType | null;
}

// 세션 스토리지 데이터 구조
export interface SessionData {
  routeId: string;
  routes: NavigationRoute[];
  selectedRouteRank: number;
  origin: string;
  destination: string;
  disabilityType: DisabilityType;
}

// 모든 서버 메시지 유니온 타입
export type ServerMessage =
  | ConnectedMessage
  | RouteCalculatedMessage
  | NavigationUpdateMessage
  | RouteDeviationMessage
  | ArrivalMessage
  | RouteSwitchedMessage
  | RouteRecalculatedMessage
  | NavigationEndedMessage
  | ErrorMessage
  | PongMessage
  | DisconnectedMessage;

// 모든 클라이언트 메시지 유니온 타입
export type ClientMessage =
  | StartNavigationMessage
  | LocationUpdateMessage
  | SwitchRouteMessage
  | RecalculateRouteMessage
  | EndNavigationMessage
  | PingMessage;
