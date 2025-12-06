import React, { useEffect, useRef } from 'react';
import { useHighContrast } from '../contexts/HighContrastContext';
import { useVoiceGuide } from '../contexts/VoiceGuideContext';
import { NavigationUpdateMessage } from '../types/navigation';

interface NavigationStatusPanelProps {
  update: NavigationUpdateMessage | null;
}

export function NavigationStatusPanel({ update }: NavigationStatusPanelProps) {
  const { isHighContrast } = useHighContrast();
  const { speak } = useVoiceGuide();
  
  // 이전 업데이트 추적 (중복 음성 방지)
  const prevUpdateRef = useRef<NavigationUpdateMessage | null>(null);

  // 음성 안내 - NavigationContext에서 이미 처리하므로 중복 방지
  useEffect(() => {
    if (update && JSON.stringify(update) !== JSON.stringify(prevUpdateRef.current)) {
      // NavigationContext에서 이미 음성 안내를 하므로 여기서는 특별한 경우만 추가 안내
      // 예: 남은 역이 1개일 때 추가 안내
      if (update.remaining_stations === 1 && update.next_station_name) {
        speak(`곧 목적지에 도착합니다. 마지막 역은 ${update.next_station_name}입니다.`);
      }
      
      prevUpdateRef.current = update;
    }
  }, [update, speak]);

  if (!update) {
    return (
      <div className={`p-6 rounded-lg text-center ${
        isHighContrast
          ? 'bg-black border-2 border-yellow-400 text-yellow-400'
          : 'bg-white shadow-lg text-gray-600'
      }`}>
        <p className="text-lg">경로 안내를 시작하는 중...</p>
      </div>
    );
  }

  return (
    <div className={`p-2 sm:p-4 rounded-lg ${
      isHighContrast
        ? 'bg-black border-2 border-yellow-400'
        : 'bg-white shadow-lg'
    }`}>
      {/* 현재 역 - 모바일 반응형 */}
      <div className="mb-2 sm:mb-4">
        <div className={`text-xs sm:text-sm mb-1 ${
          isHighContrast ? 'text-yellow-400' : 'text-gray-600'
        }`}>
          현재 역
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <span className="text-xl sm:text-2xl">🚇</span>
          <span className={`text-lg sm:text-2xl font-bold truncate ${
            isHighContrast ? 'text-yellow-400' : 'text-gray-900'
          }`}>
            {update.current_station_name}
          </span>
        </div>
      </div>

      {/* 다음 역 - 모바일 반응형 */}
      {update.next_station_name && (
        <div className="mb-2 sm:mb-4">
          <div className={`text-xs sm:text-sm mb-1 ${
            isHighContrast ? 'text-yellow-400' : 'text-gray-600'
          }`}>
            다음 역 {update.is_transfer && <span className="text-red-500 font-bold text-xs sm:text-sm">(환승역)</span>}
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0">
              <span className="text-xl sm:text-2xl flex-shrink-0">{update.is_transfer ? '🔄' : '➡️'}</span>
              <span className={`text-base sm:text-xl font-semibold truncate ${
                update.is_transfer
                  ? (isHighContrast ? 'text-yellow-400 animate-pulse' : 'text-red-600 animate-pulse')
                  : (isHighContrast ? 'text-yellow-400' : 'text-blue-600')
              }`}>
                {update.next_station_name}
              </span>
            </div>
            {update.distance_to_next !== null && (
              <span className={`text-sm sm:text-lg font-medium flex-shrink-0 ${
                isHighContrast ? 'text-yellow-400' : 'text-gray-700'
              }`}>
                {update.distance_to_next >= 1000
                  ? `${(update.distance_to_next / 1000).toFixed(1)}km`
                  : `${Math.round(update.distance_to_next)}m`}
              </span>
            )}
          </div>
          
          {/* 환승 정보 표시 - 모바일 반응형 */}
          {update.is_transfer && update.transfer_from_line && update.transfer_to_line && (
            <div className={`mt-1 sm:mt-2 p-1 sm:p-2 rounded-lg border-l-4 ${
              isHighContrast
                ? 'bg-gray-900 border-yellow-400 text-yellow-400'
                : 'bg-yellow-50 border-yellow-500 text-yellow-800'
            }`}>
              <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-semibold flex-wrap">
                <span className="px-1 sm:px-2 py-0.5 sm:py-1 rounded bg-yellow-200 text-yellow-900 text-xs sm:text-sm">
                  {update.transfer_from_line}
                </span>
                <span className="text-xs sm:text-sm">→</span>
                <span className="px-1 sm:px-2 py-0.5 sm:py-1 rounded bg-yellow-200 text-yellow-900 text-xs sm:text-sm">
                  {update.transfer_to_line}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 안내 메시지 - 모바일 반응형 */}
      {update.message && (
        <div className={`p-2 sm:p-3 rounded-lg text-center text-xs sm:text-base font-medium ${
          isHighContrast
            ? 'bg-gray-900 text-yellow-400'
            : 'bg-blue-50 text-blue-800'
        }`}>
          {update.message}
        </div>
      )}
    </div>
  );
}
