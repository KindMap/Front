import { useState } from 'react';
import { ArrowRight, ArrowLeft, Check, Heart } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { useNavigate } from 'react-router-dom';
import { Route } from '../types';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { useVoiceGuide } from '../contexts/VoiceGuideContext';

interface PregnantRouteSearchPageProps {
  onRouteSelect?: (route: Route) => void;
  addToFavorites?: boolean;
}

/**
 * 임산부를 위한 경로검색 페이지
 * 
 * 안전하고 편안한 이동을 고려한 맞춤형 경로를 제공합니다.
 */
export function PregnantRouteSearchPage({ onRouteSelect, addToFavorites = false }: PregnantRouteSearchPageProps) {
  const navigate = useNavigate();
  const { speak } = useVoiceGuide();
  const [departure, setDeparture] = useState('');
  const [destination, setDestination] = useState('');
  const [routes, setRoutes] = useState<Route[]>([]);
  const [searched, setSearched] = useState(false);
  
  // 임산부 맞춤 옵션
  const [options, setOptions] = useState({
    gentleSlope: true, // 완만한 경사
    restArea: true, // 휴게 공간
    avoidStairs: true, // 계단 회피
    medicalNearby: false, // 의료시설 인접
  });

  const handleSearch = () => {
    if (!departure || !destination) return;

    // TODO: 실제 API 호출 시 options를 파라미터로 전달
    const mockRoutes: Route[] = [
      {
        id: 'pregnant-1',
        departure,
        destination,
        duration: '30분',
        distance: '2.5km',
        description: '💜 경사 3% 미만 | 휴게 벤치 多 | 엘리베이터 이용',
      },
      {
        id: 'pregnant-2',
        departure,
        destination,
        duration: '26분',
        distance: '2.2km',
        description: '💜 평탄한 경로 | 쉼터 4곳 | 의료시설 근처',
      },
      {
        id: 'pregnant-3',
        departure,
        destination,
        duration: '35분',
        distance: '2.8km',
        description: '💜 완전 평지 | 그늘진 경로 | 화장실 多',
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
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="mb-1">임산부 경로검색</h1>
              <p className="text-sm text-muted-foreground">
                안전하고 편안하게 이동할 수 있는 경로를 찾아드립니다
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
                id="gentleSlope"
                checked={options.gentleSlope}
                onCheckedChange={(checked) =>
                  setOptions({ ...options, gentleSlope: checked as boolean })
                }
              />
              <Label htmlFor="gentleSlope" className="cursor-pointer">
                완만한 경사 (급경사 회피)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="restArea"
                checked={options.restArea}
                onCheckedChange={(checked) =>
                  setOptions({ ...options, restArea: checked as boolean })
                }
              />
              <Label htmlFor="restArea" className="cursor-pointer">
                휴게 공간 포함 (자주 쉴 수 있는 경로)
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
              <Label htmlFor="avoidStairs" className="cursor-pointer">
                계단 구간 회피 (엘리베이터 우선)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="medicalNearby"
                checked={options.medicalNearby}
                onCheckedChange={(checked) =>
                  setOptions({ ...options, medicalNearby: checked as boolean })
                }
              />
              <Label htmlFor="medicalNearby" className="cursor-pointer">
                의료시설 인접 경로 우선
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
              검색 결과가 없습니���. 다른 출발지나 도착지를 입력해주세요.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
