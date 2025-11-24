import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useLoadScript } from '@react-google-maps/api';
import { HighContrastProvider } from './contexts/HighContrastContext';
import { VoiceGuideProvider } from './contexts/VoiceGuideContext';
import { AuthProvider } from './contexts/AuthContext';
import { NavigationProvider } from './contexts/NavigationContext';
import { MapPage } from './components/MapPage';
import { UserTypeSelectionPage } from './components/UserTypeSelectionPage';
import { PhysicalDisabilityRouteSearchPage } from './components/PhysicalDisabilityRouteSearchPage';
import { AuditoryRouteSearchPage } from './components/AuditoryRouteSearchPage';
import { ElderlyRouteSearchPage } from './components/ElderlyRouteSearchPage';
import { VisualRouteSearchPage } from './components/VisualRouteSearchPage';
import { FavoritesPage } from './components/FavoritesPage';
import { LoginPage } from './components/LoginPage';
import { SignupPage } from './components/SignupPage';
import { UserProfilePage } from './components/UserProfilePage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { NavigationPage } from './components/NavigationPage';
import { Route as RouteType, Favorite } from './types';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const libraries: ("places" | "geometry")[] = ["places", "geometry"];

function AppContent() {
  const location = useLocation();
  const [selectedRoute, setSelectedRoute] = useState<RouteType | null>(null);

  useEffect(() => {
    if (location.state?.selectedRoute) {
      setSelectedRoute(location.state.selectedRoute);
    }
  }, [location]);

  const handleRouteSelect = (route: RouteType) => {
    // Check if we're adding to favorites
    const searchParams = new URLSearchParams(location.search);
    const addToFavorites = searchParams.get('addToFavorites') === 'true';

    if (addToFavorites) {
      // Add to favorites in localStorage
      const stored = localStorage.getItem('favorites');
      const favorites: Favorite[] = stored ? JSON.parse(stored) : [];
      const newFavorite: Favorite = {
        ...route,
        addedAt: new Date(),
      };
      
      // Check if already exists
      if (!favorites.some(f => f.id === route.id && f.departure === route.departure && f.destination === route.destination)) {
        favorites.push(newFavorite);
        localStorage.setItem('favorites', JSON.stringify(favorites));
      }
    }
    
    setSelectedRoute(route);
  };

  return (
    <Routes>
      {/* 공개 라우트 - 로그인 없이 접근 가능 */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* 보호된 라우트 - 로그인 필요 */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MapPage selectedRoute={selectedRoute} />
          </ProtectedRoute>
        }
      />

      {/* 사용자 유형 선택 페이지 */}
      <Route
        path="/user-type-selection"
        element={
          <ProtectedRoute>
            <UserTypeSelectionPage />
          </ProtectedRoute>
        }
      />

      {/* 각 사용자 유형별 경로검색 페이지 */}
      <Route
        path="/route-search/physical-disability"
        element={
          <ProtectedRoute>
            <PhysicalDisabilityRouteSearchPage onRouteSelect={handleRouteSelect} addToFavorites={location.search.includes('addToFavorites=true')} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/route-search/auditory"
        element={
          <ProtectedRoute>
            <AuditoryRouteSearchPage onRouteSelect={handleRouteSelect} addToFavorites={location.search.includes('addToFavorites=true')} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/route-search/elderly"
        element={
          <ProtectedRoute>
            <ElderlyRouteSearchPage onRouteSelect={handleRouteSelect} addToFavorites={location.search.includes('addToFavorites=true')} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/route-search/visual"
        element={
          <ProtectedRoute>
            <VisualRouteSearchPage onRouteSelect={handleRouteSelect} addToFavorites={location.search.includes('addToFavorites=true')} />
          </ProtectedRoute>
        }
      />

      {/* 즐겨찾기 페이지 */}
      <Route
        path="/favorites"
        element={
          <ProtectedRoute>
            <FavoritesPage />
          </ProtectedRoute>
        }
      />

      {/* 사용자 프로필 페이지 */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <UserProfilePage />
          </ProtectedRoute>
        }
      />

      {/* 실시간 내비게이션 페이지 */}
      <Route
        path="/navigation"
        element={
          <ProtectedRoute>
            <NavigationPage />
          </ProtectedRoute>
        }
      />

      {/* 404 - 홈으로 리다이렉트 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: libraries,
    preventGoogleFontsLoading: true,
  });

  if (!isLoaded) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-blue-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p>지도를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-red-50">
        <div className="text-center p-8">
          <p className="text-red-600 mb-4">지도 로딩에 실패했습니다.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            새로고침
          </button>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <HighContrastProvider>
        <VoiceGuideProvider>
          <NavigationProvider>
            <Router>
              <AppContent />
            </Router>
          </NavigationProvider>
        </VoiceGuideProvider>
      </HighContrastProvider>
    </AuthProvider>
  );
}