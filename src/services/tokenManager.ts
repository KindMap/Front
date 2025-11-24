/**
 * JWT 토큰 관리 유틸리티
 *
 * localStorage를 사용하여 access_token과 refresh_token을 안전하게 관리합니다.
 */

const ACCESS_TOKEN_KEY = 'kindmap_access_token';
const REFRESH_TOKEN_KEY = 'kindmap_refresh_token';

export const tokenManager = {
  /**
   * Access Token 조회
   */
  getAccessToken: (): string | null => {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  /**
   * Access Token 저장
   */
  setAccessToken: (token: string): void => {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },

  /**
   * Refresh Token 조회
   */
  getRefreshToken: (): string | null => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  /**
   * Refresh Token 저장
   */
  setRefreshToken: (token: string): void => {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  },

  /**
   * 토큰 쌍 저장 (access + refresh)
   */
  setTokens: (accessToken: string, refreshToken: string): void => {
    tokenManager.setAccessToken(accessToken);
    tokenManager.setRefreshToken(refreshToken);
  },

  /**
   * 모든 토큰 삭제 (로그아웃 시 사용)
   */
  clearTokens: (): void => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  /**
   * 토큰 존재 여부 확인
   */
  hasTokens: (): boolean => {
    return !!tokenManager.getAccessToken() && !!tokenManager.getRefreshToken();
  },

  /**
   * Access Token만 존재하는지 확인
   */
  hasAccessToken: (): boolean => {
    return !!tokenManager.getAccessToken();
  },

  /**
   * Refresh Token만 존재하는지 확인
   */
  hasRefreshToken: (): boolean => {
    return !!tokenManager.getRefreshToken();
  },
};
