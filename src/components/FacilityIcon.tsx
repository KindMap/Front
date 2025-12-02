/**
 * 편의시설 아이콘 컴포넌트
 * 각 편의시설 타입에 대한 아이콘/이모티콘을 표시
 */

import React from 'react';
import { FacilityIconProps } from '../types/facility';
import { getFacilityLabel, getFacilityIcon } from '../utils/facilityUtils';
import { useHighContrast } from '../contexts/HighContrastContext';

/**
 * 편의시설 아이콘 컴포넌트
 */
export function FacilityIcon({
  type,
  size = 'md',
  showLabel = false,
  count,
  className = '',
}: FacilityIconProps) {
  const { isHighContrast } = useHighContrast();
  const icon = getFacilityIcon(type);
  const label = getFacilityLabel(type);

  // 크기별 스타일
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  };

  const sizeClass = sizeClasses[size];

  return (
    <span
      className={`inline-flex items-center gap-1 ${className}`}
      role="img"
      aria-label={label}
      title={label}
    >
      {/* 아이콘 */}
      <span className={sizeClass}>{icon}</span>

      {/* 라벨 (선택) */}
      {showLabel && (
        <span
          className={`${
            size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'
          } ${isHighContrast ? 'text-yellow-400 font-bold' : 'text-foreground'}`}
        >
          {label}
        </span>
      )}

      {/* 개수 뱃지 (선택) */}
      {count !== undefined && count > 0 && (
        <span
          className={`${
            size === 'sm' ? 'text-xs px-1' : 'text-xs px-1.5'
          } rounded-full ${
            isHighContrast
              ? 'bg-yellow-400 text-black font-bold'
              : 'bg-primary/20 text-primary'
          }`}
        >
          {count}
        </span>
      )}
    </span>
  );
}
