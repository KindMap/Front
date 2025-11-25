/**
 * JWT 인증 API 서비스
 *
 * 백엔드 인증 엔드포인트와 통신하는 함수들을 제공합니다.
 * Base URL: /api/v1/auth
 */

import {
  User,
  LoginRequest,
  RegisterRequest,
  TokenResponse,
} from "../types/auth";
import { tokenManager } from "./tokenManager";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://kindmap-for-you.cloud";

export const authApi = {
  /**
   * 로그인
   * POST /api/v1/auth/login
   *
   * ⚠️ 주의: application/x-www-form-urlencoded 형식 사용 (OAuth2 표준)
   * username 필드에 email을 전송해야 함
   */
  login: async (credentials: LoginRequest): Promise<TokenResponse> => {
    const formData = new URLSearchParams();
    formData.append("username", credentials.email); // ⚠️ username 필드에 email 전송
    formData.append("password", credentials.password);

    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ detail: "로그인에 실패했습니다." }));
      throw new Error(error.detail || "로그인에 실패했습니다.");
    }

    const data: TokenResponse = await response.json();
    return data;
  },

  /**
   * 회원가입
   * POST /api/v1/auth/register
   *
   * JSON 형식으로 사용자 정보를 전송합니다.
   */
  register: async (data: RegisterRequest): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ detail: "회원가입에 실패했습니다." }));
      throw new Error(error.detail || "회원가입에 실패했습니다.");
    }

    const user: User = await response.json();
    return user;
  },

  /**
   * 현재 사용자 정보 조회
   * GET /api/v1/auth/me
   *
   * Authorization 헤더에 Bearer token 필요
   */
  getCurrentUser: async (): Promise<User> => {
    const token = tokenManager.getAccessToken();
    if (!token) {
      throw new Error("인증 토큰이 없습니다.");
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ detail: "사용자 정보를 가져올 수 없습니다." }));
      throw new Error(error.detail || "사용자 정보를 가져올 수 없습니다.");
    }

    const user: User = await response.json();
    return user;
  },

  /**
   * 토큰 갱신
   * POST /api/v1/auth/refresh
   *
   * Refresh token을 사용하여 새로운 access token과 refresh token을 발급받습니다.
   */
  refreshToken: async (): Promise<TokenResponse> => {
    const refreshToken = tokenManager.getRefreshToken();
    if (!refreshToken) {
      throw new Error("Refresh token이 없습니다.");
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ detail: "토큰 갱신에 실패했습니다." }));
      throw new Error(error.detail || "토큰 갱신에 실패했습니다.");
    }

    const data: TokenResponse = await response.json();
    return data;
  },

  /**
   * 로그아웃
   * POST /api/v1/auth/logout
   *
   * 서버에서 refresh token을 삭제하고, 로컬에서도 토큰을 제거합니다.
   */
  logout: async (): Promise<void> => {
    const token = tokenManager.getAccessToken();

    if (token) {
      try {
        await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        // 로그아웃 API 실패해도 로컬 토큰은 삭제
        console.error("Logout API failed:", error);
      }
    }

    // 로컬 토큰 삭제
    tokenManager.clearTokens();
  },
};
