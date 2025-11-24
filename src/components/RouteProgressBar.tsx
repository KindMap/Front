import React from 'react';
import { useHighContrast } from '../contexts/HighContrastContext';

interface RouteProgressBarProps {
  progress: number; // 0-100
  currentStation: string;
  nextStation: string | null;
  remainingStations: number;
}

export function RouteProgressBar({
  progress,
  currentStation,
  nextStation,
  remainingStations
}: RouteProgressBarProps) {
  const { isHighContrast } = useHighContrast();

  return (
    <div className={`p-4 rounded-lg ${
      isHighContrast
        ? 'bg-black border-2 border-yellow-400'
        : 'bg-white shadow-lg'
    }`}>
      {/* 진행률 바 */}
      <div className="mb-3">
        <div className={`flex justify-between text-sm mb-2 ${
          isHighContrast ? 'text-yellow-400' : 'text-gray-700'
        }`}>
          <span className="font-medium">{currentStation}</span>
          {nextStation && (
            <span className="font-medium">{nextStation}</span>
          )}
        </div>

        <div className={`w-full rounded-full h-3 overflow-hidden ${
          isHighContrast ? 'bg-gray-800 border border-yellow-400' : 'bg-gray-200'
        }`}>
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              isHighContrast
                ? 'bg-yellow-400'
                : 'bg-gradient-to-r from-blue-500 to-blue-600'
            }`}
            style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
          />
        </div>

        <div className={`text-center mt-2 text-lg font-semibold ${
          isHighContrast ? 'text-yellow-400' : 'text-blue-600'
        }`}>
          {progress.toFixed(0)}%
        </div>
      </div>

      {/* 남은 역 정보 */}
      <div className={`text-sm text-center ${
        isHighContrast ? 'text-yellow-400' : 'text-gray-600'
      }`}>
        남은 역: <span className="font-semibold">{remainingStations}개</span>
      </div>
    </div>
  );
}
