import { useState } from 'react';
import { ArrowRight, ArrowLeft, Check, Eye } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { useNavigate } from 'react-router-dom';
import { Route } from '../types';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { useVoiceGuide } from '../contexts/VoiceGuideContext';

interface LowVisionRouteSearchPageProps {
  onRouteSelect?: (route: Route) => void;
  addToFavorites?: boolean;
}

/**
 * 저시력자를 위한 경로검색 페이지
 * 
 * 점자블록과 음성안내 등 시각 보조를 고려한 맞춤형 경로를 제공합니다.
 */
export function LowVisionRouteSearchPage({ onRouteSelect, addToFavorites = false }: LowVisionRouteSearchPageProps) {
  const navigate = useNavigate();
  const { speak } = useVoiceGuide();
  const [departure, setDeparture] = useState('');
  const [destination, setDestination] = useState('');
  const [routes, setRoutes] = useState<Route[]>([]);
  const [searched, setSearched] = useState(false);
  
  // 저시력자 맞춤 옵션
  const [options, setOptions] = useState({
    brailleBlock: true, // 점자블록 경로
    audioGuide: true, // 음성안내 시설
    brightPath: true, // 밝은 조명 경로
    simpleRoute: true, // 단순한 경로 (복잡한 교차로 회피)
  });

  const handleSearch = () => {
    if (!departure || !destination) return;

    // TODO: 실제 API 호출 시 options를 파라미터로 전달
    const mockRoutes: Route[] = [
      {
        id: 'lowvision-1',
        departure,
        destination,
        duration: '27분',
        distance: '2.4km',
        description: '👁️ 점자블록 완비 | 음성신호등 多 | 음성안내 시스템',
      },
      {
        id: 'lowvision-2',
        departure,
        destination,
        duration: '30분',
        distance: '2.6km',
        description: '👁️ 밝은 조명 | 단순한 경로 | 촉각 보도블록',
      },
      {
        id: 'lowvision-3',
        departure,
        destination,
        duration: '33분',
        distance: '2.9km',
        description: '👁️ 점자 안내판 多 | 음향 신호기 | 안내견 동반 가능',
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
            <div className="p-2 bg-orange-600 rounded-lg">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="mb-1">저시력자 경로검색</h1>
              <p className="text-sm text-muted-foreground">
                점자블록과 음성안내가 있는 안전한 경로를 찾아드립니다
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
                id="brailleBlock"
                checked={options.brailleBlock}
                onCheckedChange={(checked) =>
                  setOptions({ ...options, brailleBlock: checked as boolean })
                }
              />
              <Label htmlFor="brailleBlock" className="cursor-pointer">
                점자블록 설치 경로만
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="audioGuide"
                checked={options.audioGuide}
                onCheckedChange={(checked) =>
                  setOptions({ ...options, audioGuide: checked as boolean })
                }
              />
              <Label htmlFor="audioGuide" className="cursor-pointer">
                음성안내 시설 포함 (음향 신호기 등)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="brightPath"
                checked={options.brightPath}
                onCheckedChange={(checked) =>
                  setOptions({ ...options, brightPath: checked as boolean })
                }
              />
              <Label htmlFor="brightPath" className="cursor-pointer">
                밝은 조명 경로 우선
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="simpleRoute"
                checked={options.simpleRoute}
                onCheckedChange={(checked) =>
                  setOptions({ ...options, simpleRoute: checked as boolean })
                }
              />
              <Label htmlFor="simpleRoute" className="cursor-pointer">
                단순한 경로 (복잡한 교차로 회피)
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
                      <span className="text-orange-600">{route.duration}</span>
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
