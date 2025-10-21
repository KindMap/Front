import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { useNavigate } from 'react-router-dom';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useVoiceGuide } from '../contexts/VoiceGuideContext';

export function LoginPage() {
  const navigate = useNavigate();
  const { speak } = useVoiceGuide();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login - just navigate back
    navigate('/');
  };

  const handleSocialLogin = (provider: string) => {
    console.log(`Login with ${provider}`);
    // Mock social login
    navigate('/');
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
            교통 약자 지원 서비스
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 mb-6">
          <div>
            <label className="block mb-2">아이디</label>
            <Input
              type="email"
              placeholder="이메일을 입력하세요"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => speak('아이디 입력란')}
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
              onFocus={() => speak('비밀번호 입력란')}
              required
            />
          </div>
          <Button 
            type="submit" 
            className="w-full"
            onMouseEnter={() => speak('로그인 버튼')}
          >
            로그인
          </Button>
        </form>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-card px-4 text-muted-foreground">
              간편 로그인
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* Google Login */}
          <Button
            type="button"
            variant="outline"
            className="h-14"
            onClick={() => handleSocialLogin('Google')}
            onMouseEnter={() => speak('구글 로그인')}
          >
            <div className="flex flex-col items-center gap-1">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-xs">Google</span>
            </div>
          </Button>

          {/* Kakao Login */}
          <Button
            type="button"
            variant="outline"
            className="h-14"
            onClick={() => handleSocialLogin('Kakao')}
            onMouseEnter={() => speak('카카오 로그인')}
          >
            <div className="flex flex-col items-center gap-1">
              <div className="w-6 h-6 rounded-full bg-[#FEE500] flex items-center justify-center">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#000000">
                  <path d="M12 3C6.477 3 2 6.477 2 10.75c0 2.567 1.656 4.824 4.157 6.151-.175.642-.644 2.367-.738 2.75-.113.462.168.455.354.331.145-.097 2.363-1.584 3.268-2.186.639.088 1.297.134 1.959.134 5.523 0 10-3.477 10-7.75S17.523 3 12 3z" />
                </svg>
              </div>
              <span className="text-xs">Kakao</span>
            </div>
          </Button>

          {/* Naver Login */}
          <Button
            type="button"
            variant="outline"
            className="h-14"
            onClick={() => handleSocialLogin('Naver')}
            onMouseEnter={() => speak('네이버 로그인')}
          >
            <div className="flex flex-col items-center gap-1">
              <div className="w-6 h-6 rounded-sm bg-[#03C75A] flex items-center justify-center">
                <span className="text-white text-xs">N</span>
              </div>
              <span className="text-xs">Naver</span>
            </div>
          </Button>
        </div>

        <div className="mt-6 text-center">
          <button
            type="button"
            className="text-sm text-muted-foreground hover:underline"
            onClick={() => console.log('Sign up')}
            onMouseEnter={() => speak('회원가입')}
          >
            계정이 없으신가요? 회원가입
          </button>
        </div>
      </Card>
    </div>
  );
}
