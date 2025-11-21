import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Switch } from './ui/switch';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import {
  Menu,
  User,
  RefreshCw,
  Building2,
  AlertTriangle,
  Plus,
  Minus,
  ArrowRight,
  MapPin,
  Search,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useHighContrast } from '../contexts/HighContrastContext';
import { useVoiceGuide } from '../contexts/VoiceGuideContext';
import { Route, Facility, Obstacle } from '../types';
import { GoogleMapComponent } from './GoogleMapComponent';
import { ScrollArea } from './ui/scroll-area';

interface MapPageProps {
  selectedRoute?: Route | null;
}

// 역검색 API 응답 타입
interface StationSearchResult {
  station_id: number;
  line: string;
  name: string;
  lat: string;
  lng: string;
  station_cd: string;
}

export function MapPage({ selectedRoute }: MapPageProps) {
  const navigate = useNavigate();
  const { isHighContrast, toggleHighContrast } = useHighContrast();
  const { isVoiceGuideEnabled, toggleVoiceGuide, speak } = useVoiceGuide();

  // UI 관련 상태
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<StationSearchResult[]>([]); // 타입 적용
  const [isSearching, setIsSearching] = useState(false);

  // 편의시설/장애물 관련 상태
  const [showFacilities, setShowFacilities] = useState(false);
  const [showObstacles, setShowObstacles] = useState(false);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);

  // 지도 상태
  const [zoomLevel, setZoomLevel] = useState(100);
  const [mapKey, setMapKey] = useState(0);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult[]>([]);
  const [selectedStation, setSelectedStation] = useState<StationSearchResult | null>(null); // 정보창을 표시할 선택된 역 상태

  const searchInputRef = useRef<HTMLInputElement>(null);

  /**
   * 장소 검색 (역 한정)
   */
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setIsSearching(true);
      setIsSearchOpen(true);
      setSearchResults([]);

      const response = await fetch(`http://35.92.117.143/api/v1/stations/search?q=${searchQuery}&limit=5`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();

      setSearchResults(data.results || []);
      console.log('검색 결과:', data.results?.length || 0, '개');
    } catch (error) {
      console.error('검색 실패:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  /**
   * 검색 결과 선택 (역 한정)
   */
  const handleSelectPlace = (station: StationSearchResult) => {
    const location = {
      lat: parseFloat(station.lat),
      lng: parseFloat(station.lng),
    };

    setMapCenter(location);
    setSelectedStation(station); // 정보창을 표시할 역을 설정
    setIsSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);

    // 음성 안내
    speak(`${station.name}으로 이동합니다.`);

    console.log('선택한 장소:', station.name, location);
  };

  /**
   * 지도 새로고침
   */
  const handleRefresh = () => {
    setMapKey(prev => prev + 1);
    speak('지도를 새로고침합니다.');
    console.log('지도 새로고침');
  };

  /**
   * 확대/축소
   */
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 10, 150));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 10, 70));
  };

  // selectedRoute가 바뀌면 경로 표시
  useEffect(() => {
    if (selectedRoute?.path && selectedRoute.path.length >= 2 && typeof google !== 'undefined' && google.maps) {
      const directionsService = new google.maps.DirectionsService();
      const routePath = selectedRoute.path;

      const promises = [];
      for (let i = 0; i < routePath.length - 1; i++) {
        const request = {
          origin: `${routePath[i]}역`,
          destination: `${routePath[i + 1]}역`,
          travelMode: google.maps.TravelMode.TRANSIT,
        };

        promises.push(new Promise((resolve, reject) => {
          directionsService.route(request, (result, status) => {
            if (status === google.maps.DirectionsStatus.OK) {
              resolve(result);
            } else {
              reject(status);
            }
          });
        }));
      }

      Promise.all(promises)
        .then(results => {
          setDirectionsResponse(results as google.maps.DirectionsResult[]);

          // Center map on the very first point
          const firstResult = results[0] as google.maps.DirectionsResult;
          if (firstResult?.routes[0]?.legs[0]?.start_location) {
            const startLocation = firstResult.routes[0].legs[0].start_location;
            setMapCenter({ lat: startLocation.lat(), lng: startLocation.lng() });
          }
        })
        .catch(status => {
          console.error("Directions Service에서 경로 계산에 실패했습니다:", status);
          setDirectionsResponse([]);
        });

    } else {
      setDirectionsResponse([]);
    }
  }, [selectedRoute]);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Google Maps */}
      <div key={mapKey} className="w-full h-full relative overflow-hidden">
        <GoogleMapComponent
          showFacilities={showFacilities}
          showObstacles={showObstacles}
          facilities={facilities}
          obstacles={obstacles}
          directionsResponse={directionsResponse}
          zoomLevel={zoomLevel}
          center={mapCenter}
          onCenterChange={setMapCenter}
          selectedStation={selectedStation} // 정보창을 표시할 역 전달
          onSelectedStationClose={() => setSelectedStation(null)}
        />
      </div>

      {/* 검색창 */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-10">
        <div className="flex gap-2">
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="장소, 주소 검색.. (역 이름만)"
            className="flex-1 bg-white shadow-lg border-2"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button
            size="icon"
            className="shadow-lg shrink-0"
            onClick={handleSearch}
            disabled={isSearching}
            onMouseEnter={() => speak('검색하기')}
          >
            {isSearching ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            ) : (
              <Search className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>

      {/* 검색 결과 Sheet (역 한정) */}
      <Sheet open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <SheetContent side="top" className="h-[60vh] w-full max-w-2xl mx-auto">
          <SheetHeader>
            <SheetTitle>검색 결과</SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-[calc(60vh-80px)] mt-4">
            {isSearching ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
                  <p className="text-muted-foreground">검색 중입니다..</p>
                </div>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-2">
                {searchResults.map((station) => (
                  <button
                    key={station.station_id}
                    onClick={() => handleSelectPlace(station)}
                    onMouseEnter={() => speak(station.name || '장소')}
                    className="w-full p-4 text-left border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-primary mt-1 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h4 className="truncate">{station.name}</h4>
                        <p className="text-sm text-muted-foreground truncate">
                          {station.line}
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground shrink-0" />
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">검색 결과가 없습니다.</p>
              </div>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* 메뉴 버튼 */}
      <div className="absolute top-4 left-4 z-10">
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild>
            <Button
              size="icon"
              className="shadow-lg"
              onMouseEnter={() => speak('메뉴')}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px]">
            <SheetHeader>
              <SheetTitle>메뉴</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-3 mt-6">
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => {
                  navigate('/user-type-selection');
                  setIsMenuOpen(false);
                }}
                onMouseEnter={() => speak('경로검색')}
              >
                경로검색
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => {
                  navigate('/favorites');
                  setIsMenuOpen(false);
                }}
                onMouseEnter={() => speak('즐겨찾기')}
              >
                즐겨찾기
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* 오른쪽 컨트롤 버튼 */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
        <Button
          size="icon"
          className="shadow-lg"
          onClick={() => navigate('/login')}
          onMouseEnter={() => speak('로그인')}
        >
          <User className="w-5 h-5" />
        </Button>

        <Button
          size="icon"
          variant="outline"
          className="shadow-lg bg-white"
          onClick={handleRefresh}
          onMouseEnter={() => speak('지도 새로고침')}
        >
          <RefreshCw className="w-5 h-5" />
        </Button>

        <Button
          size="icon"
          variant={showFacilities ? "default" : "outline"}
          className={`shadow-lg ${!showFacilities ? 'bg-white' : ''}`}
          onClick={() => {
            setShowFacilities(!showFacilities);
            speak(showFacilities ? '편의시설 숨기기' : '편의시설 표시');
          }}
          onMouseEnter={() => speak('편의시설 토글')}
        >
          <Building2 className="w-5 h-5" />
        </Button>

        <Button
          size="icon"
          variant={showObstacles ? "default" : "outline"}
          className={`shadow-lg ${!showObstacles ? 'bg-white' : ''}`}
          onClick={() => {
            setShowObstacles(!showObstacles);
            speak(showObstacles ? '장애물 숨기기' : '장애물 표시');
          }}
          onMouseEnter={() => speak('장애물 토글')}
        >
          <AlertTriangle className="w-5 h-5" />
        </Button>

        <Button
          size="icon"
          variant="outline"
          className="shadow-lg bg-white"
          onClick={handleZoomIn}
          disabled={zoomLevel >= 150}
          onMouseEnter={() => speak('확대')}
        >
          <Plus className="w-5 h-5" />
        </Button>

        <Button
          size="icon"
          variant="outline"
          className="shadow-lg bg-white"
          onClick={handleZoomOut}
          disabled={zoomLevel <= 70}
          onMouseEnter={() => speak('축소')}
        >
          <Minus className="w-5 h-5" />
        </Button>

        {/* 구분선 */}
        <div className="w-full h-px bg-gray-300 my-1"></div>

        {/* 음성 안내 설정 */}
        <div
          className="flex flex-col items-center gap-1 p-2 bg-white rounded-lg shadow-lg border-2 border-blue-500"
          onMouseEnter={() => speak('음성 안내')}
        >
          <Volume2 className="w-4 h-4 text-blue-600" />
          <Switch
            checked={isVoiceGuideEnabled}
            onCheckedChange={() => {
              toggleVoiceGuide();
              speak(isVoiceGuideEnabled ? '음성 안내 비활성화' : '음성 안내 활성화');
            }}
          />
        </div>

        {/* 고대비 설정 */}
        <div
          className="flex flex-col items-center gap-1 p-2 bg-white rounded-lg shadow-lg border-2 border-yellow-500"
          onMouseEnter={() => speak('고대비')}
        >
          <div className="w-4 h-4 bg-gradient-to-r from-yellow-400 to-gray-800 rounded-sm"></div>
          <Switch
            checked={isHighContrast}
            onCheckedChange={toggleHighContrast}
          />
        </div>
      </div>

      {/* 선택된 경로 정보 */}
      {selectedRoute && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white p-4 rounded-lg shadow-xl max-w-md w-full mx-4">
          <h3 className="mb-2">선택된 경로</h3>
          <div className="flex items-center gap-4 mb-2">
            <span className="font-bold text-lg">{selectedRoute.duration}</span>
            <span className="text-muted-foreground">{selectedRoute.distance}</span>
          </div>
          <p className="text-muted-foreground mb-1">
            출발: {selectedRoute.departure}
          </p>
          <p className="text-muted-foreground mb-1">
            도착: {selectedRoute.destination}
          </p>
          <p className="text-sm text-muted-foreground">
            {selectedRoute.description}
          </p>
        </div>
      )}
    </div>
  );
}