import { useState, useMemo } from 'react';
import { ArrowRight, ArrowLeft, Check, Users, Navigation } from 'lucide-react';
import { VoiceInputButton } from './VoiceInputButton';
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
import { FacilityInfo } from './FacilityInfo';
import { useAuth } from '../contexts/AuthContext';
import { stationCache } from '../services/stationCacheService';

interface ElderlyRouteSearchPageProps {
  onRouteSelect?: (route: Route) => void;
  addToFavorites?: boolean;
}

/**
 * 노약자를 위한 경로 검색 페이지 컴포넌트입니다.
 *
 * 음성 안내 및 확대 기능을 활용하여 사용자가 편안하게 경로를 검색하고 선택할 수 있도록 돕습니다.
 */
export function ElderlyRouteSearchPage({ onRouteSelect, addToFavorites = false }: ElderlyRouteSearchPageProps) {
  const navigate = useNavigate();
  const { speak } = useVoiceGuide();
  const { startNavigation } = useNavigation();
  const { user } = useAuth();
  
  // 임시 userId 생성 (로그인하지 않은 사용자용)
  const tempUserId = useMemo(() => `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, []);
  const effectiveUserId = user?.id || tempUserId;
  
  const [departure, setDeparture] = useState('');
  const [destination, setDestination] = useState('');
  const [routes, setRoutes] = useState<Route[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isVoiceInput, setIsVoiceInput] = useState(false);

  // 음성 입력 콜백
  const handleVoiceStationsRecognized = (origin: string, destination: string) => {
    setDeparture(origin);
    setDestination(destination);
    setIsVoiceInput(true);

    speak(`출발지 ${origin}, 도착지 ${destination}이 입력되었습니다.`);

    // 3초 후 하이라이트 제거
    setTimeout(() => setIsVoiceInput(false), 3000);
  };

  const handleVoiceRouteCalculated = (routesData: any[]) => {
    // 백엔드가 자동으로 경로를 계산한 경우
    if (routesData && routesData.length > 0) {
      const formattedRoutes: Route[] = routesData.map((result: any, index: number) => {
        const score = Math.floor((result.score || 0) * 100);
        const totalMinutes = Math.round(result.total_time || 0);

        return {
          id: (result.rank || index).toString(),
          departure: departure || '',
          destination: destination || '',
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
      setSearched(true);
      speak(`${formattedRoutes.length}개의 경로를 찾았습니다.`);
    }
  };

  const handleSearch = async () => {
    if (!departure || !destination) return;
    setLoading(true);
    setSearched(false);
    try {
      const results = await searchRoutes(departure, destination, "ELD");
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
          transferStations: result.transfer_stations || [],
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
    startNavigation(departure, destination, 'ELD');
    navigate('/navigation', {
      state: {
        origin: departure,
        destination: destination,
        disabilityType: 'ELD',
        selectedRoute: route
      }
    });
  };

  return (
    <div className="min-h-screen bg-background p-2 sm:p-4">
      <div className="max-w-2xl mx-auto">
        {/* 헤더 - 모바일 반응형 */}
        <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6 pt-2 sm:pt-4">
          <Button
            size="icon"
            variant="outline"
            onClick={() => navigate('/user-type-selection')}
            className="shadow-md"
            onMouseEnter={() => speak('뒤로가기')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="p-1.5 sm:p-2 bg-green-600 rounded-lg flex-shrink-0">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="mb-0.5 sm:mb-1 text-base sm:text-lg truncate">노약자 경로 검색</h1>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                음성 안내를 통해 편리하게 경로를 탐색하세요.
              </p>
            </div>
          </div>
        </div>

        {/* 경로 검색 - 모바일 반응형 */}
        <Card className="p-3 sm:p-4 mb-3 sm:mb-4 bg-card shadow-md">
          <div className="space-y-2 sm:space-y-3">
            {/* 음성 입력 버튼 섹션 */}
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <VoiceInputButton
                userId={effectiveUserId}
                onStationsRecognized={handleVoiceStationsRecognized}
                onRouteCalculated={handleVoiceRouteCalculated}
                disabilityType="ELD"
                className="flex-1"
              />
              <p className="text-xs sm:text-sm text-muted-foreground flex-shrink-0">
                예: "사당역에서 강남역까지"
              </p>
            </div>

            <StationAutocomplete
              id="departure"
              label="출발지"
              value={departure}
              onChange={setDeparture}
              placeholder="출발역을 입력하세요"
              required
              className={isVoiceInput ? "border-green-500 border-2" : ""}
            />
            <StationAutocomplete
              id="destination"
              label="도착지"
              value={destination}
              onChange={setDestination}
              placeholder="도착역을 입력하세요"
              required
              className={isVoiceInput ? "border-green-500 border-2" : ""}
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
                      <span className="font-bold text-lg text-green-600">{route.duration}</span>
                      <span className="text-sm text-muted-foreground">{route.description}</span>
                    </div>
                    {/* 경로 표시 */}
                    {route.path && route.path.length > 0 && route.transferStations && (
                      <div className="text-sm text-foreground font-medium">
                        {formatRouteDisplay(route.path, route.transferStations)}
                      </div>
                    )}
                    {/* 환승역 편의시설 정보 */}
                    {route.transferStations && route.transferStations.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <p className="text-xs text-muted-foreground">환승역 편의시설:</p>
                        <div className="space-y-1">
                          {route.transferStations.map((stationCode) => {
                            const stationName = stationCache.getStationName(stationCode) || stationCode;
                            return (
                              <div key={stationCode} className="flex items-start gap-2">
                                <span className="text-xs text-muted-foreground min-w-[60px]">
                                  📍 {stationName}:
                                </span>
                                <FacilityInfo
                                  stationCode={stationCode}
                                  disabilityType={user?.disability_type}
                                  compact={false}
                                  limit={3}
                                  expandable={false}
                                />
                              </div>
                            );
                          })}
                        </div>
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
