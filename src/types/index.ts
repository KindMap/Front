export interface Route {
  id: string;
  departure: string;
  destination: string;
  duration: string;
  description: string;
  directionsResult?: google.maps.DirectionsResult;
  path?: string[];
  lines?: string[];
  difficulty?: number;
  avgConvenience?: number;
  avgCongestion?: number;
  maxTransferDifficulty?: number;
  transferStations?: string[]; // 환승역 코드 배열
}

export interface Favorite extends Route {
  addedAt: Date;
}

/**
 * 편의시설 인터페이스
 * API에서 받아올 편의시설 데이터 구조
 */
export interface Facility {
  id: string;
  name: string; // 편의시설 이름
  type: FacilityType; // 편의시설 유형
  latitude: number; // 위도
  longitude: number; // 경도
  address?: string; // 주소 (선택)
  description?: string; // 설명 (선택)
  phone?: string; // 전화번호 (선택)
  openingHours?: string; // 운영시간 (선택)
  accessibility?: AccessibilityInfo; // 접근성 정보 (선택)
}

/**
 * 편의시설 유형
 */
export enum FacilityType {
  ELEVATOR = 'elevator', // 엘리베이터
  RAMP = 'ramp', // 경사로
  RESTROOM = 'restroom', // 장애인 화장실
  PARKING = 'parking', // 장애인 주차장
  BENCH = 'bench', // 휴게 벤치
  SHELTER = 'shelter', // 쉼터
  MEDICAL = 'medical', // 의료시설
  PUBLIC_TRANSPORT = 'public_transport', // 대중교통 편의시설
  OTHER = 'other', // 기타
}

/**
 * 장애물 인터페이스
 * API에서 받아올 장애물 데이터 구조
 */
export interface Obstacle {
  id: string;
  type: ObstacleType; // 장애물 유형
  severity: ObstacleSeverity; // 심각도
  latitude: number; // 위도
  longitude: number; // 경도
  description: string; // 상세 설명
  reportedAt: Date; // 신고/등록 일시
  isTemporary: boolean; // 임시 장애물 여부
  estimatedRemovalDate?: Date; // 예상 제거 일자 (선택)
  images?: string[]; // 이미지 URL 배열 (선택)
}

/**
 * 장애물 유형
 */
export enum ObstacleType {
  STAIRS = 'stairs', // 계단
  STEEP_SLOPE = 'steep_slope', // 급경사
  CONSTRUCTION = 'construction', // 공사 구간
  NARROW_PATH = 'narrow_path', // 좁은 통로
  BROKEN_ROAD = 'broken_road', // 파손된 도로
  NO_SIDEWALK = 'no_sidewalk', // 인도 없음
  TRAFFIC_OBSTACLE = 'traffic_obstacle', // 통행 방해물
  OTHER = 'other', // 기타
}

/**
 * 장애물 심각도
 */
export enum ObstacleSeverity {
  LOW = 'low', // 낮음 - 약간의 불편
  MEDIUM = 'medium', // 중간 - 통행에 주의 필요
  HIGH = 'high', // 높음 - 통행 매우 어려움
  CRITICAL = 'critical', // 심각 - 통행 불가능
}

/**
 * 접근성 정보
 */
export interface AccessibilityInfo {
  wheelchairAccessible: boolean; // 휠체어 접근 가능
  hasElevator: boolean; // 엘리베이터 있음
  hasRamp: boolean; // 경사로 있음
  hasBrailleBlock: boolean; // 점자 블록 있음
  hasAudioGuide: boolean; // 음성 안내 있음
  notes?: string; // 추가 정보
}

/**
 * 지도 좌표 인터페이스
 */
export interface MapCoordinates {
  latitude: number;
  longitude: number;
}

/**
 * 경로 좌표 배열 (경로 그리기용)
 */
export interface RoutePath {
  coordinates: MapCoordinates[];
  distance: number; // 미터 단위
  duration: number; // 초 단위
}

/**
 * 사용자 유형
 */
export enum UserType {
  PHY = 'Physical', // 휠체어 이용자
  AUD = 'Auditory', // 청각장애
  ELD = 'Elderly', // 고령자
  VIS = 'Visual', // 저시력자
}
