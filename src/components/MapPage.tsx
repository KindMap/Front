import { useState, useEffect, useRef, useContext, useLayoutEffect } from 'react';
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
} from 'lucide-react';
import { useHighContrast } from '../contexts/HighContrastContext';
import { useVoiceGuide } from '../contexts/VoiceGuideContext';
import { Route, Facility, Obstacle } from '../types';
import { GoogleMapComponent, CustomPolyline, CustomMarker } from './GoogleMapComponent';
import { ScrollArea } from './ui/scroll-area';
import {
  getStationByCd,
  getTransferConvenience,
  StationData,
  searchStations,
  StationSearchResult,
} from '../services/stationApi';
import { lineColors } from '../styles/lineColors';

interface MapPageProps {
  selectedRoute?: Route | null;
}

const getLineColor = (line: string, isHighContrast: boolean): string => {
  const lineName = Object.keys(lineColors).find(key => line.includes(key));
  if (lineName) {
    return isHighContrast ? lineColors[lineName].highContrast : lineColors[lineName].normal;
  }
  return '#666666'; // Default color
};

const getDifficultyColor = (score: number | null): string => {
  if (score === null) return '#808080'; // Unknown (Error case)
  if (score >= 80) return '#4CAF50'; // Easy
  if (score >= 40) return '#FFC107'; // Medium
  return '#F44336'; // Hard
};

export function MapPage({ selectedRoute }: MapPageProps) {
  const navigate = useNavigate();
  const { isHighContrast, toggleHighContrast } = useHighContrast();
  const { isVoiceGuideEnabled, toggleVoiceGuide, speak } = useVoiceGuide();

  // UI States
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<StationSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Feature States
  const [showFacilities, setShowFacilities] = useState(false);
  const [showObstacles, setShowObstacles] = useState(false);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);

  // Map States
  const [zoomLevel, setZoomLevel] = useState(100);
  const [mapKey, setMapKey] = useState(0);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedStation, setSelectedStation] = useState<StationSearchResult | null>(null);

  // Route Display States
  const [routePolylines, setRoutePolylines] = useState<CustomPolyline[]>([]);
  const [routeMarkers, setRouteMarkers] = useState<CustomMarker[]>([]);
  const [isRouteLoading, setIsRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // State for dynamic search bar width
  const [searchBarWidth, setSearchBarWidth] = useState<number | string>('30vw');

  // --- Handlers ---
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setIsSearchOpen(true);
    setSearchResults([]);
    try {
      const data = await searchStations(searchQuery);
      setSearchResults(data.results || []);
    } catch (error) {
      console.error('검색 실패:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectPlace = (station: StationSearchResult) => {
    const lat = parseFloat(station.lat);
    const lng = parseFloat(station.lng);
    if (isNaN(lat) || isNaN(lng)) return;
    setMapCenter({ lat, lng });
    setSelectedStation(station);
    setIsSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
    speak(`${station.name}으로 이동합니다.`);
  };

  const handleRefresh = () => setMapKey(prev => prev + 1);
  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 10, 150));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 10, 70));

  // --- Main Effect for Displaying Route ---
  useEffect(() => {
    const displayRoute = async () => {
      if (!selectedRoute?.path || selectedRoute.path.length < 2) {
        setRoutePolylines([]);
        setRouteMarkers([]);
        setRouteError(null);
        return;
      }

      setIsRouteLoading(true);
      setRouteError(null);
      
      try {
        const stationPromises = selectedRoute.path.map(id => getStationByCd(id));
        const stationResults = await Promise.allSettled(stationPromises);
        const validStations = stationResults
          .map(r => (r.status === 'fulfilled' && r.value.data) ? r.value.data : null)
          .filter(s => s && !isNaN(parseFloat(s.lat as string)) && !isNaN(parseFloat(s.lng as string))) as StationData['data'][];

        if (validStations.length < 2) {
          throw new Error('경로를 구성하기에 유효한 역 정보가 부족합니다.');
        }

        const originStation = validStations[0];
        const originPos = { lat: parseFloat(originStation.lat as string), lng: parseFloat(originStation.lng as string) };
        setMapCenter(originPos);

        const directionsService = new google.maps.DirectionsService();
        const segmentPromises = [];
        for (let i = 0; i < validStations.length - 1; i++) {
          const request = {
            origin: { lat: parseFloat(validStations[i].lat as string), lng: parseFloat(validStations[i].lng as string) },
            destination: { lat: parseFloat(validStations[i+1].lat as string), lng: parseFloat(validStations[i+1].lng as string) },
            travelMode: google.maps.TravelMode.TRANSIT,
          };
          segmentPromises.push(
            new Promise((resolve, reject) => {
              directionsService.route(request, (result, status) => {
                if (status === google.maps.DirectionsStatus.OK && result) {
                  resolve(result);
                } else {
                  reject(new Error(`Directions Service segment 요청 실패 (${status})`));
                }
              });
            })
          );
        }

        const allSegmentResults = await Promise.allSettled(segmentPromises);
        const newPolylines: CustomPolyline[] = [];
        allSegmentResults.forEach((result: any, index) => {
          if (result.status === 'fulfilled' && result.value.routes[0]) {
            newPolylines.push({
              path: result.value.routes[0].overview_path,
              color: getLineColor(selectedRoute.lines![index], isHighContrast),
            });
          } else {
            console.warn(`구간 경로를 가져오지 못했습니다: ${result.reason || '알 수 없음'}`);
          }
        });
        setRoutePolylines(newPolylines);

        // Marker Generation
        const markers: CustomMarker[] = [];
        const destinationStation = validStations[validStations.length - 1];

        markers.push({
          position: originPos,
          info: { title: '출발역', content: `${originStation.name} (${originStation.line})` },
        });
        markers.push({
          position: { lat: parseFloat(destinationStation.lat as string), lng: parseFloat(destinationStation.lng as string) },
          info: { title: '도착역', content: `${destinationStation.name} (${destinationStation.line})` },
        });

        if (selectedRoute.transfer_info) {
          const transferPromises = selectedRoute.transfer_info.map(async (transfer) => {
            const [stationId, fromLine, toLine] = transfer;
            const stationDetail = validStations.find(s => s.station_id.toString() === stationId);
            if (!stationDetail) return null;

            let convenienceScore: number | null = null;
            try {
              const convenienceData = await getTransferConvenience(stationDetail.station_cd);
              convenienceScore = convenienceData.data.convenience_score;
            } catch (e) {
              console.error(`환승 편의성 점수 조회 실패: ${stationDetail.name}`, e);
            }
            
            const stationPos = { lat: parseFloat(stationDetail.lat as string), lng: parseFloat(stationDetail.lng as string) };
            if ( (stationPos.lat === originPos.lat && stationPos.lng === originPos.lng) ||
                 (stationPos.lat === parseFloat(destinationStation.lat as string) && stationPos.lng === parseFloat(destinationStation.lng as string)) ) {
              return null; // Don't add if it's the start or end station
            }

            return {
              position: stationPos,
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: getDifficultyColor(convenienceScore),
                fillOpacity: 1,
                strokeColor: 'white',
                strokeWeight: 2,
              },
              alwaysShowInfo: true,
              info: {
                title: `${stationDetail.name} 환승`,
                content: `
                  <div>${fromLine} → ${toLine}</div>
                  <div>환승 난이도: ${convenienceScore?.toFixed(1) ?? '정보 없음'}</div>
                `,
              },
            };
          });
          const transferMarkers = (await Promise.all(transferPromises)).filter(Boolean) as CustomMarker[];
          markers.push(...transferMarkers);
        }
        setRouteMarkers(markers);
        
      } catch (err: any) {
        console.error('경로 표시 중 오류 발생:', err);
        setRouteError(err.message || '경로를 표시하는 데 실패했습니다.');
        setRoutePolylines([]);
        setRouteMarkers([]);
      } finally {
        setIsRouteLoading(false);
      }
    };

    displayRoute();
  }, [selectedRoute, isHighContrast]);

  // --- Effect for Dynamic Search Bar Width ---
  useLayoutEffect(() => {
    const updateWidth = () => {
      const windowWidth = window.innerWidth;
      const mobileBreakpoint = 768; // Common breakpoint for mobile
      
      // Calculate max width based on static space taken by side elements.
      const leftControlSpace = 70; // Approx. 16px offset + 40px button width + buffer
      const rightControlSpace = 70; // Approx. 16px offset + 40px button width + buffer
      const horizontalBuffer = 40; // Extra safety buffer
      const maxWidth = windowWidth - leftControlSpace - rightControlSpace - horizontalBuffer;

      let targetWidth;

      if (windowWidth < mobileBreakpoint) {
        // On mobile, fill the available space.
        targetWidth = maxWidth;
      } else {
        // On desktop, use 50% of the available space.
        targetWidth = maxWidth * 0.5;
      }
      
      // Set the width, ensuring it doesn't go below a minimum of 150px.
      setSearchBarWidth(Math.max(150, targetWidth));
    };

    updateWidth();
    
    window.addEventListener('resize', updateWidth);
    
    return () => window.removeEventListener('resize', updateWidth);
  }, []);


  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div key={mapKey} className="w-full h-full relative overflow-hidden">
        <GoogleMapComponent
          polylines={routePolylines}
          markers={routeMarkers}
          zoomLevel={zoomLevel}
          center={mapCenter}
          onCenterChange={setMapCenter}
          selectedStation={selectedStation}
          onSelectedStationClose={() => setSelectedStation(null)}
        />
      </div>

      {/* 검색창 */}
      <div className="absolute top-4 left-0 right-0 z-10 pointer-events-none">
        <div
          ref={searchContainerRef}
          style={{ width: searchBarWidth }}
          className="mx-auto flex items-center gap-2 px-4 pointer-events-auto"
        >
          <Input ref={searchInputRef} type="text" placeholder="장소, 주소 검색.. (역 이름만)" className="flex-1 bg-white shadow-lg border-2" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSearch()} />
          <Button size="icon" className="shadow-lg shrink-0" onClick={handleSearch} disabled={isSearching}>
            {isSearching ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" /> : <Search className="w-5 h-5" />}
          </Button>
        </div>
      </div>
      
      {/* 검색 결과 Sheet */}
      <Sheet open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <SheetContent side="top" className="h-[60vh] w-full max-w-2xl mx-auto">
          <SheetHeader><SheetTitle>검색 결과</SheetTitle></SheetHeader>
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
                        <p className="text-sm text-muted-foreground truncate">{station.line}</p>
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
          <SheetTrigger asChild><Button size="icon" className="shadow-lg"><Menu className="w-5 h-5" /></Button></SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px]">
            <SheetHeader><SheetTitle>메뉴</SheetTitle></SheetHeader>
            <div className="flex flex-col gap-3 mt-6">
              <Button variant="outline" onClick={() => { navigate('/user-type-selection'); setIsMenuOpen(false); }}>경로검색</Button>
              <Button variant="outline" onClick={() => { navigate('/favorites'); setIsMenuOpen(false); }}>즐겨찾기</Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* 오른쪽 컨트롤 버튼 */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
        <Button size="icon" className="shadow-lg" onClick={() => navigate('/profile')}><User className="w-5 h-5" /></Button>
        <Button size="icon" variant="outline" className="shadow-lg bg-white" onClick={handleRefresh}><RefreshCw className="w-5 h-5" /></Button>
        <Button size="icon" variant={showFacilities ? "default" : "outline"} className={`shadow-lg ${!showFacilities ? 'bg-white' : ''}`} onClick={() => setShowFacilities(!showFacilities)}><Building2 className="w-5 h-5" /></Button>
        <Button size="icon" variant="outline" className="shadow-lg bg-white" onClick={handleZoomIn} disabled={zoomLevel >= 150}><Plus className="w-5 h-5" /></Button>
        <Button size="icon" variant="outline" className="shadow-lg bg-white" onClick={handleZoomOut} disabled={zoomLevel <= 70}><Minus className="w-5 h-5" /></Button>
        <div className="w-full h-px bg-gray-300 my-1"></div>
        <div className="flex flex-col items-center gap-1 p-2 bg-white rounded-lg shadow-lg border-2 border-blue-500">
          <Volume2 className="w-4 h-4 text-blue-600" />
          <Switch checked={isVoiceGuideEnabled} onCheckedChange={toggleVoiceGuide} />
        </div>
        <div className="flex flex-col items-center gap-1 p-2 bg-white rounded-lg shadow-lg border-2 border-yellow-500">
          <div className="w-4 h-4 bg-gradient-to-r from-yellow-400 to-gray-800 rounded-sm"></div>
          <Switch checked={isHighContrast} onCheckedChange={toggleHighContrast} />
        </div>
      </div>

      {/* 선택된 경로 정보 */}
      {selectedRoute && (isRouteLoading || routeError || routePolylines.length > 0) && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white p-4 rounded-lg shadow-xl max-w-md w-full mx-4">
          {isRouteLoading && <p>경로 로딩 중...</p>}
          {routeError && <p className="text-red-500">오류: {routeError}</p>}
          {!isRouteLoading && !routeError && routePolylines.length > 0 && (
            <>
              <h3 className="mb-2 font-bold">선택된 경로</h3>
              <div className="flex items-center gap-4 mb-2">
                <span className="font-bold text-lg">{selectedRoute.duration}</span>
                <span className="text-muted-foreground">{selectedRoute.description}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-1">
                출발: {selectedRoute.departure}
              </p>
              <p className="text-sm text-muted-foreground mb-1">
                도착: {selectedRoute.destination}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
