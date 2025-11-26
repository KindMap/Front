import React from 'react';
import { useHighContrast } from '../contexts/HighContrastContext';
import { NavigationRoute } from '../types/navigation';
import { formatRouteDisplay, formatLines } from '../utils/routeFormatter';

interface RouteOptionSelectorProps {
  routes: NavigationRoute[];
  selectedRank: number;
  onRouteSelect: (rank: 1 | 2 | 3) => void;
}

export function RouteOptionSelector({
  routes,
  selectedRank,
  onRouteSelect
}: RouteOptionSelectorProps) {
  const { isHighContrast } = useHighContrast();

  if (routes.length === 0) {
    return null;
  }

  return (
    <div className={`p-4 rounded-lg ${
      isHighContrast
        ? 'bg-black border-2 border-yellow-400'
        : 'bg-white shadow-lg'
    }`}>
      <h3 className={`font-bold text-lg mb-3 ${
        isHighContrast ? 'text-yellow-400' : 'text-gray-800'
      }`}>
        경로 옵션
      </h3>

      <div className="space-y-2">
        {routes.slice(0, 3).map((route) => (
          <button
            key={route.rank}
            onClick={() => onRouteSelect(route.rank as 1 | 2 | 3)}
            className={`w-full text-left p-3 rounded-lg transition-all ${
              route.rank === selectedRank
                ? isHighContrast
                  ? 'bg-yellow-400 text-black border-2 border-yellow-400'
                  : 'bg-blue-100 border-2 border-blue-500'
                : isHighContrast
                ? 'bg-gray-900 text-yellow-400 border border-yellow-400 hover:bg-gray-800'
                : 'bg-gray-50 border border-gray-300 hover:bg-gray-100'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <span className={`font-bold text-base ${
                route.rank === selectedRank
                  ? isHighContrast ? 'text-black' : 'text-blue-700'
                  : isHighContrast ? 'text-yellow-400' : 'text-gray-700'
              }`}>
                경로 {route.rank}
                {route.rank === selectedRank && ' (선택됨)'}
              </span>
              <span className={`text-sm ${
                route.rank === selectedRank
                  ? isHighContrast ? 'text-black' : 'text-blue-600'
                  : isHighContrast ? 'text-yellow-400' : 'text-gray-600'
              }`}>
                {route.total_time}분
              </span>
            </div>

            <div className={`text-sm ${
              route.rank === selectedRank
                ? isHighContrast ? 'text-black' : 'text-gray-700'
                : isHighContrast ? 'text-yellow-400' : 'text-gray-600'
            }`}>
              <div className="flex gap-3 mb-1">
                <span>환승 {route.transfers}회</span>
                <span>평균 편의시설: {route.avg_convenience.toFixed(1)}</span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-sm font-medium">
                  {formatRouteDisplay(route.route_sequence, route.transfer_stations)}
                </div>
                <div className="text-xs opacity-80">
                  {formatLines(route.route_lines)}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
