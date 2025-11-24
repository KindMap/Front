import React from 'react';
import { useHighContrast } from '../contexts/HighContrastContext';

interface TransferAlertProps {
  transferFromLine: string;
  transferToLine: string;
  nextStationName: string;
}

export function TransferAlert({
  transferFromLine,
  transferToLine,
  nextStationName
}: TransferAlertProps) {
  const { isHighContrast } = useHighContrast();

  return (
    <div className={`p-4 rounded-lg border-l-4 animate-pulse ${
      isHighContrast
        ? 'bg-black border-yellow-400 text-yellow-400'
        : 'bg-yellow-50 border-yellow-500 text-yellow-800'
    }`}>
      <div className="flex items-start">
        <div className="flex-shrink-0 text-2xl mr-3">⚠️</div>
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-2">환승 안내</h3>
          <p className={`text-sm mb-1 ${
            isHighContrast ? 'text-yellow-400' : 'text-yellow-700'
          }`}>
            다음 역({nextStationName})에서 환승하세요
          </p>
          <div className={`flex items-center gap-2 text-base font-semibold ${
            isHighContrast ? 'text-yellow-400' : 'text-yellow-800'
          }`}>
            <span className="px-2 py-1 rounded bg-yellow-200 text-yellow-900">
              {transferFromLine}
            </span>
            <span>→</span>
            <span className="px-2 py-1 rounded bg-yellow-200 text-yellow-900">
              {transferToLine}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
