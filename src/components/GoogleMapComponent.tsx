import { useEffect, useRef, useState } from 'react';
import { GoogleMap, Marker, Polyline, InfoWindow } from '@react-google-maps/api';
import { Facility, Obstacle } from '../types';
import { useHighContrast } from '../contexts/HighContrastContext';

// Note: This type should ideally be in a shared types file
interface StationSearchResult {
  station_id: number;
  line: string;
  name: string;
  lat: string;
  lng: string;
  station_cd: string;
}

export interface CustomPolyline {
  path: google.maps.LatLngLiteral[];
  color: string;
}

export interface CustomMarker {
  position: google.maps.LatLngLiteral;
  label?: string;
  info?: {
    title: string;
    content: string; // Can be HTML
  };
  icon?: string | google.maps.Icon | google.maps.Symbol | null;
}


interface GoogleMapComponentProps {
  showFacilities?: boolean;
  showObstacles?: boolean;
  facilities?: Facility[];
  obstacles?: Obstacle[];
  directionsResponse?: google.maps.DirectionsResult[] | null;
  polylines?: CustomPolyline[];
  markers?: CustomMarker[];
  zoomLevel?: number;
  center?: { lat: number; lng: number } | null;
  onCenterChange?: (center: { lat: number; lng: number }) => void;
  selectedStation?: StationSearchResult | null;
  onSelectedStationClose?: () => void;
}

const defaultCenter = {
  lat: 37.5665,
  lng: 126.9780
};

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

// 고대비 지도 스타일
const highContrastMapStyles: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#2b2b2b' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#2b2b2b' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#ffff00' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#ffff00' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#ffff00' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#3a3a3a' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#ffff00' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#4a4a4a' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#ffff00' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#ffff00' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#5a5a5a' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#ffff00' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#ffff00' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#3a3a3a' }] },
  { featureType: 'transit.station', elementType: 'labels.text.fill', stylers: [{ color: '#ffff00' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#1a1a1a' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#ffff00' }] },
  { featureType: 'water', elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a1a' }] }
];

export function GoogleMapComponent({
  showFacilities = false,
  showObstacles = false,
  facilities = [],
  obstacles = [],
  directionsResponse,
  polylines = [],
  markers = [],
  zoomLevel = 100,
  center,
  onCenterChange,
  selectedStation,
  onSelectedStationClose,
}: GoogleMapComponentProps) {
  const { isHighContrast } = useHighContrast();
  const mapRef = useRef<google.maps.Map | null>(null);
  const [currentLocation, setCurrentLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [mapCenter, setMapCenter] = useState<google.maps.LatLngLiteral>(defaultCenter);
  const [activeMarker, setActiveMarker] = useState<number | null>(null);

  // 사용자 현재 위치 가져오기
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCurrentLocation(pos);
          if (!center) {
            setMapCenter(pos);
          }
        },
        () => {
          setCurrentLocation(defaultCenter);
          setMapCenter(defaultCenter);
        },
        {
          enableHighAccuracy: false,
          timeout: 20000,
          maximumAge: 300000,
        }
      );
    } else {
      setCurrentLocation(defaultCenter);
      setMapCenter(defaultCenter);
    }
  }, []); 

  // center prop에 따라 지도 이동
  useEffect(() => {
    if (center && mapRef.current) {
      mapRef.current.panTo(center);
      setMapCenter(center);
    }
  }, [center]);

  // 줌 레벨 적용
  useEffect(() => {
    if (mapRef.current) {
      const googleZoom = Math.round(12 + ((zoomLevel - 70) / 80) * 6);
      mapRef.current.setZoom(Math.max(10, Math.min(20, googleZoom)));
    }
  }, [zoomLevel]);

  // 고대비 스타일 적용/해제
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setOptions({
        styles: isHighContrast ? highContrastMapStyles : []
      });
    }
  }, [isHighContrast]);

  const onLoad = (map: google.maps.Map) => {
    mapRef.current = map;
    if (center) {
      setMapCenter(center);
    } else if (currentLocation) {
      setMapCenter(currentLocation);
    }
  };

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={mapCenter}
      zoom={15}
      onLoad={onLoad}
      options={{
        zoomControl: false,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: isHighContrast ? highContrastMapStyles : [],
      }}
    >
      {currentLocation && (
        <Marker
          position={currentLocation}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: isHighContrast ? '#ffff00' : '#4285F4',
            fillOpacity: 1,
            strokeColor: isHighContrast ? '#2b2b2b' : '#ffffff',
            strokeWeight: 3,
          }}
          title="현재 위치"
        />
      )}

      {directionsResponse && directionsResponse.map((response, responseIndex) => (
        <div key={responseIndex}>
          {response.routes[0] && (
            <>
              {response.routes[0].legs.map((leg, legIndex) =>
                leg.steps.map((step, stepIndex) => {
                  const key = `${responseIndex}-${legIndex}-${stepIndex}`;
                  let strokeColor = isHighContrast ? '#ffff00' : '#2563eb'; // Default color

                  if (step.travel_mode === 'WALKING') {
                    strokeColor = '#808080'; // Gray for walking
                  } else if (step.travel_mode === 'TRANSIT' && step.transit) {
                    strokeColor = step.transit.line.color || strokeColor;
                  }

                  return (
                    <Polyline
                      key={key}
                      path={step.path}
                      options={{
                        strokeColor,
                        strokeWeight: isHighContrast ? 8 : 6,
                        strokeOpacity: 0.8,
                      }}
                    />
                  );
                })
              )}
              {/* Render markers for the start of the first segment and the end of the last segment */}
              {responseIndex === 0 && <Marker position={response.routes[0].legs[0].start_location} label="A" />}
              {responseIndex === directionsResponse.length - 1 && <Marker position={response.routes[0].legs[response.routes[0].legs.length - 1].end_location} label="B" />}
            </>
          )}
        </div>
      ))}

      {/* 경로 폴리라인 렌더링 */}
      {polylines.map((line, index) => (
        <Polyline
          key={index}
          path={line.path}
          options={{
            strokeColor: line.color,
            strokeWeight: isHighContrast ? 8 : 6,
            strokeOpacity: 0.8,
          }}
        />
      ))}

      {/* 경로 마커 및 정보창 렌더링 */}
      {markers.map((marker, index) => (
        <Marker
          key={index}
          position={marker.position}
          label={marker.label}
          icon={marker.icon}
          onClick={() => setActiveMarker(index)}
        >
          {activeMarker === index && marker.info && (
            <InfoWindow onCloseClick={() => setActiveMarker(null)}>
              <div className="p-1">
                <h4 className="font-bold">{marker.info.title}</h4>
                <div dangerouslySetInnerHTML={{ __html: marker.info.content }} />
              </div>
            </InfoWindow>
          )}
        </Marker>
      ))}


      {/* 선택된 역 정보창 표시 (기존 검색 기능용) */}
      {selectedStation && (
        <InfoWindow
          position={{
            lat: parseFloat(selectedStation.lat),
            lng: parseFloat(selectedStation.lng),
          }}
          onCloseClick={onSelectedStationClose}
        >
          <div className="p-2">
            <h4 className="font-bold">{selectedStation.name}</h4>
            <p className="text-sm text-muted-foreground">{selectedStation.line}</p>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}