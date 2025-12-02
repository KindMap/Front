/**
 * 편의시설 API 서비스
 * 지하철 역의 교통약자 편의시설 정보를 조회하는 API 함수들
 */

import { FacilityType, FacilityItem, FacilityApiResponse, FacilityData } from '../types/facility';
import { FACILITY_LABELS, FACILITY_ICONS } from '../utils/facilityUtils';

// API Base URL
const BASE_URL = 'https://k5d98563c8.execute-api.us-west-2.amazonaws.com/inha-capstone-03';

/**
 * 특정 편의시설 타입의 데이터를 역 코드로 조회
 * @param facilityType 편의시설 타입
 * @param stationCode 역 코드
 * @returns 편의시설 아이템 목록
 */
export async function getFacilityByType(
  facilityType: FacilityType,
  stationCode: string
): Promise<FacilityItem[]> {
  const endpoint = `${BASE_URL}/${facilityType}/${stationCode}`;

  try {
    console.log(`[FacilityAPI] 🚀 요청 시작:`, {
      facilityType,
      stationCode,
      endpoint,
      timestamp: new Date().toISOString()
    });

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });

    console.log(`[FacilityAPI] 📡 응답 수신:`, {
      facilityType,
      stationCode,
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      // 404는 해당 역에 시설이 없는 경우이므로 빈 배열 반환
      if (response.status === 404) {
        console.log(`[FacilityAPI] ℹ️ 404 - 시설 없음:`, { facilityType, stationCode });
        return [];
      }
      throw new Error(`API 요청 실패: ${response.status}`);
    }

    const data: FacilityApiResponse = await response.json();

    console.log(`[FacilityAPI] ✅ 데이터 파싱 완료:`, {
      facilityType,
      stationCode,
      resource: data.resource,
      dataCount: data.data?.length || 0,
      responseStructure: {
        hasResource: !!data.resource,
        hasData: !!data.data,
        dataLength: data.data?.length,
        count: data.count
      },
      sampleData: data.data?.[0] || null
    });

    return data.data || [];
  } catch (error) {
    console.error(`[FacilityAPI] ❌ ${facilityType} 조회 실패 (${stationCode}):`, {
      error,
      errorMessage: error instanceof Error ? error.message : String(error),
      endpoint
    });
    return [];
  }
}

/**
 * 특정 역의 모든 편의시설 정보를 조회 (9개 API 병렬 호출)
 * @param stationCode 역 코드
 * @returns 편의시설 데이터 목록
 */
export async function getAllFacilities(stationCode: string): Promise<FacilityData[]> {
  const facilityTypes: FacilityType[] = [
    'elevators',
    'lifts',
    'escalators',
    'toilets',
    'helpers',
    'movingwalks',
    'safe-platforms',
    'chargers',
    'sign-phones',
  ];

  console.log(`[FacilityAPI] 🔍 전체 편의시설 조회 시작:`, {
    stationCode,
    facilityTypesCount: facilityTypes.length,
    facilityTypes
  });

  try {
    const startTime = Date.now();

    // 모든 편의시설 API를 병렬로 호출
    const results = await Promise.all(
      facilityTypes.map(async (type) => {
        const items = await getFacilityByType(type, stationCode);
        return {
          type,
          icon: FACILITY_ICONS[type],
          label: FACILITY_LABELS[type],
          count: items.length,
          items,
        };
      })
    );

    const endTime = Date.now();
    const duration = endTime - startTime;

    // count가 0보다 큰 시설만 반환
    const facilitiesWithData = results.filter((facility) => facility.count > 0);

    console.log(`[FacilityAPI] 📊 전체 편의시설 조회 완료:`, {
      stationCode,
      duration: `${duration}ms`,
      totalRequests: facilityTypes.length,
      facilitiesFound: facilitiesWithData.length,
      facilitiesNotFound: facilityTypes.length - facilitiesWithData.length,
      summary: facilitiesWithData.map(f => ({
        type: f.type,
        label: f.label,
        count: f.count
      }))
    });

    return facilitiesWithData;
  } catch (error) {
    console.error(`[FacilityAPI] ❌ 전체 편의시설 조회 실패 (${stationCode}):`, {
      error,
      errorMessage: error instanceof Error ? error.message : String(error),
      stationCode
    });
    return [];
  }
}

/**
 * 여러 역의 편의시설 정보를 조회 (병렬 처리)
 * @param stationCodes 역 코드 배열
 * @returns 역 코드를 키로 하는 편의시설 데이터 맵
 */
export async function getMultipleStationsFacilities(
  stationCodes: string[]
): Promise<Map<string, FacilityData[]>> {
  try {
    // 모든 역의 편의시설을 병렬로 조회
    const results = await Promise.all(
      stationCodes.map(async (stationCode) => {
        const facilities = await getAllFacilities(stationCode);
        return { stationCode, facilities };
      })
    );

    // Map으로 변환
    const facilityMap = new Map<string, FacilityData[]>();
    results.forEach(({ stationCode, facilities }) => {
      facilityMap.set(stationCode, facilities);
    });

    return facilityMap;
  } catch (error) {
    console.error('[FacilityAPI] 다중 역 편의시설 조회 실패:', error);
    return new Map();
  }
}

/**
 * 특정 역의 특정 편의시설만 조회 (단일 API 호출)
 * @param facilityType 편의시설 타입
 * @param stationCode 역 코드
 * @returns 편의시설 데이터 (단일)
 */
export async function getSingleFacility(
  facilityType: FacilityType,
  stationCode: string
): Promise<FacilityData | null> {
  try {
    const items = await getFacilityByType(facilityType, stationCode);

    if (items.length === 0) {
      return null;
    }

    return {
      type: facilityType,
      icon: FACILITY_ICONS[facilityType],
      label: FACILITY_LABELS[facilityType],
      count: items.length,
      items,
    };
  } catch (error) {
    console.error(`[FacilityAPI] 단일 편의시설 조회 실패 (${facilityType}, ${stationCode}):`, error);
    return null;
  }
}

/**
 * 우선순위가 높은 편의시설만 먼저 조회 (성능 최적화)
 * @param stationCode 역 코드
 * @param priorityTypes 우선순위 편의시설 타입 배열
 * @param limit 조회할 개수 (기본값: 3)
 * @returns 편의시설 데이터 목록
 */
export async function getPriorityFacilities(
  stationCode: string,
  priorityTypes: FacilityType[],
  limit: number = 3
): Promise<FacilityData[]> {
  try {
    const results: FacilityData[] = [];

    // 우선순위 순서대로 조회하되, limit에 도달하면 중단
    for (const type of priorityTypes) {
      if (results.length >= limit) {
        break;
      }

      const items = await getFacilityByType(type, stationCode);
      if (items.length > 0) {
        results.push({
          type,
          icon: FACILITY_ICONS[type],
          label: FACILITY_LABELS[type],
          count: items.length,
          items,
        });
      }
    }

    return results;
  } catch (error) {
    console.error(`[FacilityAPI] 우선순위 편의시설 조회 실패 (${stationCode}):`, error);
    return [];
  }
}
