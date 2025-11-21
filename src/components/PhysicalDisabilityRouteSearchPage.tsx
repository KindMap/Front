import { useState } from 'react';
import { ArrowRight, ArrowLeft, Check, Accessibility } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { useNavigate } from 'react-router-dom';
import { Route } from '../types';
import { Label } from './ui/label';
import { useVoiceGuide } from '../contexts/VoiceGuideContext';
import { searchRoutes } from '../services/routeApi';

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
      console.log('API Response:', results); // Log the raw response
      const formattedRoutes = results.routes.map((result: any) => {
        const score = Math.floor(result.score * 100);
        const totalMinutes = result.arrival_time;
        const h24 = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        const ampm = h24 >= 12 ? '오후' : '오전';
        const h12 = h24 % 12;
        const displayHours = h12 === 0 ? 12 : h12;
        const arrivalTimeString = `${ampm} ${displayHours}시 ${minutes}분 도착`;

        const distanceString = `${(result.walking_distance / 1000).toFixed(2)}km`; // Convert meters to km
        const descriptionString = `안전 점수 ${score} | ${result.lines.join(' → ')} | 환승 ${result.transfers}회`;

        return {
          id: result.rank.toString(),
          departure,
          destination,
          duration: arrivalTimeString,
          distance: distanceString,
          description: descriptionString,
          path: result.route, // This is the array of station names
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
                onMouseEnter={() => speak(`${route.duration}, ${route.distance}, ${route.description}`)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-purple-600">{route.duration}</span>
                      <span className="text-muted-foreground">|</span>
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
                      speak('경로 선택하기');
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
              검색 결과가 없습니다. 다른 출발지나 도착지를 입력해 주세요.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
