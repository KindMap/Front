import { Route } from "../types";

const BASE_URL = "/api";

export interface RouteSearchResult {
  id: string;
  departure: string;
  destination: string;
  duration: string;
  distance: string;
  description: string;
  // API 응답에 따라 필드를 추가해야 할 수 있습니다.
  // 예: coordinates, steps 등
}

/**
 * 경로 검색 API 호출
 *
 * @param origin - 출발지
 * @param destination - 도착지
 * @param disability_type - 교통약자 유형 (e.g., "PHY", "VIS", "AUD", "ELD")
 * @returns 검색된 경로 결과 배열
 */
export async function searchRoutes(
  origin: string,
  destination: string,
  disability_type: string
): Promise<any> {
  // API 응답 타입에 맞게 수정해야 합니다.
  try {
    const now = new Date();
    const departure_time = now.getHours() * 60 + now.getMinutes();

    const response = await fetch(`${BASE_URL}/v1/navigation/calculate`, {
      // routes => navigation/calculate
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status_code: 200,
        origin,
        destination,
        // departure_time,
        disability_type,
        // max_rounds: 5,
      }),
    });

    if (!response.ok) {
      // 서버가 2xx 범위가 아닌 상태 코드를 반환했을 때
      const errorData = await response.json().catch(() => null); // JSON 파싱 실패를 대비
      console.error("Server response was not ok.", {
        status: response.status,
        statusText: response.statusText,
        errorData,
      });
      throw new Error(
        errorData?.message || "Failed to search routes from server"
      );
    }

    const data = await response.json();

    // API 응답 형식에 따라 반환 데이터 구조를 맞춰야 합니다.
    // 예: return data.routes;
    return data;
  } catch (error) {
    console.error("Error searching routes:", error);
    // 네트워크 에러나 JSON 파싱 에러 등
    throw error;
  }
}
