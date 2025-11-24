/**
 * SignupPage - 회원가입 페이지
 *
 * JWT 기반 회원가입 기능을 제공합니다.
 * - 이메일, 비밀번호, 사용자명, 장애 유형 입력
 * - 비밀번호 확인 검증
 * - 회원가입 성공 시 자동 로그인
 */

import { useState } from 'react';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { useNavigate } from 'react-router-dom';
import { useVoiceGuide } from '../contexts/VoiceGuideContext';
import { useAuth } from '../contexts/AuthContext';
import { DisabilityTypeLabels } from '../types/auth';

export function SignupPage() {
  const navigate = useNavigate();
  const { speak } = useVoiceGuide();
  const { register, error: authError, isLoading } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    disability_type: 'NONE' as 'PHY' | 'VIS' | 'AUD' | 'ELD' | 'NONE',
  });
  const [localError, setLocalError] = useState<string | null>(null);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setLocalError(null); // 입력 시 에러 메시지 초기화
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    // 유효성 검증
    if (!formData.email || !formData.password) {
      setLocalError('이메일과 비밀번호는 필수 입력 항목입니다.');
      speak('이메일과 비밀번호를 입력해주세요');
      return;
    }

    if (formData.password.length < 8) {
      setLocalError('비밀번호는 최소 8자 이상이어야 합니다.');
      speak('비밀번호는 최소 8자 이상이어야 합니다');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setLocalError('비밀번호가 일치하지 않습니다.');
      speak('비밀번호가 일치하지 않습니다');
      return;
    }

    try {
      // 회원가입 (성공 시 자동 로그인)
      await register({
        email: formData.email,
        password: formData.password,
        username: formData.username || undefined,
        disability_type: formData.disability_type !== 'NONE' ? formData.disability_type : undefined,
      });
      speak('회원가입 성공. 로그인되었습니다.');
      navigate('/'); // 홈으로 이동
    } catch (error: any) {
      setLocalError(error.message || '회원가입에 실패했습니다.');
      speak('회원가입 실패. ' + (error.message || '다시 시도해주세요'));
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Back Button */}
      <div className="absolute top-4 left-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate('/login')}
          onMouseEnter={() => speak('로그인 페이지로 돌아가기')}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </div>

      {/* Signup Card */}
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="mb-2">회원가입</h1>
          <p className="text-muted-foreground">새로운 계정을 만드세요</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 에러 메시지 */}
          {(localError || authError) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{localError || authError}</p>
            </div>
          )}

          {/* 이메일 */}
          <div>
            <label className="block mb-2 font-medium">
              이메일 <span className="text-red-500">*</span>
            </label>
            <Input
              type="email"
              placeholder="이메일을 입력하세요"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              onFocus={() => speak('이메일 입력')}
              disabled={isLoading}
              required
            />
          </div>

          {/* 비밀번호 */}
          <div>
            <label className="block mb-2 font-medium">
              비밀번호 <span className="text-red-500">*</span>
            </label>
            <Input
              type="password"
              placeholder="최소 8자 이상"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              onFocus={() => speak('비밀번호 입력')}
              disabled={isLoading}
              minLength={8}
              required
            />
          </div>

          {/* 비밀번호 확인 */}
          <div>
            <label className="block mb-2 font-medium">
              비밀번호 확인 <span className="text-red-500">*</span>
            </label>
            <Input
              type="password"
              placeholder="비밀번호를 다시 입력하세요"
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              onFocus={() => speak('비밀번호 확인 입력')}
              disabled={isLoading}
              required
            />
          </div>

          {/* 사용자명 (선택) */}
          <div>
            <label className="block mb-2 font-medium">사용자명 (선택)</label>
            <Input
              type="text"
              placeholder="표시할 이름을 입력하세요"
              value={formData.username}
              onChange={(e) => handleChange('username', e.target.value)}
              onFocus={() => speak('사용자명 입력')}
              disabled={isLoading}
            />
          </div>

          {/* 장애 유형 선택 */}
          <div>
            <label className="block mb-2 font-medium">장애 유형 (선택)</label>
            <select
              className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              value={formData.disability_type}
              onChange={(e) =>
                handleChange('disability_type', e.target.value)
              }
              onFocus={() => speak('장애 유형 선택')}
              disabled={isLoading}
            >
              {Object.entries(DisabilityTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground mt-1">
              맞춤형 경로 추천을 위해 선택해주세요
            </p>
          </div>

          {/* 회원가입 버튼 */}
          <Button
            type="submit"
            className="w-full"
            onMouseEnter={() => speak('회원가입하기')}
            disabled={isLoading}
          >
            {isLoading ? '가입 중...' : '회원가입'}
          </Button>

          {/* 로그인 링크 */}
          <div className="text-center mt-4">
            <p className="text-sm text-muted-foreground">
              이미 계정이 있으신가요?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                onMouseEnter={() => speak('로그인')}
                className="text-primary hover:underline font-medium"
              >
                로그인
              </button>
            </p>
          </div>
        </form>
      </Card>
    </div>
  );
}
