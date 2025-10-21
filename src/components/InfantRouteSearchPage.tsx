import { useState } from 'react';
import { ArrowRight, ArrowLeft, Check, BadgeHelp } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { useNavigate } from 'react-router-dom';
import { Route } from '../types';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { useVoiceGuide } from '../contexts/VoiceGuideContext';

interface InfantRouteSearchPageProps {
  onRouteSelect?: (route: Route) => void;
  addToFavorites?: boolean;
}

/**
 * 영유아 동반자를 위한 경로검색 페이지
 * 
 * 유모차 접근성을 고려한 맞춤형 경로를 제공합니다.
 */
export function InfantRouteSearchPage({ onRouteSelect, addToFavorites = false }: InfantRouteSearchPageProps) {
  const navigate = useNavigate();
  const { speak } = useVoiceGuide();
  const [departure, setDeparture] = useState('');
  const [destination, setDestination] = useState('');
  const [routes, setRoutes] = useState<Route[]>([]);
  const [searched, setSearched] = useState(false);
  
  // 영유아 동반자 맞춤 옵션
  const [options, setOptions] = useState({
    strollerFriendly: true, // 유모차 이동 가능
    nursingRoom: false, // 수유실 경유
    restArea: true, // 휴게 공간 포함
    elevatorPrefer: true, // 엘리베이터 우선
  });

  const handleSearch = () => {
    if (!departure || !destination) return;

    // TODO: 실제 API 호출 시 options를 파라미터로 전달
    const mockRoutes: Route[] = [
      {
        id: 'infant-1',
        departure,
        destination,
        duration: '30분',
        distance: '2.8km',
        description: '👶 수유실 2곳 | 엘리베이터 이용 | 유모차 통행 가능',
      },
      {
        id: 'infant-2',
        departure,
        destination,
        duration: '27분',
        distance: '2.5km',
        description: '👶 휴게 벤치 多 | 경사 완만 | 자동문 설치',
      },
      {
        id: 'infant-3',
        departure,
        destination,
        duration: '35분',
        distance: '3.2km',
        description: '👶 수유실 3곳 | 기저귀 교환대 | 유모차 대여 가능',
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
            <div className="p-2 bg-pink-600 rounded-lg">
              <BadgeHelp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="mb-1">영유아 동반자 경로검색</h1>
              <p className="text-sm text-muted-foreground">
                유모차와 함께 안전하게 이동할 수 있는 경로를 찾아드립니다
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
                id="strollerFriendly"
                checked={options.strollerFriendly}
                onCheckedChange={(checked) =>
                  setOptions({ ...options, strollerFriendly: checked as boolean })
                }
              />
              <Label htmlFor="strollerFriendly" className="cursor-pointer">
                유모�� 이동 가능 경로만
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="nursingRoom"
                checked={options.nursingRoom}
                onCheckedChange={(checked) =>
                  setOptions({ ...options, nursingRoom: checked as boolean })
                }
              />
              <Label htmlFor="nursingRoom" className="cursor-pointer">
                수유실 근처 경유
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
                휴게 공간 포함
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="elevatorPrefer"
                checked={options.elevatorPrefer}
                onCheckedChange={(checked) =>
                  setOptions({ ...options, elevatorPrefer: checked as boolean })
                }
              />
              <Label htmlFor="elevatorPrefer" className="cursor-pointer">
                엘리베이터 우선 (계단 최소화)
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
                      <span className="text-pink-600">{route.duration}</span>
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
