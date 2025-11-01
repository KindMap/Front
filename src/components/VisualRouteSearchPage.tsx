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

interface VisualRouteSearchPageProps {
  onRouteSelect?: (route: Route) => void;
  addToFavorites?: boolean;
}

/**
 * 시각장애인을 위한 경로검색 페이지
 *
 * 음성 안내 및 촉각 정보를 활용하여 안전한 보행 환경을 제공합니다.
 */
export function VisualRouteSearchPage({ onRouteSelect, addToFavorites = false }: VisualRouteSearchPageProps) {
  const navigate = useNavigate();
  const { speak } = useVoiceGuide();
  const [departure, setDeparture] = useState('');
  const [destination, setDestination] = useState('');
  const [routes, setRoutes] = useState<Route[]>([]);
  const [searched, setSearched] = useState(false);

  // 시각장애인 맞춤 옵션
  const [options, setOptions] = useState({
    brailleBlocks: true, // 점자블록 경로
    audioSignals: true, // 음향 신호기
    tactilePaving: true, // 촉각 보도블록
    voiceGuidance: true, // 음성 안내
  });

  const handleSearch = () => {
    if (!departure || !destination) return;

    // TODO: 실제 API 호출 시 options를 파라미터로 전달
    const mockRoutes: Route[] = [
      {
        id: 'visual-1',
        departure,
        destination,
        duration: '25분',
        distance: '1.9km',
        description: '🔊 점자블록 완비 | 음향 신호기 12개 | 연속된 촉각 보도',
      },
      {
        id: 'visual-2',
        departure,
        destination,
        duration: '30분',
        distance: '2.2km',
        description: '🔊 주요 길목 음성 안내 | 장애물 적은 경로',
      },
      {
        id: 'visual-3',
        departure,
        destination,
        duration: '28분',
        distance: '2.0km',
        description: '🔊 지하철역 연계 | 점자 안내판 구비',
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
              <h1 className="mb-1">시각장애인 경로검색</h1>
              <p className="text-sm text-muted-foreground">
                음성 안내와 점자블록 정보를 통해 안전한 경로를 찾아드립니다
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
                id="brailleBlocks"
                checked={options.brailleBlocks}
                onCheckedChange={(checked) =>
                  setOptions({ ...options, brailleBlocks: checked as boolean })
                }
              />
              <Label htmlFor="brailleBlocks" className="cursor-pointer">
                점자블록 경로 우선
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="audioSignals"
                checked={options.audioSignals}
                onCheckedChange={(checked) =>
                  setOptions({ ...options, audioSignals: checked as boolean })
                }
              />
              <Label htmlFor="audioSignals" className="cursor-pointer">
                음향 신호기 포함
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="tactilePaving"
                checked={options.tactilePaving}
                onCheckedChange={(checked) =>
                  setOptions({ ...options, tactilePaving: checked as boolean })
                }
              />
              <Label htmlFor="tactilePaving" className="cursor-pointer">
                촉각 보도블록 경로
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="voiceGuidance"
                checked={options.voiceGuidance}
                onCheckedChange={(checked) =>
                  setOptions({ ...options, voiceGuidance: checked as boolean })
                }
              />
              <Label htmlFor="voiceGuidance" className="cursor-pointer">
                음성 안내 지원
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