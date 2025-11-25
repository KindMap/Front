# 🗺️ kindMap_frontend 프로젝트 분석 보고서

## 📋 프로젝트 개요

**프로젝트명**: 교통약자를 위한 웹 기반 경로 안내 서비스
**목적**: 지체장애인, 청각장애인, 시각장애인, 고령자를 위한 맞춤형 대중교통 경로 검색 및 안내
**기술 스택**: React 18 + TypeScript + Vite + Tailwind CSS
**주요 특징**: 접근성 우선 설계, 음성 안내, 고대비 모드, 사용자 유형별 맞춤 경로

---

## 🏗️ 디렉토리 구조

```
src/
├── components/              # React 컴포넌트
│   ├── ui/                 # 재사용 가능한 UI 컴포넌트 (48개 Radix UI 기반)
│   ├── MapPage.tsx         # 메인 지도 페이지
│   ├── UserTypeSelectionPage.tsx
│   ├── PhysicalDisabilityRouteSearchPage.tsx
│   ├── AuditoryRouteSearchPage.tsx
│   ├── VisualRouteSearchPage.tsx
│   ├── ElderlyRouteSearchPage.tsx
│   ├── FavoritesPage.tsx
│   ├── LoginPage.tsx
│   └── GoogleMapComponent.tsx
│
├── contexts/               # 전역 상태 관리 (Context API)
│   ├── VoiceGuideContext.tsx      # 음성 안내 기능
│   └── HighContrastContext.tsx    # 고대비 모드 기능
│
├── services/               # API 서비스 레이어
│   ├── routeApi.ts         # 경로 검색 API
│   ├── mapApi.ts           # 지도 API (편의시설/장애물)
│   └── awsPollyService.ts  # 음성 합성 (미구현)
│
├── types/                  # TypeScript 타입 정의
│   └── index.ts            # 공통 인터페이스 및 열거형
│
├── styles/                 # 스타일 파일
│   └── globals.css         # 전역 CSS (Tailwind)
│
└── App.tsx                 # 메인 앱 컴포넌트 (라우팅)
```

---

## 🛠️ 기술 스택

### 핵심 프레임워크
- **React 18.3.1**: UI 라이브러리
- **TypeScript**: 타입 안전성
- **Vite 6.4.1**: 빌드 도구 및 개발 서버
- **React Router DOM**: 클라이언트 사이드 라우팅

### UI/스타일링
- **Tailwind CSS 4.1.14**: 유틸리티 기반 CSS 프레임워크
- **Radix UI**: 접근성 우선 UI 컴포넌트 라이브러리 (48개 컴포넌트)
  - accordion, alert-dialog, avatar, button, card, checkbox, dialog, dropdown-menu 등
- **Lucide React**: 아이콘 라이브러리
- **class-variance-authority**: 조건부 스타일링
- **cmdk**: 명령 팔레트 컴포넌트

### 지도 및 위치 서비스
- **@react-google-maps/api**: Google Maps React 통합
  - places, geometry 라이브러리 사용
  - API Key: 환경변수 `VITE_GOOGLE_MAPS_API_KEY`로 관리 ✅

### 추가 라이브러리
- **React Hook Form**: 폼 관리
- **Recharts**: 차트/그래프
- **Sonner**: 토스트 알림
- **Vaul**: 드로어 컴포넌트
- **next-themes**: 테마 관리

---

## 📱 주요 페이지 및 라우트

| 경로 | 컴포넌트 | 설명 |
|------|---------|------|
| `/` | MapPage | 메인 지도 및 경로 표시 |
| `/user-type-selection` | UserTypeSelectionPage | 사용자 유형 선택 |
| `/route-search/physical-disability` | PhysicalDisabilityRouteSearchPage | 지체장애인 경로 |
| `/route-search/auditory` | AuditoryRouteSearchPage | 청각장애인 경로 |
| `/route-search/visual` | VisualRouteSearchPage | 시각장애인 경로 |
| `/route-search/elderly` | ElderlyRouteSearchPage | 고령자 경로 |
| `/favorites` | FavoritesPage | 즐겨찾기 관리 |
| `/login` | LoginPage | 로그인 (Mock) |

---

## 🔌 API 구조

### 백엔드 API
**베이스 URL**: "https://kindmap-for-you.cloud"
**프록시**: `/api` (Vite 개발 서버 설정)

#### 경로 검색 API
```typescript
POST /api/v1/routes

요청:
{
  origin: string,              // 출발지
  destination: string,         // 도착지
  departure_time: number,      // 출발 시간 (분 단위)
  disability_type: "PHY" | "VIS" | "AUD" | "ELD",
  max_rounds: 4                // 최대 환승 횟수
}

응답:
{
  routes: [{
    rank: number,              // 순위
    score: number,             // 점수 (0-100)
    arrival_time: number,      // 도착 시간
    walking_distance: number,  // 도보 거리
    lines: string[],           // 노선 목록
    transfers: number,         // 환승 횟수
    route: string[]            // 역 이름 배열
  }]
}
```

---

## 🌐 상태 관리

### Context API 활용

#### 1. VoiceGuideContext - 음성 안내
```typescript
기능:
- 음성 안내 활성화/비활성화
- Web Speech API 기반 TTS (한국어)
- AWS Polly 통합 준비 중 (미구현)

상태:
- isVoiceGuideEnabled: boolean
- toggleVoiceGuide(): void
- speak(text: string): void
```

#### 2. HighContrastContext - 고대비 모드
```typescript
기능:
- 고대비 모드 토글
- 시각장애인/저시력자 접근성 향상
- 지도 스타일 변경 (검은 배경 + 노란 텍스트)

상태:
- isHighContrast: boolean
- toggleHighContrast(): void
```

### 로컬 스토리지
- **즐겨찾기**: `localStorage.getItem('favorites')`
  - `Favorite[]` 형식으로 저장
  - 추가/삭제 시 동기화

---

## ♿ 접근성 기능

### 1. 음성 안내
- 모든 인터랙티브 요소에 음성 설명 제공
- `onMouseEnter`, `onFocus` 이벤트 활용
- 한국어 TTS 지원 (Web Speech API)

### 2. 고대비 모드
- 검은 배경 + 노란 텍스트
- 지도 스타일 동적 변경
- 저시력자 지원

### 3. 키보드 네비게이션
- Radix UI의 WAI-ARIA 호환
- 키보드만으로 전체 네비게이션 가능

### 4. 사용자 유형별 맞춤화
- **PHY (지체장애)**: 휠체어 접근성, 엘리베이터 우선, 경사로 정보
- **VIS (시각장애)**: 음성 안내 강화, 점자블록 정보
- **AUD (청각장애)**: 시각 정보 강화, 알림 표시
- **ELD (고령자)**: 계단 최소화, 휴게시설, 느린 보행 속도 고려

---

## 📊 TypeScript 타입 시스템

### 핵심 인터페이스 (src/types/index.ts)

```typescript
Route              // 경로 정보
Favorite           // 즐겨찾기 (Route + addedAt)
Facility           // 편의시설 (엘리베이터, 경사로, 화장실 등)
Obstacle           // 장애물 (계단, 공사구간 등)
AccessibilityInfo  // 접근성 정보
MapCoordinates     // 지도 좌표
```

### 열거형

```typescript
FacilityType       // 9가지 편의시설 유형
  - ELEVATOR, ESCALATOR, WHEELCHAIR_RAMP,
    ACCESSIBLE_TOILET, TACTILE_PAVING, BRAILLE_BLOCK,
    REST_AREA, EMERGENCY_BELL, WHEELCHAIR_LIFT

ObstacleType       // 8가지 장애물 유형
  - STAIRS, STEEP_SLOPE, NARROW_PATH, UNEVEN_SURFACE,
    CONSTRUCTION, BROKEN_FACILITY, HIGH_CURB, NO_TACTILE_PAVING

ObstacleSeverity   // 심각도
  - low, medium, high, critical

UserType           // 사용자 유형
  - PHY (Physical), AUD (Auditory), ELD (Elderly), VIS (Visual)
```

---

## ✅ 구현 완료 기능

- ✅ 기본 라우팅 구조
- ✅ Google Maps 통합
- ✅ 경로 검색 API 연동
- ✅ 음성 안내 (Web Speech API)
- ✅ 고대비 모드
- ✅ 즐겨찾기 기능
- ✅ 4개 사용자 유형별 페이지
- ✅ 48개 Radix UI 컴포넌트
- ✅ TypeScript 타입 안전성
- ✅ 반응형 디자인 (Tailwind CSS)

---

## ⚠️ 미구현 / 개선 필요 사항

### 1. 보안
- ❌ **Google Maps API Key 하드코딩** (`App.tsx:16`)
  - 환경 변수로 이동 필요 (`.env` 파일)
- ❌ 백엔드 API URL 노출 (`vite.config.ts`)
  - 환경 변수 사용 권장

### 2. 기능
- ⏳ AWS Polly 통합 (현재 Web Speech API 사용)
- ⏳ 실제 편의시설 API (현재 Mock 데이터)
- ⏳ 실제 장애물 API (현재 Mock 데이터)
- ⏳ 로그인/인증 시스템 (현재 Mock)
- ⏳ WebSocket 실시간 업데이트
- ⏳ 에러 바운더리 추가
- ⏳ 테스트 코드 작성

### 3. 최적화
- 경로 검색 결과 캐싱
- API 요청 디바운싱
- 번들 크기 최적화
- 이미지 최적화
- 컴포넌트 Lazy loading

---

## 🎯 아키텍처 패턴

### 계층화 아키텍처
```
Presentation Layer (컴포넌트)
    ↓
Service Layer (services/)
    ↓
Data Layer (API/LocalStorage)
```

### 설계 특징
1. **접근성 우선 설계**
   - WAI-ARIA 준수
   - WCAG 가이드라인 고려
   - 키보드 네비게이션
   - 스크린 리더 지원

2. **타입 안전성**
   - TypeScript로 전체 코드베이스 작성
   - 명시적 인터페이스 정의
   - 열거형 사용으로 오류 방지

3. **컴포넌트 재사용성**
   - Radix UI 기반 48개 공통 컴포넌트
   - 일관된 디자인 시스템
   - 조건부 스타일링 (CVA)

4. **Mock 데이터 패턴**
   - 개발 단계에서 실제 API 대신 Mock 사용
   - TODO 주석으로 실제 구현 위치 명시
   - 점진적 통합 준비

---

## 📈 코드 품질

### 강점
- ✅ 체계적인 디렉토리 구조
- ✅ TypeScript로 타입 안전성 확보
- ✅ 현대적인 기술 스택
- ✅ 접근성 표준 준수
- ✅ 컴포넌트 재사용성 높음
- ✅ 일관된 코딩 스타일

### 개선 가능 영역
- 환경 변수 설정 필요
- 에러 바운더리 추가
- 단위/통합 테스트 작성
- API 에러 핸들링 강화
- 성능 최적화
- 문서화 강화

---

## 🎬 개발 환경

### Vite 설정 (vite.config.ts)
```typescript
- 포트: 3000
- 자동 브라우저 열기
- React SWC 플러그인 사용
- 빌드 출력: build/
- API 프록시: /api → "https://kindmap-for-you.cloud"
- 경로 별칭: @ → ./src
```

### 개발 명령어
```bash
# 개발 서버 실행
npm run dev        # localhost:3000

# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview

# 의존성 설치
npm install
```

---

## 💡 주요 라이브러리 (48개 UI 컴포넌트)

**Radix UI 기반 컴포넌트**:
accordion, alert, alert-dialog, aspect-ratio, avatar, badge, breadcrumb, button, calendar, card, carousel, chart, checkbox, collapsible, command, context-menu, dialog, drawer, dropdown-menu, form, hover-card, input, input-otp, label, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner, switch, table, tabs, textarea, toast, toggle, toggle-group, tooltip

---

## 📝 결론

### 프로젝트 평가
이 프로젝트는 **교통약자를 위한 맞춤형 경로 안내 서비스**로, 접근성과 사용자 경험을 최우선으로 설계된 잘 구조화된 React 애플리케이션입니다.

### 핵심 강점
- 🎨 현대적이고 확장 가능한 아키텍처
- ♿ 철저한 접근성 고려
- 🔒 TypeScript 타입 안전성
- 🧩 높은 컴포넌트 재사용성
- 📱 반응형 디자인
- 🎯 사용자 중심 설계

### 개발 진행도
**전체 완성도: 약 70%**
- ✅ 프론트엔드 기본 구조: 95%
- ✅ UI/UX 컴포넌트: 100%
- ⏳ API 통합: 50% (경로 검색 완료, 편의시설/장애물 Mock)
- ⏳ 보안: 30% (API 키 하드코딩)
- ⏳ 테스트: 0%

### 즉시 개선 권장 사항
1. **보안**: API 키를 환경 변수로 이동
2. **기능**: AWS Polly 통합 완료
3. **API**: 실제 편의시설/장애물 API 연동
4. **인증**: 로그인/인증 시스템 구축
5. **품질**: 테스트 코드 작성

### 향후 로드맵
- Phase 1: 보안 강화 및 환경 변수 설정
- Phase 2: 실제 API 통합
- Phase 3: 인증 시스템 구축
- Phase 4: 테스트 코드 작성
- Phase 5: 성능 최적화
- Phase 6: 프로덕션 배포

---

**분석 일자**: 2025-11-14
**분석 도구**: Claude Code (Sonnet 4.5)
**프로젝트 브랜치**: task/add-api-set
