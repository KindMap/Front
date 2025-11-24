/**
 * AuthContext - 전역 인증 상태 관리
 *
 * JWT 기반 인증 시스템의 전역 상태를 관리합니다.
 * - 사용자 로그인/로그아웃
 * - 회원가입
 * - 자동 토큰 갱신 (25분마다)
 * - 사용자 정보 조회
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authApi } from '../services/authApi';
import { tokenManager } from '../services/tokenManager';
import { User, LoginRequest, RegisterRequest, AuthState } from '../types/auth';

interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true, // 초기 로드 중
    error: null,
  });

  /**
   * 초기 로드: 저장된 토큰이 있으면 사용자 정보 가져오기
   */
  useEffect(() => {
    const initAuth = async () => {
      if (tokenManager.hasTokens()) {
        try {
          const user = await authApi.getCurrentUser();
          setState({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          console.error('Initial user fetch failed:', error);
          // 토큰이 유효하지 않으면 삭제
          tokenManager.clearTokens();
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      } else {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    initAuth();
  }, []);

  /**
   * 자동 토큰 갱신 (25분마다)
   * Access token 만료 시간: 30분
   * 만료 5분 전에 갱신하여 중단 없는 서비스 제공
   */
  useEffect(() => {
    if (!state.isAuthenticated) return;

    const interval = setInterval(
      async () => {
        try {
          const { access_token, refresh_token } = await authApi.refreshToken();
          tokenManager.setTokens(access_token, refresh_token);
          console.log('[AuthContext] Token refreshed successfully');
        } catch (error) {
          console.error('[AuthContext] Token refresh failed:', error);
          // 토큰 갱신 실패 시 로그아웃
          await logout();
        }
      },
      25 * 60 * 1000
    ); // 25분

    return () => clearInterval(interval);
  }, [state.isAuthenticated]);

  /**
   * 로그인
   */
  const login = useCallback(async (credentials: LoginRequest) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // 1. 로그인 API 호출
      const { access_token, refresh_token } = await authApi.login(credentials);
      tokenManager.setTokens(access_token, refresh_token);

      // 2. 사용자 정보 가져오기
      const user = await authApi.getCurrentUser();

      // 3. 상태 업데이트
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      console.log('[AuthContext] Login successful:', user.email);
    } catch (error: any) {
      console.error('[AuthContext] Login failed:', error);
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error.message,
      });
      throw error; // 컴포넌트에서 에러 처리 가능하도록
    }
  }, []);

  /**
   * 회원가입
   * 회원가입 성공 후 자동으로 로그인
   */
  const register = useCallback(
    async (data: RegisterRequest) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        // 1. 회원가입 API 호출
        const user = await authApi.register(data);
        console.log('[AuthContext] Registration successful:', user.email);

        // 2. 자동 로그인
        await login({ email: data.email, password: data.password });
      } catch (error: any) {
        console.error('[AuthContext] Registration failed:', error);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error.message,
        }));
        throw error;
      }
    },
    [login]
  );

  /**
   * 로그아웃
   */
  const logout = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      // 1. 로그아웃 API 호출 (서버에서 refresh token 삭제)
      await authApi.logout();
      console.log('[AuthContext] Logout successful');
    } catch (error) {
      console.error('[AuthContext] Logout API failed:', error);
      // API 실패해도 로컬 상태는 초기화
    } finally {
      // 2. 로컬 상태 초기화
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  }, []);

  /**
   * 사용자 정보 새로고침
   * 프로필 업데이트 후 호출하여 최신 정보 반영
   */
  const refreshUser = useCallback(async () => {
    if (!tokenManager.hasTokens()) return;

    try {
      const user = await authApi.getCurrentUser();
      setState((prev) => ({ ...prev, user }));
      console.log('[AuthContext] User info refreshed');
    } catch (error) {
      console.error('[AuthContext] User refresh failed:', error);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth 훅
 * 컴포넌트에서 인증 상태와 함수에 접근할 수 있습니다.
 *
 * @example
 * const { user, isAuthenticated, login, logout } = useAuth();
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
