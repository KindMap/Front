import { useState } from 'react';
import { ArrowRight, ArrowLeft, Check, Users } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { useNavigate } from 'react-router-dom';
import { Route } from '../types';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { useVoiceGuide } from '../contexts/VoiceGuideContext';

interface ElderlyRouteSearchPageProps {
  onRouteSelect?: (route: Route) => void;
  addToFavorites?: boolean;
}

/**
 * 고령자를 위한 경로검색 페이지
 * 
 * 편안하고 안전한 이동을 고려한 맞춤형 경로를 제공합니다.
 */
export function ElderlyRouteSearchPage({ onRouteSelect, addToFavorites = false }: ElderlyRouteSearchPageProps) {
  const navigate = useNavigate();
  const { speak } = useVoiceGuide();
  const [departure, setDeparture] = useState('');
  const [destination, setDestination] = useState('');
  const [routes, setRoutes] = useState<Route[]>([]);
  const [searched, setSearched] = useState(false);
  
  // 고령자 맞춤 옵션
  const [options, setOptions] = useState({
    avoidStairs: true, // 계단 회피
    restPoints: true, // 휴게 지점 포함
    flatRoute: true, // 평탄한 경로 우선
    safeRoute: true, // 안전한 경로 (횡단보도, 신호등 多)
  });

  const handleSearch = () => {
    if (!departure || !destination) return;

    // TODO: 실제 API 호출 시 options를 파라미터로 전달
    const mockRoutes: Route[] = [
      {
        id: 'elderly-1',
        departure,
        destination,
        duration: '32분',
        distance: '2.3km',
        description: '🏥 휴게 벤치 5곳 | 계단 없음 | 횡단보도 신호 충분',
      },
      {
        id: 'elderly-2',
        departure,
        destination,
        duration: '28분',
        distance: '2.0km',
        description: '🏥 쉼터 3곳 | 경사 완만 | 그늘진 경로',
      },
      {
        id: 'elderly-3',
        departure,
        destination,
        duration: '38분',
        distance: '2.7km',
        description: '🏥 휴게소 多 | 엘리베이터 이용 | 의료시설 인접',
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
            <div className="p-2 bg-green-600 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="mb-1">고령자 경로검색</h1>
              <p className="text-sm text-muted-foreground">
                편안하고 안전하게 이동할 수 있는 경로를 찾아드립니다
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
                id="avoidStairs"
                checked={options.avoidStairs}
                onCheckedChange={(checked) =>
                  setOptions({ ...options, avoidStairs: checked as boolean })
                }
              />
              <Label htmlFor="avoidStairs" className="cursor-pointer">
                계단 구간 회피
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="restPoints"
                checked={options.restPoints}
                onCheckedChange={(checked) =>
                  setOptions({ ...options, restPoints: checked as boolean })
                }
              />
              <Label htmlFor="restPoints" className="cursor-pointer">
                휴게 지점 포함 (벤치, 쉼터)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="flatRoute"
                checked={options.flatRoute}
                onCheckedChange={(checked) =>
                  setOptions({ ...options, flatRoute: checked as boolean })
                }
              />
              <Label htmlFor="flatRoute" className="cursor-pointer">
                평탄한 경로 우선 (경사 최소화)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="safeRoute"
                checked={options.safeRoute}
                onCheckedChange={(checked) =>
                  setOptions({ ...options, safeRoute: checked as boolean })
                }
              />
              <Label htmlFor="safeRoute" className="cursor-pointer">
                안전한 경로 (횡단보도, 신호등 多)
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
                      <span className="text-green-600">{route.duration}</span>
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
