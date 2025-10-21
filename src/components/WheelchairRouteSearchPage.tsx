import { useState } from 'react';
import { ArrowRight, ArrowLeft, Check, Accessibility } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { useNavigate } from 'react-router-dom';
import { Route } from '../types';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { useVoiceGuide } from '../contexts/VoiceGuideContext';

interface WheelchairRouteSearchPageProps {
  onRouteSelect?: (route: Route) => void;
  addToFavorites?: boolean;
}

/**
 * 휠체어 이용자를 위한 경로검색 페이지
 * 
 * 휠체어 접근성을 고려한 맞춤형 경로를 제공합니다.
 */
export function WheelchairRouteSearchPage({ onRouteSelect, addToFavorites = false }: WheelchairRouteSearchPageProps) {
  const navigate = useNavigate();
  const { speak } = useVoiceGuide();
  const [departure, setDeparture] = useState('');
  const [destination, setDestination] = useState('');
  const [routes, setRoutes] = useState<Route[]>([]);
  const [searched, setSearched] = useState(false);
  
  // 휠체어 이용자 맞춤 옵션
  const [options, setOptions] = useState({
    elevatorOnly: true, // 엘리베이터만 이용
    avoidStairs: true, // 계단 회피
    flatRoute: true, // 평탄한 경로 우선
    widePathway: true, // 넓은 통로 우선
  });

  const handleSearch = async () => {
    if (!departure || !destination) return;

    /**
     * 실제 API 연동 예시:
     * 
     * 1. routeApi.ts의 searchRoutes 함수 사용
     * 2. 사용자 유형(wheelchair)과 선택한 옵션들을 파라미터로 전달
     * 3. 응답 데이터를 state에 저장
     * 4. 에러 처리 및 로딩 상태 관리
     * 
     * try {
     *   setIsLoading(true);
     *   setError(null);
     *   
     *   const results = await searchRoutes(departure, destination, {
     *     userType: UserType.WHEELCHAIR,
     *     elevatorOnly: options.elevatorOnly,
     *     avoidStairs: options.avoidStairs,
     *     flatRoute: options.flatRoute,
     *     widePathway: options.widePathway,
     *   });
     *   
     *   setRoutes(results);
     *   setSearched(true);
     *   
     *   // 검색 기록 저장
     *   saveSearchHistory({
     *     departure,
     *     destination,
     *     userType: UserType.WHEELCHAIR,
     *     timestamp: new Date(),
     *   });
     *   
     * } catch (error) {
     *   console.error('경로 검색 실패:', error);
     *   setError('경로를 찾을 수 없습니다. 다시 시도해주세요.');
     *   
     *   // 에러 토스트 표시
     *   toast.error('경로 검색에 실패했습니다.', {
     *     description: error.message,
     *   });
     *   
     * } finally {
     *   setIsLoading(false);
     * }
     * 
     * 
     * API 응답 데이터 구조:
     * [
     *   {
     *     id: 'route-uuid-123',
     *     departure: '서울역',
     *     destination: '강남역',
     *     duration: '28분',
     *     distance: '3.0km',
     *     description: '엘리베이터 4회 이용 | 평탄한 도로',
     *     coordinates: [
     *       { latitude: 37.5547, longitude: 126.9707 },
     *       { latitude: 37.5548, longitude: 126.9708 },
     *       ...
     *     ],
     *     obstacles: ['obstacle-id-1', 'obstacle-id-2'],
     *     facilities: ['facility-id-1', 'facility-id-2'],
     *     elevators: 4,
     *     stairs: 0,
     *     slope: { average: 2.5, maximum: 4.8 },
     *     accessibility: {
     *       wheelchairFriendly: true,
     *       hasElevator: true,
     *       hasRamp: true,
     *       pathWidth: 1.5
     *     }
     *   }
     * ]
     */

    // Mock 데이터 (임시)
    const mockRoutes: Route[] = [
      {
        id: 'wheelchair-1',
        departure,
        destination,
        duration: '28분',
        distance: '3.0km',
        description: '🛗 엘리베이터 4회 이용 | 평탄한 도로 | 휠체어 전용 램프',
      },
      {
        id: 'wheelchair-2',
        departure,
        destination,
        duration: '32분',
        distance: '3.3km',
        description: '🛗 엘리베이터 3회 이용 | 경사 5% 미만 | 자동문 설치',
      },
      {
        id: 'wheelchair-3',
        departure,
        destination,
        duration: '35분',
        distance: '3.8km',
        description: '🛗 엘리베이터 6회 이용 | 완전 평지 | 장애인 화장실 多',
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
            <div className="p-2 bg-blue-600 rounded-lg">
              <Accessibility className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="mb-1">휠체어 이용자 경로검색</h1>
              <p className="text-sm text-muted-foreground">
                휠체어 접근 가능한 최적 경로를 찾아드립니다
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
                id="elevatorOnly"
                checked={options.elevatorOnly}
                onCheckedChange={(checked) =>
                  setOptions({ ...options, elevatorOnly: checked as boolean })
                }
              />
              <Label 
                htmlFor="elevatorOnly" 
                className="cursor-pointer"
                onMouseEnter={() => speak('엘리베이터만 이용')}
              >
                엘리베이터만 이용 (계단 이용 안 함)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="avoidStairs"
                checked={options.avoidStairs}
                onCheckedChange={(checked) =>
                  setOptions({ ...options, avoidStairs: checked as boolean })
                }
              />
              <Label 
                htmlFor="avoidStairs" 
                className="cursor-pointer"
                onMouseEnter={() => speak('계단 구간 회피')}
              >
                계단 구간 회피
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
              <Label 
                htmlFor="flatRoute" 
                className="cursor-pointer"
                onMouseEnter={() => speak('평탄한 경로 우선')}
              >
                평탄한 경로 우선
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="widePathway"
                checked={options.widePathway}
                onCheckedChange={(checked) =>
                  setOptions({ ...options, widePathway: checked as boolean })
                }
              />
              <Label 
                htmlFor="widePathway" 
                className="cursor-pointer"
                onMouseEnter={() => speak('넓은 통로 우선')}
              >
                넓은 통로 우선 (휠체어 회전 가능)
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
                      <span className="text-blue-600">{route.duration}</span>
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
