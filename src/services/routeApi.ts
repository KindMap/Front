import { Route } from "../types";
import { tokenManager } from "./tokenManager";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface RouteSuccessResponse {
  route_id: string;
  origin: string;
  destination: string;
  routes: object[];
}

export interface RouteValidationError {
  detail: {
    loc: (string | number)[];
    msg: string;
    type: string;
  }[];
}

/**
 * 경로 검색 API 호출
 *
 * @param origin - 출발지
 * @param destination - 도착지
 * @param disability_type - 교통약자 유형 (e.g., "PHY", "VIS", "AUD", "ELD")
 * @returns 검색된 경로 결과
 */
export async function searchRoutes(
  origin: string,
  destination: string,
  disability_type: string
): Promise<RouteSuccessResponse> {
  try {
    // Access token 가져오기
    const token = tokenManager.getAccessToken();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // 토큰이 있으면 Authorization 헤더 추가
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}/api/v1/navigation/calculate`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        origin,
        destination,
        disability_type,
      }),
    });

    if (!response.ok) {
      const errorData: RouteValidationError | { detail: string } = await response
        .json()
        .catch(() => ({ detail: "Failed to parse error response" }));
      console.error("Server response was not ok.", {
        status: response.status,
        statusText: response.statusText,
        errorData,
      });

      // It's better to throw an object that includes the structured error data
      throw { status: response.status, errorData };
    }

    const data: RouteSuccessResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error searching routes:", error);
    throw error;
  }
}
