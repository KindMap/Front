/**
 * 편의시설 정보 컴포넌트
 * 특정 역의 편의시설 정보를 표시하는 재사용 가능한 컴포넌트
 */

import React, { useState, useEffect } from 'react';
import { FacilityInfoProps } from '../types/facility';
import { FacilityData } from '../types/facility';
import { FacilityIcon } from './FacilityIcon';
import { getAllFacilities } from '../services/facilityApi';
import { facilityCacheService } from '../services/facilityCacheService';
import { sortFacilitiesByPriority, getTopFacilities } from '../utils/facilityUtils';
import { stationCache } from '../services/stationCacheService';
import { useHighContrast } from '../contexts/HighContrastContext';

/**
 * 편의시설 정보 컴포넌트
 */
export function FacilityInfo({
  stationCode,
  stationName,
  disabilityType,
  compact = false,
  limit,
  expandable = true,
  className = '',
}: FacilityInfoProps) {
  const { isHighContrast } = useHighContrast();
  const [facilities, setFacilities] = useState<FacilityData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // 역 이름 조회 (stationName이 없을 경우)
  const displayStationName = stationName || stationCache.getStationName(stationCode) || stationCode;

  useEffect(() => {
    let isMounted = true;

    const loadFacilities = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // 캐시 확인
        const cached = facilityCacheService.getFacilities(stationCode);
        if (cached) {
          if (isMounted) {
            setFacilities(cached);
            setIsLoading(false);
          }
          return;
        }

        // API 호출
        const data = await getAllFacilities(stationCode);

        if (isMounted) {
          // 캐시에 저장
          facilityCacheService.setFacilities(stationCode, displayStationName, data);
          setFacilities(data);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('[FacilityInfo] 편의시설 조회 실패:', err);
        if (isMounted) {
          setError('편의시설 정보를 불러올 수 없습니다.');
          setIsLoading(false);
        }
      }
    };

    loadFacilities();

    return () => {
      isMounted = false;
    };
  }, [stationCode, displayStationName]);

  // 로딩 중
  if (isLoading) {
    return (
      <div className={`text-xs ${isHighContrast ? 'text-yellow-400' : 'text-muted-foreground'} ${className}`}>
        <span className="animate-pulse">편의시설 정보 로딩 중...</span>
      </div>
    );
  }

  // 에러
  if (error) {
    return (
      <div className={`text-xs ${isHighContrast ? 'text-red-400' : 'text-red-500'} ${className}`}>
        {error}
      </div>
    );
  }

  // 편의시설 없음
  if (facilities.length === 0) {
    return (
      <div className={`text-xs ${isHighContrast ? 'text-yellow-400' : 'text-muted-foreground'} ${className}`}>
        편의시설 정보가 없습니다.
      </div>
    );
  }

  // 우선순위에 따라 정렬
  const sortedFacilities = sortFacilitiesByPriority(facilities, disabilityType);

  // 표시할 편의시설 결정
  const displayLimit = isExpanded ? undefined : limit;
  const displayFacilities = displayLimit ? getTopFacilities(sortedFacilities, displayLimit) : sortedFacilities;
  const hasMore = limit && sortedFacilities.length > limit && !isExpanded;

  // 컴팩트 모드 (아이콘만)
  if (compact) {
    return (
      <div className={`flex items-center gap-1 flex-wrap ${className}`}>
        {displayFacilities.map((facility) => (
          <FacilityIcon
            key={facility.type}
            type={facility.type}
            size="sm"
            showLabel={false}
            count={facility.count}
          />
        ))}
        {hasMore && expandable && (
          <button
            onClick={() => setIsExpanded(true)}
            className={`text-xs px-2 py-0.5 rounded ${
              isHighContrast
                ? 'bg-yellow-400 text-black hover:bg-yellow-300'
                : 'bg-primary/10 text-primary hover:bg-primary/20'
            }`}
            aria-label="더 많은 편의시설 보기"
          >
            +{sortedFacilities.length - displayLimit!}
          </button>
        )}
      </div>
    );
  }

  // 일반 모드 (아이콘 + 라벨)
  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex items-center gap-2 flex-wrap">
        {displayFacilities.map((facility) => (
          <FacilityIcon
            key={facility.type}
            type={facility.type}
            size="sm"
            showLabel={true}
            count={facility.count}
          />
        ))}
      </div>
      {hasMore && expandable && (
        <button
          onClick={() => setIsExpanded(true)}
          className={`text-xs px-2 py-1 rounded ${
            isHighContrast
              ? 'bg-yellow-400 text-black hover:bg-yellow-300'
              : 'bg-primary/10 text-primary hover:bg-primary/20'
          }`}
          aria-label="더 많은 편의시설 보기"
        >
          더보기 (+{sortedFacilities.length - displayLimit!}개)
        </button>
      )}
      {isExpanded && expandable && (
        <button
          onClick={() => setIsExpanded(false)}
          className={`text-xs px-2 py-1 rounded ${
            isHighContrast
              ? 'bg-yellow-400 text-black hover:bg-yellow-300'
              : 'bg-primary/10 text-primary hover:bg-primary/20'
          }`}
          aria-label="접기"
        >
          접기
        </button>
      )}
    </div>
  );
}
