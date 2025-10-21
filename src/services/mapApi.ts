/**
 * 지도 API 서비스
 * 
 * 이 파일은 실제 백엔드 API 또는 지도 서비스 API와 통신하는 함수들을 포함합니다.
 * 현재는 Mock 데이터를 반환하지만, 실제 API 연동 시 이 함수들의 구현만 변경하면 됩니다.
 * 
 * API 통합 체크리스트:
 * ✅ 1. 환경변수 설정 (.env 파일)
 *    VITE_API_BASE_URL=https://api.mobility-service.com/v1
 *    VITE_MAP_API_KEY=your-kakao-map-api-key
 * 
 * ✅ 2. 인증 시스템 구축
 *    - JWT 토큰 관리
 *    - 토큰 갱신 로직
 *    - 로그인/로그아웃 처리
 * 
 * ✅ 3. 에러 핸들링
 *    - 네트워크 에러
 *    - 인증 에러 (401)
 *    - 권한 에러 (403)
 *    - 서버 에러 (500)
 * 
 * ✅ 4. 성능 최적화
 *    - 요청 디바운싱
 *    - 캐싱 전략
 *    - 페이지네이션
 * 
 * ✅ 5. 실시간 업데이트
 *    - WebSocket 연결
 *    - 장애물/편의시설 실시간 반영
 */

import { Facility, Obstacle, FacilityType, ObstacleType, ObstacleSeverity, MapCoordinates } from '../types';

// TODO: 환경변수로 관리
// 예시: const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.mobility-service.com/v1';
const BASE_URL = 'https://api.mobility-service.com/v1';

/**
 * 편의시설 목록 조회
 * 
 * @param bounds - 지도 영역 (위도/경도 범위)
 * @param types - 필터링할 편의시설 유형 배열 (선택)
 * @returns 편의시설 배열
 * 
 * API 연동 예시:
 * GET /api/facilities?minLat=37.5&maxLat=37.6&minLng=127.0&maxLng=127.1&types=elevator,ramp
 */
export async function fetchFacilities(
  bounds?: {
    minLatitude: number;
    maxLatitude: number;
    minLongitude: number;
    maxLongitude: number;
  },
  types?: FacilityType[]
): Promise<Facility[]> {
  try {
    // TODO: 실제 API 호출로 교체
    /*
    const queryParams = new URLSearchParams();
    if (bounds) {
      queryParams.append('minLat', bounds.minLatitude.toString());
      queryParams.append('maxLat', bounds.maxLatitude.toString());
      queryParams.append('minLng', bounds.minLongitude.toString());
      queryParams.append('maxLng', bounds.maxLongitude.toString());
    }
    if (types) {
      queryParams.append('types', types.join(','));
    }

    const response = await fetch(`${BASE_URL}/api/facilities?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${token}`, // 필요시 인증 토큰 추가
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch facilities');
    }

    const data = await response.json();
    return data.facilities;
    */

    // Mock 데이터 (개발용)
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 'facility-1',
            name: '서울역 엘리베이터',
            type: FacilityType.ELEVATOR,
            latitude: 37.5547,
            longitude: 126.9707,
            address: '서울특별시 용산구 한강대로 405',
            description: '1호선, KTX 승강장 연결',
            accessibility: {
              wheelchairAccessible: true,
              hasElevator: true,
              hasRamp: true,
              hasBrailleBlock: true,
              hasAudioGuide: false,
            },
          },
          {
            id: 'facility-2',
            name: '장애인 화장실',
            type: FacilityType.RESTROOM,
            latitude: 37.5557,
            longitude: 126.9717,
            address: '서울특별시 용산구',
            description: '24시간 이용 가능',
            accessibility: {
              wheelchairAccessible: true,
              hasElevator: false,
              hasRamp: true,
              hasBrailleBlock: false,
              hasAudioGuide: false,
            },
          },
          {
            id: 'facility-3',
            name: '장애인 주차장',
            type: FacilityType.PARKING,
            latitude: 37.5537,
            longitude: 126.9697,
            address: '서울특별시 용산구',
            description: '10면 주차 가능',
            openingHours: '24시간',
            accessibility: {
              wheelchairAccessible: true,
              hasElevator: false,
              hasRamp: true,
              hasBrailleBlock: false,
              hasAudioGuide: false,
            },
          },
        ]);
      }, 500); // 네트워크 지연 시뮬레이션
    });
  } catch (error) {
    console.error('Error fetching facilities:', error);
    throw error;
  }
}

/**
 * 장애물 목록 조회
 * 
 * @param bounds - 지도 영역 (위도/경도 범위)
 * @param severities - 필터링할 심각도 배열 (선택)
 * @returns 장애물 배열
 * 
 * API 연동 예시:
 * GET /api/obstacles?minLat=37.5&maxLat=37.6&minLng=127.0&maxLng=127.1&severities=high,critical
 */
export async function fetchObstacles(
  bounds?: {
    minLatitude: number;
    maxLatitude: number;
    minLongitude: number;
    maxLongitude: number;
  },
  severities?: ObstacleSeverity[]
): Promise<Obstacle[]> {
  try {
    // TODO: 실제 API 호출로 교체
    /*
    const queryParams = new URLSearchParams();
    if (bounds) {
      queryParams.append('minLat', bounds.minLatitude.toString());
      queryParams.append('maxLat', bounds.maxLatitude.toString());
      queryParams.append('minLng', bounds.minLongitude.toString());
      queryParams.append('maxLng', bounds.maxLongitude.toString());
    }
    if (severities) {
      queryParams.append('severities', severities.join(','));
    }

    const response = await fetch(`${BASE_URL}/api/obstacles?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${token}`, // 필요시 인증 토큰 추가
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch obstacles');
    }

    const data = await response.json();
    return data.obstacles;
    */

    // Mock 데이터 (개발용)
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 'obstacle-1',
            type: ObstacleType.CONSTRUCTION,
            severity: ObstacleSeverity.HIGH,
            latitude: 37.5552,
            longitude: 126.9702,
            description: '도로 공사 진행 중 - 우회 필요',
            reportedAt: new Date('2024-01-15'),
            isTemporary: true,
            estimatedRemovalDate: new Date('2024-03-31'),
          },
          {
            id: 'obstacle-2',
            type: ObstacleType.STAIRS,
            severity: ObstacleSeverity.CRITICAL,
            latitude: 37.5562,
            longitude: 126.9722,
            description: '계단만 있음 - 휠체어 통행 불가',
            reportedAt: new Date('2023-12-01'),
            isTemporary: false,
          },
          {
            id: 'obstacle-3',
            type: ObstacleType.NARROW_PATH,
            severity: ObstacleSeverity.MEDIUM,
            latitude: 37.5542,
            longitude: 126.9692,
            description: '좁은 통로 - 휠체어 통행 주의',
            reportedAt: new Date('2024-01-20'),
            isTemporary: false,
          },
        ]);
      }, 500); // 네트워크 지연 시뮬레이션
    });
  } catch (error) {
    console.error('Error fetching obstacles:', error);
    throw error;
  }
}

/**
 * 장소 검색
 * 
 * @param query - 검색어
 * @returns 검색 결과 배열
 * 
 * API 연동 예시:
 * GET /api/search?q=서울역
 */
export async function searchPlace(query: string): Promise<MapCoordinates[]> {
  try {
    // TODO: 실제 API 호출로 교체
    /*
    const response = await fetch(`${BASE_URL}/api/search?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to search place');
    }

    const data = await response.json();
    return data.results;
    */

    // Mock 데이터 (개발용)
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            latitude: 37.5547,
            longitude: 126.9707,
          },
        ]);
      }, 300);
    });
  } catch (error) {
    console.error('Error searching place:', error);
    throw error;
  }
}

/**
 * 편의시설 신고/등록
 * 
 * @param facility - 등록할 편의시설 정보
 * @returns 등록된 편의시설 정보
 * 
 * API 연동 예시:
 * POST /api/facilities
 */
export async function reportFacility(
  facility: Omit<Facility, 'id'>
): Promise<Facility> {
  try {
    // TODO: 실제 API 호출로 교체
    /*
    const response = await fetch(`${BASE_URL}/api/facilities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(facility),
    });

    if (!response.ok) {
      throw new Error('Failed to report facility');
    }

    const data = await response.json();
    return data;
    */

    // Mock 응답
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: `facility-${Date.now()}`,
          ...facility,
        });
      }, 500);
    });
  } catch (error) {
    console.error('Error reporting facility:', error);
    throw error;
  }
}

/**
 * 장애물 신고/등록
 * 
 * @param obstacle - 등록할 장애물 정보
 * @returns 등록된 장애물 정보
 * 
 * API 연동 예시:
 * POST /api/obstacles
 */
export async function reportObstacle(
  obstacle: Omit<Obstacle, 'id'>
): Promise<Obstacle> {
  try {
    // TODO: 실제 API 호출로 교체
    /*
    const response = await fetch(`${BASE_URL}/api/obstacles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(obstacle),
    });

    if (!response.ok) {
      throw new Error('Failed to report obstacle');
    }

    const data = await response.json();
    return data;
    */

    // Mock 응답
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: `obstacle-${Date.now()}`,
          ...obstacle,
        });
      }, 500);
    });
  } catch (error) {
    console.error('Error reporting obstacle:', error);
    throw error;
  }
}
