import { useState } from 'react';
import { ArrowRight, ArrowLeft, Check, Accessibility } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { useNavigate } from 'react-router-dom';
import { Route } from '../types';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { useVoiceGuide } from '../contexts/VoiceGuideContext';

interface PhysicalDisabilityRouteSearchPageProps {
  onRouteSelect?: (route: Route) => void;
  addToFavorites?: boolean;
}

/**
 * 지체장애인을 위한 경로검색 페이지
 *
 * 휠체어, 보행 보조기구 이용자의 접근성을 고려한 경로를 제공합니다.
 */
export function PhysicalDisabilityRouteSearchPage({ onRouteSelect, addToFavorites = false }: PhysicalDisabilityRouteSearchPageProps) {
  const navigate = useNavigate();
  const { speak } = useVoiceGuide();
  const [departure, setDeparture] = useState('');
  const [destination, setDestination] = useState('');
  const [routes, setRoutes] = useState<Route[]>([]);
  const [searched, setSearched] = useState(false);

  // 지체장애인 맞춤 옵션
  const [options, setOptions] = useState({
    useElevator: true, // 엘리베이터 이용
    avoidStairs: true, // 계단 회피
    gentleSlope: true, // 완만한 경사
    widePath: true, // 넓은 경로
  });

  const handleSearch = async () => {
    if (!departure || !destination) return;

    // Mock 데이터 (임시)
    const mockRoutes: Route[] = [
      {
        id: 'physical-1',
        departure,
        destination,
        duration: '30분',
        distance: '2.5km',
        description: '♿ 엘리베이터 3회 | 모든 구간 경사 5% 미만 | 휴게 쉼터 2곳',
      },
      {
        id: 'physical-2',
        departure,
        destination,
        duration: '27분',
        distance: '2.2km',
        description: '♿ 휠체어 리프트 1회 | 넓은 보행로 | 장애인 화장실',
      },
      {
        id: 'physical-3',
        departure,
        destination,
        duration: '35분',
        distance: '2.8km',
        description: '♿ 모든 문 자동문 | 턱 없는 경로 | 대중교통 환승 용이',
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
            <div className="p-2 bg-purple-600 rounded-lg">
              <Accessibility className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="mb-1">지체장애인 경로검색</h1>
              <p className="text-sm text-muted-foreground">
                보행 및 이동 편의를 고려한 최적 경로를 찾아드립니다
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
                id="useElevator"
                checked={options.useElevator}
                onCheckedChange={(checked) =>
                  setOptions({ ...options, useElevator: checked as boolean })
                }
              />
              <Label
                htmlFor="useElevator"
                className="cursor-pointer"
              >
                엘리베이터 이용
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="avoidStairs"
                checked={options.avoidStairs}
                onCheckedChange={(checked) =>
                  setOptions({ ...options, avoidStairs: checked as boolean })
                }
              />
              <Label
                htmlFor="avoidStairs"
                className="cursor-pointer"
              >
                계단 회피
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="gentleSlope"
                checked={options.gentleSlope}
                onCheckedChange={(checked) =>
                  setOptions({ ...options, gentleSlope: checked as boolean })
                }
              />
              <Label
                htmlFor="gentleSlope"
                className="cursor-pointer"
              >
                완만한 경사 우선
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="widePath"
                checked={options.widePath}
                onCheckedChange={(checked) =>
                  setOptions({ ...options, widePath: checked as boolean })
                }
              />
              <Label
                htmlFor="widePath"
                className="cursor-pointer"
              >
                넓은 경로 우선
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
                      <span className="text-purple-600">{route.duration}</span>
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