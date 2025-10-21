import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Accessibility, BadgeHelp, Users, Heart, Eye } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useHighContrast } from '../contexts/HighContrastContext';
import { useVoiceGuide } from '../contexts/VoiceGuideContext';

/**
 * 사용자 유형 선택 페이지
 * 
 * 교통 약자 유형을 선택하여 맞춤형 경로검색 페이지로 이동합니다.
 */
export function UserTypeSelectionPage() {
  const navigate = useNavigate();
  const { isHighContrast } = useHighContrast();
  const { speak } = useVoiceGuide();

  const userTypes = [
    {
      id: 'wheelchair',
      title: '휠체어 이용자',
      description: '휠체어로 이동 가능한 경로를 찾아드립니다',
      icon: Accessibility,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      route: '/route-search/wheelchair',
    },
    {
      id: 'infant',
      title: '영유아 동반자',
      description: '유모차와 함께 이동 가능한 경로를 찾아드립니다',
      icon: BadgeHelp,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      route: '/route-search/infant',
    },
    {
      id: 'elderly',
      title: '고령자',
      description: '계단이 적고 휴게시설이 있는 경로를 찾아드립니다',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      route: '/route-search/elderly',
    },
    {
      id: 'pregnant',
      title: '임산부',
      description: '경사가 완만하고 안전한 경로를 찾아드립니다',
      icon: Heart,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      route: '/route-search/pregnant',
    },
    {
      id: 'low-vision',
      title: '저시력자',
      description: '점자블록과 음성안내가 있는 경로를 찾아드립니다',
      icon: Eye,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      route: '/route-search/low-vision',
    },
  ];

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center gap-4 mb-6 pt-4">
          <Button
            size="icon"
            variant="outline"
            onClick={() => navigate('/')}
            className="shadow-md"
            onMouseEnter={() => speak('뒤로가기')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="mb-1">사용자 유형 선택</h1>
            <p className="text-muted-foreground">
              맞춤형 경로 안내를 위해 해당하는 유형을 선택해주세요
            </p>
          </div>
        </div>

        {/* 사용자 유형 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {userTypes.map((type) => {
            const Icon = type.icon;
            return (
              <Card
                key={type.id}
                className={`cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${
                  isHighContrast ? 'border-4' : ''
                }`}
                onClick={() => navigate(type.route)}
                onMouseEnter={() => speak(type.title)}
              >
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-lg ${
                        isHighContrast ? 'bg-primary' : type.bgColor
                      }`}
                    >
                      <Icon
                        className={`w-8 h-8 ${
                          isHighContrast ? 'text-primary-foreground' : type.color
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="mb-2">{type.title}</CardTitle>
                      <CardDescription>{type.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onMouseEnter={() => speak('선택하기')}
                  >
                    선택하기
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* 안내 메시지 */}
        <div className="mt-8 p-4 bg-card border border-border rounded-lg">
          <p className="text-sm">
            💡 <strong>안내:</strong> 선택하신 유형에 따라 최적화된 경로와 편의시설 정보를 제공합니다.
            언제든지 설정을 변경할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
