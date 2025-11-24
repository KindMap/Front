import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GoogleMap, Marker, Polyline } from '@react-google-maps/api';
import { useHighContrast } from '../contexts/HighContrastContext';
import { useNavigation } from '../contexts/NavigationContext';
import { NavigationStatusPanel } from './NavigationStatusPanel';
import { RouteProgressBar } from './RouteProgressBar';
import { RouteOptionSelector } from './RouteOptionSelector';
import { TransferAlert } from './TransferAlert';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

// 서울 중심 좌표
const defaultCenter = {
  lat: 37.5665,
  lng: 126.9780,
};

interface NavigationPageProps {
  origin?: string;
  destination?: string;
  disabilityType?: 'PHY' | 'VIS' | 'AUD' | 'ELD';
}

export function NavigationPage({
  origin,
  destination,
  disabilityType = 'PHY'
}: NavigationPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isHighContrast } = useHighContrast();
  const { state, switchRoute, endNavigation, recalculateRoute, clearError } = useNavigation();

  const [mapCenter, setMapCenter] = useState(defaultCenter);

  // location.state에서 경로 정보 가져오기
  useEffect(() => {
    const stateData = location.state as any;
    if (stateData?.origin && stateData?.destination) {
      // 이미 NavigationContext에서 startNavigation이 호출되었다고 가정
    }
  }, [location]);

  // 에러 표시
  useEffect(() => {
    if (state.error) {
      // 5초 후 에러 메시지 자동 제거
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [state.error, clearError]);

  const handleEndNavigation = () => {
    if (window.confirm('내비게이션을 종료하시겠습니까?')) {
      endNavigation();
      navigate(-1); // 이전 페이지로 돌아가기
    }
  };

  const handleRecalculate = () => {
    if (window.confirm('경로를 재계산하시겠습니까?')) {
      recalculateRoute();
    }
  };

  return (
    <div className={`relative w-full h-screen ${
      isHighContrast ? 'bg-black' : 'bg-gray-100'
    }`}>
      {/* 헤더 */}
      <div className={`absolute top-0 left-0 right-0 z-10 ${
        isHighContrast
          ? 'bg-black border-b-2 border-yellow-400'
          : 'bg-white shadow-md'
      }`}>
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => navigate(-1)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isHighContrast
                ? 'bg-yellow-400 text-black hover:bg-yellow-300'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            ← 뒤로
          </button>

          <h1 className={`text-xl font-bold ${
            isHighContrast ? 'text-yellow-400' : 'text-gray-900'
          }`}>
            실시간 경로 안내
          </h1>

          <button
            onClick={handleEndNavigation}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isHighContrast
                ? 'bg-red-600 text-yellow-400 hover:bg-red-700'
                : 'bg-red-500 text-white hover:bg-red-600'
            }`}
          >
            종료
          </button>
        </div>

        {/* 연결 상태 표시 */}
        {!state.isConnected && (
          <div className="px-4 pb-3">
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-3 py-2 rounded text-sm">
              ⚠️ 서버와 연결 중...
            </div>
          </div>
        )}

        {/* 에러 메시지 */}
        {state.error && (
          <div className="px-4 pb-3">
            <div className="bg-red-100 border border-red-400 text-red-800 px-3 py-2 rounded text-sm flex justify-between items-center">
              <span>❌ {state.error}</span>
              <button
                onClick={clearError}
                className="ml-2 text-red-600 hover:text-red-800 font-bold"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 지도 영역 */}
      <div className="w-full h-full pt-20">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={mapCenter}
          zoom={14}
          options={{
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
          }}
        >
          {/* 현재 위치 마커 (임시 - 실제로는 Geolocation에서 가져온 위치) */}
          <Marker
            position={mapCenter}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#4285F4',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            }}
          />
        </GoogleMap>
      </div>

      {/* 하단 정보 패널 */}
      <div className={`absolute bottom-0 left-0 right-0 z-10 p-4 space-y-3 max-h-[60vh] overflow-y-auto ${
        isHighContrast ? 'bg-black' : 'bg-transparent'
      }`}>
        {/* 내비게이션 상태 패널 */}
        <NavigationStatusPanel update={state.currentUpdate} />

        {/* 진행률 바 */}
        {state.currentUpdate && (
          <RouteProgressBar
            progress={state.currentUpdate.progress_percent}
            currentStation={state.currentUpdate.current_station_name}
            nextStation={state.currentUpdate.next_station_name}
            remainingStations={state.currentUpdate.remaining_stations}
          />
        )}

        {/* 환승 알림 */}
        {state.currentUpdate?.is_transfer &&
         state.currentUpdate.transfer_from_line &&
         state.currentUpdate.transfer_to_line &&
         state.currentUpdate.next_station_name && (
          <TransferAlert
            transferFromLine={state.currentUpdate.transfer_from_line}
            transferToLine={state.currentUpdate.transfer_to_line}
            nextStationName={state.currentUpdate.next_station_name}
          />
        )}

        {/* 경로 옵션 선택 */}
        {state.routes.length > 0 && (
          <RouteOptionSelector
            routes={state.routes}
            selectedRank={state.selectedRouteRank}
            onRouteSelect={switchRoute}
          />
        )}

        {/* 경로 재계산 버튼 */}
        {state.isNavigating && (
          <button
            onClick={handleRecalculate}
            className={`w-full py-3 rounded-lg font-medium transition-colors ${
              isHighContrast
                ? 'bg-gray-900 text-yellow-400 border-2 border-yellow-400 hover:bg-gray-800'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            🔄 경로 재계산
          </button>
        )}
      </div>
    </div>
  );
}
