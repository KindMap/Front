/**
 * 편의시설 상세 모달 컴포넌트
 * 특정 역의 모든 편의시설 정보를 상세하게 표시하는 모달
 */

import React, { useState, useEffect } from 'react';
import { FacilityDetailModalProps, FacilityData } from '../types/facility';
import { FacilityIcon } from './FacilityIcon';
import { getAllFacilities } from '../services/facilityApi';
import { facilityCacheService } from '../services/facilityCacheService';
import { sortFacilitiesByPriority } from '../utils/facilityUtils';
import { useHighContrast } from '../contexts/HighContrastContext';
import { Button } from './ui/button';
import { Card } from './ui/card';

/**
 * 편의시설 상세 모달 컴포넌트
 */
export function FacilityDetailModal({
  isOpen,
  onClose,
  stationCode,
  stationName,
  disabilityType,
}: FacilityDetailModalProps) {
  const { isHighContrast } = useHighContrast();
  const [facilities, setFacilities] = useState<FacilityData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

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
          facilityCacheService.setFacilities(stationCode, stationName, data);
          setFacilities(data);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('[FacilityDetailModal] 편의시설 조회 실패:', err);
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
  }, [isOpen, stationCode, stationName]);

  // 모달이 닫혀있으면 렌더링하지 않음
  if (!isOpen) return null;

  // 우선순위에 따라 정렬
  const sortedFacilities = sortFacilitiesByPriority(facilities, disabilityType);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="facility-modal-title"
    >
      <Card
        className={`w-full max-w-md max-h-[80vh] overflow-y-auto ${
          isHighContrast ? 'bg-black border-yellow-400 border-2' : 'bg-card'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 space-y-4">
          {/* 헤더 */}
          <div className="flex items-center justify-between">
            <h2
              id="facility-modal-title"
              className={`text-lg font-bold ${isHighContrast ? 'text-yellow-400' : 'text-foreground'}`}
            >
              {stationName} 편의시설
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className={isHighContrast ? 'text-yellow-400 hover:bg-yellow-400/20' : ''}
              aria-label="닫기"
            >
              ✕
            </Button>
          </div>

          {/* 로딩 중 */}
          {isLoading && (
            <div className={`text-center py-8 ${isHighContrast ? 'text-yellow-400' : 'text-muted-foreground'}`}>
              <div className="animate-pulse">편의시설 정보 로딩 중...</div>
            </div>
          )}

          {/* 에러 */}
          {error && (
            <div className={`text-center py-8 ${isHighContrast ? 'text-red-400' : 'text-red-500'}`}>
              {error}
            </div>
          )}

          {/* 편의시설 없음 */}
          {!isLoading && !error && facilities.length === 0 && (
            <div className={`text-center py-8 ${isHighContrast ? 'text-yellow-400' : 'text-muted-foreground'}`}>
              편의시설 정보가 없습니다.
            </div>
          )}

          {/* 편의시설 목록 */}
          {!isLoading && !error && sortedFacilities.length > 0 && (
            <div className="space-y-3">
              {disabilityType && disabilityType !== 'NONE' && (
                <p className={`text-sm ${isHighContrast ? 'text-yellow-400' : 'text-muted-foreground'}`}>
                  우선순위순으로 정렬되었습니다
                </p>
              )}
              {sortedFacilities.map((facility, index) => (
                <div
                  key={facility.type}
                  className={`p-3 rounded-lg border ${
                    isHighContrast
                      ? 'border-yellow-400 bg-black'
                      : index < 3
                      ? 'border-primary/30 bg-primary/5'
                      : 'border-border bg-muted/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <FacilityIcon type={facility.type} size="md" showLabel={true} />
                    <span
                      className={`font-bold ${
                        isHighContrast ? 'text-yellow-400' : 'text-primary'
                      }`}
                    >
                      {facility.count}개
                    </span>
                  </div>
                  {index < 3 && disabilityType && disabilityType !== 'NONE' && (
                    <p
                      className={`text-xs mt-1 ${
                        isHighContrast ? 'text-yellow-400' : 'text-muted-foreground'
                      }`}
                    >
                      우선 편의시설
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 총 개수 */}
          {!isLoading && !error && facilities.length > 0 && (
            <div className={`text-sm text-center pt-2 border-t ${
              isHighContrast ? 'border-yellow-400 text-yellow-400' : 'border-border text-muted-foreground'
            }`}>
              총 {facilities.reduce((sum, f) => sum + f.count, 0)}개 편의시설
            </div>
          )}

          {/* 닫기 버튼 */}
          <Button
            onClick={onClose}
            className="w-full"
            variant={isHighContrast ? 'outline' : 'default'}
          >
            닫기
          </Button>
        </div>
      </Card>
    </div>
  );
}
