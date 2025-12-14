import { useState, useMemo } from 'react';
import { ArrowRight, ArrowLeft, Check, Eye, Navigation } from 'lucide-react';
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
import { NavigationRoute } from '../types/navigation';
import { FacilityInfo } from './FacilityInfo';
import { useAuth } from '../contexts/AuthContext';
import { stationCache } from '../services/stationCacheService';

interface VisualRouteSearchPageProps {
  onRouteSelect?: (route: Route) => void;
  addToFavorites?: boolean;
}

/**
 * 시각장애인을 위한 경로 검색 페이지 컴포넌트입니다.
 *
 * 음성 안내 및 화면 읽기 기능을 통해 사용자가 명확하게 정보를 인지하고 안전하게 경로를 이용할 수 있도록 돕습니다.
 */
export function VisualRouteSearchPage({ onRouteSelect, addToFavorites = false }: VisualRouteSearchPageProps) {
  const navigate = useNavigate();
  const { speak } = useVoiceGuide();
  const { setRouteData } = useNavigation();
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
      const results = await searchRoutes(departure, destination, "VIS");
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
      setRouteData(departure, destination, 'VIS', navigationRoutes);
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
    <div className="min-h-screen bg-background p-2 sm:p-4">
      <div className="max-w-2xl mx-auto">
        {/* 헤더 - 모바일 반응형 */}
        <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6 pt-2 sm:pt-4">
          <Button
            size="icon"
            variant="outline"
            onClick={() => navigate('/user-type-selection')}
            className="shadow-md flex-shrink-0"
            onMouseEnter={() => speak('뒤로가기')}
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="p-1.5 sm:p-2 bg-orange-600 rounded-lg flex-shrink-0">
              <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="mb-0.5 sm:mb-1 text-base sm:text-lg truncate">시각장애인 경로 검색</h1>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                음성 안내와 함께 명확한 정보로 경로를 탐색하세요.
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
                disabilityType="VIS"
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

        {/* 검색 결과 - 모바일 반응형 */}
        {searched && routes.length > 0 && (
          <div className="space-y-2 sm:space-y-3">
            <h2 className="text-base sm:text-lg">추천 경로 ({routes.length}개)</h2>
            {routes.map((route) => (
              <Card
                key={route.id}
                className="p-3 sm:p-4 cursor-pointer hover:shadow-lg transition-shadow bg-card"
                onClick={() => handleSelectRoute(route)}
                onMouseEnter={() => speak(`약 ${route.duration}, 난이도 ${route.difficulty}`)}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                  <div className="flex-1 space-y-1 sm:space-y-2 min-w-0">
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                      <span className="font-bold text-base sm:text-lg text-orange-600">{route.duration}</span>
                      <span className="text-xs sm:text-sm text-muted-foreground">{route.description}</span>
                    </div>
                    {/* 경로 표시 - 모바일 반응형 */}
                    {route.path && route.path.length > 0 && route.transferStations && (
                      <div className="text-xs sm:text-sm text-foreground font-medium break-words">
                        {formatRouteDisplay(route.path, route.transferStations)}
                      </div>
                    )}
                    {/* 환승역 편의시설 정보 - 모바일 반응형 */}
                    {route.transferStations && route.transferStations.length > 0 && (
                      <div className="mt-1 sm:mt-2 space-y-1">
                        <p className="text-xs text-muted-foreground">환승역 편의시설:</p>
                        <div className="space-y-1">
                          {route.transferStations.map((stationCode) => {
                            const stationName = stationCache.getStationName(stationCode) || stationCode;
                            return (
                              <div key={stationCode} className="flex flex-col sm:flex-row items-start gap-1 sm:gap-2">
                                <span className="text-xs text-muted-foreground flex-shrink-0">
                                  📍 {stationName}:
                                </span>
                                <div className="w-full sm:flex-1">
                                  <FacilityInfo
                                    stationCode={stationCode}
                                    disabilityType={user?.disability_type}
                                    compact={true}
                                    limit={3}
                                    expandable={false}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 sm:gap-x-4 gap-y-0.5 sm:gap-y-1 text-xs sm:text-sm">
                      <div className="text-muted-foreground truncate">난이도: <span className="font-medium text-foreground">{route.difficulty}</span></div>
                      <div className="text-muted-foreground truncate">평균 편의성: <span className="font-medium text-foreground">{route.avgConvenience}</span></div>
                      <div className="text-muted-foreground truncate">평균 혼잡도: <span className="font-medium text-foreground">{route.avgCongestion}</span></div>
                      <div className="text-muted-foreground truncate">최대 환승 난이도: <span className="font-medium text-foreground">{route.maxTransferDifficulty}</span></div>
                    </div>
                  </div>
                  <div className="flex flex-row gap-2 w-full sm:w-auto sm:flex-col">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => handleStartNavigation(route, e)}
                      onMouseEnter={(e) => {
                        e.stopPropagation();
                        speak('실시간 내비게이션 시작');
                      }}
                      className="bg-[#3b82f6] text-white hover:bg-[#2563eb] flex-1 sm:flex-none text-xs sm:text-sm"
                    >
                      <Navigation className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      <span className="hidden sm:inline">내비게이션</span>
                      <span className="sm:hidden">안내</span>
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
