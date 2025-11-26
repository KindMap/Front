import React, { useState, useEffect, useRef } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { stationCache, StationInfo } from '../services/stationCacheService';
import { useHighContrast } from '../contexts/HighContrastContext';

interface StationAutocompleteProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

/**
 * 역명 자동완성 컴포넌트
 * - 사용자 입력에 따라 역 목록을 실시간으로 검색하여 표시
 * - 키보드 네비게이션 지원 (위/아래 화살표, Enter, Esc)
 */
export function StationAutocomplete({
  id,
  label,
  value,
  onChange,
  placeholder = '역명을 입력하세요',
  required = false,
  className = '',
}: StationAutocompleteProps) {
  const { isHighContrast } = useHighContrast();
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<StationInfo[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // value prop이 변경되면 inputValue 동기화
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // 입력값 변경 시 검색
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // 검색 수행
    if (newValue.trim().length > 0) {
      const results = stationCache.searchStations(newValue, 10);
      setSuggestions(results);
      setShowSuggestions(true);
      setSelectedIndex(-1);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      onChange('');
    }
  };

  // 역 선택
  const handleSelectStation = (station: StationInfo) => {
    setInputValue(station.name);
    onChange(station.name);
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  // 키보드 네비게이션
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;

      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;

      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelectStation(suggestions[selectedIndex]);
        } else if (suggestions.length === 1) {
          // 검색 결과가 1개면 자동 선택
          handleSelectStation(suggestions[0]);
        }
        break;

      case 'Escape':
        e.preventDefault();
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;

      default:
        break;
    }
  };

  // 외부 클릭 시 자동완성 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 선택된 항목으로 스크롤
  useEffect(() => {
    if (selectedIndex >= 0 && suggestionsRef.current) {
      const selectedElement = suggestionsRef.current.children[
        selectedIndex
      ] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth',
        });
      }
    }
  }, [selectedIndex]);

  return (
    <div className={`relative ${className}`}>
      <Label htmlFor={id} className={isHighContrast ? 'text-yellow-400' : ''}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        ref={inputRef}
        id={id}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (suggestions.length > 0) {
            setShowSuggestions(true);
          }
        }}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
        className={`mt-1 ${
          isHighContrast
            ? 'bg-black text-yellow-400 border-yellow-400 focus:border-yellow-300'
            : ''
        }`}
      />

      {/* 자동완성 드롭다운 */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className={`absolute z-50 w-full mt-1 max-h-60 overflow-y-auto rounded-lg border shadow-lg ${
            isHighContrast
              ? 'bg-black border-yellow-400'
              : 'bg-white border-gray-300'
          }`}
        >
          {suggestions.map((station, index) => (
            <button
              key={`${station.station_cd}-${index}`}
              type="button"
              onClick={() => handleSelectStation(station)}
              className={`w-full text-left px-4 py-3 flex items-center justify-between transition-colors ${
                index === selectedIndex
                  ? isHighContrast
                    ? 'bg-yellow-400 text-black'
                    : 'bg-blue-100 text-blue-900'
                  : isHighContrast
                  ? 'text-yellow-400 hover:bg-gray-900'
                  : 'text-gray-900 hover:bg-gray-100'
              } ${
                index !== suggestions.length - 1
                  ? isHighContrast
                    ? 'border-b border-yellow-400'
                    : 'border-b border-gray-200'
                  : ''
              }`}
            >
              <div>
                <div className="font-medium">{station.name}</div>
                <div
                  className={`text-xs ${
                    index === selectedIndex
                      ? isHighContrast
                        ? 'text-black opacity-80'
                        : 'text-blue-700'
                      : isHighContrast
                      ? 'text-yellow-400 opacity-70'
                      : 'text-gray-500'
                  }`}
                >
                  {station.line}
                </div>
              </div>
              <div
                className={`text-xs ${
                  index === selectedIndex
                    ? isHighContrast
                      ? 'text-black opacity-60'
                      : 'text-blue-600'
                    : isHighContrast
                    ? 'text-yellow-400 opacity-50'
                    : 'text-gray-400'
                }`}
              >
                {station.station_cd}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* 검색 결과 없음 메시지 */}
      {showSuggestions &&
        inputValue.trim().length > 0 &&
        suggestions.length === 0 && (
          <div
            className={`absolute z-50 w-full mt-1 px-4 py-3 rounded-lg border ${
              isHighContrast
                ? 'bg-black border-yellow-400 text-yellow-400'
                : 'bg-white border-gray-300 text-gray-500'
            }`}
          >
            검색 결과가 없습니다.
          </div>
        )}
    </div>
  );
}
