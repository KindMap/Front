import { useState } from 'react';
import { ArrowRight, ArrowLeft, Check, Ear } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { useNavigate } from 'react-router-dom';
import { Route } from '../types';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { useVoiceGuide } from '../contexts/VoiceGuideContext';

interface AuditoryRouteSearchPageProps {
  onRouteSelect?: (route: Route) => void;
  addToFavorites?: boolean;
}

/**
 * 청각장애인을 위한 경로검색 페이지
 *
 * 시각적 안내 및 명확한 정보 전달에 중점을 둔 경로를 제공합니다.
 */
export function AuditoryRouteSearchPage({ onRouteSelect, addToFavorites = false }: AuditoryRouteSearchPageProps) {
  const navigate = useNavigate();
  const { speak } = useVoiceGuide();
  const [departure, setDeparture] = useState('');
  const [destination, setDestination] = useState('');
  const [routes, setRoutes] = useState<Route[]>([]);
  const [searched, setSearched] = useState(false);
  
  // 청각장애인 맞춤 옵션
  const [options, setOptions] = useState({
    visualAlerts: true, // 시각적 알림 (예: 횡단보도 깜빡임)
    textInstructions: true, // 텍스트 기반 길 안내
    lowNoise: true, // 조용한 경로 우선
    emergencyText: true, // 긴급 상황 텍스트 지원
  });

  const handleSearch = () => {
    if (!departure || !destination) return;

    // TODO: 실제 API 호출 시 options를 파라미터로 전달
    const mockRoutes: Route[] = [
      {
        id: 'auditory-1',
        departure,
        destination,
        duration: '30분',
        distance: '2.1km',
        description: '📊 텍스트 안내 제공 | 횡단보도 시각 알림 | 공사 구간 적음',
      },
      {
        id: 'auditory-2',
        departure,
        destination,
        duration: '25분',
        distance: '1.8km',
        description: '📊 조용한 공원길 포함 | 주요 지점 사진 안내',
      },
      {
        id: 'auditory-3',
        departure,
        destination,
        duration: '35분',
        distance: '2.5km',
        description: '📊 전광판 많은 경로 | 상가 밀집 지역',
      },
    ];

    setRoutes(mockRoutes);
    setSearched(true);
  };

  const handleSelectRoute = (route: Route) => {
    if (onRouteSelect) {
      onRouteSelect(route);
    }
    if (!addToFavorites) {
      navigate('/', { state: { selectedRoute: route } });
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center gap-4 mb-6 pt-4">
          <Button
            size="icon"
            variant="outline"
            onClick={() => navigate('/user-type-selection')}
            className="shadow-md"
            onMouseEnter={() => speak('뒤로가기')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Ear className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="mb-1">청각장애인 경로검색</h1>
              <p className="text-sm text-muted-foreground">
                시각적 안내를 통해 안전하게 이동할 수 있는 경로를 찾아드립니다
              </p>
            </div>
          </div>
        </div>

        {/* 검색 옵션 */}
        <Card className="p-4 mb-4 bg-card shadow-md">
          <h3 className="mb-3">경로 옵션</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="visualAlerts"
                checked={options.visualAlerts}
                onCheckedChange={(checked) =>
                  setOptions({ ...options, visualAlerts: checked as boolean })
                }
              />
              <Label htmlFor="visualAlerts" className="cursor-pointer">
                시각적 알림 제공 (횡단보도 등)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="textInstructions"
                checked={options.textInstructions}
                onCheckedChange={(checked) =>
                  setOptions({ ...options, textInstructions: checked as boolean })
                }
              />
              <Label htmlFor="textInstructions" className="cursor-pointer">
                텍스트 기반 길 안내
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="lowNoise"
                checked={options.lowNoise}
                onCheckedChange={(checked) =>
                  setOptions({ ...options, lowNoise: checked as boolean })
                }
              />
              <Label htmlFor="lowNoise" className="cursor-pointer">
                조용한 경로 우선
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="emergencyText"
                checked={options.emergencyText}
                onCheckedChange={(checked) =>
                  setOptions({ ...options, emergencyText: checked as boolean })
                }
              />
              <Label htmlFor="emergencyText" className="cursor-pointer">
                긴급 상황 텍스트 지원
              </Label>
            </div>
          </div>
        </Card>

        {/* 검색 입력 */}
        <Card className="p-4 mb-4 bg-card shadow-md">
          <div className="space-y-3">
            <div>
              <Label htmlFor="departure">출발지</Label>
              <Input
                id="departure"
                placeholder="출발지를 입력하세요"
                value={departure}
                onChange={(e) => setDeparture(e.target.value)}
                className="mt-1"
                onFocus={() => speak('출발지 입력란')}
              />
            </div>
            <div>
              <Label htmlFor="destination">도착지</Label>
              <Input
                id="destination"
                placeholder="도착지를 입력하세요"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="mt-1"
                onFocus={() => speak('도착지 입력란')}
              />
            </div>
            <Button 
              className="w-full" 
              onClick={handleSearch}
              disabled={!departure || !destination}
              onMouseEnter={() => speak('경로 검색 버튼')}
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              경로 검색
            </Button>
          </div>
        </Card>

        {/* 검색 결과 */}
        {searched && routes.length > 0 && (
          <div className="space-y-3">
            <h2>추천 경로 ({routes.length}개)</h2>
            {routes.map((route) => (
              <Card
                key={route.id}
                className="p-4 cursor-pointer hover:shadow-lg transition-shadow bg-card"
                onClick={() => handleSelectRoute(route)}
                onMouseEnter={() => speak(`${route.duration}, ${route.distance}, ${route.description}`)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-blue-600">{route.duration}</span>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-muted-foreground">{route.distance}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {route.description}
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onMouseEnter={(e) => {
                      e.stopPropagation();
                      speak('경로 선택');
                    }}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    선택
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {searched && routes.length === 0 && (
          <Card className="p-8 text-center bg-card">
            <p className="text-muted-foreground">
              검색 결과가 없습니다. 다른 출발지나 도착지를 입력해주세요.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}