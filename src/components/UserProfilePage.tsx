/**
 * UserProfilePage - 사용자 프로필 페이지
 *
 * 사용자 정보를 표시하고 로그아웃 기능을 제공합니다.
 */

import { ArrowLeft, User, Mail, Calendar, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useVoiceGuide } from '../contexts/VoiceGuideContext';
import { DisabilityTypeLabels } from '../types/auth';

export function UserProfilePage() {
  const navigate = useNavigate();
  const { user, logout, isLoading } = useAuth();
  const { speak } = useVoiceGuide();

  const handleLogout = async () => {
    if (window.confirm('정말 로그아웃하시겠습니까?')) {
      await logout();
      speak('로그아웃되었습니다');
      navigate('/login');
    }
  };

  if (!user) {
    return null;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              onMouseEnter={() => speak('홈으로 돌아가기')}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold">내 프로필</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            onMouseEnter={() => speak('로그아웃')}
            disabled={isLoading}
            className="text-primary-foreground hover:bg-primary-foreground/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            로그아웃
          </Button>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* User Avatar Card */}
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {user.username || '사용자'}
              </h2>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </Card>

        {/* User Info Card */}
        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-semibold mb-4">계정 정보</h3>

          {/* Email */}
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">이메일</p>
              <p className="font-medium">{user.email}</p>
            </div>
          </div>

          {/* User ID */}
          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">사용자 ID</p>
              <p className="font-mono text-sm">{user.user_id}</p>
            </div>
          </div>

          {/* Created At */}
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">가입일</p>
              <p className="font-medium">{formatDate(user.created_at)}</p>
            </div>
          </div>

          {/* Disability Type */}
          {user.disability_type && user.disability_type !== 'NONE' && (
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 flex items-center justify-center text-muted-foreground mt-0.5">
                ♿
              </div>
              <div>
                <p className="text-sm text-muted-foreground">장애 유형</p>
                <p className="font-medium">
                  {DisabilityTypeLabels[user.disability_type] ||
                    user.disability_type}
                </p>
              </div>
            </div>
          )}
        </Card>

        {/* Actions Card */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">설정</h3>
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate('/favorites')}
              onMouseEnter={() => speak('즐겨찾기 관리')}
            >
              ⭐ 즐겨찾기 관리
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate('/user-type-selection')}
              onMouseEnter={() => speak('장애 유형 변경')}
            >
              🔄 장애 유형 변경
            </Button>
          </div>
        </Card>

        {/* Logout Button */}
        <Button
          variant="destructive"
          className="w-full"
          onClick={handleLogout}
          onMouseEnter={() => speak('로그아웃')}
          disabled={isLoading}
        >
          <LogOut className="w-4 h-4 mr-2" />
          {isLoading ? '로그아웃 중...' : '로그아웃'}
        </Button>
      </div>
    </div>
  );
}
