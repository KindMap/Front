import React, { useEffect } from 'react';
import { useHighContrast } from '../contexts/HighContrastContext';
import { useVoiceGuide } from '../contexts/VoiceGuideContext';
import { NavigationUpdateMessage } from '../types/navigation';

interface NavigationStatusPanelProps {
  update: NavigationUpdateMessage | null;
}

export function NavigationStatusPanel({ update }: NavigationStatusPanelProps) {
  const { isHighContrast } = useHighContrast();
  const { speak } = useVoiceGuide();

  // 음성 안내
  useEffect(() => {
    if (update) {
      // 환승 안내
      if (update.is_transfer && update.next_station_name) {
        const transferMessage = `다음 역 ${update.next_station_name}에서 ${update.transfer_from_line}에서 ${update.transfer_to_line}으로 환승하세요`;
        speak(transferMessage);
      }
      // 일반 안내
      else if (update.next_station_name) {
        speak(`다음 역은 ${update.next_station_name}입니다`);
      }
      // 메시지가 있으면 읽기
      else if (update.message) {
        speak(update.message);
      }
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
    <div className={`p-4 rounded-lg ${
      isHighContrast
        ? 'bg-black border-2 border-yellow-400'
        : 'bg-white shadow-lg'
    }`}>
      {/* 현재 역 */}
      <div className="mb-4">
        <div className={`text-sm mb-1 ${
          isHighContrast ? 'text-yellow-400' : 'text-gray-600'
        }`}>
          현재 역
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🚇</span>
          <span className={`text-2xl font-bold ${
            isHighContrast ? 'text-yellow-400' : 'text-gray-900'
          }`}>
            {update.current_station_name}
          </span>
        </div>
      </div>

      {/* 다음 역 */}
      {update.next_station_name && (
        <div className="mb-4">
          <div className={`text-sm mb-1 ${
            isHighContrast ? 'text-yellow-400' : 'text-gray-600'
          }`}>
            다음 역
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">➡️</span>
              <span className={`text-xl font-semibold ${
                isHighContrast ? 'text-yellow-400' : 'text-blue-600'
              }`}>
                {update.next_station_name}
              </span>
            </div>
            {update.distance_to_next !== null && (
              <span className={`text-lg font-medium ${
                isHighContrast ? 'text-yellow-400' : 'text-gray-700'
              }`}>
                {update.distance_to_next >= 1000
                  ? `${(update.distance_to_next / 1000).toFixed(1)} km`
                  : `${Math.round(update.distance_to_next)} m`}
              </span>
            )}
          </div>
        </div>
      )}

      {/* 안내 메시지 */}
      {update.message && (
        <div className={`p-3 rounded-lg text-center font-medium ${
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
