/**
 * 편의시설 관련 유틸리티 함수
 */

import { DisabilityType } from '../types/auth';
import { FacilityType, FacilityData } from '../types/facility';

/**
 * 편의시설 한글 라벨 매핑
 */
export const FACILITY_LABELS: Record<FacilityType, string> = {
  elevators: '엘리베이터',
  lifts: '휠체어 리프트',
  escalators: '에스컬레이터',
  toilets: '장애인 화장실',
  helpers: '교통약자 도우미',
  movingwalks: '무빙워크',
  'safe-platforms': '안전발판',
  chargers: '전동휠체어 충전기',
  'sign-phones': '수어통역 화상전화기',
};

/**
 * 편의시설 아이콘 매핑
 */
export const FACILITY_ICONS: Record<FacilityType, string> = {
  elevators: '🛗',
  lifts: '♿',
  escalators: '📶',
  toilets: '🚻',
  helpers: '👤',
  movingwalks: '🚶',
  'safe-platforms': '🦺',
  chargers: '🔌',
  'sign-phones': '📞',
};

/**
 * 교통약자 유형별 편의시설 우선순위
 */
export const FACILITY_PRIORITY: Record<DisabilityType, FacilityType[]> = {
  PHY: [
    'elevators',
    'lifts',
    'toilets',
    'chargers',
    'helpers',
    'escalators',
    'safe-platforms',
    'movingwalks',
    'sign-phones',
  ],
  VIS: [
    'helpers',
    'safe-platforms',
    'elevators',
    'escalators',
    'toilets',
    'movingwalks',
    'lifts',
    'chargers',
    'sign-phones',
  ],
  AUD: [
    'sign-phones',
    'helpers',
    'elevators',
    'escalators',
    'toilets',
    'safe-platforms',
    'movingwalks',
    'lifts',
    'chargers',
  ],
  ELD: [
    'elevators',
    'escalators',
    'toilets',
    'helpers',
    'movingwalks',
    'safe-platforms',
    'lifts',
    'chargers',
    'sign-phones',
  ],
  NONE: [
    'elevators',
    'escalators',
    'toilets',
    'helpers',
    'movingwalks',
    'lifts',
    'safe-platforms',
    'chargers',
    'sign-phones',
  ],
};

/**
 * 교통약자 유형에 따라 편의시설을 우선순위대로 정렬
 * @param facilities 편의시설 데이터 배열
 * @param disabilityType 교통약자 유형 (없으면 기본 순서)
 * @returns 정렬된 편의시설 배열
 */
export function sortFacilitiesByPriority(
  facilities: FacilityData[],
  disabilityType?: DisabilityType
): FacilityData[] {
  const priorityOrder = disabilityType ? FACILITY_PRIORITY[disabilityType] : FACILITY_PRIORITY.NONE;

  // 우선순위 인덱스를 기준으로 정렬
  return [...facilities].sort((a, b) => {
    const indexA = priorityOrder.indexOf(a.type);
    const indexB = priorityOrder.indexOf(b.type);

    // 우선순위에 없는 항목은 뒤로 보냄
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;

    return indexA - indexB;
  });
}

/**
 * 상위 N개의 편의시설만 추출
 * @param facilities 편의시설 데이터 배열
 * @param limit 추출할 개수
 * @returns 제한된 편의시설 배열
 */
export function getTopFacilities(facilities: FacilityData[], limit: number): FacilityData[] {
  return facilities.slice(0, limit);
}

/**
 * 특정 교통약자 유형의 우선순위 편의시설 타입 목록 반환
 * @param disabilityType 교통약자 유형
 * @param limit 반환할 개수 (기본값: 전체)
 * @returns 우선순위 편의시설 타입 배열
 */
export function getPriorityFacilityTypes(
  disabilityType?: DisabilityType,
  limit?: number
): FacilityType[] {
  const priorityOrder = disabilityType ? FACILITY_PRIORITY[disabilityType] : FACILITY_PRIORITY.NONE;

  if (limit) {
    return priorityOrder.slice(0, limit);
  }

  return priorityOrder;
}

/**
 * 편의시설 타입의 한글 라벨 반환
 * @param type 편의시설 타입
 * @returns 한글 라벨
 */
export function getFacilityLabel(type: FacilityType): string {
  return FACILITY_LABELS[type] || type;
}

/**
 * 편의시설 타입의 아이콘 반환
 * @param type 편의시설 타입
 * @returns 아이콘 이모티콘
 */
export function getFacilityIcon(type: FacilityType): string {
  return FACILITY_ICONS[type] || '❓';
}

/**
 * 편의시설 개수의 총합 계산
 * @param facilities 편의시설 데이터 배열
 * @returns 총 편의시설 개수
 */
export function getTotalFacilityCount(facilities: FacilityData[]): number {
  return facilities.reduce((sum, facility) => sum + facility.count, 0);
}

/**
 * 특정 타입의 편의시설이 있는지 확인
 * @param facilities 편의시설 데이터 배열
 * @param type 확인할 편의시설 타입
 * @returns 존재 여부
 */
export function hasFacilityType(facilities: FacilityData[], type: FacilityType): boolean {
  return facilities.some((facility) => facility.type === type && facility.count > 0);
}

/**
 * 편의시설 데이터를 타입별로 그룹화
 * @param facilities 편의시설 데이터 배열
 * @returns 타입을 키로 하는 맵
 */
export function groupFacilitiesByType(facilities: FacilityData[]): Map<FacilityType, FacilityData> {
  const map = new Map<FacilityType, FacilityData>();
  facilities.forEach((facility) => {
    map.set(facility.type, facility);
  });
  return map;
}

/**
 * 편의시설 정보를 간단한 문자열로 포맷
 * @param facilities 편의시설 데이터 배열
 * @param limit 표시할 개수 제한
 * @returns 포맷된 문자열 (예: "🛗 ♿ 🚻")
 */
export function formatFacilitiesAsIcons(facilities: FacilityData[], limit?: number): string {
  const sorted = sortFacilitiesByPriority(facilities);
  const limited = limit ? getTopFacilities(sorted, limit) : sorted;
  return limited.map((f) => f.icon).join(' ');
}

/**
 * 편의시설 정보를 라벨이 포함된 문자열로 포맷
 * @param facilities 편의시설 데이터 배열
 * @param limit 표시할 개수 제한
 * @returns 포맷된 문자열 (예: "🛗 엘리베이터, ♿ 휠체어 리프트")
 */
export function formatFacilitiesWithLabels(facilities: FacilityData[], limit?: number): string {
  const sorted = sortFacilitiesByPriority(facilities);
  const limited = limit ? getTopFacilities(sorted, limit) : sorted;
  return limited.map((f) => `${f.icon} ${f.label}`).join(', ');
}
