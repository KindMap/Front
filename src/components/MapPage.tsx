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

export function MapPage({ selectedRoute }: MapPageProps) {
  const navigate = useNavigate();
  const { isHighContrast, toggleHighContrast } = useHighContrast();
  const { isVoiceGuideEnabled, toggleVoiceGuide, speak } = useVoiceGuide();
  
  // UI 상태
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<google.maps.places.PlaceResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // 편의시설/장애물 상태
  const [showFacilities, setShowFacilities] = useState(false);
  const [showObstacles, setShowObstacles] = useState(false);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  
  // 지도 상태
  const [zoomLevel, setZoomLevel] = useState(100);
  const [mapKey, setMapKey] = useState(0);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);
  
  const searchInputRef = useRef<HTMLInputElement>(null);

  /**
   * 검색 핸들러
   */
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    if (typeof google === 'undefined' || !google.maps || !google.maps.places) {
      console.error('Google Maps API가 아직 로드되지 않았습니다.');
      return;
    }

    try {
      setIsSearching(true);
      setIsSearchOpen(true);

      const service = new google.maps.places.PlacesService(
        document.createElement('div')
      );

      const request: google.maps.places.TextSearchRequest = {
        query: searchQuery,
        fields: ['name', 'geometry', 'formatted_address', 'place_id'],
      };

      service.textSearch(request, (results, status) => {
        setIsSearching(false);
        
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          setSearchResults(results);
          console.log('검색 결과:', results.length, '개');
        } else {
          console.error('장소 검색 실패:', status);
          setSearchResults([]);
        }
      });
    } catch (error) {
      console.error('검색 실패:', error);
      setIsSearching(false);
      setSearchResults([]);
    }
  };

  /**
   * 검색 결과 선택
   */
  const handleSelectPlace = (place: google.maps.places.PlaceResult) => {
    if (place.geometry?.location) {
      const location = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };
      
      setMapCenter(location);
      setIsSearchOpen(false);
      setSearchQuery('');
      setSearchResults([]);
      
      // 음성 안내
      if (place.name) {
        speak(`${place.name}으로 이동합니다`);
      }
      
      console.log('선택한 장소:', place.name, location);
    }
  };

  /**
   * 새로고침
   */
  const handleRefresh = () => {
    setMapKey(prev => prev + 1);
    speak('지도를 새로고침합니다');
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

  // selectedRoute가 변경될 때 경로 표시
  useEffect(() => {
    if (selectedRoute && typeof google !== 'undefined' && google.maps) {
      if (selectedRoute.departure && selectedRoute.destination) {
        const directionsService = new google.maps.DirectionsService();
        
        directionsService.route(
          {
            origin: selectedRoute.departure,
            destination: selectedRoute.destination,
            travelMode: google.maps.TravelMode.TRANSIT,
          },
          (result, status) => {
            if (status === google.maps.DirectionsStatus.OK && result) {
              setDirectionsResponse(result);
            } else {
              console.error('경로 계산 실패:', status);
            }
          }
        );
      }
    } else {
      setDirectionsResponse(null);
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
        />
      </div>

      {/* 검색창 */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-10">
        <div className="flex gap-2">
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="장소, 주소 검색... (예: 서울역)"
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
            onMouseEnter={() => speak('검색 버튼')}
          >
            {isSearching ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            ) : (
              <Search className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>

      {/* 검색 결과 Sheet */}
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
                  <p className="text-muted-foreground">검색 중...</p>
                </div>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-2">
                {searchResults.map((place, index) => (
                  <button
                    key={place.place_id || index}
                    onClick={() => handleSelectPlace(place)}
                    onMouseEnter={() => speak(place.name || '장소')}
                    className="w-full p-4 text-left border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-primary mt-1 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h4 className="truncate">{place.name}</h4>
                        <p className="text-sm text-muted-foreground truncate">
                          {place.formatted_address}
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

      {/* 메뉴 */}
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

      {/* 컨트롤 버튼 */}
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
          onMouseEnter={() => speak('새로고침')}
        >
          <RefreshCw className="w-5 h-5" />
        </Button>

        <Button 
          size="icon" 
          variant={showFacilities ? "default" : "outline"}
          className={`shadow-lg ${!showFacilities ? 'bg-white' : ''}`}
          onClick={() => {
            setShowFacilities(!showFacilities);
            speak(showFacilities ? '편의시설 표시를 끕니다' : '편의시설 표시를 켭니다');
          }}
          onMouseEnter={() => speak('편의시설 표시')}
        >
          <Building2 className="w-5 h-5" />
        </Button>

        <Button 
          size="icon" 
          variant={showObstacles ? "default" : "outline"}
          className={`shadow-lg ${!showObstacles ? 'bg-white' : ''}`}
          onClick={() => {
            setShowObstacles(!showObstacles);
            speak(showObstacles ? '장애물 표시를 끕니다' : '장애물 표시를 켭니다');
          }}
          onMouseEnter={() => speak('장애물 표시')}
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

        {/* 음성 안내 토글 */}
        <div 
          className="flex flex-col items-center gap-1 p-2 bg-white rounded-lg shadow-lg border-2 border-blue-500"
          onMouseEnter={() => speak('음성 안내')}
        >
          <Volume2 className="w-4 h-4 text-blue-600" />
          <Switch
            checked={isVoiceGuideEnabled}
            onCheckedChange={() => {
              toggleVoiceGuide();
              speak(isVoiceGuideEnabled ? '음성 안내가 꺼졌습니다' : '음성 안내가 켜졌습니다');
            }}
          />
        </div>

        {/* 고대비 모드 토글 */}
        <div 
          className="flex flex-col items-center gap-1 p-2 bg-white rounded-lg shadow-lg border-2 border-yellow-500"
          onMouseEnter={() => speak('고대비 모드')}
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
