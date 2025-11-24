import { useState } from 'react';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { useNavigate } from 'react-router-dom';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useVoiceGuide } from '../contexts/VoiceGuideContext';
import { useAuth } from '../contexts/AuthContext';

export function LoginPage() {
  const navigate = useNavigate();
  const { speak } = useVoiceGuide();
  const { login, error: authError, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    // 기본 유효성 검증
    if (!email || !password) {
      setLocalError('이메일과 비밀번호를 입력해주세요.');
      speak('이메일과 비밀번호를 입력해주세요');
      return;
    }

    try {
      await login({ email, password });
      speak('로그인 성공');
      navigate('/'); // 로그인 성공 시 홈으로 이동
    } catch (error: any) {
      setLocalError(error.message || '로그인에 실패했습니다.');
      speak('로그인 실패. ' + (error.message || '다시 시도해주세요'));
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Back Button - Top Left */}
      <div className="absolute top-4 left-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate('/')}
          onMouseEnter={() => speak('뒤로가기')}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </div>

      {/* Login Card */}
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="mb-2">로그인</h1>
          <p className="text-muted-foreground">
            계정에 로그인하세요
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* 에러 메시지 표시 */}
          {(localError || authError) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{localError || authError}</p>
            </div>
          )}

          <div>
            <label className="block mb-2">사용자</label>
            <Input
              type="email"
              placeholder="이메일을 입력하세요"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => speak('사용자 입력')}
              disabled={isLoading}
              required
            />
          </div>
          <div>
            <label className="block mb-2">비밀번호</label>
            <Input
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => speak('비밀번호 입력')}
              disabled={isLoading}
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            onMouseEnter={() => speak('로그인하기')}
            disabled={isLoading}
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </Button>

          {/* 회원가입 링크 */}
          <div className="text-center mt-4">
            <p className="text-sm text-muted-foreground">
              계정이 없으신가요?{' '}
              <button
                type="button"
                onClick={() => navigate('/signup')}
                onMouseEnter={() => speak('회원가입')}
                className="text-primary hover:underline font-medium"
              >
                회원가입
              </button>
            </p>
          </div>
        </form>
      </Card>
    </div>
  );
}