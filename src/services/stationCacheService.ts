import stationData from '../static_data/postgres_public_subway_station.json';

/**
 * 역 정보 인터페이스
 */
export interface StationInfo {
  name: string;
  station_cd: string;
  line: string;
}

/**
 * 역 데이터 캐싱 서비스
 * - 싱글톤 패턴으로 한 번만 로드
 * - 역 코드 → 역명 빠른 조회를 위한 Map 사용
 */
class StationCacheService {
  private stationMap: Map<string, StationInfo>;
  private stationList: StationInfo[];
  private initialized: boolean = false;

  constructor() {
    this.stationMap = new Map();
    this.stationList = [];
    this.initialize();
  }

  /**
   * 역 데이터 초기화
   */
  private initialize(): void {
    if (this.initialized) {
      return;
    }

    try {
      // JSON 데이터를 Map과 List로 변환
      this.stationList = stationData as StationInfo[];
      this.stationList.forEach((station) => {
        this.stationMap.set(station.station_cd, station);
      });

      this.initialized = true;
      console.log(`[StationCache] ${this.stationMap.size}개 역 데이터 로드 완료`);
    } catch (error) {
      console.error('[StationCache] 역 데이터 로드 실패:', error);
    }
  }

  /**
   * 역 코드로 역명 조회
   * @param stationCd - 역 코드
   * @returns 역명 (찾을 수 없으면 역 코드 반환)
   */
  getStationName(stationCd: string): string {
    const station = this.stationMap.get(stationCd);
    return station ? station.name : stationCd;
  }

  /**
   * 역 코드로 전체 역 정보 조회
   * @param stationCd - 역 코드
   * @returns 역 정보 또는 null
   */
  getStationInfo(stationCd: string): StationInfo | null {
    return this.stationMap.get(stationCd) || null;
  }

  /**
   * 역 코드 배열을 역명 배열로 변환
   * @param stationCodes - 역 코드 배열
   * @returns 역명 배열
   */
  getStationNames(stationCodes: string[]): string[] {
    return stationCodes.map((code) => this.getStationName(code));
  }

  /**
   * 캐시된 역 개수 반환
   */
  getStationCount(): number {
    return this.stationMap.size;
  }

  /**
   * 역 코드가 캐시에 존재하는지 확인
   */
  hasStation(stationCd: string): boolean {
    return this.stationMap.has(stationCd);
  }

  /**
   * 역명으로 역 검색 (자동완성용)
   * @param query - 검색어
   * @param maxResults - 최대 결과 개수 (기본 10개)
   * @returns 검색 결과 배열
   */
  searchStations(query: string, maxResults: number = 10): StationInfo[] {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const normalizedQuery = query.trim().toLowerCase();
    const results: StationInfo[] = [];

    // 1. 정확히 일치하는 역 우선
    for (const station of this.stationList) {
      if (station.name.toLowerCase() === normalizedQuery) {
        results.push(station);
      }
    }

    // 2. 시작하는 역
    for (const station of this.stationList) {
      if (
        station.name.toLowerCase().startsWith(normalizedQuery) &&
        !results.includes(station)
      ) {
        results.push(station);
        if (results.length >= maxResults) {
          return results;
        }
      }
    }

    // 3. 포함하는 역
    for (const station of this.stationList) {
      if (
        station.name.toLowerCase().includes(normalizedQuery) &&
        !results.includes(station)
      ) {
        results.push(station);
        if (results.length >= maxResults) {
          return results;
        }
      }
    }

    return results;
  }

  /**
   * 역명으로 역 코드 찾기
   * @param stationName - 역명
   * @returns 역 코드 또는 null
   */
  getStationCode(stationName: string): string | null {
    const station = this.stationList.find(
      (s) => s.name.toLowerCase() === stationName.toLowerCase()
    );
    return station ? station.station_cd : null;
  }

  /**
   * 모든 역 정보 가져오기
   */
  getAllStations(): StationInfo[] {
    return [...this.stationList];
  }
}

// 싱글톤 인스턴스 export
export const stationCache = new StationCacheService();
