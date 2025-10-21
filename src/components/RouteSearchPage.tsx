import { useState } from 'react';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { useNavigate } from 'react-router-dom';
import { Route } from '../types';
import { useVoiceGuide } from '../contexts/VoiceGuideContext';

interface RouteSearchPageProps {
  onRouteSelect?: (route: Route) => void;
  addToFavorites?: boolean;
}

export function RouteSearchPage({ onRouteSelect, addToFavorites = false }: RouteSearchPageProps) {
  const navigate = useNavigate();
  const { speak } = useVoiceGuide();
  const [departure, setDeparture] = useState('');
  const [destination, setDestination] = useState('');
  const [routes, setRoutes] = useState<Route[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = () => {
    if (!departure || !destination) return;

    // Mock route data
    const mockRoutes: Route[] = [
      {
        id: '1',
        departure,
        destination,
        duration: '25분',
        distance: '3.2km',
        description: '평탄한 도로, 엘리베이터 이용 가능',
      },
      {
        id: '2',
        departure,
        destination,
        duration: '30분',
        distance: '3.5km',
        description: '경사가 적음, 휠체어 접근 가능',
      },
      {
        id: '3',
        departure,
        destination,
        duration: '35분',
        distance: '4.1km',
        description: '가장 안전한 경로, 편의시설 多',
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
    } else {
      navigate('/favorites');
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(-1)}
            onMouseEnter={() => speak('뒤로가기')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1>경로 검색</h1>
        </div>

        {/* Search Form */}
        <Card className="p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-muted-foreground">출발지</label>
              <Input
                type="text"
                placeholder="출발지를 입력하세요"
                value={departure}
                onChange={(e) => setDeparture(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                onFocus={() => speak('출발지 입력란')}
              />
            </div>
            <div>
              <label className="block mb-2 text-muted-foreground">도착지</label>
              <Input
                type="text"
                placeholder="도착지를 입력하세요"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                onFocus={() => speak('도착지 입력란')}
              />
            </div>
            <Button 
              className="w-full"
              onClick={handleSearch}
              disabled={!departure || !destination}
              onMouseEnter={() => speak('경로 검색 버튼')}
            >
              <ArrowRight className="w-5 h-5 mr-2" />
              경로 검색
            </Button>
          </div>
        </Card>

        {/* Search Results */}
        {searched && (
          <div className="space-y-4">
            <h2>검색 결과</h2>
            {routes.length === 0 ? (
              <Card className="p-6 text-center text-muted-foreground">
                검색 결과가 없습니다.
              </Card>
            ) : (
              routes.map((route) => (
                <Card 
                  key={route.id} 
                  className="p-4"
                  onMouseEnter={() => speak(`${route.duration}, ${route.distance}, ${route.description}`)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-primary text-primary-foreground rounded-full">
                          {route.duration}
                        </span>
                        <span className="text-muted-foreground">
                          {route.distance}
                        </span>
                      </div>
                      <p className="text-muted-foreground mb-2">
                        {route.departure} → {route.destination}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {route.description}
                      </p>
                    </div>
                    <Button
                      size="icon"
                      onClick={() => handleSelectRoute(route)}
                      onMouseEnter={(e) => {
                        e.stopPropagation();
                        speak('경로 선택');
                      }}
                    >
                      <Check className="w-5 h-5" />
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
