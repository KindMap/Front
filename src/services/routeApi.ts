/**
 * 경로 검색 API 서비스
 * 
 * 이 파일은 백엔드 경로 검색 API와 통신하는 함수들을 포함합니다.
 * 현재는 Mock 데이터를 반환하지만, 실제 API 연동 시 이 함수들의 구현만 변경하면 됩니다.
 * 
 * TODO: 실제 API 엔드포인트로 교체
 * - BASE_URL을 실제 백엔드 서버 주소로 변경
 * - API 키 관리 (환경변수)
 * - 인증 토큰 관리
 * - 에러 핸들링 강화
 */

import { Route, UserType } from '../types';

// TODO: 환경변수로 관리
// 예시: const BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'https://api.mobility-service.com/v1';
const BASE_URL = 'https://api.mobility-service.com/v1';

/**
 * 경로 검색 옵션 인터페이스
 * 각 사용자 유형별로 다른 옵션을 제공합니다.
 */
export interface RouteSearchOptions {
  userType: UserType;
  
  // 휠체어 이용자 옵션
  elevatorOnly?: boolean;
  avoidStairs?: boolean;
  flatRoute?: boolean;
  widePathway?: boolean;
  
  // 영유아 동반자 옵션
  strollerFriendly?: boolean;
  nursingRoom?: boolean;
  restArea?: boolean;
  elevatorPrefer?: boolean;
  
  // 고령자 옵션
  avoidStairsElderly?: boolean;
  restPoints?: boolean;
  flatRouteElderly?: boolean;
  safeRoute?: boolean;
  
  // 임산부 옵션
  gentleSlope?: boolean;
  restAreaPregnant?: boolean;
  avoidStairsPregnant?: boolean;
  medicalNearby?: boolean;
  
  // 저시력자 옵션
  brailleBlock?: boolean;
  audioGuide?: boolean;
  brightPath?: boolean;
  simpleRoute?: boolean;
}

/**
 * 경로 검색 API 호출
 * 
 * @param departure - 출발지 (주소 또는 장소명)
 * @param destination - 도착지 (주소 또는 장소명)
 * @param options - 경로 검색 옵션 (사용자 유형 및 세부 옵션)
 * @returns 검색된 경로 배열
 * 
 * API 연동 예시:
 * POST /api/routes/search
 * 
 * Request Body:
 * {
 *   "departure": "서울역",
 *   "destination": "강남역",
 *   "userType": "wheelchair",
 *   "options": {
 *     "elevatorOnly": true,
 *     "avoidStairs": true,
 *     "flatRoute": true,
 *     "widePathway": true
 *   }
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "routes": [
 *       {
 *         "id": "route-uuid-123",
 *         "departure": "서울역",
 *         "destination": "강남역",
 *         "duration": "28분",
 *         "distance": "12.5km",
 *         "description": "엘리베이터 4회 이용 | 평탄한 도로",
 *         "coordinates": [
 *           { "latitude": 37.5547, "longitude": 126.9707 },
 *           { "latitude": 37.5548, "longitude": 126.9708 },
 *           ...
 *         ],
 *         "obstacles": ["obstacle-id-1", "obstacle-id-2"],
 *         "facilities": ["facility-id-1", "facility-id-2"],
 *         "elevators": 4,
 *         "stairs": 0,
 *         "slope": {
 *           "average": 2.5,
 *           "maximum": 4.8
 *         },
 *         "accessibility": {
 *           "wheelchairFriendly": true,
 *           "hasElevator": true,
 *           "hasRamp": true,
 *           "pathWidth": 1.5
 *         }
 *       }
 *     ],
 *     "totalCount": 3
 *   }
 * }
 * 
 * Error Response:
 * {
 *   "success": false,
 *   "error": {
 *     "code": "ROUTE_NOT_FOUND",
 *     "message": "해당 경로를 찾을 수 없습니다."
 *   }
 * }
 */
export async function searchRoutes(
  departure: string,
  destination: string,
  options: RouteSearchOptions
): Promise<Route[]> {
  try {
    // TODO: 실제 API 호출로 교체
    /*
    const response = await fetch(`${BASE_URL}/api/routes/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`, // 인증 토큰
        'X-API-Key': process.env.VITE_API_KEY, // API 키 (또는 import.meta.env?.VITE_API_KEY)
      },
      body: JSON.stringify({
        departure,
        destination,
        userType: options.userType,
        options: {
          // 사용자 유형에 따른 옵션 전달
          ...(options.userType === UserType.WHEELCHAIR && {
            elevatorOnly: options.elevatorOnly,
            avoidStairs: options.avoidStairs,
            flatRoute: options.flatRoute,
            widePathway: options.widePathway,
          }),
          ...(options.userType === UserType.INFANT && {
            strollerFriendly: options.strollerFriendly,
            nursingRoom: options.nursingRoom,
            restArea: options.restArea,
            elevatorPrefer: options.elevatorPrefer,
          }),
          // ... 다른 유형들도 동일하게
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to search routes');
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error?.message || 'Search failed');
    }

    return data.data.routes;
    */

    // Mock 데이터 반환 (개발/테스트용)
    return getMockRoutes(departure, destination, options.userType);
  } catch (error) {
    console.error('Error searching routes:', error);
    throw error;
  }
}

/**
 * 특정 경로의 상세 정보 조회
 * 
 * @param routeId - 경로 ID
 * @returns 경로 상세 정보
 * 
 * API 연동 예시:
 * GET /api/routes/{routeId}
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "route": {
 *       "id": "route-uuid-123",
 *       "departure": { ... },
 *       "destination": { ... },
 *       "segments": [
 *         {
 *           "id": "segment-1",
 *           "type": "walk",
 *           "distance": 500,
 *           "duration": 420,
 *           "instructions": "직진 500m",
 *           "coordinates": [ ... ]
 *         },
 *         {
 *           "id": "segment-2",
 *           "type": "subway",
 *           "line": "2호선",
 *           "stations": 5,
 *           "duration": 600,
 *           "instructions": "2호선 탑승 (5개 역)"
 *         }
 *       ],
 *       "warnings": [
 *         {
 *           "type": "obstacle",
 *           "message": "공사 구간 우회 필요",
 *           "location": { ... }
 *         }
 *       ],
 *       "alternatives": ["route-uuid-124", "route-uuid-125"]
 *     }
 *   }
 * }
 */
export async function getRouteDetails(routeId: string): Promise<Route> {
  try {
    // TODO: 실제 API 호출로 교체
    /*
    const response = await fetch(`${BASE_URL}/api/routes/${routeId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch route details');
    }

    const data = await response.json();
    return data.data.route;
    */

    // Mock 데이터
    throw new Error('Not implemented');
  } catch (error) {
    console.error('Error fetching route details:', error);
    throw error;
  }
}

/**
 * 실시간 경로 업데이트 구독
 * WebSocket 또는 Server-Sent Events를 통한 실시간 업데이트
 * 
 * 사용 예시:
 * const unsubscribe = subscribeToRouteUpdates(routeId, (update) => {
 *   console.log('Route updated:', update);
 *   // 장애물 발생, 경로 변경 등의 업데이트 처리
 * });
 * 
 * // 컴포넌트 언마운트 시
 * unsubscribe();
 */
export function subscribeToRouteUpdates(
  routeId: string,
  callback: (update: any) => void
): () => void {
  // TODO: WebSocket 연결
  /*
  const ws = new WebSocket(`wss://api.mobility-service.com/routes/${routeId}/updates`);
  
  ws.onmessage = (event) => {
    const update = JSON.parse(event.data);
    callback(update);
  };
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
  
  // 구독 해제 함수 반환
  return () => {
    ws.close();
  };
  */

  // Mock 구현
  return () => {
    console.log('Unsubscribed from route updates');
  };
}

/**
 * 경로 평가 제출
 * 사용자가 경로를 사용한 후 피드백을 제공
 * 
 * @param routeId - 경로 ID
 * @param rating - 평점 (1-5)
 * @param feedback - 피드백 텍스트
 * @param issues - 발견한 문제들
 */
export async function submitRouteFeedback(
  routeId: string,
  rating: number,
  feedback?: string,
  issues?: Array<{
    type: 'obstacle' | 'inaccurate' | 'unsafe';
    description: string;
    location?: { latitude: number; longitude: number };
  }>
): Promise<void> {
  try {
    // TODO: 실제 API 호출로 교체
    /*
    const response = await fetch(`${BASE_URL}/api/routes/${routeId}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({
        rating,
        feedback,
        issues,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to submit feedback');
    }
    */

    console.log('Feedback submitted:', { routeId, rating, feedback, issues });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    throw error;
  }
}

/**
 * Mock 데이터 생성 함수 (개발/테스트용)
 * 실제 API 연동 후에는 제거
 */
function getMockRoutes(
  departure: string,
  destination: string,
  userType: UserType
): Route[] {
  const baseRoutes: Record<UserType, Route[]> = {
    [UserType.WHEELCHAIR]: [
      {
        id: 'wheelchair-1',
        departure,
        destination,
        duration: '28분',
        distance: '3.0km',
        description: '🛗 엘리베이터 4회 이용 | 평탄한 도로 | 휠체어 전용 램프',
      },
      {
        id: 'wheelchair-2',
        departure,
        destination,
        duration: '32분',
        distance: '3.3km',
        description: '🛗 엘리베이터 3회 이용 | 경사 5% 미만 | 자동문 설치',
      },
    ],
    [UserType.INFANT]: [
      {
        id: 'infant-1',
        departure,
        destination,
        duration: '30분',
        distance: '2.8km',
        description: '👶 수유실 2곳 | 엘리베이터 이용 | 유모차 통행 가능',
      },
    ],
    [UserType.ELDERLY]: [
      {
        id: 'elderly-1',
        departure,
        destination,
        duration: '32분',
        distance: '2.3km',
        description: '🏥 휴게 벤치 5곳 | 계단 없음 | 횡단보도 신호 충분',
      },
    ],
    [UserType.PREGNANT]: [
      {
        id: 'pregnant-1',
        departure,
        destination,
        duration: '30분',
        distance: '2.5km',
        description: '💜 경사 3% 미만 | 휴게 벤치 多 | 엘리베이터 이용',
      },
    ],
    [UserType.LOW_VISION]: [
      {
        id: 'lowvision-1',
        departure,
        destination,
        duration: '27분',
        distance: '2.4km',
        description: '👁️ 점자블록 완비 | 음성신호등 多 | 음성안내 시스템',
      },
    ],
  };

  return baseRoutes[userType] || [];
}

/**
 * 인증 토큰 가져오기
 * localStorage 또는 Context에서 관리
 */
function getAuthToken(): string | null {
  // TODO: 실제 인증 시스템과 연동
  return localStorage.getItem('authToken');
}
