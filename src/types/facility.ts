/**
 * 편의시설 관련 타입 정의
 */

import { DisabilityType } from './auth';

/**
 * 편의시설 타입
 */
export type FacilityType =
  | 'elevators'      // 엘리베이터
  | 'lifts'          // 휠체어 리프트
  | 'escalators'     // 에스컬레이터
  | 'toilets'        // 장애인 화장실
  | 'helpers'        // 교통약자 도우미
  | 'movingwalks'    // 무빙워크
  | 'safe-platforms' // 안전발판
  | 'chargers'       // 전동휠체어 충전기
  | 'sign-phones';   // 수어통역 화상전화기

/**
 * API 응답의 개별 편의시설 아이템
 */
export interface FacilityItem {
  stn_cd: string;          // 역 코드
  stn_nm: string;          // 역 이름
  line_nm?: string;        // 호선명
  [key: string]: any;      // 각 시설마다 다른 필드 (예: 위치, 수량 등)
}

/**
 * API 응답 구조 (실제 응답 형식에 맞춤)
 */
export interface FacilityApiResponse {
  resource: string;        // 리소스 타입 (예: "subway_elevator")
  count: number;           // 데이터 개수
  data: FacilityItem[];    // 편의시설 아이템 배열
}

/**
 * 특정 타입의 편의시설 데이터
 */
export interface FacilityData {
  type: FacilityType;      // 시설 타입
  icon: string;            // 표시할 아이콘/이모티콘
  label: string;           // 한글 라벨
  count: number;           // 해당 시설 개수
  items: FacilityItem[];   // 상세 아이템 목록
}

/**
 * 특정 역의 모든 편의시설 정보
 */
export interface StationFacilities {
  stationCode: string;         // 역 코드
  stationName: string;         // 역 이름
  facilities: FacilityData[];  // 편의시설 목록
  lastUpdated: number;         // 마지막 업데이트 시각 (타임스탬프)
}

/**
 * 편의시설 정보 컴포넌트 Props
 */
export interface FacilityInfoProps {
  stationCode: string;              // 역 코드 (필수)
  stationName?: string;             // 역 이름 (선택)
  disabilityType?: DisabilityType;  // 교통약자 유형 (우선순위 적용)
  compact?: boolean;                // 컴팩트 모드 (아이콘만)
  limit?: number;                   // 표시 개수 제한
  expandable?: boolean;             // 더보기 버튼 표시 여부
  className?: string;               // 추가 CSS 클래스
}

/**
 * 편의시설 아이콘 컴포넌트 Props
 */
export interface FacilityIconProps {
  type: FacilityType;               // 시설 타입
  size?: 'sm' | 'md' | 'lg';        // 아이콘 크기
  showLabel?: boolean;              // 라벨 표시 여부
  count?: number;                   // 개수 뱃지 표시
  className?: string;               // 추가 CSS 클래스
}

/**
 * 편의시설 상세 모달 Props
 */
export interface FacilityDetailModalProps {
  isOpen: boolean;                  // 모달 표시 여부
  onClose: () => void;              // 닫기 핸들러
  stationCode: string;              // 역 코드
  stationName: string;              // 역 이름
  disabilityType?: DisabilityType;  // 교통약자 유형
}
