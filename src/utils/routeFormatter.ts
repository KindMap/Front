import { stationCache } from '../services/stationCacheService';

/**
 * 경로를 "출발역 - 환승역 - 도착역" 형식으로 포맷팅
 * @param routeSequence - 역 코드 배열
 * @param transferStations - 환승역 코드 배열
 * @returns 포맷팅된 경로 문자열
 */
export function formatRouteDisplay(
  routeSequence: string[],
  transferStations: string[]
): string {
  if (routeSequence.length === 0) {
    return '';
  }

  // 출발역
  const origin = stationCache.getStationName(routeSequence[0]);

  // 도착역
  const destination = stationCache.getStationName(routeSequence[routeSequence.length - 1]);

  // 환승역이 없는 경우
  if (transferStations.length === 0) {
    return `${origin} → ${destination}`;
  }

  // 환승역 이름 변환
  const transferNames = transferStations.map((code) => stationCache.getStationName(code));

  // 출발역 - 환승역1, 환승역2 - 도착역
  return `${origin} - ${transferNames.join(', ')} - ${destination}`;
}

/**
 * 경로 시퀀스를 역명으로 변환하여 간단히 표시
 * @param routeSequence - 역 코드 배열
 * @param maxStations - 표시할 최대 역 개수 (기본 5개)
 * @returns 포맷팅된 경로 문자열 (예: "서울역 → 시청 → 을지로입구 → ...")
 */
export function formatRouteSequence(routeSequence: string[], maxStations: number = 5): string {
  const stationNames = stationCache.getStationNames(routeSequence);

  if (stationNames.length <= maxStations) {
    return stationNames.join(' → ');
  }

  const displayStations = stationNames.slice(0, maxStations);
  return `${displayStations.join(' → ')} ...`;
}

/**
 * 호선 배열을 읽기 쉬운 형식으로 포맷팅
 * @param routeLines - 호선 배열
 * @returns 포맷팅된 호선 문자열 (예: "2호선, 3호선")
 */
export function formatLines(routeLines: string[]): string {
  // 중복 제거
  const uniqueLines = Array.from(new Set(routeLines));
  return uniqueLines.join(', ');
}
