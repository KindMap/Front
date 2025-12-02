/**
 * 편의시설 캐시 서비스
 * 이미 조회한 역의 편의시설 정보를 메모리에 캐싱하여 중복 API 호출 방지
 */

import { StationFacilities, FacilityData } from '../types/facility';

/**
 * 편의시설 캐시 서비스 클래스 (싱글톤)
 */
class FacilityCacheService {
  private cache: Map<string, StationFacilities>;
  private readonly CACHE_TTL = 60 * 60 * 1000; // 1시간 (밀리초)

  constructor() {
    this.cache = new Map();
  }

  /**
   * 특정 역의 편의시설 정보를 캐시에 저장
   * @param stationCode 역 코드
   * @param stationName 역 이름
   * @param facilities 편의시설 데이터 배열
   */
  setFacilities(stationCode: string, stationName: string, facilities: FacilityData[]): void {
    const stationFacilities: StationFacilities = {
      stationCode,
      stationName,
      facilities,
      lastUpdated: Date.now(),
    };

    this.cache.set(stationCode, stationFacilities);
    console.log(`[FacilityCacheService] 캐시 저장: ${stationName} (${stationCode}) - ${facilities.length}개 시설`);
  }

  /**
   * 특정 역의 편의시설 정보를 캐시에서 조회
   * @param stationCode 역 코드
   * @returns 편의시설 데이터 배열 또는 null (캐시 없음/만료)
   */
  getFacilities(stationCode: string): FacilityData[] | null {
    const cached = this.cache.get(stationCode);

    if (!cached) {
      return null;
    }

    // 캐시 만료 확인
    const now = Date.now();
    const elapsed = now - cached.lastUpdated;

    if (elapsed > this.CACHE_TTL) {
      console.log(`[FacilityCacheService] 캐시 만료: ${cached.stationName} (${stationCode})`);
      this.cache.delete(stationCode);
      return null;
    }

    console.log(`[FacilityCacheService] 캐시 히트: ${cached.stationName} (${stationCode})`);
    return cached.facilities;
  }

  /**
   * 특정 역의 편의시설 캐시가 존재하는지 확인
   * @param stationCode 역 코드
   * @returns 캐시 존재 여부 (만료된 캐시는 false)
   */
  hasFacilities(stationCode: string): boolean {
    const cached = this.cache.get(stationCode);

    if (!cached) {
      return false;
    }

    // 캐시 만료 확인
    const now = Date.now();
    const elapsed = now - cached.lastUpdated;

    if (elapsed > this.CACHE_TTL) {
      this.cache.delete(stationCode);
      return false;
    }

    return true;
  }

  /**
   * 특정 역의 캐시 삭제
   * @param stationCode 역 코드
   */
  removeFacilities(stationCode: string): void {
    const cached = this.cache.get(stationCode);
    if (cached) {
      console.log(`[FacilityCacheService] 캐시 삭제: ${cached.stationName} (${stationCode})`);
      this.cache.delete(stationCode);
    }
  }

  /**
   * 모든 캐시 삭제
   */
  clearCache(): void {
    const size = this.cache.size;
    this.cache.clear();
    console.log(`[FacilityCacheService] 전체 캐시 삭제: ${size}개 항목`);
  }

  /**
   * 현재 캐시 상태 조회
   * @returns 캐시된 역의 개수와 상세 정보
   */
  getCacheStatus(): {
    totalCached: number;
    stations: { stationCode: string; stationName: string; facilityCount: number; age: number }[];
  } {
    const now = Date.now();
    const stations = Array.from(this.cache.values()).map((cached) => ({
      stationCode: cached.stationCode,
      stationName: cached.stationName,
      facilityCount: cached.facilities.length,
      age: Math.floor((now - cached.lastUpdated) / 1000), // 초 단위
    }));

    return {
      totalCached: this.cache.size,
      stations,
    };
  }

  /**
   * 만료된 캐시 항목 정리
   * @returns 삭제된 캐시 항목 수
   */
  cleanExpiredCache(): number {
    const now = Date.now();
    let deletedCount = 0;

    this.cache.forEach((cached, stationCode) => {
      const elapsed = now - cached.lastUpdated;
      if (elapsed > this.CACHE_TTL) {
        this.cache.delete(stationCode);
        deletedCount++;
      }
    });

    if (deletedCount > 0) {
      console.log(`[FacilityCacheService] 만료된 캐시 정리: ${deletedCount}개 항목 삭제`);
    }

    return deletedCount;
  }

  /**
   * 여러 역의 편의시설 정보를 한 번에 캐시에 저장
   * @param facilitiesMap 역 코드를 키로 하는 편의시설 맵
   */
  setMultipleFacilities(facilitiesMap: Map<string, { name: string; facilities: FacilityData[] }>): void {
    facilitiesMap.forEach((data, stationCode) => {
      this.setFacilities(stationCode, data.name, data.facilities);
    });
  }

  /**
   * 여러 역의 편의시설 정보를 한 번에 조회
   * @param stationCodes 역 코드 배열
   * @returns 캐시된 역의 편의시설 맵 (캐시 없는 역은 제외)
   */
  getMultipleFacilities(stationCodes: string[]): Map<string, FacilityData[]> {
    const result = new Map<string, FacilityData[]>();

    stationCodes.forEach((stationCode) => {
      const facilities = this.getFacilities(stationCode);
      if (facilities !== null) {
        result.set(stationCode, facilities);
      }
    });

    return result;
  }
}

// 싱글톤 인스턴스 export
export const facilityCacheService = new FacilityCacheService();

// 주기적으로 만료된 캐시 정리 (5분마다)
if (typeof window !== 'undefined') {
  setInterval(() => {
    facilityCacheService.cleanExpiredCache();
  }, 5 * 60 * 1000);
}
