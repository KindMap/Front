/**
 * 인증 관련 TypeScript 타입 정의
 */

/**
 * 사용자 정보
 */
export interface User {
  user_id: string;
  email: string;
  username?: string;
  disability_type?: 'PHY' | 'VIS' | 'AUD' | 'ELD' | 'NONE';
  created_at: string;
}

/**
 * 로그인 요청 데이터
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * 회원가입 요청 데이터
 */
export interface RegisterRequest {
  email: string;
  password: string;
  username?: string;
  disability_type?: 'PHY' | 'VIS' | 'AUD' | 'ELD' | 'NONE';
}

/**
 * 토큰 응답 데이터
 */
export interface TokenResponse {
  access_token: string;
  refresh_token: string;
}

/**
 * 전역 인증 상태
 */
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * 장애 유형 레이블 매핑
 */
export const DisabilityTypeLabels: Record<string, string> = {
  PHY: '지체장애 (휠체어 사용자)',
  VIS: '시각장애',
  AUD: '청각장애',
  ELD: '고령자',
  NONE: '해당 없음',
};
