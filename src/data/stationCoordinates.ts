import stationDataWithGeom from '../static_data/postgres_public_subway_station_with_geom.json';

/**
 * 역 정보 (좌표 포함)
 */
interface StationWithGeom {
  name: string;
  station_cd: string;
  line: string;
  geom: string; // "POINT (lng lat)" 형식
}

/**
 * 좌표 인터페이스
 */
export interface Coordinate {
  lat: number;
  lng: number;
}

/**
 * 역 좌표 캐시 서비스
 * - 싱글톤 패턴으로 한 번만 로드
 * - 역 코드 → 좌표 빠른 조회를 위한 Map 사용
 */
class StationCoordinateCache {
  private coordinateMap: Map<string, Coordinate>;
  private initialized: boolean = false;

  constructor() {
    this.coordinateMap = new Map();
    this.initialize();
  }

  /**
   * 좌표 데이터 초기화
   */
  private initialize(): void {
    if (this.initialized) {
      return;
    }

    try {
      const stations = stationDataWithGeom as StationWithGeom[];

      stations.forEach((station) => {
        // "POINT (lng lat)" 형식 파싱
        const coordinate = this.parseGeomPoint(station.geom);
        if (coordinate) {
          this.coordinateMap.set(station.station_cd, coordinate);
        }
      });

      this.initialized = true;
      console.log(`[StationCoordinateCache] ${this.coordinateMap.size}개 역 좌표 데이터 로드 완료`);
    } catch (error) {
      console.error('[StationCoordinateCache] 좌표 데이터 로드 실패:', error);
    }
  }

  /**
   * "POINT (lng lat)" 형식 문자열을 좌표 객체로 변환
   * @param geom - "POINT (126.656666 37.466769)" 형식 문자열
   * @returns 좌표 객체 또는 null
   */
  private parseGeomPoint(geom: string): Coordinate | null {
    try {
      // "POINT (126.656666 37.466769)" -> ["126.656666", "37.466769"]
      const match = geom.match(/POINT\s*\(([0-9.]+)\s+([0-9.]+)\)/);
      if (match) {
        const lng = parseFloat(match[1]);
        const lat = parseFloat(match[2]);
        return { lat, lng };
      }
      return null;
    } catch (error) {
      console.error('[StationCoordinateCache] POINT 파싱 실패:', geom, error);
      return null;
    }
  }

  /**
   * 역 코드로 좌표 조회
   * @param stationCd - 역 코드
   * @returns 좌표 객체 또는 null
   */
  getCoordinate(stationCd: string): Coordinate | null {
    return this.coordinateMap.get(stationCd) || null;
  }

  /**
   * 캐시된 역 좌표 개수 반환
   */
  getCount(): number {
    return this.coordinateMap.size;
  }

  /**
   * 역 코드가 캐시에 존재하는지 확인
   */
  hasCoordinate(stationCd: string): boolean {
    return this.coordinateMap.has(stationCd);
  }
}

// 싱글톤 인스턴스 생성
const coordinateCache = new StationCoordinateCache();

/**
 * 역 코드로 좌표 가져오기
 * @param stationCd - 역 코드
 * @returns 좌표 객체 또는 null
 */
export function getStationCoordinate(stationCd: string): Coordinate | null {
  const coordinate = coordinateCache.getCoordinate(stationCd);

  if (!coordinate) {
    console.warn(`[getStationCoordinate] 역 코드 ${stationCd}의 좌표를 찾을 수 없습니다.`);
  }

  return coordinate;
}

/**
 * 역 코드 배열로 경로 좌표 배열 생성
 * @param stationCodes - 역 코드 배열
 * @returns 좌표 배열 (좌표를 찾을 수 없는 역은 제외됨)
 */
export function getRouteCoordinates(stationCodes: string[]): Coordinate[] {
  return stationCodes
    .map(code => coordinateCache.getCoordinate(code))
    .filter((coord): coord is Coordinate => coord !== null);
}

/**
 * 캐시된 역 좌표 개수 확인
 */
export function getStationCoordinateCount(): number {
  return coordinateCache.getCount();
}
