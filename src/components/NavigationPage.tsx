import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { GoogleMap, Marker, Polyline } from "@react-google-maps/api";
import { useHighContrast } from "../contexts/HighContrastContext";
import { useNavigation } from "../contexts/NavigationContext";
import { NavigationStatusPanel } from "./NavigationStatusPanel";
import { RouteProgressBar } from "./RouteProgressBar";
import { RouteOptionSelector } from "./RouteOptionSelector";
import { TransferAlert } from "./TransferAlert";
import {
  getRouteCoordinates,
  getStationCoordinate,
} from "../data/stationCoordinates";

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

// 서울 중심 좌표
const defaultCenter = {
  lat: 37.5665,
  lng: 126.978,
};

interface NavigationPageProps {
  origin?: string;
  destination?: string;
  disabilityType?: "PHY" | "VIS" | "AUD" | "ELD";
}

export function NavigationPage({
  origin,
  destination,
  disabilityType = "PHY",
}: NavigationPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isHighContrast } = useHighContrast();
  const { state, startGuidance, stopNavigation, switchRoute, recalculateRoute, clearError } =
    useNavigation();

  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [currentPosition, setCurrentPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [routePath, setRoutePath] = useState<{ lat: number; lng: number }[]>(
    []
  );

  // 경로 데이터 검증 - 없으면 검색 페이지로 리다이렉트
  useEffect(() => {
    if (!state.routeId || state.routes.length === 0) {
      console.warn('[NavigationPage] 경로 데이터 없음 - 검색 페이지로 이동');
      navigate('/physical-disability');
    }
  }, [state.routeId, state.routes, navigate]);

  // 선택된 경로의 좌표를 폴리라인으로 표시
  useEffect(() => {
    if (state.routes.length > 0) {
      const selectedRoute = state.routes.find(
        (r) => r.rank === state.selectedRouteRank
      );

      if (selectedRoute && selectedRoute.route_sequence) {
        const coordinates = getRouteCoordinates(selectedRoute.route_sequence);
        console.log(
          `[NavigationPage] 경로 로드 완료: ${coordinates.length}개 역 좌표`
        );

        setRoutePath(coordinates);

        // 경로의 중심으로 지도 이동 (첫 번째 역)
        if (coordinates.length > 0 && !currentPosition) {
          setMapCenter(coordinates[0]);
        }
      }
    }
  }, [state.routes, state.selectedRouteRank, currentPosition]);

  // 실제 GPS 위치로 현재 위치 마커 업데이트
  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const newPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCurrentPosition(newPos);
        setMapCenter(newPos); // 현재 위치로 지도 중심 이동
      },
      (error) => {
        console.error("[NavigationPage] GPS 위치 추적 실패:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

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

  const handleStartGuidance = () => {
    console.log('[NavigationPage] 안내 시작 버튼 클릭');
    startGuidance();
  };

  const handleEndNavigation = () => {
    if (window.confirm("내비게이션을 종료하시겠습니까?")) {
      stopNavigation();
      navigate(-1); // 이전 페이지로 돌아가기
    }
  };

  const handleRecalculate = () => {
    if (window.confirm("경로를 재계산하시겠습니까?")) {
      recalculateRoute();
    }
  };

  return (
    <div
      className={`flex flex-col w-full h-screen overflow-hidden ${
        isHighContrast ? "bg-black" : "bg-gray-100"
      }`}
    >
      {/* 헤더 */}
      <div
        className={`flex-none z-20 ${
          isHighContrast
            ? "bg-black border-b-2 border-yellow-400"
            : "bg-white shadow-md"
        }`}
      >
        <div className="flex items-center justify-between p-4">
          {/* 좌측: 안내 시작 버튼 또는 뒤로 버튼 */}
          <div>
            {!state.isNavigating ? (
              <button
                onClick={handleStartGuidance}
                className={`px-6 py-2 rounded-lg font-bold transition-all ${
                  isHighContrast
                    ? "bg-yellow-400 text-black hover:bg-yellow-300 border-2 border-yellow-600"
                    : "bg-green-600 text-white hover:bg-green-700 shadow-lg"
                }`}
              >
                🚀 안내 시작
              </button>
            ) : (
              <button
                onClick={() => navigate(-1)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isHighContrast
                    ? "bg-yellow-400 text-black hover:bg-yellow-300"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                ← 뒤로
              </button>
            )}
          </div>

          <h1
            className={`text-xl font-bold ${
              isHighContrast ? "text-yellow-400" : "text-gray-900"
            }`}
          >
            실시간 경로 안내
          </h1>

          <button
            onClick={handleEndNavigation}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isHighContrast
                ? "bg-red-600 text-yellow-400 hover:bg-red-700"
                : "bg-red-500 text-white hover:bg-red-600"
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

      {/* 지도 영역 - 남은 공간 차지 (노트북 화면 최적화) */}
      <div
        className="flex-1 relative"
        style={{ minHeight: "50vh", maxHeight: "70vh" }}
      >
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={mapCenter}
          zoom={15}
          options={{
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
          }}
        >
          {/* 현재 위치 마커 (실시간 GPS) */}
          {currentPosition && (
            <Marker
              position={currentPosition}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: "#4285F4",
                fillOpacity: 1,
                strokeColor: "#ffffff",
                strokeWeight: 3,
              }}
              title="현재 위치"
            />
          )}

          {/* 경로 폴리라인 */}
          {routePath.length > 1 && (
            <Polyline
              path={routePath}
              options={{
                strokeColor: isHighContrast ? "#FFFF00" : "#2563EB",
                strokeOpacity: 0.8,
                strokeWeight: 5,
                geodesic: true,
              }}
            />
          )}

          {/* 경로 상의 역 마커들 */}
          {routePath.map((coord, index) => (
            <Marker
              key={`route-station-${index}`}
              position={coord}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 5,
                fillColor: isHighContrast ? "#FFFF00" : "#2563EB",
                fillOpacity: 0.6,
                strokeColor: "#FFFFFF",
                strokeWeight: 2,
              }}
            />
          ))}
        </GoogleMap>
      </div>

      {/* 하단 정보 패널 - 고정 높이 (노트북 화면 최적화) */}
      <div
        className={`flex-none overflow-y-auto z-10 ${
          isHighContrast ? "bg-black" : "bg-white shadow-2xl"
        }`}
        style={{ height: "30vh", minHeight: "250px", maxHeight: "400px" }}
      >
        <div className="p-4 space-y-3">
          {/* 안내 시작 전 - 선택된 경로 요약 */}
          {!state.isNavigating ? (
            <div className="space-y-4">
              {/* 선택된 경로 요약 정보 */}
              {state.routes.length > 0 && (() => {
                const selectedRoute = state.routes.find(r => r.rank === state.selectedRouteRank);
                if (!selectedRoute) return null;

                return (
                  <div className={`rounded-lg p-4 ${
                    isHighContrast
                      ? "bg-gray-900 border-2 border-yellow-400"
                      : "bg-blue-50 border border-blue-200"
                  }`}>
                    <h3 className={`text-lg font-bold mb-3 ${
                      isHighContrast ? "text-yellow-400" : "text-gray-900"
                    }`}>
                      선택된 경로 (경로 {state.selectedRouteRank})
                    </h3>
                    <div className={`space-y-2 ${
                      isHighContrast ? "text-yellow-200" : "text-gray-700"
                    }`}>
                      <p className="flex items-center gap-2">
                        <span className="text-lg">⏱️</span>
                        <span>소요시간: <strong>약 {selectedRoute.total_time}분</strong></span>
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="text-lg">🔄</span>
                        <span>환승: <strong>{selectedRoute.transfers}회</strong></span>
                      </p>
                      {selectedRoute.transfer_stations && selectedRoute.transfer_stations.length > 0 && (
                        <p className="flex items-start gap-2">
                          <span className="text-lg">📍</span>
                          <span>환승역: <strong>{selectedRoute.transfer_stations.join(", ")}</strong></span>
                        </p>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* 경로 옵션 선택 (다른 경로가 있을 때만) */}
              {state.routes.length > 1 && (
                <div>
                  <p className={`text-sm mb-2 ${
                    isHighContrast ? "text-yellow-200" : "text-gray-600"
                  }`}>
                    다른 경로 선택:
                  </p>
                  <RouteOptionSelector
                    routes={state.routes}
                    selectedRank={state.selectedRouteRank}
                    onRouteSelect={switchRoute}
                  />
                </div>
              )}

              {/* 안내 메시지 */}
              <div className={`text-center py-2 ${
                isHighContrast ? "text-yellow-200" : "text-gray-600"
              }`}>
                <p className="text-sm">
                  경로를 확인하고 좌상단 "🚀 안내 시작" 버튼을 눌러주세요
                </p>
              </div>
            </div>
          ) : (
            <>
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
              <button
                onClick={handleRecalculate}
                className={`w-full py-3 rounded-lg font-medium transition-colors ${
                  isHighContrast
                    ? "bg-gray-900 text-yellow-400 border-2 border-yellow-400 hover:bg-gray-800"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                🔄 경로 재계산
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
