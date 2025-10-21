import { useEffect, useRef, useState } from 'react';
import { GoogleMap, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { Facility, Obstacle } from '../types';
import { useHighContrast } from '../contexts/HighContrastContext';

interface GoogleMapComponentProps {
  showFacilities?: boolean;
  showObstacles?: boolean;
  facilities?: Facility[];
  obstacles?: Obstacle[];
  directionsResponse?: google.maps.DirectionsResult | null;
  zoomLevel?: number;
  center?: { lat: number; lng: number } | null;
  onCenterChange?: (center: { lat: number; lng: number }) => void;
}

const defaultCenter = {
  lat: 37.5665,
  lng: 126.9780
};

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

// 고대비 모드 지도 스타일
const highContrastMapStyles: google.maps.MapTypeStyle[] = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#2b2b2b' }]
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#2b2b2b' }]
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#ffff00' }]
  },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#ffff00' }]
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#ffff00' }]
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#3a3a3a' }]
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#ffff00' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#4a4a4a' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#ffff00' }]
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#ffff00' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#5a5a5a' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#ffff00' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#ffff00' }]
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#3a3a3a' }]
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#ffff00' }]
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#1a1a1a' }]
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#ffff00' }]
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#1a1a1a' }]
  }
];

export function GoogleMapComponent({
  showFacilities = false,
  showObstacles = false,
  facilities = [],
  obstacles = [],
  directionsResponse,
  zoomLevel = 100,
  center,
  onCenterChange,
}: GoogleMapComponentProps) {
  const { isHighContrast } = useHighContrast();
  const mapRef = useRef<google.maps.Map | null>(null);
  const [currentLocation, setCurrentLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [mapCenter, setMapCenter] = useState<google.maps.LatLngLiteral>(defaultCenter);

  // 현재 위치 가져오기
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
            if (mapRef.current) {
              mapRef.current.panTo(pos);
            }
          }
        },
        (error) => {
          // 위치 정보를 가져올 수 없을 때 기본 위치(서울) 사용
          // 사용자가 위치 권한을 거부했거나 브라우저에서 지원하지 않는 경우
          setCurrentLocation(defaultCenter);
          setMapCenter(defaultCenter);
        },
        {
          enableHighAccuracy: false, // 배터리 소모를 줄이기 위해 false로 변경
          timeout: 10000, // 타임아웃을 10초로 증가
          maximumAge: 300000, // 5분간 캐시된 위치 정보 사용 가능
        }
      );
    } else {
      // 브라우저가 geolocation을 지원하지 않는 경우
      setCurrentLocation(defaultCenter);
      setMapCenter(defaultCenter);
    }
  }, [center]);

  // center prop이 변경되면 지도 이동
  useEffect(() => {
    if (center && mapRef.current) {
      mapRef.current.panTo(center);
      setMapCenter(center);
    }
  }, [center]);

  // 줌 레벨 변경
  useEffect(() => {
    if (mapRef.current) {
      const googleZoom = Math.round(12 + ((zoomLevel - 70) / 80) * 6);
      mapRef.current.setZoom(Math.max(10, Math.min(20, googleZoom)));
    }
  }, [zoomLevel]);

  // 고대비 모드 변경 시 지도 스타일 업데이트
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setOptions({
        styles: isHighContrast ? highContrastMapStyles : []
      });
    }
  }, [isHighContrast]);

  const onLoad = (map: google.maps.Map) => {
    mapRef.current = map;
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
      {/* 현재 위치 마커 */}
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

      {/* 경로 표시 */}
      {directionsResponse && (
        <DirectionsRenderer
          directions={directionsResponse}
          options={{
            suppressMarkers: false,
            polylineOptions: {
              strokeColor: isHighContrast ? '#ffff00' : '#2563eb',
              strokeWeight: isHighContrast ? 6 : 5,
              strokeOpacity: 1,
            },
            markerOptions: {
              icon: isHighContrast ? {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: '#ffff00',
                fillOpacity: 1,
                strokeColor: '#2b2b2b',
                strokeWeight: 3,
              } : undefined,
            },
          }}
        />
      )}
    </GoogleMap>
  );
}
