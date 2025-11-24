import { useState } from 'react';
import { ArrowRight, ArrowLeft, Check, Ear, Navigation } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { useNavigate } from 'react-router-dom';
import { Route } from '../types';
import { Label } from './ui/label';
import { useVoiceGuide } from '../contexts/VoiceGuideContext';
import { useNavigation } from '../contexts/NavigationContext';
import { searchRoutes } from '../services/routeApi';

interface AuditoryRouteSearchPageProps {
  onRouteSelect?: (route: Route) => void;
  addToFavorites?: boolean;
}

/**
 * 청각장애인을 위한 경로 검색 페이지 컴포넌트입니다.
 *
 * 음성 안내 기능을 활용하여 사용자가 쉽게 경로를 검색하고 선택할 수 있도록 돕습니다.
 */
export function AuditoryRouteSearchPage({ onRouteSelect, addToFavorites = false }: AuditoryRouteSearchPageProps) {
  const navigate = useNavigate();
  const { speak } = useVoiceGuide();
  const { startNavigation } = useNavigation();
  const [departure, setDeparture] = useState('');
  const [destination, setDestination] = useState('');
  const [routes, setRoutes] = useState<Route[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!departure || !destination) return;
    setLoading(true);
    setSearched(false);
    try {
      const results = await searchRoutes(departure, destination, "AUD");
      console.log('API Response:', results);
      const formattedRoutes: Route[] = results.routes.map((result: any, index: number) => {
        const score = Math.floor((result.score || 0) * 100);
        const totalMinutes = Math.round(result.total_time || 0);

        return {
          id: (result.rank || index).toString(),
          departure,
          destination,
          duration: `약 ${totalMinutes}분`,
          description: `환승 ${result.transfers || 0}회`,
          path: result.route_sequence || [],
          lines: result.route_lines || [],
          difficulty: score,
          avgConvenience: result.avg_convenience,
          avgCongestion: result.avg_congestion,
          maxTransferDifficulty: result.max_transfer_difficulty,
        };
      });
      setRoutes(formattedRoutes);
    } catch (error) {
      console.error("Failed to fetch routes:", error);
      setRoutes([]);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  const handleSelectRoute = (route: Route) => {
    if (onRouteSelect) {
      onRouteSelect(route);
    }
    if (!addToFavorites) {
      navigate('/', { state: { selectedRoute: route } });
    }
  };

  const handleStartNavigation = (route: Route, e: React.MouseEvent) => {
    e.stopPropagation();
    startNavigation(departure, destination, 'AUD');
    navigate('/navigation', {
      state: {
        origin: departure,
        destination: destination,
        disabilityType: 'AUD',
        selectedRoute: route
      }
    });
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
              <h1 className="mb-1">청각장애인 경로 검색</h1>
              <p className="text-sm text-muted-foreground">
                음성 안내를 통해 편리하게 경로를 탐색하세요.
              </p>
            </div>
          </div>
        </div>

        {/* 경로 검색 */}
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
                onFocus={() => speak('출발지 입력')}
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
                onFocus={() => speak('도착지 입력')}
              />
            </div>
            <Button
              className="w-full"
              onClick={handleSearch}
              disabled={!departure || !destination}
              onMouseEnter={() => speak('경로 검색하기')}
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
                onMouseEnter={() => speak(`약 ${route.duration}, 난이도 ${route.difficulty}`)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-lg text-blue-600">{route.duration}</span>
                      <span className="text-sm text-muted-foreground">{route.description}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                      <div className="text-muted-foreground">난이도: <span className="font-medium text-foreground">{route.difficulty}</span></div>
                      <div className="text-muted-foreground">평균 편의성: <span className="font-medium text-foreground">{route.avgConvenience}</span></div>
                      <div className="text-muted-foreground">평균 혼잡도: <span className="font-medium text-foreground">{route.avgCongestion}</span></div>
                      <div className="text-muted-foreground">최대 환승 난이도: <span className="font-medium text-foreground">{route.maxTransferDifficulty}</span></div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => handleStartNavigation(route, e)}
                      onMouseEnter={(e) => {
                        e.stopPropagation();
                        speak('실시간 내비게이션 시작');
                      }}
                      className="bg-blue-500 text-white hover:bg-blue-600"
                    >
                      <Navigation className="w-4 h-4 mr-1" />
                      내비게이션
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onMouseEnter={(e) => {
                        e.stopPropagation();
                        speak('경로 선택하기');
                      }}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      선택
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {searched && routes.length === 0 && (
          <Card className="p-8 text-center bg-card">
            <p className="text-muted-foreground">
              검색 결과가 없습니다. 다른 출발지나 도착지를 입력해 주세요.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
