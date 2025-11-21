import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Accessibility, Users, Eye, Ear } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useHighContrast } from '../contexts/HighContrastContext';
import { useVoiceGuide } from '../contexts/VoiceGuideContext';

/**
 * 사용자 유형 선택 페이지 컴포넌트
 *
 * 사용자가 자신의 유형을 선택하여, 맞춤형 경로검색 페이지로 이동하도록 돕습니다.
 */
export function UserTypeSelectionPage() {
  const navigate = useNavigate();
  const { isHighContrast } = useHighContrast();
  const { speak } = useVoiceGuide();

  const userTypes = [
    {
      id: 'physical-disability',
      title: '지체장애인',
      description: '휠체어, 엘리베이터 등 접근성을 고려한 경로 검색',
      icon: Accessibility,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      route: '/route-search/physical-disability',
    },
    {
      id: 'auditory',
      title: '청각장애인',
      description: '음성 안내 없이 시각 정보 위주의 경로 검색',
      icon: Ear,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      route: '/route-search/auditory',
    },
    {
      id: 'visual',
      title: '시각장애인',
      description: '음성 안내 및 화면 읽기 기능을 통한 경로 검색',
      icon: Eye,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      route: '/route-search/visual',
    },
    {
      id: 'elderly',
      title: '노약자',
      description: '복잡하지 않고, 걷는 구간이 적은 경로 검색',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      route: '/route-search/elderly',
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
              편리한 경로 안내를 위해 자신의 유형을 선택해주세요.
            </p>
          </div>
        </div>

        {/* 사용자 유형 카드 목록 */}
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

        {/* 안내 문구
        <div className="mt-8 p-4 bg-card border border-border rounded-lg">
          <p className="text-sm">
            참고: <strong>안내:</strong> 선택하기를 누르면 해당 사용자의 특성에 맞는 편의시설 정보를 지도에 표시합니다.
            편의시설은 언제든지 끄고 켤 수 있습니다.
          </p>
        </div> */}
      </div>
    </div>
  );
}
