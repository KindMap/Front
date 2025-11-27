import { useState } from 'react';
import { ArrowRight, ArrowLeft, Check, Accessibility, Navigation } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { useNavigate } from 'react-router-dom';
import { Route } from '../types';
import { Label } from './ui/label';
import { useVoiceGuide } from '../contexts/VoiceGuideContext';
import { useNavigation } from '../contexts/NavigationContext';
import { searchRoutes } from '../services/routeApi';
import { StationAutocomplete } from './StationAutocomplete';
import { formatRouteDisplay } from '../utils/routeFormatter';
import { NavigationRoute } from '../types/navigation';

interface PhysicalDisabilityRouteSearchPageProps {
  onRouteSelect?: (route: Route) => void;
  addToFavorites?: boolean;
}

/**
 * 지체장애인을 위한 경로 검색 페이지 컴포넌트입니다.
 *
 * 휠체어, 엘리베이터 등 접근성을 고려한 최적의 경로를 추천하여 이동 편의를 돕습니다.
 */
export function PhysicalDisabilityRouteSearchPage({ onRouteSelect, addToFavorites = false }: PhysicalDisabilityRouteSearchPageProps) {
  const navigate = useNavigate();
  const { speak } = useVoiceGuide();
  const { setRouteData } = useNavigation();
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
      const results = await searchRoutes(departure, destination, "PHY");
      console.log('API Response:', results);

      // UI 표시용 Route 배열
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
          transferStations: result.transfer_stations || [],
        };
      });
      setRoutes(formattedRoutes);

      // NavigationContext용 NavigationRoute 배열로 변환
      const navigationRoutes: NavigationRoute[] = results.routes.map((result: any) => ({
        rank: result.rank || 1,
        route_sequence: result.route_sequence || [],
        route_lines: result.route_lines || [],
        total_time: result.total_time || 0,
        transfers: result.transfers || 0,
        transfer_stations: result.transfer_stations || [],
        transfer_info: result.transfer_info || [],
        score: result.score || 0,
        avg_convenience: result.avg_convenience || 0,
        avg_congestion: result.avg_congestion || 0,
        max_transfer_difficulty: result.max_transfer_difficulty || 0,
      }));

      // NavigationContext에 데이터 저장
      setRouteData(departure, destination, 'PHY', navigationRoutes);
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
    // NavigationPage로 이동 (경로 데이터는 이미 Context에 저장됨)
    navigate('/navigation');
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
              <h1 className="mb-1">지체장애인 경로 검색</h1>
              <p className="text-sm text-muted-foreground">
                접근성을 고려한 최적의 경로를 탐색하세요.
              </p>
            </div>
          </div>
        </div>

        {/* 경로 검색 */}
        <Card className="p-4 mb-4 bg-card shadow-md">
          <div className="space-y-3">
            <StationAutocomplete
              id="departure"
              label="출발지"
              value={departure}
              onChange={setDeparture}
              placeholder="출발역을 입력하세요"
              required
            />
            <StationAutocomplete
              id="destination"
              label="도착지"
              value={destination}
              onChange={setDestination}
              placeholder="도착역을 입력하세요"
              required
            />
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
                      <span className="font-bold text-lg text-purple-600">{route.duration}</span>
                      <span className="text-sm text-muted-foreground">{route.description}</span>
                    </div>
                    {/* 경로 표시 */}
                    {route.path && route.path.length > 0 && route.transferStations && (
                      <div className="text-sm text-foreground font-medium">
                        {formatRouteDisplay(route.path, route.transferStations)}
                      </div>
                    )}
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
